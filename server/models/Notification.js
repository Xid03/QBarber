const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    type: {
      type: String,
      enum: ['turn_soon', 'now_serving', 'booking_reminder', 'cancelled'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedQueueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QueueEntry',
      default: null
    },
    relatedBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
