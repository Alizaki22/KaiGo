// src/models/driverModel.js
// Raw DB queries for the drivers table
const pool = require('../config/db');

const driverModel = {
  // Create a driver profile record (after user is created with role='driver')
  create: async ({ userId, vehicleMake, vehicleModel, vehiclePlate, vehicleColor }) => {
    const result = await pool.query(
      `INSERT INTO drivers (user_id, vehicle_make, vehicle_model, vehicle_plate, vehicle_color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, vehicleMake, vehicleModel, vehiclePlate, vehicleColor]
    );
    return result.rows[0];
  },

  // Find driver profile by user ID (used after login)
  findByUserId: async (userId) => {
    const result = await pool.query(
      'SELECT * FROM drivers WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  },

  // Find driver profile by driver ID
  findById: async (driverId) => {
    const result = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [driverId]
    );
    return result.rows[0];
  },

  // Toggle availability ON or OFF
  setAvailability: async (driverId, isAvailable) => {
    const result = await pool.query(
      `UPDATE drivers SET is_available = $1 WHERE id = $2 RETURNING *`,
      [isAvailable, driverId]
    );
    return result.rows[0];
  },

  // Increment total rides count and update rating
  completeRide: async (driverId, newRating) => {
    await pool.query(
      `UPDATE drivers
       SET total_rides = total_rides + 1,
           rating = $1
       WHERE id = $2`,
      [newRating, driverId]
    );
  },

  // Get all available drivers (for broadcasting ride requests)
  getAvailableDrivers: async () => {
    const result = await pool.query(
      `SELECT d.*, u.name, u.phone
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       WHERE d.is_available = TRUE`
    );
    return result.rows;
  },
};

module.exports = driverModel;
