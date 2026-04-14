const cron = require('node-cron');
const { expireBookings, expirePendingPayments, sendUpcomingBookingReminders } = require('./bookingService');

function startBookingAutomation(io) {
  const minuteJob = cron.schedule('* * * * *', async () => {
    try {
      await sendUpcomingBookingReminders(io);
      await expireBookings(io);
      await expirePendingPayments();
    } catch (error) {
      console.error('Booking automation minute job failed:', error.message);
    }
  });

  const midnightJob = cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Booking automation midnight job ran.');
    } catch (error) {
      console.error('Booking automation midnight job failed:', error.message);
    }
  });

  return {
    minuteJob,
    midnightJob,
    stop() {
      minuteJob.stop();
      midnightJob.stop();
    }
  };
}

module.exports = {
  startBookingAutomation
};
