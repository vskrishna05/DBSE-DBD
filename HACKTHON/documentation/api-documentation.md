# MechX – REST API Documentation

Base URI: `/api/v1/`  
Interactive Swagger UI: `http://localhost:8080/swagger-ui/index.html`  
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Authenticate with username/email and password, returns JWT token.
- `POST /api/v1/auth/register`: Register new customer or mechanic.
- `GET /api/v1/auth/me`: Get current authenticated user profile.

## 2. Vehicles (`/api/v1/vehicles`)
- `GET /api/v1/vehicles`: Get authenticated customer's vehicles.
- `GET /api/v1/vehicles/{id}`: Get vehicle details (ownership enforced).
- `POST /api/v1/vehicles`: Register new vehicle (auto-generates digital passport).
- `PUT /api/v1/vehicles/{id}`: Update vehicle info.
- `DELETE /api/v1/vehicles/{id}`: Soft delete vehicle.

## 3. Service Booking (`/api/v1/bookings`)
- `POST /api/v1/bookings`: Book service slot with vehicle, package, and valet pickup option.
- `GET /api/v1/bookings`: List bookings for current user.
- `GET /api/v1/bookings/{id}`: View booking details.
- `POST /api/v1/bookings/{id}/cancel`: Cancel booking with reason.

## 4. Mechanic Assignment (`/api/v1/mechanics`)
- `GET /api/v1/mechanics`: List all certified mechanics.
- `GET /api/v1/mechanics/recommend/{serviceRequestId}`: Smart rule-based assignment matching engine (specialization, capacity, experience, rating).
- `POST /api/v1/mechanics/assign`: Manager approves or overrides mechanic assignment.

## 5. Service Tracking & Status (`/api/v1/services`)
- `GET /api/v1/services/categories`: Catalog of active repair categories.
- `GET /api/v1/services/packages`: Silver, Gold, Platinum tiered packages.
- `PATCH /api/v1/services/{id}/status`: Advance lifecycle status (11 stages).
- `GET /api/v1/services/{id}/history`: Visual progress timeline log.

## 6. Vehicle Health Score (`/api/v1/health`)
- `GET /api/v1/health/vehicle/{vehicleId}`: Health report history.
- `GET /api/v1/health/vehicle/{vehicleId}/latest`: Latest score out of 100 (Engine, Brakes, Tyres, Battery).
- `POST /api/v1/health`: Certified mechanic inspection submission.

## 7. Vehicle Problem Identification (`/api/v1/diagnosis`)
- `POST /api/v1/diagnosis`: Rule-based failure identification and inspection recommendations.

## 8. Smart Cost Estimation (`/api/v1/estimates`)
- `GET /api/v1/estimates/service/{serviceRequestId}`: Retrieve cost estimate.
- `POST /api/v1/estimates`: Manager creates/revises estimate with parts & GST.
- `POST /api/v1/estimates/{serviceRequestId}/decision`: Customer approves or rejects.

## 9. Digital Vehicle Passport (`/api/v1/passports`)
- `GET /api/v1/passports/vehicle/{vehicleId}`: Full digital vehicle passport ledger.
- `GET /api/v1/passports/public/{passportNumber}`: Public QR verification lookup.

## 10. Valet Pickup & Drop (`/api/v1/pickups`)
- `GET /api/v1/pickups/service/{serviceRequestId}`: Retrieve pickup & drop status.
- `PUT /api/v1/pickups`: Update driver assignment, address, or delivery state.
- `POST /api/v1/pickups/{serviceRequestId}/verify-otp`: Dual OTP verification for handover.

## 11. Billing & Invoices (`/api/v1/invoices`)
- `GET /api/v1/invoices`: List invoices.
- `GET /api/v1/invoices/{id}`: View invoice details.
- `POST /api/v1/invoices/service/{serviceRequestId}`: Generate official tax invoice.
- `POST /api/v1/invoices/{id}/pay`: Record payment.
- `GET /api/v1/invoices/{id}/pdf`: Download official iText 7 PDF receipt.

## 12. Spare Parts Inventory (`/api/v1/inventory`)
- `GET /api/v1/inventory/parts`: Catalog of parts in stock.
- `GET /api/v1/inventory/low-stock`: Parts below reorder threshold.
- `POST /api/v1/inventory/parts`: Add new part to catalog.
- `PATCH /api/v1/inventory/parts/{id}/stock`: Adjust physical inventory count.
- `POST /api/v1/inventory/service-use`: Record part used in repair with transaction deduction.

## 13. Python AI Predictive Maintenance (`/api/v1/maintenance`)
- `GET /api/v1/maintenance/vehicle/{vehicleId}`: Current predictive maintenance forecasts.
- `POST /api/v1/maintenance/predict/{vehicleId}`: Trigger Random Forest AI inference.

## 14. Admin Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics/dashboard`: Recharts KPI metrics, monthly revenue, popular services, workshop stats.
