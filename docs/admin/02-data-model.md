# TripZ Admin Data Model

## Tables

```text
admin_users
customers
bookings
booking_segments
booking_documents
ticket_extractions
tasks
payments
expenses
templates
providers
import_batches
import_rows
```

## Relationships

```text
customers
  -> bookings
  -> booking_documents
  -> ticket_extractions
  -> tasks
  -> payments

bookings
  -> booking_segments
  -> booking_documents
  -> ticket_extractions
  -> tasks
  -> payments

providers
  -> bookings
  -> booking_segments

admin_users
  -> customers.assigned_agent_id
  -> bookings.assigned_agent_id
  -> tasks.assigned_to_id
```

## Required Enums

```text
role: admin, manager, agent, finance
booking_type: flight, hotel, package, visa, insurance, transfer, other
market: domestic, international, unknown
journey_type: one_way, return, multi_city, stay_only, not_applicable, unknown
booking_status: draft, quoted, confirmed, ticketed, in_travel, completed, cancelled
payment_status: unpaid, partial, paid, refunded, cancelled
document_status: needed, uploaded, verified, sent_to_customer, not_required
extraction_status: extracting, ready_to_review, needs_review, failed, saved
task_status: open, in_progress, blocked, done, cancelled
```

## Rules

- `bookings.margin` is derived from `selling_price - base_cost` when both values exist.
- Dashboard metrics must be calculated from stored records, not spreadsheet formulas.
- `ticket_extractions.raw_response` keeps the Gemini response for audit.
- `ticket_extractions.normalized_json` keeps validated fields after schema parsing.
- Human review is required before creating a booking from extraction output.
