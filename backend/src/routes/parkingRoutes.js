const express = require('express');
const { body } = require('express-validator');
const {
  createParking, getParkings, getParkingById, updateParking, deleteParking,
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parkings
 *   description: Parking management
 */

/**
 * @swagger
 * /parkings:
 *   get:
 *     summary: Get all parkings
 *     tags: [Parkings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of parkings with available spaces
 */
router.get('/', protect, getParkings);

/**
 * @swagger
 * /parkings/{id}:
 *   get:
 *     summary: Get parking by ID
 *     tags: [Parkings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Parking details
 */
router.get('/:id', protect, getParkingById);

/**
 * @swagger
 * /parkings:
 *   post:
 *     summary: Create a new parking (admin only)
 *     tags: [Parkings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, totalSpaces, location, feePerHour]
 *             properties:
 *               code:        { type: string }
 *               name:        { type: string }
 *               totalSpaces: { type: integer }
 *               location:    { type: string }
 *               feePerHour:  { type: number }
 *     responses:
 *       201:
 *         description: Parking created
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('code').notEmpty().withMessage('Parking code is required'),
    body('name').notEmpty().withMessage('Parking name is required'),
    body('totalSpaces').isInt({ min: 1 }).withMessage('Total spaces must be a positive integer'),
    body('location').notEmpty().withMessage('Location is required'),
    body('feePerHour').isFloat({ min: 0 }).withMessage('Fee per hour must be a positive number'),
  ],
  validate,
  createParking
);

/**
 * @swagger
 * /parkings/{id}:
 *   put:
 *     summary: Update parking (admin only)
 *     tags: [Parkings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Parking updated
 */
router.put('/:id', protect, authorize('admin'), updateParking);

/**
 * @swagger
 * /parkings/{id}:
 *   delete:
 *     summary: Delete parking (admin only)
 *     tags: [Parkings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Parking deleted
 */
router.delete('/:id', protect, authorize('admin'), deleteParking);

module.exports = router;
