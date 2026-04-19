-- ============================================================
-- KaiGo Ride Booking MVP — PostgreSQL Schema
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT                NOT NULL,
  phone         VARCHAR(20)         NOT NULL,
  role          VARCHAR(10)         NOT NULL CHECK (role IN ('user', 'driver')),
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_make   VARCHAR(50) NOT NULL,
  vehicle_model  VARCHAR(50) NOT NULL,
  vehicle_plate  VARCHAR(20) NOT NULL,
  vehicle_color  VARCHAR(30) NOT NULL,
  is_available   BOOLEAN     NOT NULL DEFAULT FALSE,
  rating         NUMERIC(3,2)         DEFAULT 5.00,
  total_rides    INT                  DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS rides (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id),
  driver_id        UUID                   REFERENCES drivers(id),
  pickup_address   TEXT          NOT NULL,
  dropoff_address  TEXT          NOT NULL,
  status           VARCHAR(20)   NOT NULL DEFAULT 'requested'
                     CHECK (status IN ('requested','accepted','in_progress','completed','cancelled')),
  fare             NUMERIC(8,2),
  duration_minutes INT,
  cancelled_by     VARCHAR(10)  CHECK (cancelled_by IN ('user','driver')),
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ride_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id    UUID        NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id  UUID        NOT NULL REFERENCES drivers(id),
  status     VARCHAR(10) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ride_id, driver_id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_rides_user_id   ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status    ON rides(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
