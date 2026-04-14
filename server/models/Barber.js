const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    photo: {
      type: String,
      default: ''
    },
    specialty: {
      type: String,
      default: 'General grooming'
    },
    avgServiceTime: {
      type: Number,
      default: Number(process.env.DEFAULT_SERVICE_MINUTES || 30)
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'break'],
      default: 'online'
    },
    rating: {
      type: Number,
      default: 5
    },
    totalServices: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Barber', barberSchema);
