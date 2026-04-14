const express = require('express');
const barberController = require('../controllers/barberController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', barberController.listBarbers);
router.post('/', authenticate, authorize('owner', 'admin'), barberController.createBarber);
router.put('/:id', authenticate, authorize('owner', 'admin'), barberController.updateBarber);

module.exports = router;
