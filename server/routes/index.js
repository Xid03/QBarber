const express = require('express');
const adminBookingRoutes = require('./adminBookingRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const authRoutes = require('./authRoutes');
const barberRoutes = require('./barberRoutes');
const bookingRoutes = require('./bookingRoutes');
const notificationRoutes = require('./notificationRoutes');
const queueRoutes = require('./queueRoutes');
const shopRoutes = require('./shopRoutes');
const webhookRoutes = require('./webhookRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/queue', queueRoutes);
router.use('/bookings', bookingRoutes);
router.use('/barbers', barberRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/webhook', webhookRoutes);
router.use('/admin/bookings', adminBookingRoutes);

module.exports = router;
