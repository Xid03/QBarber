const AnalyticsEvent = require('../models/AnalyticsEvent');
const Booking = require('../models/Booking');
const QueueEntry = require('../models/QueueEntry');
const asyncHandler = require('../middleware/asyncHandler');

const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const query = req.query.shopId ? { shopId: req.query.shopId } : {};

  const [events, bookings, queueEntries] = await Promise.all([
    AnalyticsEvent.find(query).sort({ timestamp: -1 }).limit(20),
    Booking.find(query).countDocuments(),
    QueueEntry.find(query).countDocuments()
  ]);

  return res.status(200).json({
    success: true,
    data: {
      totalBookings: bookings,
      totalQueueEntries: queueEntries,
      recentEvents: events
    }
  });
});

module.exports = {
  getAnalyticsSummary
};
