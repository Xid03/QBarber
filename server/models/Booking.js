const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      default: null
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      default: 'premium haircut'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'completed', 'cancelled', 'expired'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: process.env.DEFAULT_CURRENCY || 'RM'
    },
    paymentId: {
      type: String,
      default: ''
    },
    checkInCode: {
      type: String,
      default: ''
    },
    checkInTime: Date,
    cancellationReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ shopId: 1, scheduledDate: 1, startTime: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
