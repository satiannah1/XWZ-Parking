const express = require('express');
const { body } = require('express-validator');
const {
  carEntry, carExit, getEntries, getEntryById, reportOutgoing, reportEntered,
} = require('../controllers/carEntryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CarEntries
 *   description: Car entry and exit management
 */

/**
 * @swagger
 * /entries/reports/outgoing:
 *   get:
 *     summary: Report of all outgoing cars with total charged amount between two dates
 *     tags: [CarEntries]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Outgoing cars report
 */
router.get('/reports/outgoing', protect, authorize('admin'), reportOutgoing);

/**
 * @swagger
 * /entries/reports/entered:
 *   get:
 *     summary: Report of all entered cars between two dates
 *     tags: [CarEntries]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Entered cars report
 */
router.get('/reports/entered', protect, authorize('admin'), reportEntered);

/**
 * @swagger
 * /entries:
 *   get:
 *     summary: Get all car entries
 *     tags: [CarEntries]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [parked, exited] }
 *       - in: query
 *         name: parkingCode
 *         schema: { type: string }
 *       - in: query
 *         name: plateNumber
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of car entries
 */
router.get('/', protect, getEntries);

/**
 * @swagger
 * /entries/{id}:
 *   get:
 *     summary: Get car entry by ID
 *     tags: [CarEntries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car entry details
 */
router.get('/:id', protect, getEntryById);

/**
 * @swagger
 * /entries:
 *   post:
 *     summary: Register car entry
 *     tags: [CarEntries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plateNumber, parkingCode]
 *             properties:
 *               plateNumber: { type: string }
 *               parkingCode: { type: string }
 *     responses:
 *       201:
 *         description: Car entry registered, ticket generated
 */
router.post(
  '/',
  protect,
  [
    body('plateNumber').notEmpty().withMessage('Plate number is required'),
    body('parkingCode').notEmpty().withMessage('Parking code is required'),
    body('driverEmail').optional().isEmail().withMessage('Invalid email address'),
  ],
  validate,
  carEntry
);

/**
 * @swagger
 * /entries/{id}/exit:
 *   put:
 *     summary: Register car exit and generate bill
 *     tags: [CarEntries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Car exit registered, bill generated
 */
router.put('/:id/exit', protect, carExit);

module.exports = router;
