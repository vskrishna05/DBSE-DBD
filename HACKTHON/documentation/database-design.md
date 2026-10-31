# MechX – Database Design Documentation

## Database Engine
- **Engine**: MySQL 8.x
- **Schema Name**: `vehicle_service_management`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Relational Entity Model (28 Tables)

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|------------|-------------|------------------|---------|
| `users` | `id` (BIGINT) | None | System user authentication, credentials & roles |
| `service_centers` | `id` (BIGINT) | None | Physical workshops and contact details |
| `customer_profiles` | `id` (BIGINT) | `user_id`, `preferred_service_center_id` | Extended customer profile & emergency contact |
| `mechanic_profiles` | `id` (BIGINT) | `user_id`, `service_center_id` | Mechanic skills, workload, rating & experience |
| `vehicles` | `id` (BIGINT) | `customer_id` | Vehicle registration, VIN, fuel type, odometer |
| `service_categories` | `id` (BIGINT) | None | Catalog of repair categories and base labor rates |
| `service_packages` | `id` (BIGINT) | None | Silver, Gold, Platinum service package tiers |
| `appointment_slots` | `id` (BIGINT) | `service_center_id` | Workshop capacity and reservation time slots |
| `service_requests` | `id` (BIGINT) | `customer_id`, `vehicle_id`, `service_center_id`, `category_id`, `package_id` | Core service booking record & 11-stage status |
| `mechanic_assignments` | `id` (BIGINT) | `service_request_id`, `mechanic_id`, `assigned_by_id` | Rule-based mechanic assignment with match score |
| `service_records` | `id` (BIGINT) | `service_request_id`, `vehicle_id`, `mechanic_id` | Verified service history ledger entries |
| `service_status_history` | `id` (BIGINT) | `service_request_id`, `changed_by_user_id` | Audit trail of every lifecycle status transition |
| `spare_parts` | `id` (BIGINT) | None | Inventory stock, reorder levels, unit prices |
| `service_parts` | `id` (BIGINT) | `service_request_id`, `part_id`, `added_by_user_id` | Parts consumed during repairs (auto stock deduction) |
| `service_estimates` | `id` (BIGINT) | `service_request_id` | Pre-repair quote with labor, parts, discount & GST |
| `invoices` | `id` (BIGINT) | `service_request_id`, `customer_id` | Official tax invoices & payment status |
| `payments` | `id` (BIGINT) | `invoice_id` | Payment transaction records (UPI, Card, Cash) |
| `vehicle_health_reports` | `id` (BIGINT) | `vehicle_id`, `service_request_id` | Engine, Brakes, Tyres, Battery scores (0-100) |
| `diagnosis_reports` | `id` (BIGINT) | `vehicle_id`, `user_id` | Rule-based diagnostic report and symptom logs |
| `vehicle_passports` | `id` (BIGINT) | `vehicle_id` | Digital passport, QR code link & SHA-256 hash |
| `vehicle_maintenance_history` | `id` (BIGINT) | `vehicle_id`, `service_record_id` | Historical log of component replacements |
| `maintenance_rules` | `id` (BIGINT) | None | Standard interval rules (km & months) |
| `maintenance_predictions` | `id` (BIGINT) | `vehicle_id` | Python ML forecast records (due km, date, priority) |
| `pickup_drop_requests` | `id` (BIGINT) | `service_request_id` | Doorstep valet addresses, status & dual OTP |
| `notifications` | `id` (BIGINT) | `user_id` | In-app notification queue |
| `reviews` | `id` (BIGINT) | `service_request_id`, `customer_id`, `mechanic_id`, `service_center_id` | Star ratings & customer reviews |
| `complaints` | `id` (BIGINT) | `customer_id`, `service_request_id`, `resolved_by_user_id` | Support ticket management |
| `audit_logs` | `id` (BIGINT) | `user_id` | Security and compliance audit trail |
