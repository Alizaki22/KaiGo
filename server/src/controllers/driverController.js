// src/controllers/driverController.js
// Handles ride lifecycle from the DRIVER's perspective
const rideModel   = require('../models/rideModel');
const driverModel = require('../models/driverModel');
const { AppError } = require('../middleware/errorHandler');

// ── Helpers ────────────────────────────────────────────────────────────────────

// Simple fare calculator (base $3 + $1.50/minute)
const calculateFare = (durationMinutes) => {
  const BASE_FARE       = 3.00;
  const RATE_PER_MINUTE = 1.50;
  return parseFloat((BASE_FARE + RATE_PER_MINUTE * durationMinutes).toFixed(2));
};

// Resolve driver profile from the authenticated user's ID
const getDriverProfile = async (userId) => {
  const driver = await driverModel.findByUserId(userId);
  if (!driver) throw new AppError('Driver profile not found.', 404);
  return driver;
};

// ── POST /api/drivers/online ────────────────────────────────────────────────
// Sets the driver as available (online) and ready to receive rides
const goOnline = async (req, res, next) => {
  try {
    const driver  = await getDriverProfile(req.user.id);
    const updated = await driverModel.setAvailability(driver.id, true);

    res.json({
      success: true,
      message: 'You are now online 🟢 and can receive ride requests.',
      driver: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/drivers/accept ────────────────────────────────────────────────
// Body: { rideId }
// Driver accepts a ride identified by rideId in the request body
const acceptRideByBody = async (req, res, next) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).json({ success: false, message: 'rideId is required in the request body.' });
    }

    const driver = await getDriverProfile(req.user.id);

    const ride = await rideModel.findById(rideId);
    if (!ride) throw new AppError('Ride not found.', 404);

    if (ride.status !== 'requested') {
      throw new AppError(`This ride is no longer available (current status: ${ride.status}).`, 400);
    }

    if (!driver.is_available) {
      throw new AppError('You are currently offline or on another ride. Go online first.', 409);
    }

    // Mark driver busy while on trip
    await driverModel.setAvailability(driver.id, false);

    const updated = await rideModel.updateStatus(rideId, 'accepted', {
      driverId: driver.id,
    });

    res.json({
      success: true,
      message: 'Ride accepted! Head to the pickup location.',
      ride: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/drivers/rides/available ────────────────────────────────────────
// Returns all open ride requests (status = 'requested')
const getAvailableRides = async (req, res, next) => {
  try {
    const rides = await rideModel.findAvailable();
    res.json({ success: true, count: rides.length, rides });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/drivers/rides/:id/accept ─────────────────────────────────────
// REST-style variant: rideId comes from URL param
const acceptRide = async (req, res, next) => {
  try {
    const driver = await getDriverProfile(req.user.id);

    const ride = await rideModel.findById(req.params.id);
    if (!ride) throw new AppError('Ride not found.', 404);

    if (ride.status !== 'requested') {
      throw new AppError(`This ride is no longer available (current status: ${ride.status}).`, 400);
    }

    await driverModel.setAvailability(driver.id, false);

    const updated = await rideModel.updateStatus(req.params.id, 'accepted', {
      driverId: driver.id,
    });

    res.json({ success: true, message: 'Ride accepted!', ride: updated });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/drivers/rides/:id/status ─────────────────────────────────────
// Allowed transitions: accepted → in_progress → completed
const updateRideStatus = async (req, res, next) => {
  try {
    const { status, durationMinutes } = req.body;
    const driver = await getDriverProfile(req.user.id);

    const ride = await rideModel.findById(req.params.id);
    if (!ride) throw new AppError('Ride not found.', 404);

    if (ride.driver_id !== driver.id) {
      throw new AppError('This ride is not assigned to you.', 403);
    }

    const VALID_TRANSITIONS = {
      accepted:    ['in_progress', 'cancelled'],
      in_progress: ['completed'],
    };

    if (!VALID_TRANSITIONS[ride.status]?.includes(status)) {
      throw new AppError(
        `Cannot transition ride from '${ride.status}' to '${status}'.`, 400
      );
    }

    const extras = {};

    if (status === 'completed') {
      const mins = durationMinutes || 15;
      extras.fare            = calculateFare(mins);
      extras.durationMinutes = mins;
      await driverModel.setAvailability(driver.id, true);
      await driverModel.completeRide(driver.id, driver.rating);
    }

    if (status === 'cancelled') {
      extras.cancelledBy  = 'driver';
      extras.cancelReason = req.body.reason || 'Cancelled by driver';
      await driverModel.setAvailability(driver.id, true);
    }

    const updated = await rideModel.updateStatus(req.params.id, status, extras);

    res.json({
      success: true,
      message: `Ride status updated to '${status}'.`,
      ride: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/drivers/rides/history ──────────────────────────────────────────
const getDriverRideHistory = async (req, res, next) => {
  try {
    const driver = await getDriverProfile(req.user.id);
    const rides  = await rideModel.findByDriverId(driver.id);
    res.json({ success: true, count: rides.length, rides });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/drivers/availability ─────────────────────────────────────────
// Body: { isAvailable: true | false }
const toggleAvailability = async (req, res, next) => {
  try {
    const driver      = await getDriverProfile(req.user.id);
    const isAvailable = req.body.isAvailable;

    if (typeof isAvailable !== 'boolean') {
      throw new AppError('isAvailable must be a boolean (true or false).', 400);
    }

    const updated = await driverModel.setAvailability(driver.id, isAvailable);

    res.json({
      success: true,
      message: `You are now ${isAvailable ? 'online 🟢' : 'offline 🔴'}`,
      driver: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  goOnline,
  acceptRideByBody,
  getAvailableRides,
  acceptRide,
  updateRideStatus,
  getDriverRideHistory,
  toggleAvailability,
};
