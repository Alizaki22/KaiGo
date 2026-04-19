-- KaiGo Seed Data (password for all accounts: "password123")
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('a1000000-0000-0000-0000-000000000001','Alex Rider','alex@example.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','+1-555-0101','user'),
('b2000000-0000-0000-0000-000000000002','Dave Driver','dave@example.com','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','+1-555-0202','driver')
ON CONFLICT (email) DO NOTHING;

INSERT INTO drivers (id, user_id, vehicle_make, vehicle_model, vehicle_plate, vehicle_color, is_available, rating, total_rides)
VALUES ('c3000000-0000-0000-0000-000000000003','b2000000-0000-0000-0000-000000000002','Toyota','Camry','KAI-2024','Silver',TRUE,4.92,137)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO rides (id, user_id, driver_id, pickup_address, dropoff_address, status, fare, duration_minutes)
VALUES ('d4000000-0000-0000-0000-000000000004','a1000000-0000-0000-0000-000000000001','c3000000-0000-0000-0000-000000000003','123 Main St, Downtown','456 Oak Ave, Uptown','completed',12.50,18)
ON CONFLICT DO NOTHING;
