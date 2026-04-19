// src/controllers/rideController.js
// Handles ride lifecycle from the USER's perspective
const rideModel   = require('../models/rideModel');
const { AppError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// Simple fare calculator: base $3 + $1.50 per estimated minute
// (In a real app, you'd use distance from a maps API)
const calculateFare = (durationMinutes) => {
  const BASE_FARE       = 3.00;
  const RATE_PER_MINUTE = 1.50;
  return parseFloat((BASE_FARE + RATE_PER_MINUTE * durationMinutes).toFixed(2));
};

// POST /api/rides — User requests a new ride
const requestRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickupAddress, dropoffAddress } = req.body;

    const ride = await rideModel.create({
      userId: req.user.id,
      pickupAddress,
      dropoffAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Ride requested! Looking for a driver...',
      ride,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/:id — Get a single ride's details
const getRide = async (req, res, next) => {
  try {
    const ride = await rideModel.findById(req.params.id);
    if (!ride) throw new AppError('Ride not found.', 404);

    // Only the rider or assigned driver can view the ride
    const isOwner   = ride.user_id    === req.user.id;
    const isDriver  = ride.driver_id && req.user.role === 'driver';
    if (!isOwner && !isDriver) {
      throw new AppError('You are not authorized to view this ride.', 403);
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/user/history — User's ride history
const getUserRideHistory = async (req, res, next) => {
  try {
    const rides = await rideModel.findByUserId(req.user.id);
    res.json({ success: true, rides });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/rides/:id/cancel — User cancels a requested ride
const cancelRide = async (req, res, next) => {
  try {
    const ride = await rideModel.findById(req.params.id);
    if (!ride) throw new AppError('Ride not found.', 404);

    if (ride.user_id !== req.user.id) {
      throw new AppError('You can only cancel your own rides.', 403);
    }

    if (!['requested', 'accepted'].includes(ride.status)) {
      throw new AppError(`Cannot cancel a ride that is already ${ride.status}.`, 400);
    }

    const updated = await rideModel.updateStatus(req.params.id, 'cancelled', {
      cancelledBy: 'user',
      cancelReason: req.body.reason || 'Cancelled by user',
    });

    res.json({ success: true, message: 'Ride cancelled.', ride: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestRide, getRide, getUserRideHistory, cancelRide };
