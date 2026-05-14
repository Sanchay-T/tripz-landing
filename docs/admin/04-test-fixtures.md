# Ticket Fixture Dataset

## Purpose

Use a deterministic synthetic dataset for extraction and upload testing. Do not use real customer tickets for regression tests.

## Directory

```text
test-fixtures/tickets/
  manifest.json
  domestic-flight-indigo.png
  domestic-flight-airindia.pdf
  international-flight-emirates.png
  international-return-ticket.pdf
  hotel-voucher.png
  boarding-pass.png
  multi-city-flight.pdf
  low-quality-photo.jpg
  rotated-ticket.png
  missing-pnr-ticket.png
  expected/
```

## Rules

- Use fake passengers, fake PNRs, fake emails, fake phone numbers, fake routes, and fake amounts.
- Include clean, PDF, hotel, boarding-pass, international, multi-city, rotated, low-quality, and missing-field cases.
- Store expected normalized JSON for every fixture.
- Treat low-quality and missing-field fixtures as review-required cases.
