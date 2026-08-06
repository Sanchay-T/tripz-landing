"use client";

import { useRouter } from "next/navigation";
import { cloneElement, useId } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

/**
 * A labelled field.
 *
 * It used to wrap everything in a bare `<label>` with a `<span>` doing the label's
 * job and no id at all, so the association worked only by nesting. Cloning a
 * generated id onto the control gives a real `htmlFor` pair, which is what screen
 * readers and "click the label to focus" both rely on.
 */
function Field({ label, children, hint }) {
  const id = useId();

  return (
    <div className="grid gap-1.5">
      <Label className="font-mono text-xs uppercase tracking-widest text-ink/50" htmlFor={id}>
        {label}
      </Label>
      {cloneElement(children, { id })}
      {hint && <p className="text-xs leading-4 text-ink/45">{hint}</p>}
    </div>
  );
}

/**
 * The five dropdowns were native `<select>` elements styled to look like the text
 * inputs beside them. This maps the same {value, onChange, options} shape onto the
 * library Select so they behave and look like one control, not two.
 */
function SelectField({ id, value, onChange, options, format = (o) => o }) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full" id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {format(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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

      // A toast, not an inline banner: this is a transient confirmation of an
      // action that succeeded, and the form below it has already been cleared.
      // Inline Notice stays for errors, which you have to act on.
      toast.success(`Saved ${payload.booking.booking_code}`, {
        description: `Margin ${inr(payload.margin)}.${payload.warning ? ` ${payload.warning}` : ""}`
      });
      setForm(EMPTY);
      // The margin and dashboard pages are force-dynamic, so refreshing the router
      // cache is what makes the new booking show up in their totals immediately.
      router.refresh();
    } catch (error) {
      setNotice({ tone: "critical", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {notice && (
        <Notice tone={notice.tone}>
          {notice.message}
        </Notice>
      )}

      <Panel title="Customer">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Name">
            <Input
                            onChange={(e) => update("customerName", e.target.value)}
              required
              value={form.customerName}
            />
          </Field>
          <Field label="Mobile number" hint="Used to match an existing customer">
            <Input
                            inputMode="numeric"
              onChange={(e) => update("mobileNumber", e.target.value)}
              value={form.mobileNumber}
            />
          </Field>
          <Field label="Email">
            <Input
                            onChange={(e) => update("email", e.target.value)}
              type="email"
              value={form.email}
            />
          </Field>
        </div>
        {/* flex-wrap and a shrink-0 control: this row holds ~70 characters across
            two spans, and without them the checkbox squashed to a sliver on a
            phone rather than the label wrapping. */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink/70">
          <Checkbox
            checked={form.isInternal}
            className="shrink-0"
            id="is-internal"
            onCheckedChange={(checked) => update("isInternal", checked === true)}
          />
          <Label className="font-normal text-ink/70" htmlFor="is-internal">
            This is our own booking, not customer business
          </Label>
          <span className="text-xs text-ink/45">(excluded from the take rate)</span>
        </div>
      </Panel>

      <Panel title="Booking">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Type">
            <SelectField
              onChange={(v) => update("bookingType", v)}
              options={BOOKING_TYPES}
              value={form.bookingType}
            />
          </Field>
          <Field label="Market">
            <SelectField
              onChange={(v) => update("market", v)}
              options={MARKETS}
              value={form.market}
            />
          </Field>
          <Field label="Journey">
            <SelectField
              format={(o) => o.replace(/_/g, " ")}
              onChange={(v) => update("journeyType", v)}
              options={JOURNEY_TYPES}
              value={form.journeyType}
            />
          </Field>
          <Field label="From">
            <Input
                            onChange={(e) => update("departure", e.target.value)}
              value={form.departure}
            />
          </Field>
          <Field label="To / hotel">
            <Input
                            onChange={(e) => update("arrival", e.target.value)}
              value={form.arrival}
            />
          </Field>
          <Field label="Provider" hint="Airline, hotel or vendor">
            <Input
                            onChange={(e) => update("provider", e.target.value)}
              value={form.provider}
            />
          </Field>
          <Field label="Travel date">
            <Input
                            onChange={(e) => update("travelDate", e.target.value)}
              type="date"
              value={form.travelDate}
            />
          </Field>
          <Field label="Return date">
            <Input
                            onChange={(e) => update("returnDate", e.target.value)}
              type="date"
              value={form.returnDate}
            />
          </Field>
          <Field label="PNR / confirmation">
            <Input
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
            <Input
                            inputMode="decimal"
              onChange={(e) => update("baseCost", e.target.value)}
              value={form.baseCost}
            />
          </Field>
          <Field label="Selling price (what they paid)">
            <Input
                            inputMode="decimal"
              onChange={(e) => update("sellingPrice", e.target.value)}
              required
              value={form.sellingPrice}
            />
          </Field>
          <Field label="Payment">
            <SelectField
              onChange={(v) => update("paymentStatus", v)}
              options={PAYMENT_STATUSES}
              value={form.paymentStatus}
            />
          </Field>
          <Field label="Status">
            <SelectField
              format={(o) => o.replace(/_/g, " ")}
              onChange={(v) => update("bookingStatus", v)}
              options={BOOKING_STATUSES}
              value={form.bookingStatus}
            />
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
          <Textarea
            className="min-h-20"
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
        <Button
          onClick={() => {
            setForm(EMPTY);
            setNotice(null);
          }}
          type="button"
          variant="ghost"
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
