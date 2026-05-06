# TripZ Admin Portal PRD Notes

Source workbook:

```text
/Users/sanchay/Downloads/TripsZ.xlsx
```

Date captured: 2026-05-06

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

## Open Product Questions

- Should the first admin system use Supabase, a simple Postgres backend, or a Next.js server-only backend?
- Should uploaded tickets be stored in Vercel Blob, Supabase Storage, Google Drive, or another storage provider?
- Should WhatsApp be click-to-chat only at first, or integrated with an official WhatsApp provider?
- Does every booking need an invoice/payment receipt flow in v1?
- Who are the actual internal roles: owner, manager, agent, finance, or something simpler?
- What are the final booking statuses TripZ wants to use operationally?
- Should customer intake happen through the public landing page later?
- Should the dashboard be real-time or simple daily updated analytics?

## Recommended Next Step

Create a clean PRD from this note with three locked outputs:

1. A normalized database schema.
2. A canonical Excel import template.
3. Admin panel wireframes for dashboard, customers, bookings, tasks, documents, and finance.
