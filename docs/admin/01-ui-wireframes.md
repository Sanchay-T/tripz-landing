# TripZ Admin UI Wireframes

## Theme

Use the default shadcn admin template shape, adapted to TripZ colors.

```text
--------------------------------------------------------------------------------+
| TripZ Admin                    Search...       Upload Tickets     New Booking   |
+----------------------+---------------------------------------------------------+
| Dashboard            | KPI cards                                               |
| Ticket Intake        | Charts / queues / tables                                |
| Bookings             |                                                         |
| Customers            |                                                         |
| Tasks                |                                                         |
| Documents            |                                                         |
| Finance              |                                                         |
| Expenses             |                                                         |
| Templates            |                                                         |
| Providers            |                                                         |
| Imports              |                                                         |
| Settings             |                                                         |
+----------------------+---------------------------------------------------------+
```

## Dashboard

```text
+--------------------------------------------------------------------------------+
| Dashboard                                      Date Range | Market | Type       |
+--------------------------------------------------------------------------------+
| Total Booked   | Margin Earned | Customers | Open Tasks | Pending Docs        |
| INR 4,00,000   | INR 1,000     | 4         | 12         | 7                   |
+--------------------------------------------------------------------------------+
| Revenue / Margin Chart                         | Finance Snapshot             |
| +--------------------------------------------+ | Revenue      INR 60,00,000   |
| | domestic / international / hotel trend     | | Expenses     INR 89,000      |
| +--------------------------------------------+ | Net Profit   INR 47,000      |
+--------------------------------------------------------------------------------+
| 24h Travel Queue              | Pending Documents                              |
| Customer | Route | Due | Task | Customer | Document | Status | Assigned       |
+--------------------------------------------------------------------------------+
| Recent Bookings                                                                 |
| Booking | Customer | Type | Market | Travel Date | Price | Margin | Status     |
+--------------------------------------------------------------------------------+
```

## Ticket Intake

```text
+--------------------------------------------------------------------------------+
| Ticket Intake                           Download Template | Upload Tickets      |
+--------------------------------------------------------------------------------+
| Dropzone                                 Batch Summary                         |
| +-----------------------------------+    +-----------------------------------+  |
| | Drag tickets / vouchers here      |    | 18 files                          |  |
| | PDF, PNG, JPG, WEBP               |    | 12 extracted | 4 review | 2 fail |  |
| +-----------------------------------+    +-----------------------------------+  |
+--------------------------------------------------------------------------------+
| File Queue                                                                      |
| File              | Type Guess | Gemini Status | Confidence | Action            |
| domestic-01.png   | Flight     | Needs Review  | 0.92       | Review            |
+--------------------------------------------------------------------------------+
| Review Panel                                                                    |
| Preview               | Extracted Fields                                        |
| +------------------+   | Passenger, phone, email, route, date, PNR, provider    |
| | ticket image/pdf |   | base cost, selling price, margin, market, type         |
| +------------------+   | Confirm Booking | Save Document Only | Mark Failed    |
+--------------------------------------------------------------------------------+
```

## Booking Detail

```text
+--------------------------------------------------------------------------------+
| TZ-0001 / Keya                                Status: Ticketed | Payment: Paid  |
+--------------------------------------------------------------------------------+
| Customer Summary          | Booking Details             | Pricing              |
| Phone / email / location  | Type / market / route/date  | Cost / sale / margin |
+--------------------------------------------------------------------------------+
| Segments                  | Documents                    | Tasks                |
| Flight 1 DEL -> BOM       | Ticket uploaded / verified   | Boarding pass due    |
| Return optional           | Boarding pass needed         | Payment follow-up    |
+--------------------------------------------------------------------------------+
| Notes / Notifications / WhatsApp links                                          |
+--------------------------------------------------------------------------------+
```
