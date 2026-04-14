const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
);

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    operatingHours: {
      open: {
        type: String,
        default: '09:00'
      },
      close: {
        type: String,
        default: '20:00'
      }
    },
    avgServiceTime: {
      type: Number,
      default: Number(process.env.DEFAULT_SERVICE_MINUTES || 30)
    },
    bookingFee: {
      type: Number,
      default: Number(process.env.DEFAULT_BOOKING_FEE || 5)
    },
    currency: {
      type: String,
      default: process.env.DEFAULT_CURRENCY || 'RM'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    queueSettings: {
      isPaused: {
        type: Boolean,
        default: false
      },
      pauseReason: {
        type: String,
        default: ''
      },
      bookingPriorityEnabled: {
        type: Boolean,
        default: true
      }
    },
    branches: {
      type: [branchSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Shop', shopSchema);
