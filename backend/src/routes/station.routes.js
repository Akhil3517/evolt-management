const express = require('express');
const { body, validationResult } = require('express-validator');
const Station = require('../models/station.model');
const { auth } = require('../middleware/auth.middleware');
const router = express.Router();
const validateStation = [
  body('name').trim().notEmpty().withMessage('Station name is required'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('powerOutput')
    .isFloat({ min: 0 })
    .withMessage('Power output must be a positive number'),
  body('connectorType')
    .isIn(['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'])
    .withMessage('Invalid connector type'),
];

/**
 * @swagger
 * /api/stations:
 *   post:
 *     summary: Create a new charging station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Station'
 *     responses:
 *       201:
 *         description: Station created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 */
router.post('/', auth, validateStation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const station = new Station({
      ...req.body,
      createdBy: req.user._id,
    });

    await station.save();
    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error creating station' });
  }
});

/**
 * @swagger
 * /api/stations:
 *   get:
 *     summary: Get all charging stations
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter stations by status
 *       - in: query
 *         name: connectorType
 *         schema:
 *           type: string
 *           enum: [Type 1, Type 2, CCS, CHAdeMO, Tesla]
 *         description: Filter stations by connector type
 *       - in: query
 *         name: minPower
 *         schema:
 *           type: number
 *         description: Filter stations by minimum power output
 *     responses:
 *       200:
 *         description: List of stations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { status, connectorType, minPower } = req.query;
    const query = {};

    if (status) query.status = status;
    if (connectorType) query.connectorType = connectorType;
    if (minPower) query.powerOutput = { $gte: Number(minPower) };

    const stations = await Station.find(query);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stations' });
  }
});

/**
 * @swagger
 * /api/stations/{id}:
 *   get:
 *     summary: Get a charging station by ID
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *     responses:
 *       200:
 *         description: Station details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching station' });
  }
});

/**
 * @swagger
 * /api/stations/{id}:
 *   put:
 *     summary: Update a charging station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Station'
 *     responses:
 *       200:
 *         description: Station updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to update this station
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, validateStation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    if (station.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this station' });
    }

    Object.assign(station, req.body);
    await station.save();
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error updating station' });
  }
});

/**
 * @swagger
 * /api/stations/{id}:
 *   delete:
 *     summary: Delete a charging station
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Station ID
 *     responses:
 *       200:
 *         description: Station deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Not authorized to delete this station
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Check if user is the creator of the station
    if (station.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this station' });
    }

    await station.deleteOne();
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting station' });
  }
});

module.exports = router; 