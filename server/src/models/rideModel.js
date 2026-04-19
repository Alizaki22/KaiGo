// src/models/rideModel.js
// Raw DB queries for the rides table
const pool = require('../config/db');

const rideModel = {
  // Create a new ride request from a user
  create: async ({ userId, pickupAddress, pickupLat, pickupLng, dropoffAddress }) => {
    const result = await pool.query(
      `INSERT INTO rides (user_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, status)
       VALUES ($1, $2, $3, $4, $5, 'requested')
       RETURNING *`,
      [userId, pickupAddress, pickupLat, pickupLng, dropoffAddress]
    );
    return result.rows[0];
  },

  // Get a single ride with driver + user info joined
  findById: async (rideId) => {
    const result = await pool.query(
      `SELECT r.*,
              u.name  AS user_name,  u.phone AS user_phone,
              du.name AS driver_name, du.phone AS driver_phone,
              d.vehicle_make, d.vehicle_model, d.vehicle_plate, d.vehicle_color, d.rating AS driver_rating
       FROM rides r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN drivers d ON d.id = r.driver_id
       LEFT JOIN users du ON du.id = d.user_id
       WHERE r.id = $1`,
      [rideId]
    );
    return result.rows[0];
  },

  // Get all rides for a specific user (history)
  findByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT r.*,
              du.name AS driver_name,
              d.vehicle_make, d.vehicle_model, d.vehicle_plate
       FROM rides r
       LEFT JOIN drivers d  ON d.id = r.driver_id
       LEFT JOIN users   du ON du.id = d.user_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get all rides for a specific driver (history)
  findByDriverId: async (driverId) => {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.phone AS user_phone
       FROM rides r
       JOIN users u ON u.id = r.user_id
       WHERE r.driver_id = $1
       ORDER BY r.created_at DESC`,
      [driverId]
    );
    return result.rows;
  },

  // Get all open ride requests (status = 'requested') for drivers to browse
  findAvailable: async () => {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, u.phone AS user_phone
       FROM rides r
       JOIN users u ON u.id = r.user_id
       WHERE r.status = 'requested'
       ORDER BY r.created_at ASC`
    );
    return result.rows;
  },

  // Update ride status (accepted, in_progress, completed, cancelled)
  updateStatus: async (rideId, status, extras = {}) => {
    const { driverId, fare, durationMinutes, cancelledBy, cancelReason } = extras;
    const result = await pool.query(
      `UPDATE rides
       SET status           = $1,
           driver_id        = COALESCE($2, driver_id),
           fare             = COALESCE($3, fare),
           duration_minutes = COALESCE($4, duration_minutes),
           cancelled_by     = COALESCE($5, cancelled_by),
           cancel_reason    = COALESCE($6, cancel_reason)
       WHERE id = $7
       RETURNING *`,
      [status, driverId || null, fare || null, durationMinutes || null,
       cancelledBy || null, cancelReason || null, rideId]
    );
    return result.rows[0];
  },
};

module.exports = rideModel;
