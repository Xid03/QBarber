const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    eventType: {
      type: String,
      enum: ['queue_join', 'complete', 'booking', 'no_show'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
