const express = require('express');
const shopController = require('../controllers/shopController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', shopController.listShops);
router.get('/:id', shopController.getShopById);
router.post('/', authenticate, authorize('owner', 'admin'), shopController.createShop);
router.put('/:id', authenticate, authorize('owner', 'admin'), shopController.updateShop);

module.exports = router;
