-- ============================================================================
-- MechX – Vehicle Service Management Platform
-- Database Schema: vehicle_service_management
-- MySQL 8.x Normalized Relational Database Schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS vehicle_service_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vehicle_service_management;

-- Disable foreign key checks during creation/reset
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pickup_drop_requests;
DROP TABLE IF EXISTS vehicle_passports;
DROP TABLE IF EXISTS diagnosis_reports;
DROP TABLE IF EXISTS vehicle_health_reports;
DROP TABLE IF EXISTS maintenance_predictions;
DROP TABLE IF EXISTS maintenance_rules;
DROP TABLE IF EXISTS vehicle_maintenance_history;
DROP TABLE IF EXISTS service_parts;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS service_estimates;
DROP TABLE IF EXISTS service_status_history;
DROP TABLE IF EXISTS service_records;
DROP TABLE IF EXISTS mechanic_assignments;
DROP TABLE IF EXISTS appointment_slots;
DROP TABLE IF EXISTS service_requests;
DROP TABLE IF EXISTS service_packages;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS mechanic_profiles;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS service_centers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role ENUM('ADMIN', 'CUSTOMER', 'MECHANIC', 'SERVICE_CENTER_MANAGER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    profile_image_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. service_centers
-- ----------------------------------------------------------------------------
CREATE TABLE service_centers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(120),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 07:00 PM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sc_city (city)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. customer_profiles
-- ----------------------------------------------------------------------------
CREATE TABLE customer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    preferred_service_center_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cust_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cust_sc FOREIGN KEY (preferred_service_center_id) REFERENCES service_centers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. mechanic_profiles
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    service_center_id BIGINT NOT NULL,
    specialization VARCHAR(150) NOT NULL, -- e.g. Engine, Transmission, Electrical, General
    experience_years INT NOT NULL DEFAULT 1,
    skill_level ENUM('JUNIOR', 'MID', 'SENIOR', 'MASTER') DEFAULT 'MID',
    is_available BOOLEAN DEFAULT TRUE,
    current_workload INT DEFAULT 0,
    max_daily_capacity INT DEFAULT 4,
    rating_average DECIMAL(3, 2) DEFAULT 5.00,
    total_reviews_count INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mech_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mech_sc FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE RESTRICT,
    INDEX idx_mech_avail (is_available, specialization)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. vehicles
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    vin VARCHAR(50) NOT NULL UNIQUE,
    manufacturer VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    manufacturing_year INT NOT NULL,
    fuel_type ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG') NOT NULL,
    transmission ENUM('MANUAL', 'AUTOMATIC', 'CVT', 'DCT', 'AMT') NOT NULL,
    color VARCHAR(40),
    current_odometer INT NOT NULL DEFAULT 0,
    insurance_policy_number VARCHAR(100),
    insurance_expiry_date DATE,
    last_service_date DATE,
    vehicle_photo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_veh_cust FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_veh_reg (registration_number),
    INDEX idx_veh_cust (customer_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. service_categories
-- ----------------------------------------------------------------------------
CREATE TABLE service_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    estimated_duration_hours DECIMAL(4, 2) DEFAULT 2.0,
    is_active BOOLEAN DEFAULT TRUE,
    icon_name VARCHAR(50) DEFAULT 'wrench',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. service_packages
-- ----------------------------------------------------------------------------
CREATE TABLE service_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    package_type ENUM('BASIC', 'STANDARD', 'COMPREHENSIVE', 'PREMIUM') NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    included_services TEXT, -- JSON or comma-separated list
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. appointment_slots
-- ----------------------------------------------------------------------------
CREATE TABLE appointment_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_center_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT DEFAULT 5,
    booked_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_slot_sc FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_sc_slot (service_center_id, slot_date, start_time)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. service_requests
-- ----------------------------------------------------------------------------
CREATE TABLE service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    service_center_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    package_id BIGINT,
    booking_date DATE NOT NULL,
    booking_time_slot VARCHAR(50) NOT NULL,
    reported_issues TEXT,
    issue_photos_json JSON,
    current_odometer INT NOT NULL,
    status ENUM(
        'BOOKING_REQUESTED',
        'BOOKING_CONFIRMED',
        'VEHICLE_RECEIVED',
        'INSPECTION_IN_PROGRESS',
        'ESTIMATE_PENDING',
        'ESTIMATE_APPROVED',
        'REPAIR_IN_PROGRESS',
        'QUALITY_CHECK',
        'READY_FOR_DELIVERY',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'BOOKING_REQUESTED',
    requires_pickup_drop BOOLEAN DEFAULT FALSE,
    estimated_completion_date DATETIME,
    actual_completion_date DATETIME,
    cancellation_reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sr_cust FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_sc FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_cat FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_pkg FOREIGN KEY (package_id) REFERENCES service_packages(id) ON DELETE SET NULL,
    INDEX idx_sr_status (status),
    INDEX idx_sr_cust (customer_id),
    INDEX idx_sr_veh (vehicle_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. mechanic_assignments
-- ----------------------------------------------------------------------------
CREATE TABLE mechanic_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    mechanic_id BIGINT NOT NULL, -- references users.id (mechanic)
    assigned_by_id BIGINT NOT NULL, -- references users.id (manager/admin)
    assignment_rule_score DECIMAL(5, 2) DEFAULT 0.00,
    assignment_notes TEXT,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_ma_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ma_mech FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ma_assigner FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. service_records
-- ----------------------------------------------------------------------------
CREATE TABLE service_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    vehicle_id BIGINT NOT NULL,
    mechanic_id BIGINT NOT NULL,
    odometer_reading INT NOT NULL,
    inspection_notes TEXT,
    repair_details TEXT,
    mechanic_remarks TEXT,
    quality_checked_by VARCHAR(120),
    service_date DATE NOT NULL,
    next_service_due_date DATE,
    next_service_due_km INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_srec_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_srec_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_srec_mech FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. service_status_history
-- ----------------------------------------------------------------------------
CREATE TABLE service_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    remarks TEXT,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ssh_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ssh_user FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ssh_sr (service_request_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 13. spare_parts
-- ----------------------------------------------------------------------------
CREATE TABLE spare_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_number VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL, -- e.g. Brakes, Engine, Suspension, Electrical, Fluids
    manufacturer VARCHAR(100),
    compatible_models TEXT,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 5,
    unit_of_measure VARCHAR(20) DEFAULT 'PIECE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_num (part_number),
    INDEX idx_part_cat (category)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 14. service_parts
-- ----------------------------------------------------------------------------
CREATE TABLE service_parts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity_used INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    added_by_user_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_part FOREIGN KEY (part_id) REFERENCES spare_parts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sp_user FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 15. service_estimates
-- ----------------------------------------------------------------------------
CREATE TABLE service_estimates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    estimate_number VARCHAR(50) NOT NULL UNIQUE,
    labor_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    parts_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    gst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_estimated_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'REVISED') DEFAULT 'PENDING',
    customer_notes TEXT,
    manager_notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_est_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 16. invoices
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    labor_charges DECIMAL(10, 2) NOT NULL,
    parts_total DECIMAL(10, 2) NOT NULL,
    pickup_drop_charges DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    gst_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    gst_amount DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
    pdf_url VARCHAR(255),
    issued_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_cust FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_inv_status (payment_status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 17. payments
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    payment_reference VARCHAR(80) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'SUCCESS',
    transaction_notes TEXT,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_inv FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    INDEX idx_pay_ref (payment_reference)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 18. vehicle_health_reports
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_health_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    service_request_id BIGINT,
    overall_health_score INT NOT NULL, -- 0 to 100
    engine_score INT NOT NULL, -- 0 to 100
    brakes_score INT NOT NULL, -- 0 to 100
    tyres_score INT NOT NULL, -- 0 to 100
    battery_score INT NOT NULL, -- 0 to 100
    health_category ENUM('EXCELLENT', 'GOOD', 'FAIR', 'CRITICAL') NOT NULL,
    technician_summary TEXT,
    recommendations TEXT,
    inspection_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vhr_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_vhr_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
    INDEX idx_vhr_veh (vehicle_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 19. diagnosis_reports
-- ----------------------------------------------------------------------------
CREATE TABLE diagnosis_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    selected_symptoms_json JSON NOT NULL,
    identified_issues_json JSON NOT NULL,
    recommended_inspections TEXT,
    severity_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    disclaimer_accepted BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diag_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_diag_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 20. vehicle_passports
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_passports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL UNIQUE,
    passport_number VARCHAR(60) NOT NULL UNIQUE,
    verification_hash VARCHAR(120) NOT NULL,
    qr_code_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT TRUE,
    total_services_count INT DEFAULT 0,
    lifetime_service_spend DECIMAL(12, 2) DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pass_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 21. vehicle_maintenance_history
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_maintenance_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    service_record_id BIGINT,
    component_name VARCHAR(100) NOT NULL,
    action_performed ENUM('INSPECTED', 'SERVICED', 'REPLACED', 'CLEANED') NOT NULL,
    odometer_at_service INT NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0.00,
    service_date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vmh_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_vmh_sr FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE SET NULL,
    INDEX idx_vmh_veh_comp (vehicle_id, component_name)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 22. maintenance_rules
-- ----------------------------------------------------------------------------
CREATE TABLE maintenance_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    component_name VARCHAR(100) NOT NULL,
    interval_km INT NOT NULL,
    interval_months INT NOT NULL,
    fuel_type_applicable VARCHAR(50) DEFAULT 'ALL',
    severity_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    recommendation_text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 23. maintenance_predictions
-- ----------------------------------------------------------------------------
CREATE TABLE maintenance_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    prediction_type ENUM('ML_MODEL', 'RULE_BASED') NOT NULL DEFAULT 'ML_MODEL',
    predicted_maintenance_requirement VARCHAR(200) NOT NULL,
    estimated_due_mileage INT NOT NULL,
    estimated_due_date DATE NOT NULL,
    priority_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    confidence_score DECIMAL(5, 2) DEFAULT 85.00,
    recommendation TEXT NOT NULL,
    is_dismissed BOOLEAN DEFAULT FALSE,
    predicted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mp_veh FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_mp_veh (vehicle_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 24. pickup_drop_requests
-- ----------------------------------------------------------------------------
CREATE TABLE pickup_drop_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_pincode VARCHAR(20) NOT NULL,
    pickup_contact_name VARCHAR(100) NOT NULL,
    pickup_contact_phone VARCHAR(20) NOT NULL,
    pickup_scheduled_at DATETIME NOT NULL,
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_pincode VARCHAR(20),
    pickup_status ENUM('REQUESTED', 'ASSIGNED', 'OUT_FOR_PICKUP', 'PICKED_UP', 'AT_WORKSHOP') DEFAULT 'REQUESTED',
    delivery_status ENUM('NOT_STARTED', 'OUT_FOR_DELIVERY', 'DELIVERED') DEFAULT 'NOT_STARTED',
    pickup_driver_name VARCHAR(100),
    pickup_driver_phone VARCHAR(20),
    pickup_otp VARCHAR(10),
    delivery_otp VARCHAR(10),
    pickup_completed_at DATETIME,
    delivery_completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pdr_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 25. notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('BOOKING', 'STATUS', 'ESTIMATE', 'INVOICE', 'PREDICTION', 'SYSTEM') NOT NULL,
    reference_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 26. reviews
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_request_id BIGINT NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    mechanic_id BIGINT,
    service_center_id BIGINT NOT NULL,
    service_rating INT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
    mechanic_rating INT CHECK (mechanic_rating BETWEEN 1 AND 5),
    review_title VARCHAR(150),
    review_comments TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rev_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_cust FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rev_mech FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_rev_sc FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 27. complaints
-- ----------------------------------------------------------------------------
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    service_request_id BIGINT,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by_user_id BIGINT,
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comp_cust FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_comp_sr FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
    CONSTRAINT fk_comp_resolver FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_comp_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 28. audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(80) NOT NULL,
    entity_id BIGINT,
    ip_address VARCHAR(50),
    details TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_time (created_at)
) ENGINE=InnoDB;
