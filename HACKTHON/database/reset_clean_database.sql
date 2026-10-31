-- ============================================================================
-- MechX – Vehicle Service Management Platform
-- Clean Baseline Reset: 0 Demo Records, Exactly 1 Clean Account Per Role
-- ============================================================================

USE vehicle_service_management;

SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all transaction and entity tables
TRUNCATE TABLE appointment_slots;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE complaints;
TRUNCATE TABLE customer_profiles;
TRUNCATE TABLE diagnosis_reports;
TRUNCATE TABLE invoices;
TRUNCATE TABLE maintenance_predictions;
TRUNCATE TABLE mechanic_assignments;
TRUNCATE TABLE mechanic_profiles;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE pickup_drop_requests;
TRUNCATE TABLE reviews;
TRUNCATE TABLE service_estimates;
TRUNCATE TABLE service_parts;
TRUNCATE TABLE service_records;
TRUNCATE TABLE service_requests;
TRUNCATE TABLE service_status_history;
TRUNCATE TABLE vehicle_health_reports;
TRUNCATE TABLE vehicle_maintenance_history;
TRUNCATE TABLE vehicle_passports;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
TRUNCATE TABLE service_centers;

-- 1. EXACTLY 1 DEMO ACCOUNT FOR EACH OF THE 4 ROLES
-- Default password: password123
INSERT INTO users (id, username, email, password_hash, full_name, phone_number, role, status) VALUES
(1, 'admin', 'admin@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Administrator', '+91 90000 00001', 'ADMIN', 'ACTIVE'),
(2, 'manager', 'manager@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Service Manager', '+91 90000 00002', 'SERVICE_CENTER_MANAGER', 'ACTIVE'),
(3, 'mechanic', 'mechanic@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Lead Mechanic', '+91 90000 00003', 'MECHANIC', 'ACTIVE'),
(4, 'customer', 'customer@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Customer Account', '+91 90000 00004', 'CUSTOMER', 'ACTIVE');

-- 2. PRIMARY WORKSHOP SERVICE CENTER
INSERT INTO service_centers (id, name, code, address_line1, address_line2, city, state, pincode, phone_number, email, latitude, longitude, operating_hours, is_active) VALUES
(1, 'MechX Prime Workshop', 'HUB-01', '100 Feet Road, Indiranagar', 'Phase 1', 'Bangalore', 'Karnataka', '560038', '+91 80 2000 3000', 'hub01@mechx.com', 12.9716, 77.6412, '08:00 AM - 08:00 PM', TRUE);

-- 3. CUSTOMER PROFILE (Clean)
INSERT INTO customer_profiles (id, user_id, address_line1, address_line2, city, state, pincode, emergency_contact_name, emergency_contact_phone, preferred_service_center_id) VALUES
(1, 4, 'Indiranagar Main', '12th Cross', 'Bangalore', 'Karnataka', '560038', 'Emergency Contact', '+91 90000 99999', 1);

-- 4. MECHANIC PROFILE (Initial Workload: 0)
INSERT INTO mechanic_profiles (id, user_id, service_center_id, specialization, experience_years, skill_level, is_available, current_workload, max_daily_capacity, rating_average, total_reviews_count) VALUES
(1, 3, 1, 'General Servicing, Diagnostics, Engine Repair', 7, 'SENIOR', TRUE, 0, 4, 5.00, 0);

SET FOREIGN_KEY_CHECKS = 1;
