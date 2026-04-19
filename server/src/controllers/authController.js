// src/controllers/authController.js
// Handles registration and authentication (email+password & mock OTP)
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel   = require('../models/userModel');
const driverModel = require('../models/driverModel');
const { AppError } = require('../middleware/errorHandler');

// ── In-memory OTP store (mock — replace with Redis in production) ─────────────
// Map<phone, { otp, expiresAt }>
const otpStore = new Map();

// Generate a 6-digit OTP
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ── JWT helper ────────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, phone, role,
            vehicleMake, vehicleModel, vehiclePlate, vehicleColor } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) throw new AppError('Email is already registered.', 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, passwordHash, phone, role });

    if (role === 'driver') {
      if (!vehicleMake || !vehicleModel || !vehiclePlate || !vehicleColor) {
        throw new AppError('Vehicle details are required for driver registration.', 400);
      }
      await driverModel.create({ userId: user.id, vehicleMake, vehicleModel, vehiclePlate, vehicleColor });
    }

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login  (email + password) ──────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password.', 401);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await driverModel.findByUserId(user.id);
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser,
      driverProfile,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/otp/send  ──────────────────────────────────────────────────
// Body: { phone }
// Generates a mock OTP, logs it to console, and returns it in the response
// (in production you'd send via SMS provider and NOT return the OTP)
const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({ success: false, message: 'phone is required.' });
    }

    const otp       = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone.trim(), { otp, expiresAt });

    // Simulate SMS delivery via console log
    console.log(`📱 [MOCK OTP] Phone: ${phone}  OTP: ${otp}  (expires in 5 min)`);

    res.json({
      success: true,
      message: `OTP sent to ${phone}. (MOCK — check server console)`,
      // ⚠️  Remove `otp` from the response in production!
      otp,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/otp/verify  ────────────────────────────────────────────────
// Body: { phone, otp }
// Verifies the OTP and returns a JWT if valid — user must exist in the DB
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'phone and otp are required.' });
    }

    const record = otpStore.get(phone.trim());

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found for this phone. Request a new one.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone.trim());
      return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid OTP.' });
    }

    // OTP is valid — clear it (one-time use)
    otpStore.delete(phone.trim());

    // Look up user by phone number
    const user = await userModel.findByPhone(phone.trim());
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this phone number. Please register first.',
      });
    }

    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await driverModel.findByUserId(user.id);
    }

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'OTP verified. Login successful!',
      token,
      user: safeUser,
      driverProfile,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) throw new AppError('User not found.', 404);

    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await driverModel.findByUserId(user.id);
    }

    res.json({ success: true, user, driverProfile });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, sendOtp, verifyOtp, getMe };
