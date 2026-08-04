import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  byCustomer,
  byType,
  marginOf,
  requestedFigures,
  summarise,
  takePct,
  zeroMargin
} from "../src/lib/admin/margin-metrics.js";

/**
 * Fixture shaped like a `bookings` row, mirroring the real export Rao sent so the
 * proportions being asserted are the ones that actually occur: flights carrying most
 * of the revenue at almost no margin, hotels carrying almost all of the profit, and
 * one large pass-through booking sold at cost.
 *
 * Fabricated values - no real customer or trip appears here.
 */
const rows = [
  // A package customer: flight and land at cost, both hotels carrying the margin.
  { booking_type: "flight", market: "domestic", customer_id: "c1", customers: { name: "Customer One" }, selling_price: 187161, base_cost: 187161 },
  { booking_type: "hotel", market: "domestic", customer_id: "c1", customers: { name: "Customer One" }, selling_price: 65707, base_cost: 50707 },
  { booking_type: "hotel", market: "domestic", customer_id: "c1", customers: { name: "Customer One" }, selling_price: 59468, base_cost: 49468 },
  { booking_type: "package", market: "unknown", customer_id: "c1", customers: { name: "Customer One" }, selling_price: 59400, base_cost: 59400 },
  // Standalone flights, thin margins.
  { booking_type: "flight", market: "international", customer_id: "c2", customers: { name: "Customer Two" }, selling_price: 87000, base_cost: 86735 },
  { booking_type: "flight", market: "domestic", customer_id: "c3", customers: { name: "Customer Three" }, selling_price: 22000, base_cost: 21100 },
  { booking_type: "flight", market: "domestic", customer_id: "c4", customers: { name: "Customer Four" }, selling_price: 11535, base_cost: 11335 },
  { booking_type: "flight", market: "domestic", customer_id: "c4", customers: { name: "Customer Four" }, selling_price: 10000, base_cost: 9817 }
];

describe("margin metrics", () => {
  it("totals gross, net and margin across every booking", () => {
    const total = summarise(rows);
    assert.equal(total.count, 8);
    assert.equal(total.gross, 502271);
    assert.equal(total.net, 475723);
    assert.equal(total.margin, 26548);
    assert.equal(total.takePct.toFixed(2), "5.29");
  });

  it("recomputes margin from the prices rather than trusting a stored value", () => {
    // A row whose stored margin disagrees with its prices must not be believed.
    assert.equal(marginOf({ selling_price: 1000, base_cost: 900, margin: 999999 }), 100);
    // With no base_cost there is nothing to recompute from, so the stored value stands.
    assert.equal(marginOf({ selling_price: 1000, base_cost: null, margin: 250 }), 250);
  });

  it("shows hotels carrying the profit while flights carry the revenue", () => {
    const types = Object.fromEntries(byType(rows).map((t) => [t.type, t]));

    assert.equal(types.flight.gross, 317696);
    assert.equal(types.flight.margin, 1548);
    assert.equal(types.flight.takePct.toFixed(2), "0.49");

    assert.equal(types.hotel.gross, 125175);
    assert.equal(types.hotel.margin, 25000);
    assert.equal(types.hotel.takePct.toFixed(2), "19.97");

    // The headline: a quarter of the revenue, almost all of the profit.
    const total = summarise(rows);
    assert.equal(Math.round((types.hotel.gross / total.gross) * 100), 25);
    assert.equal(Math.round((types.hotel.margin / total.margin) * 100), 94);
  });

  it("sorts booking types by revenue, richest first", () => {
    assert.deepEqual(byType(rows).map((t) => t.type), ["flight", "hotel", "package"]);
  });

  it("flags bookings sold at exactly zero margin", () => {
    const zero = zeroMargin(rows);
    assert.equal(zero.count, 2);
    assert.equal(zero.gross, 246561);
    assert.equal(Math.round(zero.shareOfGrossPct), 49);
  });

  it("groups a multi-line trip into one customer, and reports its blended take", () => {
    const customers = byCustomer(rows);
    const biggest = customers[0];

    assert.equal(biggest.bookings.length, 4);
    assert.deepEqual(biggest.types.sort(), ["flight", "hotel", "package"]);
    assert.equal(biggest.gross, 371736);
    assert.equal(biggest.margin, 25000);
    assert.equal(biggest.takePct.toFixed(2), "6.73");
  });

  it("never divides by zero on an unpriced booking", () => {
    assert.equal(takePct(0, 0), null);
    const empty = summarise([]);
    assert.equal(empty.gross, 0);
    assert.equal(empty.takePct, null);
  });

  it("treats a missing booking_type as other rather than dropping the row", () => {
    const [only] = byType([{ selling_price: 100, base_cost: 60 }]);
    assert.equal(only.type, "other");
    assert.equal(only.margin, 40);
  });

  it("produces the seven figures Rao asked for, split by market", () => {
    const f = requestedFigures(rows);

    assert.deepEqual(f.internationalBooking, { count: 1, value: 87000, margin: 265 });
    assert.deepEqual(f.domesticBooking, { count: 4, value: 230696, margin: 1283 });
    assert.deepEqual(f.internationalHotel, { count: 0, value: 0, margin: 0 });
    assert.deepEqual(f.domesticHotel, { count: 2, value: 125175, margin: 25000 });

    assert.equal(f.totalBookingValue, 502271);
    assert.equal(f.totalMarginEarned, 26548);
    assert.equal(f.packageVendorValue, 59400);
    assert.equal(f.packageVendorCount, 1);

    // The market splits plus the package account for every rupee of the total.
    const split =
      f.internationalBooking.value +
      f.domesticBooking.value +
      f.internationalHotel.value +
      f.domesticHotel.value +
      f.packageVendorValue;
    assert.equal(split, f.totalBookingValue);
    assert.equal(f.unclassified, 0);
  });

  it("counts a flight with no market in the total but in neither split", () => {
    const f = requestedFigures([
      { booking_type: "flight", market: "domestic", selling_price: 100, base_cost: 60 },
      { booking_type: "flight", selling_price: 500, base_cost: 400 }
    ]);

    assert.equal(f.domesticBooking.value, 100);
    assert.equal(f.internationalBooking.value, 0);
    // Still in the total - dropping it would understate the business.
    assert.equal(f.totalBookingValue, 600);
    // And the gap is reported rather than left to be discovered.
    assert.equal(f.unclassified, 1);
  });
});

/**
 * Optional cross-check against the real parsed export, which lives outside this repo
 * because it carries customer names and live portal credentials. Skipped unless
 * TRIPZ_REAL_DATA points at it, so CI and a fresh clone stay green without it.
 *
 *   TRIPZ_REAL_DATA=~/hq/projects/tripz/data/tripz.json npm test
 */
describe("margin metrics against the real export", () => {
  const path = process.env.TRIPZ_REAL_DATA;

  it("reproduces the figures published in the analysis", { skip: !path || !existsSync(path) }, () => {
    const dataset = JSON.parse(readFileSync(path, "utf8"));
    // Map the parsed sheet onto the bookings-row shape this module expects.
    const real = dataset.bookings
      .filter((b) => !b.isOwnBooking)
      .map((b) => ({
        booking_type: b.line === "land" ? "package" : b.line,
        market: b.scope,
        customer_id: b.customerPhone,
        selling_price: b.gross,
        base_cost: b.net
      }));

    const total = summarise(real);
    assert.equal(total.count, 8);
    assert.equal(total.gross, 502271);
    assert.equal(total.margin, 26548);
    assert.equal(total.takePct.toFixed(2), "5.29");

    const types = Object.fromEntries(byType(real).map((t) => [t.type, t]));
    assert.equal(types.flight.takePct.toFixed(2), "0.49");
    assert.equal(types.hotel.takePct.toFixed(2), "19.97");
    assert.equal(Math.round(zeroMargin(real).shareOfGrossPct), 49);

    // The seven figures Rao asked for on 2026-08-04, straight off his own sheet.
    const f = requestedFigures(real);
    assert.deepEqual(f.internationalBooking, { count: 1, value: 87000, margin: 265 });
    assert.deepEqual(f.domesticBooking, { count: 4, value: 230696, margin: 1283 });
    assert.deepEqual(f.internationalHotel, { count: 0, value: 0, margin: 0 });
    assert.deepEqual(f.domesticHotel, { count: 2, value: 125175, margin: 25000 });
    assert.equal(f.totalBookingValue, 502271);
    assert.equal(f.totalMarginEarned, 26548);
    assert.equal(f.packageVendorValue, 59400);
  });
});
