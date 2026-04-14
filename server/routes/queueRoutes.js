const express = require('express');
const queueController = require('../controllers/queueController');
const { authenticate, authorize } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.post('/join', optionalAuth, queueController.joinQueueHandler);
router.get('/status/:shopId', queueController.getQueueStatusHandler);
router.get('/my-position', authenticate, queueController.getMyPositionHandler);
router.delete('/leave/:id', optionalAuth, queueController.leaveQueueHandler);
router.post('/call-next', authenticate, authorize('owner', 'admin'), queueController.callNextHandler);
router.put('/:id/start', authenticate, authorize('owner', 'admin'), queueController.startServiceHandler);
router.put('/:id/complete', authenticate, authorize('owner', 'admin'), queueController.completeServiceHandler);
router.put('/:id/no-show', authenticate, authorize('owner', 'admin'), queueController.markNoShowHandler);
router.post('/pause', authenticate, authorize('owner', 'admin'), queueController.pauseQueueHandler);
router.post('/resume', authenticate, authorize('owner', 'admin'), queueController.resumeQueueHandler);
router.get('/history', authenticate, authorize('owner', 'admin'), queueController.historyHandler);

module.exports = router;
