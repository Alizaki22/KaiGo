// src/models/userModel.js
// Raw DB queries for the users table
const pool = require('../config/db');

const userModel = {
  // Find a user by their email (used during login)
  findByEmail: async (email) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find a user by their phone number (used during OTP login)
  findByPhone: async (phone) => {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  },

  // Find a user by their primary key
  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Create a new user and return the record
  create: async ({ name, email, passwordHash, phone, role }) => {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, created_at`,
      [name, email, passwordHash, phone, role]
    );
    return result.rows[0];
  },
};

module.exports = userModel;
