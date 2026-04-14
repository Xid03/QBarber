const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('owner', 'admin'), bookingController.listAdminBookingsHandler);
router.put('/:id', authenticate, authorize('owner', 'admin'), bookingController.updateAdminBookingHandler);

module.exports = router;
