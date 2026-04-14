const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const query = req.query.userId ? { userId: req.query.userId } : {};
  const notifications = await Notification.find(query).sort({ sentAt: -1 });

  return res.status(200).json({
    success: true,
    data: notifications
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    {
      isRead: true,
      readAt: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data: notification
  });
});

module.exports = {
  listNotifications,
  markNotificationRead
};
