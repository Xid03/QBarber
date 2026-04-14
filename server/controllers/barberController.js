const Barber = require('../models/Barber');
const asyncHandler = require('../middleware/asyncHandler');

const listBarbers = asyncHandler(async (req, res) => {
  const query = req.query.shopId ? { shopId: req.query.shopId } : {};
  const barbers = await Barber.find(query).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: barbers
  });
});

const createBarber = asyncHandler(async (req, res) => {
  if (!req.body.shopId) {
    return res.status(400).json({
      success: false,
      message: 'shopId is required.'
    });
  }

  const barber = await Barber.create(req.body);

  return res.status(201).json({
    success: true,
    message: 'Barber created successfully.',
    data: barber
  });
});

const updateBarber = asyncHandler(async (req, res) => {
  const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!barber) {
    return res.status(404).json({
      success: false,
      message: 'Barber not found.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Barber updated successfully.',
    data: barber
  });
});

module.exports = {
  createBarber,
  listBarbers,
  updateBarber
};
