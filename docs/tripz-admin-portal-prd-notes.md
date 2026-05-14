# TripZ Admin Portal Product Spec

Source workbook:

```text
/Users/sanchay/Downloads/TripsZ.xlsx
```

Date captured: 2026-05-06

Status: Draft v1

## Purpose

TripZ needs a back-office operating system where the team can log in, upload or enter travel booking work, track customer and ticket details, manage document handoffs, and see business statistics from the same source of truth.

The attached workbook is not a clean import template yet. It is a rough operating-system sketch that combines dashboard metrics, customer intake fields, ticket update fields, and basic revenue/expense calculations.

## Workbook Summary

The workbook has two sheets.

### Sheet1: Operating System / Dashboard Draft

Sheet1 contains the main admin-panel concept.

Dashboard metrics represented:

| Area | Fields |
| --- | --- |
| Domestic bookings | Tickets Booked, Booked Ticket Price, Margin |
| Domestic hotels | Hotel Booked, Hotel Booked Price, Margin |
| International tickets | International Ticket Booked, International Ticket Booked Price, Margin |
| International hotels | International Hotel Booked, International Hotel Booked Price, Margin |
| Totals | Total Booked Amount, Total Margin Earned |

Sample dashboard values in the workbook:

| Metric | Value |
| --- | ---: |
| Domestic ticket booked | 1 |
| Domestic ticket price | 5,000 |
| Domestic ticket margin | 200 |
| Domestic hotel booked | 1 |
| Domestic hotel price | 5,000 |
| Domestic hotel margin | 200 |
| International ticket booked | 1 |
| International ticket price | 100,000 |
| International ticket margin | 200 |
| International hotel booked | 1 |
| International hotel price | 100,000 |
| International hotel margin | 200 |
| Total booked amount | 400,000 |
| Total margin earned | 1,000 |

Other operational notes present in Sheet1:

| Workbook note | Product interpretation |
| --- | --- |
| No of Customer | Customer count / CRM summary |
| Boarding Pass | Boarding-pass tracking workflow |
| 24 Hours Before Notification | Reminder workflow before travel |
| Form To Enter Customer Details Base | Customer intake form |
| For Tickets, We Need To Create A Templates | Ticket/document template generator |
| Fixed Flight And Hotel, Domestic And International Tickets Template | Templates by booking category |

Customer intake fields listed:

| Field |
| --- |
| Customer ID, automatic capture from Form 1 |
| Customer Name |
| Customer Gender |
| Customer Location |
| Customer Mobile No |
| Customer Mail ID |
| Remarks on what he/she does |

Manual ticket update fields listed:

| Field |
| --- |
| Customer Name |
| Departure and Arrival |
| One way / Return |
| Total Revenue |
| Margin |
| Domestic or International |
| Flight or Hotel |
| Travel Date |
| Airlines |
| Airlines logo can be pre-uploaded for tickets |

### Sheet2: Revenue / Expense Scratch Sheet

Sheet2 contains basic business math.

Booking category values:

| Price | Category |
| ---: | --- |
| 5,000 | Domestic |
| 100,000 | International |
| 5,000 | Hotel |

Detected formulas:

| Cell | Formula | Interpretation |
| --- | --- | --- |
| E2 | `=B2*100` | Domestic revenue model |
| E3 | `=B3*50` | International revenue model |
| E4 | `=B4*100` | Hotel revenue model |
| E5 | `=SUM(E2:E4)` | Total revenue |
| E7 | `=E5*5%` | 5% margin / commission |
| I6 | `=SUM(I2:I5)` | Expense total |
| J7 | `=I7-I6` | Balance / profit after expenses |

Expense-like entries:

| Name | Amount |
| --- | ---: |
| Keya | 25,000 |
| Sachay | 25,000 |
| Sony | 30,000 |
| Rent | 9,000 |
| Total expense | 89,000 |
| Input / total | 136,000 |
| Difference | 47,000 |

No formula errors were detected in the workbook.

## Product Direction

The real product should separate the workbook into dedicated modules:

| Workbook concept | Admin product module |
| --- | --- |
| Dashboard row | Analytics dashboard |
| Customer form fields | Customer CRM |
| Manual ticket fields | Booking operations |
| Boarding pass note | Document/task workflow |
| 24-hour notification note | Reminder engine |
| Sheet2 formulas | Finance dashboard |
| Ticket template notes | Template/document generator |

## Recommended Product Decisions

These are the recommended defaults for the first production build.

| Area | Recommendation | Reason |
| --- | --- | --- |
| Product shape | Internal admin operating system first | The workbook describes back-office operations, not a public customer portal |
| Core record | Make `bookings` the center of the system | Customers, documents, tasks, payments, and reports all connect naturally to bookings |
| App architecture | Use the existing Next.js app with server-side data access | Keeps v1 simple and avoids a separate backend service too early |
| Database | Postgres, preferably Supabase Postgres if fast managed setup is needed | Relational data fits customers, bookings, segments, payments, tasks, and finance |
| Auth | Use Supabase Auth if using Supabase, otherwise Clerk or NextAuth | Do not build custom password/auth logic |
| File storage | Supabase Storage or Vercel Blob | Needed for tickets, vouchers, boarding passes, receipts, invoices, and logos |
| WhatsApp | Click-to-chat links in v1 | Lowest operational risk; official WhatsApp API can come later |
| Import/export | CSV first, XLSX second | CSV is easier to validate and debug; XLSX can follow once schema is stable |
| Reminders | Persist reminders as tasks | The team needs a visible work queue, not invisible alerts |
| Status fields | Use explicit enums | Keeps reporting clean and avoids spreadsheet-style drift |
| Finance | Calculate from stored records | No live business metric should depend on spreadsheet formulas |

## System Principles

- Keep implementations simple, explicit, and easy to operate.
- One customer can have many bookings.
- One booking can have many segments, documents, tasks, notifications, and payments.
- Store booking-level commercial data on the booking record.
- Store trip-leg or hotel-stay detail in booking segments.
- Store all operational work as tasks.
- Validate every import before saving any records.
- Use structured status values instead of free-text statuses.
- Start with manual controls and assisted workflows before adding automation.
- Do not build customer-facing login, vendor integrations, or automated WhatsApp sending in v1.

## Core Entity Relationships

```text
admin_users
  -> customers.assigned_agent_id
  -> bookings.assigned_agent_id
  -> tasks.assigned_to_id
  -> notifications.owner_id

customers
  -> bookings
  -> tasks
  -> notifications
  -> payments

bookings
  -> booking_segments
  -> booking_documents
  -> tasks
  -> notifications
  -> payments

airlines_vendors
  -> bookings.provider_id
  -> booking_segments.provider_id

templates
  -> notifications.template_id
```

## Controlled Statuses And Enums

### User Roles

```text
admin
manager
agent
finance
```

### Booking Types

```text
flight
hotel
package
visa
insurance
transfer
other
```

### Market

```text
domestic
international
```

### Journey Types

```text
one_way
return
multi_city
stay_only
not_applicable
```

### Booking Statuses

```text
draft
quoted
confirmed
ticketed
in_travel
completed
cancelled
```

### Payment Statuses

```text
unpaid
partial
paid
refunded
cancelled
```

### Document Statuses

```text
needed
uploaded
verified
sent_to_customer
not_required
```

### Task Statuses

```text
open
in_progress
blocked
done
cancelled
```

### Task Priorities

```text
low
normal
high
urgent
```

### Notification Channels

```text
whatsapp
call
email
internal
```

### Notification Statuses

```text
draft
scheduled
sent
failed
cancelled
```

## Proposed Admin Modules

### 1. Admin Login And Roles

Purpose: secure access for the TripZ team.

Initial roles:

| Role | Permissions |
| --- | --- |
| Owner/Admin | Full access, dashboard, finance, users, settings |
| Operations Manager | Customers, bookings, tasks, documents, reminders |
| Agent | Assigned customers/bookings/tasks |
| Finance | Payments, margins, expenses, reports |

### 2. Customer CRM

Fields:

| Field | Notes |
| --- | --- |
| Customer ID | Auto-generated |
| Name | Required |
| Gender | Optional |
| Location | City/state/country |
| Mobile number | Required for call/WhatsApp workflows |
| Email | Required when available |
| Remarks | Free-text customer context |
| Source | Manual, form, Excel upload, WhatsApp, call |
| Assigned agent | Team member responsible |
| Created at | System timestamp |
| Updated at | System timestamp |

### 3. Booking Operations

One booking should represent one commercial travel requirement.

Fields:

| Field | Notes |
| --- | --- |
| Booking ID | Auto-generated |
| Customer ID | Linked customer |
| Booking type | Flight, Hotel, Package, Visa, Insurance, Other |
| Market | Domestic or International |
| Journey type | One-way, Return, Multi-city, Stay-only |
| Departure | City/airport/hotel check-in location |
| Arrival | City/airport/hotel check-out location |
| Travel date | Required for reminders |
| Return date | Optional |
| Airline / hotel | Text or linked master table |
| PNR / confirmation number | Optional at creation, required when issued |
| Base cost | What TripZ pays |
| Selling price | What customer pays |
| Margin | Formula: selling price minus base cost |
| Payment status | Unpaid, Partial, Paid, Refunded |
| Booking status | Draft, Quoted, Confirmed, Ticketed, Completed, Cancelled |
| Assigned agent | Owner of this booking |
| Notes | Internal operations notes |

### 4. Booking Segments

Needed for multi-leg flights and complex trips.

Fields:

| Field | Notes |
| --- | --- |
| Booking ID | Linked booking |
| Segment number | 1, 2, 3... |
| Segment type | Flight, Hotel, Transfer, Visa, Other |
| From | Origin |
| To | Destination |
| Date/time | Departure or check-in |
| Airline/hotel/vendor | Provider |
| Flight number | Optional |
| Confirmation number | Optional |

### 5. Document Operations

Purpose: make ticket, voucher, boarding pass, and handoff status visible to the team.

Document types:

| Document type |
| --- |
| Flight ticket |
| Hotel voucher |
| Boarding pass |
| Visa document |
| Passport copy |
| Invoice |
| Payment receipt |
| Other |

Document fields:

| Field | Notes |
| --- | --- |
| Booking ID | Linked booking |
| Customer ID | Linked customer |
| Document type | Enum |
| File URL | Stored file |
| Status | Needed, Uploaded, Verified, Sent to customer |
| Uploaded by | Team user |
| Uploaded at | Timestamp |
| Sent at | Timestamp |

### 6. Tasks And Reminders

Purpose: turn operations into trackable back-office work.

Initial task types:

| Task type | Trigger |
| --- | --- |
| Upload ticket | Booking confirmed |
| Upload boarding pass | Flight date approaching |
| 24-hour travel reminder | 24 hours before travel date |
| Payment follow-up | Payment status not paid |
| Missing document follow-up | Required document absent |
| Customer call-back | Manual |
| WhatsApp follow-up | Manual or scheduled |

Task fields:

| Field | Notes |
| --- | --- |
| Task ID | Auto-generated |
| Booking ID | Optional |
| Customer ID | Optional |
| Task type | Enum |
| Priority | Low, Normal, High, Urgent |
| Status | Open, In progress, Blocked, Done, Cancelled |
| Due date/time | Required for reminders |
| Assigned to | Team user |
| Description | Internal task text |
| Completed at | Timestamp |

### 7. Notifications

Purpose: support WhatsApp/call/email workflows.

Initial notification channels:

| Channel |
| --- |
| WhatsApp |
| Call |
| Email |
| Internal task |

Notification fields:

| Field | Notes |
| --- | --- |
| Customer ID | Required |
| Booking ID | Optional |
| Channel | Enum |
| Template ID | Optional |
| Message body | Text sent or call note |
| Scheduled for | Optional |
| Sent at | Optional |
| Status | Draft, Scheduled, Sent, Failed, Cancelled |
| Owner | Team user |

### 8. Finance Dashboard

Purpose: expose business numbers without spreadsheet drift.

Metrics:

| Metric |
| --- |
| Total booked amount |
| Total margin earned |
| Domestic ticket revenue |
| Domestic hotel revenue |
| International ticket revenue |
| International hotel revenue |
| Booking count |
| Customer count |
| Average margin per booking |
| Pending payments |
| Refunds |
| Operating expenses |
| Net profit |

### 9. Expenses

Fields:

| Field | Notes |
| --- | --- |
| Expense ID | Auto-generated |
| Category | Salary, Rent, Vendor, Software, Refund, Other |
| Name / vendor | Text |
| Amount | Number |
| Expense date | Date |
| Payment status | Pending, Paid |
| Notes | Optional |

### 10. Templates

Purpose: make repeated ticket/document/customer communication consistent.

Template types:

| Template type |
| --- |
| Domestic flight ticket |
| International flight ticket |
| Hotel booking voucher |
| Boarding pass handoff |
| WhatsApp confirmation |
| WhatsApp reminder |
| Payment follow-up |
| Cancellation/refund update |

Template fields:

| Field | Notes |
| --- | --- |
| Template ID | Auto-generated |
| Name | Required |
| Type | Enum |
| Body | Markdown/HTML/message text |
| Variables | Customer name, PNR, date, airline, amount, etc. |
| Active | Boolean |

### 11. Airline / Vendor Master Data

Fields:

| Field | Notes |
| --- | --- |
| Airline/vendor ID | Auto-generated |
| Name | Required |
| Type | Airline, hotel, vendor |
| Logo | Uploaded image |
| Support contact | Optional |
| Notes | Optional |

## Canonical Upload Template

The workbook should be converted into a proper upload/import template. Suggested first version:

| Column | Required | Notes |
| --- | --- | --- |
| Customer Name | Yes | Full name |
| Phone | Yes | WhatsApp/call number |
| Email | No | Customer email |
| Gender | No | Optional |
| Location | No | Customer city |
| Booking Type | Yes | Flight, Hotel, Package, Visa, Insurance |
| Market | Yes | Domestic or International |
| Journey Type | No | One-way, Return, Multi-city, Stay-only |
| Departure | Conditional | Required for flights |
| Arrival | Conditional | Required for flights |
| Travel Date | Yes | Used for reminders |
| Return Date | No | For return/multi-city trips |
| Airline / Hotel | No | Provider name |
| PNR / Confirmation No | No | Can be added later |
| Base Cost | No | Internal cost |
| Selling Price | Yes | Customer amount |
| Margin | No | Can be calculated |
| Payment Status | Yes | Unpaid, Partial, Paid, Refunded |
| Booking Status | Yes | Draft, Quoted, Confirmed, Ticketed, Completed, Cancelled |
| Document Status | No | Needed, Uploaded, Verified, Sent |
| Assigned Agent | No | Team member |
| Notes | No | Internal remarks |

## Suggested Database Tables

Initial tables:

| Table | Purpose |
| --- | --- |
| `admin_users` | Team login and roles |
| `customers` | Customer profile and intake data |
| `bookings` | Booking-level commercial records |
| `booking_segments` | Flight legs, hotel stays, trip pieces |
| `booking_documents` | Tickets, vouchers, boarding passes, receipts |
| `tasks` | Back-office operational work |
| `notifications` | WhatsApp, call, email, reminder logs |
| `payments` | Customer/vendor payment tracking |
| `expenses` | Operating costs |
| `templates` | Ticket/message/document templates |
| `airlines_vendors` | Airline, hotel, and vendor metadata |
| `import_batches` | Upload attempts, validation status, source file, and import summary |
| `import_rows` | Row-level import validation results before saving |

## Database Table Specs

### `admin_users`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `name` | Team member name |
| `email` | Login email |
| `role` | `admin`, `manager`, `agent`, or `finance` |
| `is_active` | Controls access |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `customers`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `customer_code` | Human-readable auto-generated ID |
| `name` | Required |
| `gender` | Optional |
| `location` | Optional |
| `mobile_number` | Required |
| `email` | Optional |
| `remarks` | Optional |
| `source` | Manual, form, Excel/CSV upload, WhatsApp, call, referral, other |
| `assigned_agent_id` | Optional user reference |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `bookings`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `booking_code` | Human-readable auto-generated ID |
| `customer_id` | Required customer reference |
| `booking_type` | Flight, hotel, package, visa, insurance, transfer, other |
| `market` | Domestic or international |
| `journey_type` | One-way, return, multi-city, stay-only, not applicable |
| `departure` | Required for flight/transfer |
| `arrival` | Required for flight/transfer |
| `travel_date` | Required for reminders |
| `return_date` | Optional |
| `provider_id` | Optional airline/hotel/vendor reference |
| `pnr_or_confirmation` | Optional at creation, required before ticketed/completed where relevant |
| `base_cost` | Internal cost |
| `selling_price` | Customer amount |
| `margin` | Calculated as selling price minus base cost |
| `payment_status` | Unpaid, partial, paid, refunded, cancelled |
| `booking_status` | Draft, quoted, confirmed, ticketed, in travel, completed, cancelled |
| `assigned_agent_id` | Optional user reference |
| `notes` | Internal notes |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `booking_segments`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `booking_id` | Parent booking |
| `segment_number` | Sort order |
| `segment_type` | Flight, hotel, transfer, visa, insurance, other |
| `from_location` | Origin or check-in location |
| `to_location` | Destination or check-out location |
| `start_datetime` | Departure/check-in/start |
| `end_datetime` | Arrival/check-out/end |
| `provider_id` | Optional provider reference |
| `flight_number` | Optional |
| `confirmation_number` | Optional |
| `notes` | Internal notes |

### `booking_documents`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `booking_id` | Parent booking |
| `customer_id` | Customer reference for filtering |
| `document_type` | Ticket, voucher, boarding pass, passport copy, invoice, receipt, other |
| `file_url` | Uploaded file URL |
| `status` | Needed, uploaded, verified, sent to customer, not required |
| `uploaded_by_id` | User reference |
| `uploaded_at` | Timestamp |
| `verified_by_id` | Optional user reference |
| `verified_at` | Optional timestamp |
| `sent_at` | Optional timestamp |
| `notes` | Internal notes |

### `tasks`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `booking_id` | Optional booking reference |
| `customer_id` | Optional customer reference |
| `task_type` | Upload ticket, upload boarding pass, payment follow-up, reminder, callback, etc. |
| `priority` | Low, normal, high, urgent |
| `status` | Open, in progress, blocked, done, cancelled |
| `due_at` | Required |
| `assigned_to_id` | Optional user reference |
| `description` | Internal task text |
| `completed_at` | Timestamp when done |
| `created_at` | Timestamp |
| `updated_at` | Timestamp |

### `notifications`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `customer_id` | Required |
| `booking_id` | Optional |
| `channel` | WhatsApp, call, email, internal |
| `template_id` | Optional |
| `message_body` | Text sent or call note |
| `scheduled_for` | Optional |
| `sent_at` | Optional |
| `status` | Draft, scheduled, sent, failed, cancelled |
| `owner_id` | User reference |

### `payments`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `customer_id` | Required |
| `booking_id` | Required |
| `direction` | Customer payment, vendor payment, refund |
| `amount` | Numeric |
| `payment_date` | Required when paid |
| `payment_method` | Cash, UPI, bank transfer, card, other |
| `status` | Pending, paid, failed, refunded, cancelled |
| `reference_number` | Optional transaction reference |
| `receipt_document_id` | Optional document reference |
| `notes` | Internal notes |

### `expenses`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `category` | Salary, rent, vendor, software, refund, marketing, other |
| `name_or_vendor` | Payee or description |
| `amount` | Numeric |
| `expense_date` | Date |
| `payment_status` | Pending or paid |
| `notes` | Optional |

### `templates`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `name` | Required |
| `type` | Ticket, voucher, WhatsApp confirmation, reminder, payment follow-up, etc. |
| `body` | Markdown/HTML/message text |
| `variables` | Explicit allowed-variable schema |
| `is_active` | Boolean |

Allowed v1 template variables:

```text
customer_name
booking_id
booking_type
market
journey_type
departure
arrival
travel_date
return_date
airline_or_hotel
pnr_or_confirmation
selling_price
paid_amount
pending_amount
agent_name
support_phone
```

### `airlines_vendors`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `name` | Required |
| `type` | Airline, hotel, vendor |
| `logo_url` | Optional uploaded image |
| `support_contact` | Optional |
| `notes` | Optional |
| `is_active` | Boolean |

## MVP Scope

Build the first admin version around the workflows already implied by the workbook.

### Must Have

- Admin login.
- Customer list, create, edit, search.
- Booking list, create, edit, search.
- Domestic/international and flight/hotel categories.
- Revenue, selling price, and margin tracking.
- Upload ticket/voucher/boarding-pass documents.
- 24-hour upcoming travel task list.
- Dashboard counters for customers, bookings, revenue, margin, and pending work.
- Excel/CSV import using the canonical upload template.
- Excel/CSV export for operations and finance.

### Should Have

- WhatsApp message link generation from booking/customer records.
- Template generator for ticket and hotel voucher messages.
- Airline logo upload.
- Agent assignment.
- Payment status tracking.
- Expense tracking.

### Later

- Automated WhatsApp sending.
- Customer-facing portal.
- Vendor integrations.
- Airline/hotel API integrations.
- PDF ticket generation.
- Advanced analytics.
- Role-based approvals.

## Required Screens

### Navigation

Primary navigation:

- Dashboard.
- Customers.
- Bookings.
- Tasks.
- Documents.
- Finance.
- Expenses.
- Templates.
- Providers.
- Imports.
- Settings.

### Dashboard

Must show:

- Business metric cards.
- Date range filter.
- Market and booking type filters.
- Open task queue.
- Upcoming travel table.
- Pending documents table.
- Recent bookings table.
- Finance snapshot.

### Customers

Must show:

- Customer search.
- Filters by source, assigned agent, and created date.
- Table with name, phone, location, assigned agent, booking count, and latest booking.
- Create/edit customer flow.
- Customer detail page with bookings, tasks, notifications, and notes.

### Bookings

Must show:

- Booking search.
- Filters by booking type, market, booking status, payment status, assigned agent, and travel date.
- Table with customer, route/stay, travel date, selling price, margin, payment status, booking status, and assigned agent.
- Create/edit booking flow.
- Booking detail page with pricing, segments, documents, tasks, payments, notifications, and notes.

### Tasks

Must show:

- Queue grouped by overdue, due today, and upcoming.
- Filters by assignee, priority, task type, and status.
- Fast actions to start, block, complete, or cancel a task.

### Documents

Must show:

- Required documents.
- Uploaded but unverified documents.
- Sent documents.
- Filters by document type, status, travel date, and assigned agent.

### Finance

Must show:

- Date filters.
- Revenue and margin summary.
- Payment status summary.
- Expense summary.
- Net profit.
- Export action.

## Primary User Flows

### Flow 1: Add Customer And Booking Manually

1. Admin logs in.
2. Admin creates customer.
3. Admin creates booking under that customer.
4. Admin enters route, travel date, category, pricing, and margin.
5. System creates required tasks.
6. Booking appears in dashboard and operations list.

### Flow 2: Upload Bookings From Excel

1. Admin downloads canonical import template.
2. Team fills customer and booking rows.
3. Admin uploads Excel/CSV.
4. System validates required fields.
5. System shows import errors before saving.
6. Admin confirms import.
7. Customers, bookings, and tasks are created.

### Flow 3: Boarding Pass Reminder

1. Flight booking has a travel date.
2. System creates a boarding-pass task before travel.
3. Task appears in the 24-hour operations list.
4. Agent uploads boarding pass.
5. Agent marks it verified and sent.

### Flow 4: Finance Review

1. Owner opens dashboard.
2. Owner sees booking revenue, margin, expenses, and net profit.
3. Owner filters by date range and booking category.
4. Owner exports the report.

### Flow 5: Payment Follow-Up

1. Booking payment status is unpaid or partial.
2. System creates or surfaces payment follow-up task.
3. Agent generates WhatsApp payment follow-up from template.
4. Agent records sent message or call note.
5. Finance records payment when received.
6. Booking payment status updates.

## Implementation Phases

### Phase 1: Foundation

- Choose database and auth provider.
- Add admin auth and protected routes.
- Create database schema and migrations.
- Seed first admin user and enum values.
- Add base admin layout and navigation.

### Phase 2: Core Operations

- Build customer CRUD.
- Build booking CRUD.
- Add booking statuses, payment statuses, pricing, and margin calculation.
- Add booking detail page.
- Add basic dashboard metrics.

### Phase 3: Documents And Tasks

- Add file storage.
- Build document upload/status workflow.
- Build task queue.
- Add task generation rules for confirmed bookings, payment follow-up, and 24-hour reminders.

### Phase 4: Import, Export, Finance

- Build CSV template download.
- Build import validation and preview.
- Build commit flow for valid rows.
- Build finance dashboard.
- Build exports.

### Phase 5: Templates And WhatsApp

- Add templates.
- Add variable validation.
- Add click-to-WhatsApp generation.
- Add notification logs.

## Acceptance Criteria

V1 is acceptable when:

- Admin can log in and access protected admin screens.
- Admin can create a customer and booking manually.
- Admin can import valid customer and booking rows from the canonical template.
- Invalid import rows show exact row-level errors before save.
- Booking margin is calculated consistently.
- Dashboard totals match stored bookings, payments, and expenses.
- Flight bookings create upcoming travel and boarding-pass tasks.
- Agents can upload, verify, and mark documents sent.
- Owner can export bookings and finance reports.
- WhatsApp links generate from approved templates without unsupported variables.

## Non-Goals For V1

- Automated WhatsApp sending.
- Customer-facing login.
- Airline booking API integration.
- Hotel booking API integration.
- PDF generation from scratch.
- Complex approval workflows.
- Multi-tenant support.
- Custom authentication implementation.

## Open Product Questions

- Confirm whether Supabase Postgres + Supabase Storage is acceptable for v1.
- Confirm whether auth should be Supabase Auth, Clerk, or another provider.
- Confirm whether v1 finance requires invoice/payment receipt generation or only payment tracking.
- Confirm the exact internal team roles and whether managers and agents need different permissions in v1.
- Confirm whether customer intake through the public landing page is later scope.
- Confirm whether the dashboard should be live/refreshed automatically or filter-based/server-rendered in v1.

## Recommended Next Steps

1. Lock database/auth/storage choices.
2. Convert the table specs into migrations.
3. Create the canonical CSV/XLSX import template.
4. Produce admin wireframes for dashboard, customers, bookings, tasks, documents, and finance.
5. Implement Phase 1 foundation.
