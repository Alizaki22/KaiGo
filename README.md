# 🚗 KaiGo — Ride Booking MVP

A full-stack ride-hailing MVP built with **React Native (Expo)**, **Node.js + Express**, and **PostgreSQL**.

---

## Project Structure

```
KaiGo/
├── client/          ← React Native (Expo) — single app, role-based navigation
├── server/          ← Node.js + Express REST API
└── database/        ← PostgreSQL schema + seed data
```

---

## Features

### 👤 Rider App
- Register / Login
- Request a ride (pickup + dropoff address)
- Live ride status tracking (polls every 5 seconds)
- Cancel a ride
- View ride history
- Profile screen

### 🚗 Driver App
- Register as a driver with vehicle details
- Toggle online / offline availability
- Browse available ride requests
- Accept rides
- Start ride → Mark as complete
- View earnings history
- Driver stats (total rides, rating, estimated earnings)

### 🔧 Backend REST API
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (user or driver) |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/rides` | Request a ride |
| GET | `/api/rides/:id` | Get ride details |
| GET | `/api/rides/user/history` | User's ride history |
| PATCH | `/api/rides/:id/cancel` | Cancel a ride |
| GET | `/api/driver/rides/available` | Available ride requests |
| PATCH | `/api/driver/rides/:id/accept` | Accept a ride |
| PATCH | `/api/driver/rides/:id/status` | Update ride status |
| PATCH | `/api/driver/availability` | Toggle online/offline |

---

## Setup Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)
- Android emulator / iOS simulator / Expo Go app

---

### 1. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE kaigo_db;"

# Run the schema
psql -U postgres -d kaigo_db -f database/schema.sql

# (Optional) Load seed data
psql -U postgres -d kaigo_db -f database/seed.sql
```

Seed accounts (password: `password123`):
- Rider: `alex@example.com`
- Driver: `dave@example.com`

---

### 2. Backend (server/)

```bash
cd server
npm install

# Copy and configure environment
copy .env.example .env
# Edit .env and fill in your PostgreSQL credentials + JWT secret

npm run dev
# → API running at http://localhost:5000
# → Health check: http://localhost:5000/api/health
```

---

### 3. Frontend (client/)

```bash
cd client
npm install

# Start Expo development server
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan the QR code with **Expo Go** on your phone

> **📱 Physical Device?** Update `client/src/api/api.js`:
> Change `BASE_URL` to `http://<YOUR_LOCAL_IP>:5000/api`
> (find your IP with `ipconfig` on Windows)

---

## Environment Variables

```env
# server/.env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kaigo_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

## Fare Calculation

Fare is calculated when a driver marks a ride as complete:

```
fare = $3.00 (base) + $1.50 × duration_minutes
```

Example: 20-minute ride = $3.00 + $30.00 = **$33.00**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Navigation | React Navigation v6 |
| HTTP Client | Axios |
| Token Storage | AsyncStorage |
| Backend | Node.js + Express |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | PostgreSQL |
| DB Client | node-postgres (pg) |

---

## Development Notes

- **Polling**: The rider's status screen polls the API every 5 seconds. For production, replace with WebSockets (Socket.IO).
- **Maps**: Text-based address input is used for the MVP. Integrate `react-native-maps` + Google Maps API for a real map experience.
- **Payments**: Not implemented. Integrate Stripe for production.
- **Push Notifications**: Not implemented. Use Expo Notifications for real-time driver alerts.
