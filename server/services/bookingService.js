const crypto = require('crypto');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Barber = require('../models/Barber');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Shop = require('../models/Shop');
const { emitToUser } = require('../socket');
const { joinQueue } = require('./queueService');

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'checked-in'];
const DEFAULT_BUFFER_MINUTES = 5;

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function padTime(value) {
  return String(value).padStart(2, '0');
}

function formatTimeFromMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${padTime(hours)}:${padTime(minutes)}`;
}

function parseTimeString(time) {
  const [hours, minutes] = String(time).split(':').map(Number);

  return (hours * 60) + minutes;
}

function getDateKey(date) {
  const normalizedDate = new Date(date);

  return `${normalizedDate.getFullYear()}-${padTime(normalizedDate.getMonth() + 1)}-${padTime(normalizedDate.getDate())}`;
}

function combineDateAndTime(date, time) {
  const normalizedDate = new Date(date);
  const [hours, minutes] = String(time).split(':').map(Number);

  return new Date(
    normalizedDate.getFullYear(),
    normalizedDate.getMonth(),
    normalizedDate.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

function addMinutes(time, minutesToAdd) {
  return formatTimeFromMinutes(parseTimeString(time) + minutesToAdd);
}

function buildSlot({
  startTime,
  endTime,
  barberIds,
  durationMinutes,
  price,
  currency
}) {
  return {
    startTime,
    endTime,
    barberIds,
    durationMinutes,
    price,
    currency
  };
}

function isSameDate(left, right) {
  return getDateKey(left) === getDateKey(right);
}

async function loadBookingContext(shopId, barberId = null) {
  const [shop, barbers] = await Promise.all([
    Shop.findById(shopId),
    Barber.find(
      barberId
        ? { _id: barberId, shopId, isActive: true }
        : { shopId, isActive: true, status: { $ne: 'offline' } }
    )
  ]);

  if (!shop) {
    throw createHttpError('Shop not found.', 404);
  }

  if (barberId && barbers.length === 0) {
    throw createHttpError('Selected barber is not available for bookings.', 404);
  }

  return { shop, barbers };
}

async function findActiveBookings(shopId, date, barberId = null) {
  const dateKey = getDateKey(date);
  const startOfDay = new Date(`${dateKey}T00:00:00`);
  const endOfDay = new Date(`${dateKey}T23:59:59.999`);
  const query = {
    shopId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ACTIVE_BOOKING_STATUSES }
  };

  if (barberId) {
    query.barberId = barberId;
  }

  return Booking.find(query).sort({ startTime: 1 });
}

async function getAvailableSlots(shopId, date, barberId = null) {
  if (!date) {
    throw createHttpError('date is required.', 400);
  }

  const { shop, barbers } = await loadBookingContext(shopId, barberId);
  const activeBookings = await findActiveBookings(shopId, date, barberId);
  const bookingBuffer = DEFAULT_BUFFER_MINUTES;
  const slotDuration = Number(shop.avgServiceTime || process.env.DEFAULT_SERVICE_MINUTES || 30);
  const openMinutes = parseTimeString(shop.operatingHours?.open || '09:00');
  const closeMinutes = parseTimeString(shop.operatingHours?.close || '20:00');
  const barbersById = barbers.reduce((accumulator, currentBarber) => {
    accumulator[String(currentBarber._id)] = currentBarber;
    return accumulator;
  }, {});

  const slots = [];

  for (let start = openMinutes; start + slotDuration <= closeMinutes; start += slotDuration + bookingBuffer) {
    const startTime = formatTimeFromMinutes(start);
    const endTime = formatTimeFromMinutes(start + slotDuration);
    const availableBarbers = barbers.filter((currentBarber) => {
      const barberBookings = activeBookings.filter((booking) => {
        return String(booking.barberId) === String(currentBarber._id);
      });

      return barberBookings.every((booking) => booking.startTime !== startTime);
    });

    if (availableBarbers.length > 0) {
      slots.push(
        buildSlot({
          startTime,
          endTime,
          barberIds: availableBarbers.map((currentBarber) => String(currentBarber._id)),
          durationMinutes: slotDuration,
          price: shop.bookingFee || 0,
          currency: shop.currency
        })
      );
    }
  }

  return {
    shopId: String(shopId),
    date: getDateKey(date),
    barberId: barberId || null,
    slotDuration,
    bufferMinutes: bookingBuffer,
    availableSlots: barberId
      ? slots
      : slots.map((slot) => ({
          ...slot,
          barbers: slot.barberIds.map((id) => ({
            _id: id,
            name: barbersById[id]?.name || 'Available barber'
          }))
        }))
  };
}

async function ensureSlotAvailable(shopId, date, startTime, barberId = null) {
  const slotMap = await getAvailableSlots(shopId, date, barberId);
  const slot = slotMap.availableSlots.find((currentSlot) => currentSlot.startTime === startTime);

  if (!slot) {
    throw createHttpError('Selected slot is no longer available.', 409);
  }

  return slot;
}

async function createBooking(shopId, userId, slotData) {
  const { date, startTime, barberId = null, serviceType = 'premium haircut', notes = '' } = slotData;

  if (!shopId || !userId || !date || !startTime) {
    throw createHttpError('shopId, userId, date, and startTime are required.', 400);
  }

  const slot = await ensureSlotAvailable(shopId, date, startTime, barberId);
  const assignedBarberId = barberId || slot.barberIds[0] || null;

  const booking = await Booking.create({
    shopId,
    userId,
    barberId: assignedBarberId,
    scheduledDate: combineDateAndTime(date, startTime),
    startTime,
    endTime: slot.endTime,
    status: 'pending',
    paymentStatus: 'pending',
    amount: slot.price,
    currency: slot.currency,
    serviceType,
    notes,
    checkInCode: crypto.randomBytes(8).toString('hex')
  });

  await AnalyticsEvent.create({
    shopId,
    eventType: 'booking',
    metadata: {
      bookingId: booking._id.toString(),
      startTime,
      serviceType
    }
  });

  return Booking.findById(booking._id)
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status');
}

async function confirmBooking(bookingId) {
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        status: 'confirmed',
        paymentStatus: 'paid'
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status');

  if (!booking) {
    throw createHttpError('Booking not found.', 404);
  }

  return booking;
}

async function checkInBooking(bookingId, qrCode = null, io = null) {
  const booking = await Booking.findById(bookingId)
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status');

  if (!booking) {
    throw createHttpError('Booking not found.', 404);
  }

  if (qrCode && booking.checkInCode && booking.checkInCode !== qrCode) {
    throw createHttpError('Invalid QR code for this booking.', 400);
  }

  if (!['pending', 'confirmed', 'checked-in'].includes(booking.status)) {
    throw createHttpError('This booking cannot be checked in anymore.', 409);
  }

  booking.status = 'checked-in';
  booking.checkInTime = new Date();
  await booking.save();

  const joinResult = await joinQueue(
    booking.shopId,
    booking.userId?._id || booking.userId,
    booking.serviceType,
    {
      type: 'booking',
      notes: `Booking check-in for ${booking.startTime}`,
      checkInStatus: 'checked-in'
    },
    io
  );

  if (io && booking.userId?._id) {
    emitToUser(io, booking.userId._id, 'booking:checked-in', {
      bookingId: booking._id,
      queueEntryId: joinResult.queueEntry._id
    });
  }

  return {
    booking,
    queueEntry: joinResult.queueEntry,
    queueData: joinResult.queueData
  };
}

async function cancelBooking(bookingId, reason = 'Cancelled by customer.') {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createHttpError('Booking not found.', 404);
  }

  if (['cancelled', 'expired'].includes(booking.status)) {
    return booking;
  }

  booking.status = 'cancelled';
  booking.cancellationReason = reason;

  if (booking.paymentStatus === 'paid') {
    booking.paymentStatus = 'refunded';
  }

  await booking.save();

  return booking;
}

async function expireBookings(io = null) {
  const now = new Date();
  const bookings = await Booking.find({
    status: { $in: ['pending', 'confirmed'] }
  }).populate('userId', 'name email phone');
  const expiredBookings = [];

  for (const booking of bookings) {
    const startDateTime = combineDateAndTime(booking.scheduledDate, booking.startTime);

    if (startDateTime.getTime() + (10 * 60 * 1000) < now.getTime()) {
      booking.status = 'expired';
      booking.cancellationReason = 'Auto-expired after missing the 10-minute check-in window.';
      await booking.save();
      expiredBookings.push(booking);

      if (booking.userId?._id) {
        await Notification.create({
          userId: booking.userId._id,
          shopId: booking.shopId,
          type: 'cancelled',
          title: 'Booking expired',
          message: 'Your booking expired because check-in did not happen in time.',
          relatedBookingId: booking._id
        });

        if (io) {
          emitToUser(io, booking.userId._id, 'booking:expired', {
            bookingId: booking._id
          });
        }
      }
    }
  }

  return expiredBookings;
}

async function sendUpcomingBookingReminders(io = null) {
  const now = new Date();
  const reminderThresholdStart = now.getTime() + (14 * 60 * 1000);
  const reminderThresholdEnd = now.getTime() + (16 * 60 * 1000);
  const bookings = await Booking.find({
    status: { $in: ['pending', 'confirmed'] }
  }).populate('userId', 'name email phone');
  const remindedBookings = [];

  for (const booking of bookings) {
    const startDateTime = combineDateAndTime(booking.scheduledDate, booking.startTime).getTime();

    if (startDateTime >= reminderThresholdStart && startDateTime <= reminderThresholdEnd) {
      const existingReminder = await Notification.findOne({
        relatedBookingId: booking._id,
        type: 'booking_reminder',
        sentAt: {
          $gte: new Date(startDateTime - (30 * 60 * 1000))
        }
      });

      if (!existingReminder && booking.userId?._id) {
        const notification = await Notification.create({
          userId: booking.userId._id,
          shopId: booking.shopId,
          type: 'booking_reminder',
          title: 'Booking reminder',
          message: `Your booking starts at ${booking.startTime}. Please check in soon.`,
          relatedBookingId: booking._id
        });

        remindedBookings.push(notification);

        if (io) {
          emitToUser(io, booking.userId._id, 'booking:reminder', {
            bookingId: booking._id,
            startTime: booking.startTime
          });
        }
      }
    }
  }

  return remindedBookings;
}

async function expirePendingPayments() {
  const now = new Date();
  const bookings = await Booking.find({
    status: 'pending',
    paymentStatus: 'pending'
  });
  const expiredPayments = [];

  for (const booking of bookings) {
    if (booking.createdAt.getTime() + (15 * 60 * 1000) < now.getTime()) {
      booking.status = 'expired';
      booking.cancellationReason = 'Payment was not completed within 15 minutes.';
      await booking.save();
      expiredPayments.push(booking);
    }
  }

  return expiredPayments;
}

module.exports = {
  ACTIVE_BOOKING_STATUSES,
  addMinutes,
  cancelBooking,
  checkInBooking,
  combineDateAndTime,
  confirmBooking,
  createBooking,
  createHttpError,
  ensureSlotAvailable,
  expireBookings,
  expirePendingPayments,
  formatTimeFromMinutes,
  getAvailableSlots,
  getDateKey,
  parseTimeString,
  sendUpcomingBookingReminders
};
