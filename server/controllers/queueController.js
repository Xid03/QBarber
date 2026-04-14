const QueueEntry = require('../models/QueueEntry');
const asyncHandler = require('../middleware/asyncHandler');
const {
  cancelQueue,
  callNextCustomer,
  completeService,
  getQueueStatus,
  getTodayHistory,
  getUserPosition,
  joinQueue,
  markNoShow,
  pauseQueue,
  resumeQueue,
  startService
} = require('../services/queueService');

const joinQueueHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const { shopId, serviceType = 'haircut', type = 'walk-in', notes = '' } = req.body;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId is required.'
    });
  }

  const result = await joinQueue(
    shopId,
    req.user?._id || null,
    serviceType,
    {
      type,
      notes
    },
    io
  );

  return res.status(201).json({
    success: true,
    message: 'Queue joined successfully.',
    data: result
  });
});

const getQueueStatusHandler = asyncHandler(async (req, res) => {
  const queueData = await getQueueStatus(req.params.shopId);

  return res.status(200).json({
    success: true,
    data: queueData
  });
});

const getMyPositionHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Login is required to get the current user position.'
    });
  }

  const { shopId } = req.query;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId query parameter is required.'
    });
  }

  const position = await getUserPosition(shopId, req.user._id);

  return res.status(200).json({
    success: true,
    data: position
  });
});

const leaveQueueHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const queueEntry = await QueueEntry.findById(req.params.id);

  if (!queueEntry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.'
    });
  }

  if (req.user && queueEntry.userId && String(queueEntry.userId) !== String(req.user._id) && !['owner', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to leave this queue entry.'
    });
  }

  const result = await cancelQueue(req.params.id, req.body?.reason || 'Left the queue.', io);

  return res.status(200).json({
    success: true,
    message: 'Queue entry cancelled successfully.',
    data: result
  });
});

const callNextHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const { shopId, barberId = null } = req.body;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId is required.'
    });
  }

  const result = await callNextCustomer(shopId, barberId, io);

  return res.status(200).json({
    success: true,
    message: 'Next customer called successfully.',
    data: result
  });
});

const startServiceHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const result = await startService(req.params.id, req.body?.barberId, io);

  return res.status(200).json({
    success: true,
    message: 'Service started successfully.',
    data: result
  });
});

const completeServiceHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const result = await completeService(req.params.id, io);

  return res.status(200).json({
    success: true,
    message: 'Service completed successfully.',
    data: result
  });
});

const markNoShowHandler = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const result = await markNoShow(req.params.id, io);

  return res.status(200).json({
    success: true,
    message: 'Queue entry marked as no-show.',
    data: result
  });
});

const pauseQueueHandler = asyncHandler(async (req, res) => {
  const { shopId, reason } = req.body;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId is required.'
    });
  }

  const shop = await pauseQueue(shopId, reason);
  const queueData = await getQueueStatus(shopId);
  const io = req.app.get('io');

  if (io) {
    io.to(`shop:${shopId}`).emit('queue:updated', { shopId, queueData });
  }

  return res.status(200).json({
    success: true,
    message: 'Queue paused successfully.',
    data: {
      shop,
      queueData
    }
  });
});

const resumeQueueHandler = asyncHandler(async (req, res) => {
  const { shopId } = req.body;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId is required.'
    });
  }

  const shop = await resumeQueue(shopId);
  const queueData = await getQueueStatus(shopId);
  const io = req.app.get('io');

  if (io) {
    io.to(`shop:${shopId}`).emit('queue:updated', { shopId, queueData });
  }

  return res.status(200).json({
    success: true,
    message: 'Queue resumed successfully.',
    data: {
      shop,
      queueData
    }
  });
});

const historyHandler = asyncHandler(async (req, res) => {
  const { shopId } = req.query;

  if (!shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId query parameter is required.'
    });
  }

  const history = await getTodayHistory(shopId);

  return res.status(200).json({
    success: true,
    data: history
  });
});

module.exports = {
  callNextHandler,
  completeServiceHandler,
  getMyPositionHandler,
  getQueueStatusHandler,
  historyHandler,
  joinQueueHandler,
  leaveQueueHandler,
  markNoShowHandler,
  pauseQueueHandler,
  resumeQueueHandler,
  startServiceHandler
};
