// src/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, sendOtp, verifyOtp, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ── Shared validators ─────────────────────────────────────────────────────────
const emailAndPassword = [
  body('email').isEmail().withMessage('A valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('role').isIn(['user', 'driver']).withMessage("Role must be 'user' or 'driver'."),
  ...emailAndPassword,
], register);

// ── POST /api/auth/login  (email + password) ──────────────────────────────────
router.post('/login', emailAndPassword, login);

// ── POST /api/auth/otp/send  ──────────────────────────────────────────────────
// Body: { phone }
// Issues a mock 6-digit OTP (printed to console; also returned in dev response)
router.post('/otp/send', [
  body('phone').trim().notEmpty().withMessage('phone is required.'),
], sendOtp);

// ── POST /api/auth/otp/verify  ────────────────────────────────────────────────
// Body: { phone, otp }
// Validates the OTP and returns a JWT on success
router.post('/otp/verify', [
  body('phone').trim().notEmpty().withMessage('phone is required.'),
  body('otp').trim().notEmpty().withMessage('otp is required.'),
], verifyOtp);

// ── GET /api/auth/me  (protected) ─────────────────────────────────────────────
router.get('/me', auth, getMe);

module.exports = router;
