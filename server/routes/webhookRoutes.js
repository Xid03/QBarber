const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

router.post('/stripe', webhookController.handleStripeWebhook);

module.exports = router;
