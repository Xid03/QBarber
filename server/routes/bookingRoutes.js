const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.get('/slots', bookingController.getAvailableSlotsHandler);
router.post('/', authenticate, bookingController.createBookingHandler);
router.get('/my-bookings', authenticate, bookingController.getMyBookingsHandler);
router.get('/:id', authenticate, bookingController.getBookingByIdHandler);
router.put('/:id/cancel', authenticate, bookingController.cancelBookingHandler);
router.post('/:id/checkin', optionalAuth, bookingController.checkInBookingHandler);
router.post('/:id/pay', authenticate, bookingController.payForBookingHandler);

module.exports = router;
