const Parking = require('../models/Parking');
const logger = require('../config/logger');

// POST /api/parkings
const createParking = async (req, res, next) => {
  try {
    const { code, name, totalSpaces, location, feePerHour } = req.body;
    const parking = await Parking.create({
      code,
      name,
      totalSpaces,
      availableSpaces: totalSpaces,
      location,
      feePerHour,
    });
    logger.info(`Parking created: ${code} - ${name}`);
    res.status(201).json({ success: true, data: parking });
  } catch (error) {
    next(error);
  }
};

// GET /api/parkings
const getParkings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.location) filter.location = new RegExp(req.query.location, 'i');

    const [parkings, total] = await Promise.all([
      Parking.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Parking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: parkings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/parkings/:id
const getParkingById = async (req, res, next) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) return res.status(404).json({ success: false, message: 'Parking not found.' });
    res.json({ success: true, data: parking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/parkings/:id
const updateParking = async (req, res, next) => {
  try {
    const parking = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!parking) return res.status(404).json({ success: false, message: 'Parking not found.' });
    logger.info(`Parking updated: ${parking.code}`);
    res.json({ success: true, data: parking });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/parkings/:id
const deleteParking = async (req, res, next) => {
  try {
    const parking = await Parking.findByIdAndDelete(req.params.id);
    if (!parking) return res.status(404).json({ success: false, message: 'Parking not found.' });
    logger.info(`Parking deleted: ${parking.code}`);
    res.json({ success: true, message: 'Parking deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createParking, getParkings, getParkingById, updateParking, deleteParking };
