const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, notificationController.listNotifications);
router.patch('/:id/read', authenticate, notificationController.markNotificationRead);

module.exports = router;
