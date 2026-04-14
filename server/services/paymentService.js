const Booking = require('../models/Booking');
const { confirmBooking, createHttpError } = require('./bookingService');

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function createPaymentIntent(bookingId, amount) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createHttpError('Booking not found.', 404);
  }

  const paymentAmount = amount ?? booking.amount;
  const paymentId = `mock_pi_${booking._id}_${Date.now()}`;

  booking.paymentId = paymentId;
  booking.amount = paymentAmount;
  await booking.save();

  if (String(process.env.MOCK_PAYMENTS).toLowerCase() === 'true') {
    await wait(2000);
    const confirmedBooking = await confirmBooking(bookingId);

    return {
      booking: confirmedBooking,
      paymentIntent: {
        id: paymentId,
        clientSecret: `${paymentId}_secret_mock`,
        amount: paymentAmount,
        currency: booking.currency,
        status: 'succeeded',
        mocked: true
      }
    };
  }

  return {
    booking,
    paymentIntent: {
      id: paymentId,
      clientSecret: `${paymentId}_secret_placeholder`,
      amount: paymentAmount,
      currency: booking.currency,
      status: 'requires_confirmation',
      mocked: false
    }
  };
}

async function refundBooking(bookingId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createHttpError('Booking not found.', 404);
  }

  booking.paymentStatus = 'refunded';
  booking.status = booking.status === 'completed' ? booking.status : 'cancelled';
  await booking.save();

  return booking;
}

async function handleWebhook(event) {
  if (event?.type === 'payment_intent.succeeded' && event?.data?.object?.metadata?.bookingId) {
    const booking = await confirmBooking(event.data.object.metadata.bookingId);

    return {
      acknowledged: true,
      booking
    };
  }

  return {
    acknowledged: true,
    ignored: true
  };
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
  refundBooking
};
