// server.js — Application entry point
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes   = require('./src/routes/authRoutes');
const rideRoutes   = require('./src/routes/rideRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

// Initialize database connection pool
require('./src/config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);    // Register, Login, OTP, Me
app.use('/api/rides',   rideRoutes);   // User ride operations
app.use('/api/drivers', driverRoutes); // Driver operations

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success:   true,
    status:    'ok',
    service:   'KaiGo API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚗 KaiGo API running at http://localhost:${PORT}`);
  console.log(`   Health:  GET  http://localhost:${PORT}/api/health`);
  console.log(`   Auth:    POST http://localhost:${PORT}/api/auth/login`);
  console.log(`            POST http://localhost:${PORT}/api/auth/otp/send`);
  console.log(`            POST http://localhost:${PORT}/api/auth/otp/verify`);
  console.log(`   Rides:   POST http://localhost:${PORT}/api/rides/request`);
  console.log(`            GET  http://localhost:${PORT}/api/rides/:id`);
  console.log(`   Drivers: POST http://localhost:${PORT}/api/drivers/online`);
  console.log(`            POST http://localhost:${PORT}/api/drivers/accept\n`);
});
