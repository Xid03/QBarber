const AnalyticsEvent = require('../models/AnalyticsEvent');
const Barber = require('../models/Barber');
const Notification = require('../models/Notification');
const QueueEntry = require('../models/QueueEntry');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { emitToShop, emitToUser } = require('../socket');

const ACTIVE_QUEUE_STATUSES = ['waiting', 'called', 'serving'];
const HISTORY_STATUSES = ['completed', 'cancelled', 'no-show'];
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const BUFFER_MINUTES = 5;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getQueueDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toMinutes(milliseconds) {
  return Math.max(0, Math.round(milliseconds / 60000));
}

function sortQueueEntries(entries, bookingPriorityEnabled = true) {
  const scoreByStatus = {
    called: 0,
    waiting: 1,
    serving: 2,
    completed: 3,
    cancelled: 4,
    'no-show': 5
  };

  return [...entries].sort((left, right) => {
    if (bookingPriorityEnabled && left.type !== right.type) {
      return left.type === 'booking' ? -1 : 1;
    }

    const leftStatusScore = scoreByStatus[left.status] ?? 99;
    const rightStatusScore = scoreByStatus[right.status] ?? 99;

    if (leftStatusScore !== rightStatusScore) {
      return leftStatusScore - rightStatusScore;
    }

    return new Date(left.joinedAt || left.createdAt).getTime() - new Date(right.joinedAt || right.createdAt).getTime();
  });
}

function calculateRemainingServiceMinutes(entry, barberLookup = {}) {
  if (!entry.startedAt) {
    return 0;
  }

  const startedAt = new Date(entry.startedAt).getTime();
  const elapsedMinutes = toMinutes(Date.now() - startedAt);
  const barberAverage = barberLookup[String(entry.barberId?._id || entry.barberId)]?.avgServiceTime;
  const baseline = barberAverage || entry.estimatedWaitTime || Number(process.env.DEFAULT_SERVICE_MINUTES || 30);

  return Math.max(0, baseline - elapsedMinutes);
}

function calculateEstimatedWait({
  positionAhead,
  activeBarbers,
  avgServiceTime,
  ongoingServices = [],
  bufferMinutes = BUFFER_MINUTES
}) {
  const barberCount = Math.max(activeBarbers, 1);
  const queueLoadMinutes = Math.ceil(Math.max(positionAhead, 0) / barberCount) * avgServiceTime;
  const remainingMinutes = ongoingServices.length > 0
    ? Math.round(ongoingServices.reduce((sum, value) => sum + value, 0) / barberCount)
    : 0;

  return Math.max(0, queueLoadMinutes + remainingMinutes + bufferMinutes);
}

function selectAvailableBarber(barbers, entries) {
  const onlineBarbers = barbers.filter((barber) => barber.isActive && barber.status === 'online');

  if (onlineBarbers.length === 0) {
    return null;
  }

  const loadMap = onlineBarbers.reduce((accumulator, barber) => {
    accumulator[String(barber._id)] = entries.filter((entry) => {
      return String(entry.barberId?._id || entry.barberId) === String(barber._id) && ['called', 'serving'].includes(entry.status);
    }).length;

    return accumulator;
  }, {});

  return [...onlineBarbers].sort((left, right) => {
    const loadDifference = loadMap[String(left._id)] - loadMap[String(right._id)];

    if (loadDifference !== 0) {
      return loadDifference;
    }

    return (left.totalServices || 0) - (right.totalServices || 0);
  })[0];
}

async function cleanupStaleServingEntries(shopId) {
  const staleThreshold = new Date(Date.now() - TWO_HOURS_MS);

  const staleEntries = await QueueEntry.find({
    shopId,
    status: 'serving',
    startedAt: { $lte: staleThreshold }
  });

  if (staleEntries.length === 0) {
    return [];
  }

  const ids = staleEntries.map((entry) => entry._id);

  await QueueEntry.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        status: 'cancelled',
        completedAt: new Date(),
        notes: 'Auto-cancelled after exceeding the 2-hour serving safety window.'
      }
    }
  );

  return ids;
}

async function loadQueueContext(shopId) {
  const [shop, barbers, entries] = await Promise.all([
    Shop.findById(shopId),
    Barber.find({ shopId, isActive: true }),
    QueueEntry.find({
      shopId,
      status: { $in: ACTIVE_QUEUE_STATUSES }
    })
      .populate('userId', 'name email phone')
      .populate('barberId', 'name avgServiceTime status')
      .sort({ joinedAt: 1 })
  ]);

  if (!shop) {
    throw createHttpError('Shop not found.', 404);
  }

  return { shop, barbers, entries };
}

async function recalculateQueueWaitTimes(shopId) {
  const { shop, barbers, entries } = await loadQueueContext(shopId);
  const bookingPriorityEnabled = shop.queueSettings?.bookingPriorityEnabled !== false;
  const sortedEntries = sortQueueEntries(entries, bookingPriorityEnabled);
  const waitingEntries = sortedEntries.filter((entry) => ['waiting', 'called'].includes(entry.status));
  const activeBarbers = barbers.filter((barber) => barber.isActive && barber.status === 'online');
  const averageServiceTime = Math.round(
    activeBarbers.reduce((sum, barber) => sum + (barber.avgServiceTime || shop.avgServiceTime || 30), 0) /
      Math.max(activeBarbers.length, 1)
  ) || shop.avgServiceTime || 30;
  const barberLookup = activeBarbers.reduce((accumulator, barber) => {
    accumulator[String(barber._id)] = barber;
    return accumulator;
  }, {});
  const ongoingServices = entries
    .filter((entry) => entry.status === 'serving')
    .map((entry) => calculateRemainingServiceMinutes(entry, barberLookup));

  const updates = [];

  waitingEntries.forEach((entry, index) => {
    const estimatedWaitTime = calculateEstimatedWait({
      positionAhead: index,
      activeBarbers: activeBarbers.length,
      avgServiceTime: averageServiceTime,
      ongoingServices
    });

    if (entry.estimatedWaitTime !== estimatedWaitTime) {
      updates.push({
        updateOne: {
          filter: { _id: entry._id },
          update: {
            $set: { estimatedWaitTime }
          }
        }
      });
    }
  });

  if (updates.length > 0) {
    await QueueEntry.bulkWrite(updates);
  }

  return getQueueStatus(shopId);
}

async function emitQueueUpdated(io, shopId) {
  if (!io) {
    return getQueueStatus(shopId);
  }

  const queueData = await recalculateQueueWaitTimes(shopId);
  emitToShop(io, shopId, 'queue:updated', { shopId, queueData });

  queueData.waitingEntries.forEach((entry, index) => {
    if (entry.userId?._id && index < 3) {
      emitToUser(io, entry.userId._id, 'turn:approaching', {
        position: index + 1,
        estTime: entry.estimatedWaitTime
      });
    }
  });

  return queueData;
}

async function getNextQueueNumber(shopId, dateKey) {
  const latestEntry = await QueueEntry.findOne({
    shopId,
    queueDateKey: dateKey
  }).sort({ queueNumber: -1 });

  return latestEntry ? latestEntry.queueNumber + 1 : 1;
}

async function createNotification({ userId, shopId, type, title, message, relatedQueueId }) {
  if (!userId) {
    return null;
  }

  return Notification.create({
    userId,
    shopId,
    type,
    title,
    message,
    relatedQueueId
  });
}

async function joinQueue(shopId, userId, serviceType = 'haircut', options = {}, io = null) {
  const dateKey = getQueueDateKey();
  const { shop, barbers, entries } = await loadQueueContext(shopId);

  if (!shop.isActive) {
    throw createHttpError('This shop is currently inactive.', 409);
  }

  if (shop.queueSettings?.isPaused) {
    throw createHttpError(shop.queueSettings.pauseReason || 'The queue is currently paused.', 409);
  }

  if (userId) {
    const existingActiveEntry = await QueueEntry.findOne({
      shopId,
      userId,
      status: { $in: ACTIVE_QUEUE_STATUSES }
    });

    if (existingActiveEntry) {
      throw createHttpError('This user already has an active queue entry.', 409);
    }
  }

  const queueNumber = await getNextQueueNumber(shopId, dateKey);
  const activeBarbers = barbers.filter((barber) => barber.isActive && barber.status === 'online');
  const activeWaitEntries = sortQueueEntries(
    entries.filter((entry) => ['waiting', 'called'].includes(entry.status)),
    shop.queueSettings?.bookingPriorityEnabled !== false
  );
  const estimatedWaitTime = calculateEstimatedWait({
    positionAhead: activeWaitEntries.length,
    activeBarbers: activeBarbers.length,
    avgServiceTime: Math.round(
      activeBarbers.reduce((sum, barber) => sum + (barber.avgServiceTime || shop.avgServiceTime || 30), 0) /
        Math.max(activeBarbers.length, 1)
    ) || shop.avgServiceTime || 30,
    ongoingServices: entries
      .filter((entry) => entry.status === 'serving')
      .map((entry) => calculateRemainingServiceMinutes(entry))
  });

  const queueEntry = await QueueEntry.create({
    shopId,
    userId: userId || null,
    queueNumber,
    queueDateKey: dateKey,
    type: options.type || 'walk-in',
    status: 'waiting',
    estimatedWaitTime,
    serviceType,
    notes: options.notes || '',
    checkInStatus: options.checkInStatus || 'pending'
  });

  await AnalyticsEvent.create({
    shopId,
    eventType: 'queue_join',
    metadata: {
      queueEntryId: queueEntry._id.toString(),
      queueNumber,
      type: queueEntry.type,
      serviceType
    }
  });

  if (userId) {
    await createNotification({
      userId,
      shopId,
      type: 'turn_soon',
      title: 'You joined the queue',
      message: `You are number ${queueNumber} in line with an estimated wait of ${estimatedWaitTime} minutes.`,
      relatedQueueId: queueEntry._id
    });
  }

  const queueData = await emitQueueUpdated(io, shopId);

  if (io && userId) {
    const positionData = await getUserPosition(shopId, userId);

    emitToUser(io, userId, 'queue:joined', {
      queueNumber,
      position: positionData?.position ?? null,
      estWait: estimatedWaitTime
    });
  }

  return {
    queueEntry: await QueueEntry.findById(queueEntry._id).populate('userId', 'name email phone'),
    queueData
  };
}

async function getNextInLine(shopId) {
  const { shop, entries } = await loadQueueContext(shopId);

  const waitingEntries = sortQueueEntries(
    entries.filter((entry) => entry.status === 'waiting'),
    shop.queueSettings?.bookingPriorityEnabled !== false
  );

  return waitingEntries[0] || null;
}

async function callNextCustomer(shopId, barberId = null, io = null) {
  await cleanupStaleServingEntries(shopId);

  const { shop, barbers, entries } = await loadQueueContext(shopId);

  if (shop.queueSettings?.isPaused) {
    throw createHttpError(shop.queueSettings.pauseReason || 'The queue is currently paused.', 409);
  }

  const nextEntry = await getNextInLine(shopId);

  if (!nextEntry) {
    throw createHttpError('There is no waiting customer in the queue.', 404);
  }

  let selectedBarber = barberId
    ? await Barber.findOne({ _id: barberId, shopId, isActive: true })
    : null;

  if (!selectedBarber) {
    selectedBarber = selectAvailableBarber(barbers, entries);
  }

  if (!selectedBarber) {
    throw createHttpError('No active barber is available to call the next customer.', 409);
  }

  nextEntry.status = 'called';
  nextEntry.calledAt = new Date();
  nextEntry.barberId = selectedBarber._id;
  nextEntry.checkInStatus = nextEntry.checkInStatus === 'pending' ? 'checked-in' : nextEntry.checkInStatus;

  await nextEntry.save();

  if (nextEntry.userId?._id && io) {
    emitToUser(io, nextEntry.userId._id, 'customer:called', {
      queueNumber: nextEntry.queueNumber,
      barberName: selectedBarber.name
    });
  }

  const queueData = await emitQueueUpdated(io, shopId);

  return {
    queueEntry: await QueueEntry.findById(nextEntry._id)
      .populate('userId', 'name email phone')
      .populate('barberId', 'name status'),
    queueData
  };
}

async function startService(queueEntryId, barberId, io = null) {
  const queueEntry = await QueueEntry.findById(queueEntryId);

  if (!queueEntry) {
    throw createHttpError('Queue entry not found.', 404);
  }

  if (!barberId && !queueEntry.barberId) {
    throw createHttpError('A barber must be assigned before service can start.', 400);
  }

  queueEntry.status = 'serving';
  queueEntry.barberId = barberId || queueEntry.barberId;
  queueEntry.startedAt = new Date();

  await queueEntry.save();

  const barber = await Barber.findById(queueEntry.barberId);

  if (queueEntry.userId && io) {
    emitToUser(io, queueEntry.userId, 'service:started', {
      barberName: barber?.name || 'Assigned barber'
    });
  }

  const queueData = await emitQueueUpdated(io, queueEntry.shopId);

  return {
    queueEntry: await QueueEntry.findById(queueEntryId)
      .populate('userId', 'name email phone')
      .populate('barberId', 'name status'),
    queueData
  };
}

async function completeService(queueEntryId, io = null) {
  const queueEntry = await QueueEntry.findById(queueEntryId);

  if (!queueEntry) {
    throw createHttpError('Queue entry not found.', 404);
  }

  const completedAt = new Date();
  const actualWaitTime = queueEntry.startedAt
    ? toMinutes(new Date(queueEntry.startedAt).getTime() - new Date(queueEntry.joinedAt).getTime())
    : queueEntry.estimatedWaitTime;

  queueEntry.status = 'completed';
  queueEntry.completedAt = completedAt;
  queueEntry.actualWaitTime = actualWaitTime;

  await queueEntry.save();

  if (queueEntry.barberId) {
    await Barber.findByIdAndUpdate(queueEntry.barberId, {
      $inc: {
        totalServices: 1
      }
    });
  }

  if (queueEntry.userId) {
    await User.findByIdAndUpdate(queueEntry.userId, {
      $inc: {
        totalVisits: 1
      }
    });
  }

  await AnalyticsEvent.create({
    shopId: queueEntry.shopId,
    eventType: 'complete',
    metadata: {
      queueEntryId: queueEntry._id.toString(),
      actualWaitTime
    }
  });

  if (queueEntry.userId && io) {
    emitToUser(io, queueEntry.userId, 'service:completed', {
      totalTime: actualWaitTime,
      requestReview: true
    });
  }

  const queueData = await emitQueueUpdated(io, queueEntry.shopId);

  return {
    queueEntry,
    queueData
  };
}

async function markNoShow(queueEntryId, io = null) {
  const queueEntry = await QueueEntry.findById(queueEntryId);

  if (!queueEntry) {
    throw createHttpError('Queue entry not found.', 404);
  }

  queueEntry.status = 'no-show';
  queueEntry.completedAt = new Date();
  queueEntry.checkInStatus = 'expired';

  await queueEntry.save();

  await AnalyticsEvent.create({
    shopId: queueEntry.shopId,
    eventType: 'no_show',
    metadata: {
      queueEntryId: queueEntry._id.toString(),
      queueNumber: queueEntry.queueNumber
    }
  });

  const queueData = await emitQueueUpdated(io, queueEntry.shopId);

  return {
    queueEntry,
    queueData
  };
}

async function cancelQueue(queueEntryId, reason = '', io = null) {
  const queueEntry = await QueueEntry.findById(queueEntryId);

  if (!queueEntry) {
    throw createHttpError('Queue entry not found.', 404);
  }

  queueEntry.status = 'cancelled';
  queueEntry.completedAt = new Date();
  queueEntry.notes = reason ? `Cancelled: ${reason}` : 'Cancelled by user or admin.';

  await queueEntry.save();

  const queueData = await emitQueueUpdated(io, queueEntry.shopId);

  return {
    queueEntry,
    queueData
  };
}

async function pauseQueue(shopId, reason = 'Queue paused by admin.') {
  const shop = await Shop.findByIdAndUpdate(
    shopId,
    {
      $set: {
        'queueSettings.isPaused': true,
        'queueSettings.pauseReason': reason
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!shop) {
    throw createHttpError('Shop not found.', 404);
  }

  return shop;
}

async function resumeQueue(shopId) {
  const shop = await Shop.findByIdAndUpdate(
    shopId,
    {
      $set: {
        'queueSettings.isPaused': false,
        'queueSettings.pauseReason': ''
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!shop) {
    throw createHttpError('Shop not found.', 404);
  }

  return shop;
}

async function getQueueStatus(shopId) {
  const { shop, barbers, entries } = await loadQueueContext(shopId);
  const bookingPriorityEnabled = shop.queueSettings?.bookingPriorityEnabled !== false;
  const sortedEntries = sortQueueEntries(entries, bookingPriorityEnabled);
  const waitingEntries = sortedEntries.filter((entry) => ['waiting', 'called'].includes(entry.status));
  const nowServing = sortedEntries.find((entry) => entry.status === 'serving') || null;

  return {
    shopId: String(shopId),
    queuePaused: !!shop.queueSettings?.isPaused,
    pauseReason: shop.queueSettings?.pauseReason || '',
    totalActive: entries.length,
    waitingCount: waitingEntries.length,
    servingCount: sortedEntries.filter((entry) => entry.status === 'serving').length,
    nowServing,
    activeBarbers: barbers.filter((barber) => barber.isActive && barber.status === 'online'),
    waitingEntries,
    entries: sortedEntries
  };
}

async function getUserPosition(shopId, userId) {
  if (!userId) {
    return null;
  }

  const queueData = await getQueueStatus(shopId);
  const index = queueData.waitingEntries.findIndex((entry) => String(entry.userId?._id || entry.userId) === String(userId));

  if (index === -1) {
    const servingEntry = queueData.entries.find((entry) => {
      return entry.status === 'serving' && String(entry.userId?._id || entry.userId) === String(userId);
    });

    if (servingEntry) {
      return {
        position: 0,
        status: 'serving',
        estimatedWaitTime: 0,
        queueEntryId: servingEntry._id
      };
    }

    return null;
  }

  const entry = queueData.waitingEntries[index];

  return {
    position: index + 1,
    status: entry.status,
    estimatedWaitTime: entry.estimatedWaitTime,
    queueEntryId: entry._id
  };
}

async function getTodayHistory(shopId) {
  const dateKey = getQueueDateKey();

  return QueueEntry.find({
    shopId,
    queueDateKey: dateKey,
    status: { $in: HISTORY_STATUSES }
  })
    .populate('userId', 'name email phone')
    .populate('barberId', 'name status')
    .sort({ completedAt: -1, updatedAt: -1 });
}

module.exports = {
  ACTIVE_QUEUE_STATUSES,
  BUFFER_MINUTES,
  calculateEstimatedWait,
  cancelQueue,
  callNextCustomer,
  cleanupStaleServingEntries,
  completeService,
  createHttpError,
  getNextInLine,
  getQueueDateKey,
  getQueueStatus,
  getTodayHistory,
  getUserPosition,
  joinQueue,
  markNoShow,
  pauseQueue,
  recalculateQueueWaitTimes,
  resumeQueue,
  selectAvailableBarber,
  sortQueueEntries,
  startService
};
