const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('owner', 'admin'), analyticsController.getAnalyticsSummary);

module.exports = router;
