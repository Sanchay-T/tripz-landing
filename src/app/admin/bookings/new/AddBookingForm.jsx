"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminButton, Notice, Panel } from "../../components";

/**
 * Add a booking by typing it in.
 *
 * The margin preview here is the same arithmetic the database performs on the
 * generated column - selling price minus base cost - shown live so the person
 * entering the booking sees what it earns before they save it. The saved figure is
 * still whatever the database derives; this never sends a margin.
 */

const BOOKING_TYPES = ["flight", "hotel", "package", "visa", "insurance", "transfer", "other"];
const MARKETS = ["domestic", "international", "unknown"];
const JOURNEY_TYPES = ["one_way", "return", "multi_city", "stay_only", "not_applicable", "unknown"];
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded", "cancelled"];
const BOOKING_STATUSES = [
  "draft",
  "quoted",
  "confirmed",
  "ticketed",
  "in_travel",
  "completed",
  "cancelled"
];

const EMPTY = {
  customerName: "",
  mobileNumber: "",
  email: "",
  bookingType: "flight",
  market: "domestic",
  journeyType: "one_way",
  departure: "",
  arrival: "",
  travelDate: "",
  returnDate: "",
  provider: "",
  pnrOrConfirmation: "",
  baseCost: "",
  sellingPrice: "",
  paymentStatus: "unpaid",
  bookingStatus: "confirmed",
  isInternal: false,
  notes: ""
};

function inr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-ink/50">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-4 text-ink/45">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-ink/12 bg-paper px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand-vivid focus:ring-2 focus:ring-brand-vivid/20";

export default function AddBookingForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Live preview of what the database will derive.
  const preview = useMemo(() => {
    const base = Number(form.baseCost);
    const sell = Number(form.sellingPrice);
    if (!Number.isFinite(base) || !Number.isFinite(sell) || form.sellingPrice === "") {
      return null;
    }
    const margin = sell - base;
    return { margin, takePct: sell > 0 ? (margin / sell) * 100 : null };
  }, [form.baseCost, form.sellingPrice]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Could not save the booking.");
      }

      setNotice({
        tone: "success",
        message: `Saved ${payload.booking.booking_code} — margin ${inr(payload.margin)}.${
          payload.warning ? ` ${payload.warning}` : ""
        }`
      });
      setForm(EMPTY);
      // The margin and dashboard pages are force-dynamic, so refreshing the router
      // cache is what makes the new booking show up in their totals immediately.
      router.refresh();
    } catch (error) {
      setNotice({ tone: "error", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {notice && (
        <Notice tone={notice.tone === "success" ? "good" : "critical"}>
          {notice.message}
        </Notice>
      )}

      <Panel title="Customer">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Name">
            <input
              className={inputClass}
              onChange={(e) => update("customerName", e.target.value)}
              required
              value={form.customerName}
            />
          </Field>
          <Field label="Mobile number" hint="Used to match an existing customer">
            <input
              className={inputClass}
              inputMode="numeric"
              onChange={(e) => update("mobileNumber", e.target.value)}
              value={form.mobileNumber}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              onChange={(e) => update("email", e.target.value)}
              type="email"
              value={form.email}
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
          <input
            checked={form.isInternal}
            className="size-4 rounded border-ink/25"
            onChange={(e) => update("isInternal", e.target.checked)}
            type="checkbox"
          />
          This is our own booking, not customer business
          <span className="text-xs text-ink/45">(excluded from the take rate)</span>
        </label>
      </Panel>

      <Panel title="Booking">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Type">
            <select
              className={inputClass}
              onChange={(e) => update("bookingType", e.target.value)}
              value={form.bookingType}
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Market">
            <select
              className={inputClass}
              onChange={(e) => update("market", e.target.value)}
              value={form.market}
            >
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Journey">
            <select
              className={inputClass}
              onChange={(e) => update("journeyType", e.target.value)}
              value={form.journeyType}
            >
              {JOURNEY_TYPES.map((j) => (
                <option key={j} value={j}>
                  {j.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="From">
            <input
              className={inputClass}
              onChange={(e) => update("departure", e.target.value)}
              value={form.departure}
            />
          </Field>
          <Field label="To / hotel">
            <input
              className={inputClass}
              onChange={(e) => update("arrival", e.target.value)}
              value={form.arrival}
            />
          </Field>
          <Field label="Provider" hint="Airline, hotel or vendor">
            <input
              className={inputClass}
              onChange={(e) => update("provider", e.target.value)}
              value={form.provider}
            />
          </Field>
          <Field label="Travel date">
            <input
              className={inputClass}
              onChange={(e) => update("travelDate", e.target.value)}
              type="date"
              value={form.travelDate}
            />
          </Field>
          <Field label="Return date">
            <input
              className={inputClass}
              onChange={(e) => update("returnDate", e.target.value)}
              type="date"
              value={form.returnDate}
            />
          </Field>
          <Field label="PNR / confirmation">
            <input
              className={inputClass}
              onChange={(e) => update("pnrOrConfirmation", e.target.value)}
              value={form.pnrOrConfirmation}
            />
          </Field>
        </div>
      </Panel>

      {/* The point of the form. Given a heavier frame than the blocks around it so it
          does not read at the same weight as the notes box. */}
      <Panel
        className="border-ink/25"
        title="Money"
        meta="Enter what it cost and what the customer paid. Margin is derived by the database from these two, never typed in."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Base cost (what we paid)">
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(e) => update("baseCost", e.target.value)}
              value={form.baseCost}
            />
          </Field>
          <Field label="Selling price (what they paid)">
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(e) => update("sellingPrice", e.target.value)}
              required
              value={form.sellingPrice}
            />
          </Field>
          <Field label="Payment">
            <select
              className={inputClass}
              onChange={(e) => update("paymentStatus", e.target.value)}
              value={form.paymentStatus}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              onChange={(e) => update("bookingStatus", e.target.value)}
              value={form.bookingStatus}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {preview && (
          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-ink/8 pt-5">
            <span className="font-mono text-xs uppercase tracking-widest text-ink/45">
              This booking earns
            </span>
            <span
              className={`font-mono text-2xl sm:text-3xl font-medium leading-none tabular-nums tracking-tight ${
                preview.margin > 0 ? "text-brand" : preview.margin < 0 ? "text-critical" : "text-ink/50"
              }`}
            >
              {inr(preview.margin)}
            </span>
            {preview.takePct !== null && (
              <span className="font-mono text-sm tabular-nums text-ink/50">
                {preview.takePct.toFixed(2)}% take
              </span>
            )}
          </div>
        )}
      </Panel>

      <Panel>
        <Field label="Notes">
          <textarea
            className={`${inputClass} min-h-20`}
            onChange={(e) => update("notes", e.target.value)}
            value={form.notes}
          />
        </Field>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton disabled={saving} type="submit">
          {saving ? "Saving..." : "Save booking"}
        </AdminButton>
        <AdminButton href="/admin/margin" tone="light">
          View margin
        </AdminButton>
        <button
          className="text-sm text-ink/55 hover:text-ink"
          onClick={() => {
            setForm(EMPTY);
            setNotice(null);
          }}
          type="button"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
