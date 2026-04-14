const Shop = require('../models/Shop');
const asyncHandler = require('../middleware/asyncHandler');

const listShops = asyncHandler(async (req, res) => {
  const query = req.query.ownerId ? { ownerId: req.query.ownerId } : {};
  const shops = await Shop.find(query).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: shops
  });
});

const getShopById = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found.'
    });
  }

  return res.status(200).json({
    success: true,
    data: shop
  });
});

const createShop = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ownerId: req.body.ownerId || req.user?._id
  };

  if (!payload.ownerId) {
    return res.status(400).json({
      success: false,
      message: 'ownerId is required to create a shop.'
    });
  }

  const shop = await Shop.create(payload);

  return res.status(201).json({
    success: true,
    message: 'Shop created successfully.',
    data: shop
  });
});

const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!shop) {
    return res.status(404).json({
      success: false,
      message: 'Shop not found.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Shop updated successfully.',
    data: shop
  });
});

module.exports = {
  createShop,
  getShopById,
  listShops,
  updateShop
};
