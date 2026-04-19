// src/routes/driverRoutes.js
const express = require('express');
const {
  getAvailableRides,
  goOnline,
  acceptRideByBody,
  acceptRide,
  updateRideStatus,
  getDriverRideHistory,
  toggleAvailability,
} = require('../controllers/driverController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// All driver routes require authentication + driver role
router.use(auth, requireRole('driver'));

// ── POST /api/drivers/online ──────────────────────────────────────────────────
// Sets driver availability to true (goes online / ready to accept rides)
router.post('/online', goOnline);

// ── POST /api/drivers/accept ──────────────────────────────────────────────────
// Body: { rideId }  — Driver accepts a specific ride request
router.post('/accept', acceptRideByBody);

// ── GET  /api/drivers/rides/available ─────────────────────────────────────────
router.get('/rides/available', getAvailableRides);

// ── GET  /api/drivers/rides/history ──────────────────────────────────────────
router.get('/rides/history', getDriverRideHistory);

// ── PATCH /api/drivers/rides/:id/accept ──────────────────────────────────────
// REST-style alias for accepting a ride (param-based)
router.patch('/rides/:id/accept', acceptRide);

// ── PATCH /api/drivers/rides/:id/status ──────────────────────────────────────
router.patch('/rides/:id/status', updateRideStatus);

// ── PATCH /api/drivers/availability ──────────────────────────────────────────
// Body: { isAvailable: true | false }
router.patch('/availability', toggleAvailability);

module.exports = router;
