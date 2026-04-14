import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { barbers as fallbackBarbers, bookingSetup, notifications as fallbackNotifications } from './mockData';
import { authAPI, barbersAPI, bookingsAPI, notificationsAPI, queueAPI, setMobileAuthToken, shopsAPI } from '../services/api';
import { disconnectMobileSocket, getMobileSocket } from '../services/socket';

const SessionContext = createContext(null);
const DEMO_CUSTOMER = {
  email: 'adam@qbarber.demo',
  password: 'customer12345'
};

function formatRelativeTime(value) {
  if (!value) {
    return 'Just now';
  }

  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return new Date(value).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short'
  });
}

function formatBookingDateLabel(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function buildBranchOptions(shop, queueStatus) {
  if (!shop) {
    return [];
  }

  const waitMinutes = queueStatus?.waitingEntries?.[0]?.estimatedWaitTime || queueStatus?.waitingCount * 5 || 0;
  const baseBranch = {
    id: String(shop._id),
    shopId: String(shop._id),
    name: shop.name,
    district: shop.address?.split(',')?.[0] || 'Main branch',
    distance: 'Live branch',
    waitMinutes,
    highlight: queueStatus?.queuePaused ? 'Queue paused temporarily' : 'Live queue ready'
  };

  const extraBranches = (shop.branches || []).map((branch, index) => ({
    id: `${shop._id}-branch-${index + 1}`,
    shopId: String(shop._id),
    name: branch.name,
    district: branch.address?.split(',')?.[0] || `Branch ${index + 1}`,
    distance: 'Branch preview',
    waitMinutes: Math.max(10, waitMinutes - index * 6),
    highlight: index === 0 ? 'Most premium slots open' : 'Branch linked to the same live queue feed'
  }));

  return [baseBranch, ...extraBranches];
}

function formatQueueAhead(entry, currentEntryId) {
  if (!entry || String(entry._id) === String(currentEntryId)) {
    return null;
  }

  return {
    id: String(entry._id),
    queueNumber: entry.queueNumber,
    service: entry.serviceType || 'Haircut',
    eta: `${entry.estimatedWaitTime || 0} min left`,
    stage:
      entry.status === 'serving'
        ? 'In progress'
        : entry.status === 'called'
          ? 'Called to chair'
          : 'Waiting'
  };
}

function mapNotification(item) {
  const toneByType = {
    turn_soon: 'queue',
    now_serving: 'queue',
    booking_reminder: 'booking',
    cancelled: 'alerts'
  };
  const iconByType = {
    turn_soon: 'clock',
    now_serving: 'scissors',
    booking_reminder: 'calendar',
    cancelled: 'alert-circle'
  };

  return {
    id: String(item._id),
    category: toneByType[item.type] || 'alerts',
    type: item.type,
    title: item.title,
    message: item.message,
    time: formatRelativeTime(item.sentAt || item.createdAt),
    read: Boolean(item.isRead),
    icon: iconByType[item.type] || 'bell'
  };
}

function mapBookingHistory(bookings = []) {
  return bookings.map((booking) => ({
    id: String(booking._id),
    title: booking.serviceType || 'Premium booking',
    date: formatBookingDateLabel(booking.scheduledDate),
    barber: booking.barberId?.name || 'First available barber',
    points: booking.paymentStatus === 'paid' ? '+25 pts' : '+10 pts'
  }));
}

export function SessionProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [barbers, setBarbers] = useState(fallbackBarbers);
  const [queueStatus, setQueueStatus] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [currentQueueEntry, setCurrentQueueEntry] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [lastBooking, setLastBooking] = useState(null);
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState('');

  const shopId = shop?._id ? String(shop._id) : null;

  const refreshNotifications = async (userId = user?._id) => {
    if (!userId) {
      return [];
    }

    try {
      const response = await notificationsAPI.list(userId);
      const nextItems = (response.data || []).map(mapNotification);
      setNotifications(nextItems);
      return nextItems;
    } catch {
      return notifications;
    }
  };

  const refreshBookings = async () => {
    if (!isLoggedIn) {
      return [];
    }

    try {
      const response = await bookingsAPI.mine();
      const nextBookings = response.data || [];
      setBookings(nextBookings);
      return nextBookings;
    } catch {
      return bookings;
    }
  };

  const refreshQueueState = async (targetShopId = shopId) => {
    if (!targetShopId) {
      return null;
    }

    try {
      const [queueResponse, positionResponse] = await Promise.all([
        queueAPI.status(targetShopId),
        isLoggedIn ? queueAPI.myPosition(targetShopId) : Promise.resolve({ data: null })
      ]);
      const nextQueueStatus = queueResponse.data;
      const nextPosition = positionResponse.data || null;
      const nextCurrentEntry = nextPosition?.queueEntryId
        ? nextQueueStatus?.entries?.find((entry) => String(entry._id) === String(nextPosition.queueEntryId)) || null
        : null;

      setQueueStatus(nextQueueStatus);
      setMyPosition(nextPosition);
      setCurrentQueueEntry(nextCurrentEntry);
      setBranches((current) => (shop ? buildBranchOptions(shop, nextQueueStatus) : current));

      return {
        queueStatus: nextQueueStatus,
        myPosition: nextPosition,
        currentQueueEntry: nextCurrentEntry
      };
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    }
  };

  const bootstrapSession = async (authPayload) => {
    const nextToken = authPayload?.token || null;
    const profileResponse = await authAPI.me();
    const shopResponse = authPayload?.shop
      ? { data: [authPayload.shop] }
      : await shopsAPI.list();
    const nextShop = authPayload?.shop || profileResponse.data?.shop || shopResponse.data?.[0] || null;

    setToken(nextToken);
    setMobileAuthToken(nextToken);
    setUser(profileResponse.data?.user || authPayload?.user || null);
    setShop(nextShop);
    setSelectedBranchId((current) => current || (nextShop ? String(nextShop._id) : null));

    const [barberResponse] = await Promise.allSettled([
      nextShop ? barbersAPI.list(nextShop._id) : Promise.resolve({ data: fallbackBarbers })
    ]);

    if (barberResponse.status === 'fulfilled') {
      setBarbers((barberResponse.value.data || []).map((barber) => ({
        id: String(barber._id),
        name: barber.name,
        specialty: barber.specialty,
        average: `${barber.avgServiceTime || nextShop?.avgServiceTime || 30} min avg`,
        status: barber.status,
        rating: String(barber.rating || 4.8)
      })));
    }

    setBranches(buildBranchOptions(nextShop, null));
    await Promise.allSettled([
      refreshQueueState(nextShop?._id),
      refreshBookings(),
      refreshNotifications(profileResponse.data?.user?._id || authPayload?.user?._id)
    ]);
  };

  useEffect(() => {
    if (!isLoggedIn || !user?._id || !shopId) {
      disconnectMobileSocket();
      return undefined;
    }

    const socket = getMobileSocket();
    socket.emit('join:user', String(user._id));
    socket.emit('join:shop', String(shopId));

    const handleQueueUpdated = ({ queueData }) => {
      setQueueStatus(queueData);
      setBranches((current) => {
        if (current.length === 0 && shop) {
          return buildBranchOptions(shop, queueData);
        }

        return current.map((branch) => ({
          ...branch,
          waitMinutes: queueData?.waitingEntries?.[0]?.estimatedWaitTime || branch.waitMinutes,
          highlight: queueData?.queuePaused ? 'Queue paused temporarily' : branch.highlight
        }));
      });

      setCurrentQueueEntry((current) =>
        current ? queueData?.entries?.find((entry) => String(entry._id) === String(current._id)) || null : current
      );
      setMyPosition((current) => {
        if (!current?.queueEntryId) {
          return current;
        }

        const waitingIndex = queueData?.waitingEntries?.findIndex(
          (entry) => String(entry._id) === String(current.queueEntryId)
        );

        if (waitingIndex >= 0) {
          return {
            ...current,
            position: waitingIndex + 1,
            estimatedWaitTime: queueData.waitingEntries[waitingIndex].estimatedWaitTime
          };
        }

        const servingEntry = queueData?.entries?.find(
          (entry) => String(entry._id) === String(current.queueEntryId) && entry.status === 'serving'
        );

        return servingEntry ? { ...current, position: 0, status: 'serving', estimatedWaitTime: 0 } : current;
      });
    };

    const appendRealtimeNotification = (payload, type, title, icon = 'bell') => {
      setNotifications((current) => [
        {
          id: `${type}-${Date.now()}`,
          category: type.includes('booking') ? 'booking' : 'queue',
          type,
          title,
          message: payload?.message || title,
          time: 'Just now',
          read: false,
          icon
        },
        ...current
      ]);
    };

    const handleQueueJoined = ({ queueNumber, position, estWait }) => {
      appendRealtimeNotification(
        {
          message: `Queue #${queueNumber} joined successfully. Position ${position}. Estimated wait ${estWait} minutes.`
        },
        'turn_soon',
        'Queue joined',
        'check-circle'
      );
    };

    const handleTurnApproaching = ({ position, estTime }) => {
      setMyPosition((current) => (current ? { ...current, position, estimatedWaitTime: estTime } : current));
      appendRealtimeNotification(
        { message: `You are now #${position} in line with about ${estTime} minutes left.` },
        'turn_soon',
        'Your turn is getting close',
        'clock'
      );
    };

    const handleServiceStarted = ({ barberName }) => {
      appendRealtimeNotification(
        { message: `${barberName || 'Your barber'} just started your service.` },
        'now_serving',
        'Service started',
        'scissors'
      );
    };

    const handleServiceCompleted = ({ totalTime }) => {
      appendRealtimeNotification(
        { message: `Service completed in ${totalTime || 0} minutes.` },
        'alerts',
        'Visit completed',
        'award'
      );
      setCurrentQueueEntry(null);
      setMyPosition(null);
      refreshBookings();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('queue:joined', handleQueueJoined);
    socket.on('turn:approaching', handleTurnApproaching);
    socket.on('customer:called', handleTurnApproaching);
    socket.on('service:started', handleServiceStarted);
    socket.on('service:completed', handleServiceCompleted);

    return () => {
      socket.emit('leave:user', String(user._id));
      socket.emit('leave:shop', String(shopId));
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('queue:joined', handleQueueJoined);
      socket.off('turn:approaching', handleTurnApproaching);
      socket.off('customer:called', handleTurnApproaching);
      socket.off('service:started', handleServiceStarted);
      socket.off('service:completed', handleServiceCompleted);
    };
  }, [isLoggedIn, user?._id, shopId]);

  const loginDemo = async () => {
    setIsAuthenticating(true);
    setError('');

    try {
      const response = await authAPI.login(DEMO_CUSTOMER);
      setIsLoggedIn(true);
      await bootstrapSession(response.data);
      return { ok: true };
    } catch (nextError) {
      setError(nextError.message);
      setIsLoggedIn(false);
      setMobileAuthToken(null);
      return { ok: false, message: nextError.message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setShop(null);
    setBranches([]);
    setSelectedBranchId(null);
    setQueueStatus(null);
    setMyPosition(null);
    setCurrentQueueEntry(null);
    setBookings([]);
    setLastBooking(null);
    setAvailableSlots([]);
    setNotifications(fallbackNotifications);
    setMobileAuthToken(null);
    disconnectMobileSocket();
  };

  const refreshHomeData = async () => {
    if (!shopId) {
      return null;
    }

    setIsRefreshing(true);

    try {
      const [queueData, bookingsData, notificationsData] = await Promise.all([
        refreshQueueState(shopId),
        refreshBookings(),
        refreshNotifications()
      ]);

      return {
        queueData,
        bookingsData,
        notificationsData
      };
    } finally {
      setIsRefreshing(false);
    }
  };

  const joinQueueRemote = async ({ serviceType = 'haircut', type = 'walk-in', notes = '' } = {}) => {
    if (!shopId) {
      throw new Error('No active shop is selected.');
    }

    const response = await queueAPI.join({
      shopId,
      serviceType,
      type,
      notes
    });

    setCurrentQueueEntry(response.data?.queueEntry || null);
    setQueueStatus(response.data?.queueData || queueStatus);
    await Promise.allSettled([refreshQueueState(shopId), refreshNotifications()]);
    return response.data;
  };

  const leaveQueueRemote = async (queueEntryId = currentQueueEntry?._id) => {
    if (!queueEntryId) {
      return null;
    }

    const response = await queueAPI.leave(queueEntryId);
    setCurrentQueueEntry(null);
    setMyPosition(null);
    setQueueStatus(response.data?.queueData || queueStatus);
    await Promise.allSettled([refreshQueueState(shopId), refreshNotifications()]);
    return response.data;
  };

  const loadAvailableSlots = async ({ date, barberId = null }) => {
    if (!shopId || !date) {
      setAvailableSlots([]);
      return [];
    }

    const response = await bookingsAPI.slots({
      shopId,
      date,
      barberId
    });
    setAvailableSlots(response.data || []);
    return response.data || [];
  };

  const createPremiumBooking = async ({
    date,
    startTime,
    barberId = null,
    serviceType = 'premium haircut',
    amount
  }) => {
    if (!shopId) {
      throw new Error('No active shop is selected.');
    }

    const bookingResponse = await bookingsAPI.create({
      shopId,
      date,
      startTime,
      barberId,
      serviceType
    });
    const booking = bookingResponse.data;
    const paymentResponse = await bookingsAPI.pay(booking._id, amount);
    const confirmedBooking = paymentResponse.data?.booking || booking;

    setLastBooking(confirmedBooking);
    await Promise.allSettled([refreshBookings(), refreshNotifications()]);
    return {
      booking: confirmedBooking,
      paymentIntent: paymentResponse.data?.paymentIntent || null
    };
  };

  const checkInBooking = async (bookingId, qrCode) => {
    const response = await bookingsAPI.checkIn(bookingId, qrCode);
    await Promise.allSettled([refreshQueueState(shopId), refreshBookings(), refreshNotifications()]);
    return response.data;
  };

  const markNotificationRead = async (notificationId) => {
    await notificationsAPI.markRead(notificationId);
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, read: true } : item))
    );
  };

  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0] || null;
  const profile = user
    ? {
        name: user.name,
        email: user.email,
        phone: user.phone,
        tier: user.loyaltyPoints >= 100 ? 'Gold Fade Club' : 'Silver Fade Club',
        loyaltyPoints: user.loyaltyPoints || 0,
        nextRewardAt: 100,
        visits: user.totalVisits || 0,
        memberSince: formatBookingDateLabel(user.createdAt),
        preferences: {
          push: Boolean(user.notificationPrefs?.push),
          sms: Boolean(user.notificationPrefs?.sms),
          promo: true
        },
        history: mapBookingHistory(bookings),
        achievements: [
          `${Math.max(1, Math.min(3, bookings.length))} bookings on record`,
          myPosition ? 'Active queue holder' : 'Ready to book anytime',
          `${user.totalVisits || 0} total visits`
        ]
      }
    : null;

  const queueSnapshot = useMemo(() => {
    if (!queueStatus) {
      return null;
    }

    const queueEntryId = myPosition?.queueEntryId || currentQueueEntry?._id || null;
    const peopleAhead = myPosition?.position ? Math.max(myPosition.position - 1, 0) : 0;
    const aheadEntries = (queueStatus.waitingEntries || [])
      .filter((entry) => String(entry._id) !== String(queueEntryId))
      .slice(0, peopleAhead)
      .map((entry) => formatQueueAhead(entry, queueEntryId))
      .filter(Boolean);

    return {
      waitingCount: queueStatus.waitingCount || 0,
      activeBarbers: queueStatus.activeBarbers?.length || 0,
      totalBarbers: barbers.length || queueStatus.activeBarbers?.length || 0,
      estimatedWait: myPosition?.estimatedWaitTime || aheadEntries[0]?.estimatedWaitTime || 0,
      nowServing: queueStatus.nowServing?.queueNumber || '-',
      queueNumber: currentQueueEntry?.queueNumber || '-',
      position: myPosition?.position || null,
      peopleAhead,
      countdownSeconds: Math.max(0, (myPosition?.estimatedWaitTime || 0) * 60),
      arrivalWindow:
        myPosition?.estimatedWaitTime > 0
          ? `${myPosition.estimatedWaitTime}-${myPosition.estimatedWaitTime + 10} min`
          : 'Head to the counter now',
      expectedChair: currentQueueEntry?.barberId?.name || 'First available chair',
      serviceType: currentQueueEntry?.serviceType || 'Haircut',
      joinedAt: currentQueueEntry?.joinedAt
        ? new Date(currentQueueEntry.joinedAt).toLocaleTimeString('en-MY', {
            hour: 'numeric',
            minute: '2-digit'
          })
        : '--',
      ahead: aheadEntries
    };
  }, [queueStatus, myPosition, currentQueueEntry, barbers]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isAuthenticating,
      isRefreshing,
      error,
      token,
      user,
      shop,
      branches,
      selectedBranchId,
      selectedBranch,
      selectBranch: setSelectedBranchId,
      barbers,
      profile,
      queueStatus,
      queueSnapshot,
      myPosition,
      currentQueueEntry,
      bookings,
      lastBooking,
      notifications,
      availableSlots,
      bookingSetup,
      loginDemo,
      logout,
      refreshHomeData,
      refreshQueueState,
      refreshBookings,
      refreshNotifications,
      joinQueueRemote,
      leaveQueueRemote,
      loadAvailableSlots,
      createPremiumBooking,
      checkInBooking,
      markNotificationRead
    }),
    [
      isLoggedIn,
      isAuthenticating,
      isRefreshing,
      error,
      token,
      user,
      shop,
      branches,
      selectedBranchId,
      selectedBranch,
      barbers,
      profile,
      queueStatus,
      queueSnapshot,
      myPosition,
      currentQueueEntry,
      bookings,
      lastBooking,
      notifications,
      availableSlots
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useClientSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useClientSession must be used within SessionProvider.');
  }

  return context;
}
