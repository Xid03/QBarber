const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    queueNumber: {
      type: Number,
      required: true
    },
    queueDateKey: {
      type: String,
      required: true,
      default() {
        return new Date().toISOString().slice(0, 10);
      }
    },
    type: {
      type: String,
      enum: ['walk-in', 'booking'],
      default: 'walk-in'
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'serving', 'completed', 'cancelled', 'no-show'],
      default: 'waiting'
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    calledAt: Date,
    startedAt: Date,
    completedAt: Date,
    estimatedWaitTime: {
      type: Number,
      default: 0
    },
    actualWaitTime: {
      type: Number,
      default: 0
    },
    serviceType: {
      type: String,
      default: 'haircut'
    },
    notes: {
      type: String,
      default: ''
    },
    checkInStatus: {
      type: String,
      enum: ['pending', 'checked-in', 'expired'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

queueEntrySchema.index({ shopId: 1, queueDateKey: 1, queueNumber: 1 }, { unique: true });
queueEntrySchema.index({ shopId: 1, status: 1, joinedAt: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
