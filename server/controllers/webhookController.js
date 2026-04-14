const asyncHandler = require('../middleware/asyncHandler');
const { handleWebhook } = require('../services/paymentService');

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const result = await handleWebhook(req.body);

  return res.status(200).json({
    success: true,
    message: 'Webhook received successfully.',
    data: result
  });
});

module.exports = {
  handleStripeWebhook
};
