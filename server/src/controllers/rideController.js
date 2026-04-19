// src/controllers/rideController.js
// Handles ride lifecycle from the USER's perspective
const rideModel   = require('../models/rideModel');
const driverModel = require('../models/driverModel');
const { AppError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// Simple fare calculator: base $3 + $1.50 per estimated minute
// (In a real app, you'd use distance from a maps API)
const calculateFare = (durationMinutes) => {
  const BASE_FARE       = 3.00;
  const RATE_PER_MINUTE = 1.50;
  return parseFloat((BASE_FARE + RATE_PER_MINUTE * durationMinutes).toFixed(2));
};

// Haversine formula to calculate distance between two points in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// POST /api/rides — User requests a new ride
const requestRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { pickupAddress, pickupLat, pickupLng, dropoffAddress } = req.body;

    // 1. Create the ride request
    let ride = await rideModel.create({
      userId: req.user.id,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
    });

    // 2. Fetch online drivers
    const availableDrivers = await driverModel.getAvailableDrivers();

    if (availableDrivers.length > 0) {
      // 3. Find the nearest driver
      let nearestDriver = null;
      let minDistance = Infinity;

      availableDrivers.forEach(driver => {
        if (driver.latitude && driver.longitude) {
          const dist = getDistance(pickupLat, pickupLng, driver.latitude, driver.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearestDriver = driver;
          }
        }
      });

      // 4. Assign driver if found within a reasonable range (e.g., 10km)
      if (nearestDriver && minDistance < 10) {
        ride = await rideModel.updateStatus(ride.id, 'assigned', {
          driverId: nearestDriver.id
        });

        // Mark driver as unavailable (assigned)
        await driverModel.setAvailability(nearestDriver.id, false);
      }
    }

    res.status(201).json({
      success: true,
      message: ride.status === 'assigned' 
        ? 'Driver assigned! They are on their way.' 
        : 'Ride requested! Looking for a driver...',
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
