const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const {
  cancelBooking,
  checkInBooking,
  confirmBooking,
  createBooking,
  getAvailableSlots
} = require('../services/bookingService');
const { createPaymentIntent } = require('../services/paymentService');

const getAvailableSlotsHandler = asyncHandler(async (req, res) => {
  const { shopId, date, barberId = null } = req.query;

  if (!shopId || !date) {
    return res.status(400).json({
      success: false,
      message: 'shopId and date are required.'
    });
  }

  const slots = await getAvailableSlots(shopId, date, barberId);

  return res.status(200).json({
    success: true,
    data: slots
  });
});

const createBookingHandler = asyncHandler(async (req, res) => {
  const booking = await createBooking(req.body.shopId, req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Booking created successfully.',
    data: booking
  });
});

const getMyBookingsHandler = asyncHandler(async (req, res) => {
  const query = {
    userId: req.user._id
  };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const bookings = await Booking.find(query)
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status')
    .sort({ scheduledDate: 1, startTime: 1 });

  return res.status(200).json({
    success: true,
    data: bookings
  });
});

const getBookingByIdHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.'
    });
  }

  if (
    req.user &&
    !['owner', 'admin'].includes(req.user.role) &&
    String(booking.userId?._id || booking.userId) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view this booking.'
    });
  }

  return res.status(200).json({
    success: true,
    data: booking
  });
});

const cancelBookingHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.'
    });
  }

  if (
    !['owner', 'admin'].includes(req.user.role) &&
    String(booking.userId) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to cancel this booking.'
    });
  }

  const updatedBooking = await cancelBooking(req.params.id, req.body?.reason || 'Cancelled by user.');

  return res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully.',
    data: updatedBooking
  });
});

const checkInBookingHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const booking = await Booking.findById(req.params.id).populate('userId', 'name email phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.'
    });
  }

  const hasPrivilegedAccess = req.user && ['owner', 'admin'].includes(req.user.role);
  const isOwner = req.user && String(booking.userId?._id || booking.userId) === String(req.user._id);
  const hasQrCode = Boolean(req.body?.qrCode);

  if (!hasPrivilegedAccess && !isOwner && !hasQrCode) {
    return res.status(400).json({
      success: false,
      message: 'Provide a QR code or log in as the booking owner/admin to check in.'
    });
  }

  const result = await checkInBooking(req.params.id, req.body?.qrCode || null, io);

  return res.status(200).json({
    success: true,
    message: 'Booking checked in successfully.',
    data: result
  });
});

const payForBookingHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.'
    });
  }

  if (
    !['owner', 'admin'].includes(req.user.role) &&
    String(booking.userId) !== String(req.user._id)
  ) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to pay for this booking.'
    });
  }

  const result = await createPaymentIntent(req.params.id, req.body?.amount);

  return res.status(200).json({
    success: true,
    message: result.paymentIntent.mocked
      ? 'Mock payment completed and booking confirmed.'
      : 'Payment intent created successfully.',
    data: result
  });
});

const listAdminBookingsHandler = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.shopId) {
    query.shopId = req.query.shopId;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.date) {
    const normalizedDate = new Date(req.query.date);
    const startOfDay = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate());
    const endOfDay = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate(), 23, 59, 59, 999);

    query.scheduledDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const bookings = await Booking.find(query)
    .populate('userId', 'name email phone')
    .populate('barberId', 'name specialty status')
    .sort({ scheduledDate: 1, startTime: 1 });

  return res.status(200).json({
    success: true,
    data: bookings
  });
});

const updateAdminBookingHandler = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found.'
    });
  }

  let updatedBooking;

  if (req.body?.status === 'confirmed') {
    updatedBooking = await confirmBooking(req.params.id);
  } else if (req.body?.status === 'cancelled') {
    updatedBooking = await cancelBooking(req.params.id, req.body?.reason || 'Cancelled by admin.');
  } else {
    updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('userId', 'name email phone')
      .populate('barberId', 'name specialty status');
  }

  return res.status(200).json({
    success: true,
    message: 'Booking updated successfully.',
    data: updatedBooking
  });
});

module.exports = {
  cancelBookingHandler,
  checkInBookingHandler,
  createBookingHandler,
  getAvailableSlotsHandler,
  getBookingByIdHandler,
  getMyBookingsHandler,
  listAdminBookingsHandler,
  payForBookingHandler,
  updateAdminBookingHandler
};
