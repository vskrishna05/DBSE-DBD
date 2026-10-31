-- ============================================================================
-- MechX – Vehicle Service Management Platform
-- Sample Data Script: Demonstration records across all 4 roles
-- Default password for all sample accounts: password123
-- BCrypt Hash: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ============================================================================

USE vehicle_service_management;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS
-- Password for all accounts is: password123
INSERT INTO users (id, username, email, password_hash, full_name, phone_number, role, status) VALUES
(1, 'admin', 'admin@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'System Administrator', '+91 98765 00001', 'ADMIN', 'ACTIVE'),
(2, 'manager_blr', 'manager@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Suresh Menon', '+91 98765 00002', 'SERVICE_CENTER_MANAGER', 'ACTIVE'),
(3, 'mech_rajesh', 'rajesh.kumar@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Rajesh Kumar', '+91 98765 00003', 'MECHANIC', 'ACTIVE'),
(4, 'mech_amit', 'amit.sharma@mechx.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Amit Sharma', '+91 98765 00004', 'MECHANIC', 'ACTIVE'),
(5, 'cust_john', 'john.doe@gmail.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'John Doe', '+91 98765 00005', 'CUSTOMER', 'ACTIVE'),
(6, 'cust_priya', 'priya.patel@gmail.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Priya Patel', '+91 98765 00006', 'CUSTOMER', 'ACTIVE');

-- 2. SERVICE CENTERS
INSERT INTO service_centers (id, name, code, address_line1, address_line2, city, state, pincode, phone_number, email, latitude, longitude, operating_hours, is_active) VALUES
(1, 'MechX Prime Autocare - Downtown Hub', 'SC-BLR-01', 'Plot 42, Outer Ring Road, Bellandur', 'Near EcoSpace Tech Park', 'Bangalore', 'Karnataka', '560103', '+91 80 4455 6677', 'blr.prime@mechx.com', 12.9279, 77.6833, '08:00 AM - 08:00 PM', TRUE),
(2, 'MechX Tech-Works Koramangala', 'SC-BLR-02', '80 Feet Road, 4th Block', 'Koramangala', 'Bangalore', 'Karnataka', '560034', '+91 80 4455 6688', 'koramangala@mechx.com', 12.9352, 77.6245, '08:30 AM - 07:30 PM', TRUE);

-- 3. CUSTOMER PROFILES
INSERT INTO customer_profiles (id, user_id, address_line1, address_line2, city, state, pincode, emergency_contact_name, emergency_contact_phone, preferred_service_center_id) VALUES
(1, 5, 'Flat 402, Skyline Residency', 'Sarjapur Main Road', 'Bangalore', 'Karnataka', '560035', 'Sarah Doe', '+91 98765 11111', 1),
(2, 6, 'Villa 18, Palm Meadows', 'Whitefield', 'Bangalore', 'Karnataka', '560066', 'Ketan Patel', '+91 98765 22222', 1);

-- 4. MECHANIC PROFILES
INSERT INTO mechanic_profiles (id, user_id, service_center_id, specialization, experience_years, skill_level, is_available, current_workload, max_daily_capacity, rating_average, total_reviews_count) VALUES
(1, 3, 1, 'Engine Repair, Transmission, Brake Systems', 8, 'SENIOR', TRUE, 1, 4, 4.90, 48),
(2, 4, 1, 'Electrical Repair, AC Diagnostics, Hybrid/EV', 5, 'MID', TRUE, 1, 4, 4.80, 32);

-- 5. VEHICLES
INSERT INTO vehicles (id, customer_id, registration_number, vin, manufacturer, model, manufacturing_year, fuel_type, transmission, color, current_odometer, insurance_policy_number, insurance_expiry_date, last_service_date, vehicle_photo_url, is_active) VALUES
(1, 5, 'KA-01-MJ-2024', 'MB1JTE82N00192831', 'Toyota', 'Fortuner 2.8 4x4', 2022, 'DIESEL', 'AUTOMATIC', 'Phantom Black', 38450, 'POL-TY-98231', '2027-05-15', '2026-06-10', '/uploads/vehicle-images/fortuner.png', TRUE),
(2, 5, 'KA-05-NB-5541', 'MALC351GLN0283910', 'Hyundai', 'Creta 1.5 SX', 2023, 'PETROL', 'MANUAL', 'Polar White', 18200, 'POL-HY-12093', '2027-08-20', '2026-08-15', '/uploads/vehicle-images/creta.png', TRUE),
(3, 6, 'KA-03-EX-9012', 'MAT623190L0192830', 'Tata', 'Nexon EV Prime', 2023, 'ELECTRIC', 'AUTOMATIC', 'Signature Teal', 24100, 'POL-TT-77291', '2027-01-30', '2026-07-01', '/uploads/vehicle-images/nexon.png', TRUE);

-- 6. SERVICE CATEGORIES
INSERT INTO service_categories (id, name, code, description, base_labor_cost, estimated_duration_hours, is_active, icon_name) VALUES
(1, 'General Servicing', 'CAT_GENERAL', 'Comprehensive multi-point inspection, fluids top-up, filter clean, brake inspection, road test', 1200.00, 3.5, TRUE, 'wrench'),
(2, 'Engine Repair & Diagnostics', 'CAT_ENGINE', 'Engine tune-up, spark plugs, timing belt check, oil leaks, compression tests', 2500.00, 5.0, TRUE, 'activity'),
(3, 'Oil & Filter Change', 'CAT_OIL', 'Engine oil drain, premium synthetic oil refill, OEM oil filter replacement', 600.00, 1.0, TRUE, 'droplet'),
(4, 'Brake Repair & Service', 'CAT_BRAKE', 'Brake pad replacement, disc skimming, caliper lube, brake fluid bleed', 1500.00, 2.5, TRUE, 'disc'),
(5, 'Battery Replacement & Testing', 'CAT_BATTERY', 'Battery load test, terminal cleaning, high-durability AGM battery replacement', 400.00, 1.0, TRUE, 'battery-charging'),
(6, 'Tyre Replacement & Alignment', 'CAT_TYRE', 'Wheel balancing, 3D laser alignment, tyre replacement, nitrogen filling', 900.00, 2.0, TRUE, 'circle'),
(7, 'AC Repair & Cooling Service', 'CAT_AC', 'Refrigerant gas top-up, AC condenser coil flush, cabin filter, blower clean', 1800.00, 3.0, TRUE, 'wind'),
(8, 'Electrical & Wiring Diagnosis', 'CAT_ELECTRICAL', 'OBD-II scanner diagnostics, alternator & starter motor check, wiring harness inspection', 1400.00, 2.5, TRUE, 'zap'),
(9, 'Accident & Denting-Painting', 'CAT_BODYWORK', 'Panel beating, dent puller repair, primer coat, computerized paint booth finishing', 4500.00, 8.0, TRUE, 'shield-alert');

-- 7. SERVICE PACKAGES
INSERT INTO service_packages (id, name, package_type, description, price, discount_percentage, included_services) VALUES
(1, 'Express Silver Care', 'BASIC', 'Engine oil replacement, oil filter change, 30-point checkup, exterior wash', 2499.00, 5.00, 'Oil Change, Filter Replacement, 30-point Inspection, Car Wash'),
(2, 'Pro Gold Performance', 'STANDARD', 'Full synthetic oil, all filters, brake servicing, throttle body cleaning, coolant check', 4999.00, 10.00, 'Synthetic Oil, Filters, Brake Check, Spark Plug Inspect, Diagnostic Scan'),
(3, 'MechX Platinum Shield', 'COMPREHENSIVE', 'Complete vehicle overhaul, suspension check, AC overhaul, wheel alignment, interior sanitization', 8999.00, 15.00, 'All fluids, 60-point Inspection, AC Service, Wheel Alignment, Detailing');

-- 8. SPARE PARTS INVENTORY
INSERT INTO spare_parts (id, part_number, name, category, manufacturer, compatible_models, unit_price, quantity_in_stock, reorder_level, unit_of_measure, is_active) VALUES
(1, 'SP-BP-001', 'Ceramic Front Brake Pads Set', 'Brakes', 'Bosch', 'Toyota Fortuner, Hilux, Innova Crysta', 2850.00, 24, 6, 'SET', TRUE),
(2, 'SP-OIL-5W30', 'Fully Synthetic 5W-30 Engine Oil 4L', 'Fluids', 'Mobil 1', 'Toyota Fortuner, Hyundai Creta, Honda City', 2400.00, 50, 10, 'CAN', TRUE),
(3, 'SP-OF-008', 'OEM Engine Oil Filter Cartridge', 'Filters', 'Toyota Genuine Parts', 'Toyota Fortuner, Innova Crysta', 650.00, 35, 8, 'PIECE', TRUE),
(4, 'SP-AF-012', 'High-Flow Engine Air Filter', 'Filters', 'Mann Filter', 'Toyota Fortuner 2.8', 850.00, 20, 5, 'PIECE', TRUE),
(5, 'SP-CF-004', 'Activated Carbon Cabin Air Filter', 'AC', 'Denso', 'Hyundai Creta, Kia Seltos', 550.00, 28, 5, 'PIECE', TRUE),
(6, 'SP-BAT-75AH', '75Ah 12V Maintenance-Free AGM Battery', 'Electrical', 'Amaron', 'Toyota Fortuner, Tata Harrier, Scorpio-N', 7800.00, 12, 4, 'PIECE', TRUE),
(7, 'SP-DISC-002', 'Ventilated Front Brake Disc Rotor', 'Brakes', 'Brembo', 'Toyota Fortuner 2021-2024', 4200.00, 8, 3, 'PIECE', TRUE),
(8, 'SP-COOL-001', 'Long-Life Anti-Freeze Coolant 1L', 'Fluids', 'Castrol Radicool', 'Universal', 320.00, 45, 10, 'BOTTLE', TRUE);

-- 9. SERVICE REQUESTS
INSERT INTO service_requests (id, booking_reference, customer_id, vehicle_id, service_center_id, category_id, package_id, booking_date, booking_time_slot, reported_issues, issue_photos_json, current_odometer, status, requires_pickup_drop, estimated_completion_date) VALUES
(1, 'MX-2026-0001', 5, 1, 1, 1, 2, '2026-10-28', '09:00 AM - 10:00 AM', 'Scheduled periodic 40,000 km general servicing. Mild squeaking sound from front brakes when decelerating.', '[]', 38450, 'REPAIR_IN_PROGRESS', TRUE, '2026-10-31 17:00:00'),
(2, 'MX-2026-0002', 5, 2, 1, 7, 1, '2026-10-29', '11:00 AM - 12:00 PM', 'AC cooling is insufficient in traffic; slight foul smell from blower vents.', '[]', 18200, 'ESTIMATE_PENDING', FALSE, '2026-11-01 15:00:00'),
(3, 'MX-2026-0003', 6, 3, 1, 8, NULL, '2026-10-25', '10:00 AM - 11:00 AM', 'Charging port flap alert on dashboard, 12V auxiliary battery status check.', '[]', 24100, 'COMPLETED', FALSE, '2026-10-25 16:30:00');

-- 10. MECHANIC ASSIGNMENTS
INSERT INTO mechanic_assignments (id, service_request_id, mechanic_id, assigned_by_id, assignment_rule_score, assignment_notes, assigned_at, is_active) VALUES
(1, 1, 3, 2, 94.50, 'Matched for Senior Brake & Engine experience with Fortuner chassis.', '2026-10-28 09:30:00', TRUE),
(2, 3, 4, 2, 96.00, 'Assigned to EV/Electrical specialist for auxiliary battery check.', '2026-10-25 10:15:00', FALSE);

-- 11. SERVICE STATUS HISTORY
INSERT INTO service_status_history (id, service_request_id, previous_status, new_status, changed_by_user_id, remarks, changed_at) VALUES
(1, 1, NULL, 'BOOKING_REQUESTED', 5, 'Booking placed via MechX Customer Portal', '2026-10-28 08:30:00'),
(2, 1, 'BOOKING_REQUESTED', 'BOOKING_CONFIRMED', 2, 'Confirmed appointment slot SC-BLR-01', '2026-10-28 09:00:00'),
(3, 1, 'BOOKING_CONFIRMED', 'VEHICLE_RECEIVED', 2, 'Vehicle received at Downtown Hub via doorstep valet pickup', '2026-10-28 10:15:00'),
(4, 1, 'VEHICLE_RECEIVED', 'INSPECTION_IN_PROGRESS', 3, 'Initial 40-point vehicle inspection started', '2026-10-28 10:45:00'),
(5, 1, 'INSPECTION_IN_PROGRESS', 'ESTIMATE_APPROVED', 5, 'Customer approved parts estimate of Rs 6,700 via web portal', '2026-10-28 12:00:00'),
(6, 1, 'ESTIMATE_APPROVED', 'REPAIR_IN_PROGRESS', 3, 'Replacing front ceramic brake pads and oil filter cartridge', '2026-10-28 14:00:00');

-- 12. SERVICE PARTS USED
INSERT INTO service_parts (id, service_request_id, part_id, quantity_used, unit_price, total_price, added_by_user_id, created_at) VALUES
(1, 1, 1, 1, 2850.00, 2850.00, 3, '2026-10-28 14:15:00'),
(2, 1, 2, 1, 2400.00, 2400.00, 3, '2026-10-28 14:20:00'),
(3, 1, 3, 1, 650.00, 650.00, 3, '2026-10-28 14:25:00');

-- 13. SERVICE ESTIMATES
INSERT INTO service_estimates (id, service_request_id, estimate_number, labor_charges, parts_total, discount_amount, gst_rate, gst_amount, total_estimated_amount, status, customer_notes, manager_notes) VALUES
(1, 1, 'EST-2026-0001', 1500.00, 5900.00, 500.00, 18.00, 1242.00, 8142.00, 'APPROVED', 'Please ensure brake discs are cleaned properly.', 'Includes Pro Gold package rebate of Rs 500'),
(2, 2, 'EST-2026-0002', 1800.00, 550.00, 0.00, 18.00, 423.00, 2773.00, 'PENDING', NULL, 'Includes cabin air filter and AC refrigerant gas top-up');

-- 14. INVOICES & PAYMENTS (FOR COMPLETED SERVICE #3)
INSERT INTO invoices (id, service_request_id, invoice_number, customer_id, labor_charges, parts_total, pickup_drop_charges, subtotal, discount_amount, gst_rate, gst_amount, grand_total, payment_status, issued_date) VALUES
(1, 3, 'INV-2026-0001', 6, 1400.00, 0.00, 0.00, 1400.00, 100.00, 18.00, 234.00, 1534.00, 'PAID', '2026-10-25 16:30:00');

INSERT INTO payments (id, invoice_id, payment_reference, amount, payment_method, payment_status, transaction_notes) VALUES
(1, 1, 'PAY-UPI-20261025-99812', 1534.00, 'UPI', 'SUCCESS', 'Paid via Google Pay UPI Ref: 42918291029');

-- 15. VEHICLE HEALTH REPORTS
INSERT INTO vehicle_health_reports (id, vehicle_id, service_request_id, overall_health_score, engine_score, brakes_score, tyres_score, battery_score, health_category, technician_summary, recommendations, inspection_date) VALUES
(1, 1, 1, 86, 92, 74, 88, 90, 'GOOD', 'Engine compression and turbo boost levels are optimal. Front brake pads worn down to 3.2mm (replacement underway). Battery health is 90%.', 'Front brake pad replacement recommended now. Tyre rotation due at 45,000 km.', '2026-10-28'),
(2, 2, 2, 91, 95, 92, 89, 88, 'EXCELLENT', 'All mechanical components in top condition. AC cabin filter has particulate buildup.', 'AC cabin filter replacement recommended.', '2026-10-29'),
(3, 3, 3, 94, 98, 92, 90, 96, 'EXCELLENT', 'EV high-voltage pack health 98.4%, 12V auxiliary battery testing nominal at 12.8V.', 'No urgent mechanical action required. Keep tyre pressure at 34 PSI.', '2026-10-25');

-- 16. VEHICLE PASSPORTS (DIGITAL VEHICLE PASSPORT WITH QR & VERIFICATION)
INSERT INTO vehicle_passports (id, vehicle_id, passport_number, verification_hash, qr_code_url, is_verified, total_services_count, lifetime_service_spend) VALUES
(1, 1, 'VPASS-TOY-2022-8291', 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://mechx.app/passport/VPASS-TOY-2022-8291', TRUE, 4, 32450.00),
(2, 2, 'VPASS-HYU-2023-1192', 'SHA256:8f43b1237ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d1111', 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://mechx.app/passport/VPASS-HYU-2023-1192', TRUE, 2, 9200.00),
(3, 3, 'VPASS-TAT-2023-9031', 'SHA256:9a32c1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126e2222', 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://mechx.app/passport/VPASS-TAT-2023-9031', TRUE, 1, 1534.00);

-- 17. PICKUP AND DROP REQUESTS
INSERT INTO pickup_drop_requests (id, service_request_id, pickup_address, pickup_city, pickup_pincode, pickup_contact_name, pickup_contact_phone, pickup_scheduled_at, pickup_status, delivery_status, pickup_driver_name, pickup_driver_phone, pickup_otp, delivery_otp, pickup_completed_at) VALUES
(1, 1, 'Flat 402, Skyline Residency, Sarjapur Main Road', 'Bangalore', '560035', 'John Doe', '+91 98765 00005', '2026-10-28 09:30:00', 'AT_WORKSHOP', 'NOT_STARTED', 'Kiran Varma (MechX Driver #12)', '+91 98765 44332', '4829', '7104', '2026-10-28 10:15:00');

-- 18. MAINTENANCE RULES & PREDICTIONS
INSERT INTO maintenance_rules (id, component_name, interval_km, interval_months, fuel_type_applicable, severity_level, recommendation_text) VALUES
(1, 'Engine Oil & Filter', 10000, 6, 'PETROL,DIESEL,HYBRID', 'HIGH', 'Replace engine oil and OEM filter to prevent sludge buildup and friction wear.'),
(2, 'Front & Rear Brake Pads', 20000, 12, 'ALL', 'CRITICAL', 'Inspect brake pad friction lining thickness and disc rotor runout.'),
(3, 'Cabin Air Filter', 15000, 12, 'ALL', 'MEDIUM', 'Replace cabin pollen filter to ensure optimal HVAC airflow and cabin air purity.'),
(4, 'Transmission Fluid Flush', 40000, 24, 'ALL', 'HIGH', 'Drain and replace automatic transmission fluid to protect planetary gearsets and clutch packs.'),
(5, 'Coolant Radiator Flush', 40000, 24, 'ALL', 'MEDIUM', 'Flush and replenish engine coolant to avoid cooling jacket corrosion.');

INSERT INTO maintenance_predictions (id, vehicle_id, component_name, prediction_type, predicted_maintenance_requirement, estimated_due_mileage, estimated_due_date, priority_level, confidence_score, recommendation) VALUES
(1, 1, 'Transmission Fluid Flush', 'ML_MODEL', 'Automated Transmission Fluid Renewal Due', 40000, '2026-12-15', 'HIGH', 92.40, 'Vehicle odometer at 38,450 km. Fluid degradation model predicts viscosity decay by 40,000 km.'),
(2, 1, 'Tyre Rotation & 3D Alignment', 'RULE_BASED', 'Wheel Balance & Tread Life Rotation', 42000, '2027-01-20', 'MEDIUM', 88.00, 'Last rotation was at 30,000 km. Rotate tyres to prevent uneven shoulder wear.'),
(3, 2, 'Cabin Air Filter', 'ML_MODEL', 'High Particulate Resistance Detected in AC System', 20000, '2026-11-20', 'MEDIUM', 89.50, 'Replace cabin filter cartridge during current AC diagnostic service.');

-- 19. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, notification_type, reference_id, is_read) VALUES
(1, 5, 'Service Progress Update', 'Your Toyota Fortuner (KA-01-MJ-2024) is now in Repair: Brake pads replacement in progress.', 'STATUS', 1, FALSE),
(2, 5, 'Estimate Approved', 'You approved Estimate #EST-2026-0001 for Rs 8,142. Work has resumed.', 'ESTIMATE', 1, TRUE),
(3, 6, 'Invoice Paid Receipt', 'Payment of Rs 1,534 for Tata Nexon EV (KA-03-EX-9012) was confirmed. Vehicle Passport updated.', 'INVOICE', 1, TRUE);

-- 20. REVIEWS
INSERT INTO reviews (id, service_request_id, customer_id, mechanic_id, service_center_id, service_rating, mechanic_rating, review_title, review_comments) VALUES
(1, 3, 6, 4, 1, 5, 5, 'Outstanding EV Expertise!', 'Amit diagnosed the auxiliary 12V alert in under 20 minutes and performed full diagnostics. Highly recommend MechX Downtown Hub!');

-- 21. COMPLAINTS
INSERT INTO complaints (id, ticket_number, customer_id, service_request_id, subject, description, priority, status) VALUES
(1, 'TKT-2026-0042', 5, 1, 'Delay in pickup valet arrival', 'The valet driver arrived 15 minutes after the scheduled 9:30 AM slot due to heavy traffic on Sarjapur road.', 'LOW', 'RESOLVED');

SET FOREIGN_KEY_CHECKS = 1;
