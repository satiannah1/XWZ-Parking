const CarEntry = require('../models/CarEntry');
const Parking = require('../models/Parking');
const logger = require('../config/logger');
const { sendTicketEmail, sendBillEmail } = require('../config/email');

// POST /api/entries  - car entry
const carEntry = async (req, res, next) => {
  try {
    const { plateNumber, parkingCode, driverEmail } = req.body;

    const parking = await Parking.findOne({ code: parkingCode.toUpperCase() });
    if (!parking) return res.status(404).json({ success: false, message: 'Parking not found.' });

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({ success: false, message: 'No available spaces in this parking.' });
    }

    // Check if car is already parked
    const existing = await CarEntry.findOne({ plateNumber: plateNumber.toUpperCase(), status: 'parked' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This car is already parked.' });
    }

    const entry = await CarEntry.create({
      plateNumber: plateNumber.toUpperCase(),
      parkingCode: parkingCode.toUpperCase(),
      parking: parking._id,
      driverEmail: driverEmail || null,
      attendant: req.user._id,
    });

    // Decrease available spaces
    parking.availableSpaces -= 1;
    await parking.save();

    await entry.populate('parking', 'name code location feePerHour');

    const ticket = generateTicket(entry, parking);
    logger.info(`Car entered: ${plateNumber} at ${parkingCode}`);

    // Send ticket email (non-blocking)
    if (driverEmail) {
      sendTicketEmail({ to: driverEmail, ticket, parking }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: entry,
      ticket,
      emailSent: !!driverEmail,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/entries/:id/exit  - car exit
const carExit = async (req, res, next) => {
  try {
    const entry = await CarEntry.findById(req.params.id).populate('parking');
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found.' });
    if (entry.status === 'exited') {
      return res.status(400).json({ success: false, message: 'Car has already exited.' });
    }

    const exitDateTime = new Date();
    const durationMs = exitDateTime - entry.entryDateTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const chargedAmount = parseFloat((durationHours * entry.parking.feePerHour).toFixed(2));

    entry.exitDateTime = exitDateTime;
    entry.chargedAmount = chargedAmount;
    entry.status = 'exited';
    await entry.save();

    // Increase available spaces
    await Parking.findByIdAndUpdate(entry.parking._id, { $inc: { availableSpaces: 1 } });

    const bill = generateBill(entry, durationHours, chargedAmount);
    logger.info(`Car exited: ${entry.plateNumber} from ${entry.parkingCode}, charged: ${chargedAmount}`);

    // Send bill email (non-blocking)
    if (entry.driverEmail) {
      sendBillEmail({ to: entry.driverEmail, bill }).catch(() => {});
    }

    res.json({
      success: true,
      data: entry,
      bill,
      emailSent: !!entry.driverEmail,
      emailSentTo: entry.driverEmail || null,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/entries
const getEntries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.parkingCode) filter.parkingCode = req.query.parkingCode.toUpperCase();
    if (req.query.plateNumber) filter.plateNumber = new RegExp(req.query.plateNumber, 'i');

    const [entries, total] = await Promise.all([
      CarEntry.find(filter)
        .populate('parking', 'name code location')
        .populate('attendant', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ entryDateTime: -1 }),
      CarEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/entries/:id
const getEntryById = async (req, res, next) => {
  try {
    const entry = await CarEntry.findById(req.params.id)
      .populate('parking')
      .populate('attendant', 'firstName lastName');
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found.' });
    res.json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// GET /api/entries/reports/outgoing
const reportOutgoing = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 10 } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'from and to date params are required.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {
      status: 'exited',
      exitDateTime: { $gte: new Date(from), $lte: new Date(to) },
    };

    const [entries, total, aggregate] = await Promise.all([
      CarEntry.find(filter)
        .populate('parking', 'name code location')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ exitDateTime: -1 }),
      CarEntry.countDocuments(filter),
      CarEntry.aggregate([
        { $match: filter },
        { $group: { _id: null, totalAmount: { $sum: '$chargedAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: entries,
      totalAmount: aggregate[0]?.totalAmount || 0,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/entries/reports/entered
const reportEntered = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 10 } = req.query;
    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'from and to date params are required.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {
      entryDateTime: { $gte: new Date(from), $lte: new Date(to) },
    };

    const [entries, total] = await Promise.all([
      CarEntry.find(filter)
        .populate('parking', 'name code location')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ entryDateTime: -1 }),
      CarEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// Helpers
const generateTicket = (entry, parking) => ({
  ticketNumber: `TKT-${entry._id.toString().slice(-8).toUpperCase()}`,
  plateNumber: entry.plateNumber,
  parkingName: parking.name,
  parkingCode: parking.code,
  location: parking.location,
  entryDateTime: entry.entryDateTime,
  feePerHour: parking.feePerHour,
});

const generateBill = (entry, durationHours, chargedAmount) => ({
  billNumber: `BILL-${entry._id.toString().slice(-8).toUpperCase()}`,
  plateNumber: entry.plateNumber,
  parkingCode: entry.parkingCode,
  entryDateTime: entry.entryDateTime,
  exitDateTime: entry.exitDateTime,
  durationHours: parseFloat(durationHours.toFixed(2)),
  durationMinutes: Math.round(durationHours * 60),
  feePerHour: entry.parking.feePerHour,
  totalAmount: chargedAmount,
});

module.exports = { carEntry, carExit, getEntries, getEntryById, reportOutgoing, reportEntered };
