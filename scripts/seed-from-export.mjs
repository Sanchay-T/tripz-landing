#!/usr/bin/env node
/**
 * Seed the database from Rao's parsed booking export.
 *
 *   DATABASE_URL=postgres://localhost/tripz \
 *   TRIPZ_REAL_DATA=~/hq/projects/tripz/data/tripz.json \
 *   node scripts/seed-from-export.mjs
 *
 * The export lives outside this repo because it carries customer names and phone
 * numbers. Nothing from it is committed; this script only reads it.
 *
 * Two schema facts this script has to respect:
 *   - `bookings.margin` is a GENERATED column (selling_price - base_cost). Writing
 *     it is an error, and the whole point of the margin dashboard is that the
 *     database derives it rather than trusting a spreadsheet.
 *   - `providers.type` and `bookings.booking_type` / `market` / `journey_type` are
 *     CHECK-constrained enums, so the sheet's free text has to be mapped, not passed
 *     through.
 *
 * Idempotent: re-running replaces the seeded rows rather than duplicating them.
 * `--reset` additionally clears everything the app can write.
 */

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import os from "node:os";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

function expandHome(p) {
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;
}

const exportPath = expandHome(
  process.env.TRIPZ_REAL_DATA || "~/hq/projects/tripz/data/tripz.json"
);

const sql = postgres(DATABASE_URL, { max: 1, onnotice: () => {} });

// The sheet's product lines map onto the schema's booking_type enum. "land" is the
// vendor sheet - land arrangements bought from a local operator - which the schema
// calls a package.
const BOOKING_TYPE = { flight: "flight", hotel: "hotel", land: "package" };

function market(scope) {
  const s = (scope || "").toLowerCase();
  if (s.startsWith("inter")) return "international";
  if (s.startsWith("dom")) return "domestic";
  return "unknown";
}

function journeyType(booking) {
  if (booking.line === "hotel") return "stay_only";
  if (booking.line === "land") return "not_applicable";
  const t = (booking.trip || "").toLowerCase();
  if (t.includes("round")) return "return";
  if (t.includes("one")) return "one_way";
  return "unknown";
}

function paymentStatus(value) {
  return value === "received" ? "paid" : value === "pending" ? "unpaid" : "unpaid";
}

function bookingStatus(booking) {
  return booking.serviceStatus === "done" ? "completed" : "confirmed";
}

function describe(booking, field) {
  if (booking.line === "flight") {
    return field === "from" ? booking.from : booking.to;
  }
  if (booking.line === "hotel") {
    return field === "from" ? booking.city : booking.hotel;
  }
  return field === "from" ? booking.location : booking.vendor;
}

function code(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

async function main() {
  const reset = process.argv.includes("--reset");
  const dataset = JSON.parse(readFileSync(exportPath, "utf8"));
  const bookings = dataset.bookings ?? [];

  if (reset) {
    // Order matters: children before parents.
    await sql`truncate booking_segments, booking_documents, ticket_extractions, tasks, payments, bookings, customers, providers restart identity cascade`;
    console.log("reset: cleared bookings, customers, providers and their children");
  }

  // One customer per distinct phone number. The sheet spells the same person
  // differently across its three tabs, so the phone is the only stable key.
  const byPhone = new Map();
  for (const b of bookings) {
    const key = b.customerPhone || b.customer || "unknown";
    if (!byPhone.has(key)) byPhone.set(key, b);
  }

  const customerIds = new Map();
  for (const [key, sample] of byPhone) {
    const [row] = await sql`
      insert into customers ${sql({
        customer_code: code("CUST"),
        name: sample.customer || "Unknown",
        mobile_number: sample.customerPhone || null,
        location: describe(sample, "from") || null,
        source: "import",
        is_internal: Boolean(sample.isOwnBooking),
        remarks: sample.isOwnBooking ? "Owner's own booking" : null
      })}
      returning id
    `;
    customerIds.set(key, row.id);
  }
  console.log(`customers: ${customerIds.size}`);

  // Providers come from the booking platform and the airline/vendor named on each row.
  const providers = new Map();
  for (const b of bookings) {
    const name = b.platform || b.airline || b.vendor;
    if (!name || providers.has(name)) continue;
    const type = b.line === "hotel" ? "hotel" : b.line === "land" ? "vendor" : "airline";
    const [row] = await sql`
      insert into providers ${sql({ name, type, is_active: true })} returning id
    `;
    providers.set(name, row.id);
  }
  console.log(`providers: ${providers.size}`);

  let inserted = 0;
  for (const b of bookings) {
    const key = b.customerPhone || b.customer || "unknown";
    const providerName = b.platform || b.airline || b.vendor;

    await sql`
      insert into bookings ${sql({
        booking_code: code("TZ"),
        customer_id: customerIds.get(key),
        booking_type: BOOKING_TYPE[b.line] ?? "other",
        market: market(b.scope),
        journey_type: journeyType(b),
        departure: describe(b, "from") ?? null,
        arrival: describe(b, "to") ?? null,
        travel_date: b.onwardDate ?? b.checkIn ?? b.entryDate ?? b.bookingDate ?? null,
        return_date: b.returnDate ?? b.checkOut ?? b.exitDate ?? null,
        provider_id: providerName ? providers.get(providerName) : null,
        pnr_or_confirmation: b.onwardPnr ?? null,
        // margin is generated by the database from these two - never written here.
        base_cost: b.net,
        selling_price: b.gross,
        payment_status: paymentStatus(b.paymentStatus),
        booking_status: bookingStatus(b),
        notes: b.isOwnBooking ? "Owner's own booking, excluded from customer take rate" : null
      })}
    `;
    inserted += 1;
  }
  console.log(`bookings: ${inserted}`);

  const [totals] = await sql`
    select
      count(*)::int                                as count,
      coalesce(sum(selling_price), 0)::numeric     as gross,
      coalesce(sum(base_cost), 0)::numeric         as net,
      coalesce(sum(margin), 0)::numeric            as margin
    from bookings
  `;
  console.log(
    `\ntotals (all rows incl. owner): gross=${totals.gross} net=${totals.net} margin=${totals.margin}`
  );

  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
