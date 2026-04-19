// src/routes/rideRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  requestRide,
  getRide,
  getUserRideHistory,
  cancelRide,
} = require('../controllers/rideController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// All ride routes require authentication
router.use(auth);

// ── POST /api/rides/request  ──────────────────────────────────────────────────
// Alias: POST /api/rides (both accepted)  |  Users only
const rideValidators = [
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required.'),
  body('dropoffAddress').trim().notEmpty().withMessage('Dropoff address is required.'),
];

router.post('/request', requireRole('user'), rideValidators, requestRide);
router.post('/',        requireRole('user'), rideValidators, requestRide); // legacy alias

// ── GET /api/rides/user/history ───────────────────────────────────────────────
// NOTE: Must come BEFORE /:id to avoid "user" being parsed as an ID
router.get('/user/history', requireRole('user'), getUserRideHistory);

// ── GET /api/rides/:id ────────────────────────────────────────────────────────
router.get('/:id', getRide);

// ── PATCH /api/rides/:id/cancel ───────────────────────────────────────────────
router.patch('/:id/cancel', requireRole('user'), cancelRide);

module.exports = router;
