import { AlertTriangle, TrendingDown } from "lucide-react";

import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminTable,
  Figure,
  FigureCell,
  FigureRow,
  Notice,
  PageHeader
} from "../components";
import {
  byCustomer,
  byType,
  customerBookings,
  fetchMarginRows,
  grossOf,
  internalBookings,
  marginOf,
  requestedFigures,
  summarise,
  zeroMargin
} from "@/lib/admin/margin";

export const dynamic = "force-dynamic";

/**
 * Where the money is actually made.
 *
 * The other admin screens answer "what happened". This one answers "what did it
 * earn", which is a different question and the one that changes pricing. Margin is
 * recomputed from selling price and base cost on every row rather than read from a
 * stored field, so a figure here cannot quietly drift from the prices behind it.
 */

// Fixed hue per booking type. Colour follows the entity, never its rank, so a type
// dropping out of the data never repaints the others.
//
// These are NOT the brand palette, deliberately. TripZ's accent is a desaturated
// spine green chosen to recede — right for ink, but it fails the chroma floor and the
// protan CVD gate the moment you ask it to encode categories (green against the
// palette's clay reads as one colour to a protanope). So encoding uses a validated
// categorical set, and the brand accent stays reserved for meaning. Verified with
// `scripts/validate_palette.js --pairs all`: worst CVD ΔE 9.2, worst normal-vision
// ΔE 24.0. Its contrast warning is discharged by the direct labels and the table.
const TYPE_COLOR = {
  flight: "#2a78d6",
  hotel: "#eb6834",
  package: "#1baf7a",
  transfer: "#4a3aa7",
  visa: "#eda100",
  insurance: "#e87ba4",
  other: "#8a8a80"
};

function colorForType(type) {
  return TYPE_COLOR[type] ?? TYPE_COLOR.other;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

function formatPct(value, digits = 1) {
  return value === null || value === undefined || Number.isNaN(value)
    ? "—"
    : `${Number(value).toFixed(digits)}%`;
}

/** One 100% stacked bar. Segments keep a 2px gap so adjacent hues never touch. */
function ShareBar({ segments }) {
  const shown = segments.filter((segment) => segment.value > 0);
  const total = shown.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return <p className="text-sm text-ink/45">Nothing to show yet.</p>;
  }

  return (
    <div>
      <div className="flex h-3.5 w-full gap-0.5 overflow-hidden rounded-full bg-ink/10">
        {shown.map((segment) => (
          <div
            key={segment.label}
            className="h-full"
            style={{
              backgroundColor: segment.color,
              flexGrow: segment.value,
              flexBasis: 0,
              minWidth: 3
            }}
          />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {shown.map((segment) => (
          <li key={segment.label} className="flex items-center gap-1.5 text-xs text-ink/60">
            <span
              className="inline-block size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="font-semibold text-ink">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const bookingColumns = [
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="inline-block size-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: row.color }}
        />
        {row.type}
      </span>
    )
  },
  { key: "booking", label: "Booking" },
  { key: "customer", label: "Customer" },
  { key: "route", label: "Route / Stay" },
  { key: "gross", label: "Gross" },
  { key: "margin", label: "Margin" },
  {
    key: "take",
    label: "Take",
    render: (row) =>
      row.isZero ? <AdminBadge tone="critical">0%</AdminBadge> : <span>{row.take}</span>
  }
];

export default async function MarginPage() {
  const { rows, error } = await fetchMarginRows();

  // Every reported figure runs on customer business only. Rao's own travel is real
  // but carries no margin, so including it understates the take rate and inflates
  // domestic booking value. The full row set is still used for the table below.
  const billable = customerBookings(rows);
  const internal = internalBookings(rows);

  const total = summarise(billable);
  const types = byType(billable);
  const zero = zeroMargin(billable);
  const customers = byCustomer(billable);
  const packages = customers.filter((customer) => customer.types.length > 1);
  const asked = requestedFigures(billable);

  // Rao's list, in the order he wrote it, so the page can be checked against the
  // message rather than against someone's memory of it.
  const askedRows = [
    { label: "International booking", cut: asked.internationalBooking, type: "flight" },
    { label: "Domestic booking", cut: asked.domesticBooking, type: "flight" },
    { label: "International hotel booking", cut: asked.internationalHotel, type: "hotel" },
    { label: "Domestic hotel booking", cut: asked.domesticHotel, type: "hotel" }
  ];

  // Computed, not asserted: which type earns the most, and how lopsided it is.
  const topByMargin = [...types].sort((a, b) => b.margin - a.margin)[0];
  const profitShare = topByMargin && total.margin > 0 ? (topByMargin.margin / total.margin) * 100 : null;
  const revenueShare = topByMargin && total.gross > 0 ? (topByMargin.gross / total.gross) * 100 : null;

  const tableRows = rows.map((row) => {
    const gross = grossOf(row);
    const margin = marginOf(row);

    return {
      id: row.id,
      color: colorForType(row.booking_type),
      type: row.booking_type ?? "other",
      booking: row.booking_code ?? "—",
      customer: row.customers?.name ?? "Unknown",
      route: [row.departure, row.arrival].filter(Boolean).join(" → ") || "Not set",
      gross: formatCurrency(gross),
      margin: formatCurrency(margin),
      take: formatPct(gross > 0 ? (margin / gross) * 100 : null, 2),
      isZero: gross > 0 && margin === 0
    };
  });

  return (
    <>
      <PageHeader
        title="Margin"
        body="What each line of the business actually earns. Margin is recomputed from selling price minus base cost on every row, never read from a stored total."
        action={<AdminButton href="/admin/bookings" tone="light">View bookings</AdminButton>}
      />

      <div className="space-y-5 px-4 py-5 sm:px-6">
        {error && (
          <Notice tone="warn" title="Bookings could not be loaded">
            The database did not answer, so every figure on this page is zero — that is
            an empty response, not a real result. {error}
          </Notice>
        )}

        {!error && rows.length === 0 && (
          <AdminCard className="p-6">
            <p className="text-sm font-semibold text-ink">No bookings recorded yet</p>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Once bookings carry a selling price and a base cost, this page shows what
              each line earns. Import Rao&apos;s workbook from{" "}
              <a className="font-semibold text-brand underline" href="/admin/bookings/new">
                Add booking
              </a>{" "}
              to populate it.
            </p>
          </AdminCard>
        )}

        {/* Rao's own list, verbatim and in his order, as plain numbers. He asked for
            exactly this on 2026-08-04: the four market cuts, the two totals, and the
            package vendor value, "All in numbers". It leads the page because it is
            the thing he asked for; everything below it is interpretation. */}
        <AdminCard className="overflow-hidden">
          <div className="border-b border-ink/8 px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">The numbers</h2>
            <p className="mt-1 text-xs leading-5 text-ink/55">
              Bookings and value by market, plus totals.
            </p>
          </div>

          <div className="divide-y divide-ink/8">
            {askedRows.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-5"
              >
                <span className="flex items-center gap-2 text-sm text-ink/75">
                  <span
                    className="inline-block size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: colorForType(row.type) }}
                  />
                  {row.label}
                </span>
                <span className="flex items-baseline gap-5">
                  <span className="text-sm tabular-nums text-ink/50">
                    {row.cut.count} booking{row.cut.count === 1 ? "" : "s"}
                  </span>
                  <span className="min-w-[7.5rem] text-right text-lg font-bold tabular-nums text-ink">
                    {formatCurrency(row.cut.value)}
                  </span>
                </span>
              </div>
            ))}

            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-brand-soft/40 px-4 py-3 sm:px-5">
              <span className="text-sm font-semibold text-ink">Total booking value</span>
              <span className="text-xl font-bold tabular-nums text-ink">
                {formatCurrency(asked.totalBookingValue)}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-brand-soft/40 px-4 py-3 sm:px-5">
              <span className="text-sm font-semibold text-ink">Total margin earned</span>
              <span className="text-xl font-bold tabular-nums text-ink">
                {formatCurrency(asked.totalMarginEarned)}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 sm:px-5">
              <span className="flex items-center gap-2 text-sm text-ink/75">
                <span
                  className="inline-block size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: colorForType("package") }}
                />
                Package vendor booking value
              </span>
              <span className="flex items-baseline gap-5">
                <span className="text-sm tabular-nums text-ink/50">
                  {asked.packageVendorCount} booking
                  {asked.packageVendorCount === 1 ? "" : "s"}
                </span>
                <span className="min-w-[7.5rem] text-right text-lg font-bold tabular-nums text-ink">
                  {formatCurrency(asked.packageVendorValue)}
                </span>
              </span>
            </div>
          </div>

          {internal.length > 0 && (
            <p className="border-t border-ink/8 px-4 py-3 text-xs leading-5 text-ink/55 sm:px-5">
              Excludes {internal.length} internal booking
              {internal.length === 1 ? "" : "s"} worth{" "}
              {formatCurrency(internal.reduce((sum, row) => sum + grossOf(row), 0))}{" "}
              made on the company&apos;s own account. They are real bookings but not customer
              business, and counting them would drag the take rate down.
            </p>
          )}

          {asked.unclassified > 0 && (
            <p className="border-t border-ink/8 px-4 py-3 text-[12px] leading-5 text-warn sm:px-5">
              {asked.unclassified} booking{asked.unclassified === 1 ? " has" : "s have"} no
              market recorded, so {asked.unclassified === 1 ? "it is" : "they are"} counted
              in the totals but in neither the domestic nor the international line. The
              four rows above will not sum to the total until that is filled in.
            </p>
          )}
        </AdminCard>

        <FigureRow>
          <FigureCell>
            <Figure label="Revenue" value={formatCurrency(total.gross)} detail="Total selling price." />
          </FigureCell>
          <FigureCell>
            <Figure label="Margin earned" value={formatCurrency(total.margin)} detail="Selling price minus base cost." />
          </FigureCell>
          <FigureCell>
            {/* The one figure on this page that carries the argument. */}
            <Figure accent label="Take rate" value={formatPct(total.takePct, 2)} detail="Margin as a share of revenue." />
          </FigureCell>
          <FigureCell>
            <Figure label="Bookings" value={total.count} detail="Every priced booking on record." />
          </FigureCell>
        </FigureRow>

        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-ink">
            Where the revenue comes from, and where the profit does
          </h2>
          <p className="mt-1 text-xs leading-5 text-ink/55">
            Same colours, two bars. A line that is wide on top and narrow below is
            turning revenue into no profit.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45">
                Share of revenue
              </p>
              <ShareBar
                segments={types.map((type) => ({
                  color: colorForType(type.type),
                  label: type.label,
                  value: type.gross
                }))}
              />
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45">
                Share of profit
              </p>
              <ShareBar
                segments={types.map((type) => ({
                  color: colorForType(type.type),
                  label: type.label,
                  value: type.margin
                }))}
              />
            </div>
          </div>

          {topByMargin && profitShare !== null && revenueShare !== null && total.margin > 0 && (
            <p className="mt-5 border-t border-ink/8 pt-4 text-sm leading-6 text-ink/75">
              <strong className="text-ink">{topByMargin.label}</strong> are{" "}
              {formatPct(revenueShare, 0)} of revenue but {formatPct(profitShare, 0)} of
              profit — {formatCurrency(topByMargin.margin)} of the{" "}
              {formatCurrency(total.margin)} earned. Everything else is close to
              pass-through.
            </p>
          )}
        </AdminCard>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AdminCard className="p-5">
            <h2 className="text-sm font-semibold text-ink">Take rate by type</h2>
            <p className="mt-1 text-xs leading-5 text-ink/55">
              Margin as a percentage of what the customer paid.
            </p>
            <ul className="mt-4 space-y-3">
              {types.length === 0 && <li className="text-sm text-ink/45">No bookings yet.</li>}
              {types.map((type) => {
                const widest = Math.max(...types.map((t) => t.takePct ?? 0), 1);

                return (
                  <li key={type.type}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink/75">{type.label}</span>
                      <span className="font-semibold tabular-nums text-ink">
                        {formatPct(type.takePct, 2)}
                      </span>
                    </div>
                    {/* 6px, matching the shared TakeRateBars on the dashboard. This
                        page kept its own copy at `h-px`, so the same measure was a
                        readable bar on one screen and a hairline rule on the other. */}
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink/8">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          backgroundColor: colorForType(type.type),
                          // Scaled against the best-performing type so a 0.49% bar is
                          // still visible next to a 20% one, with a 2% floor so a real
                          // but tiny take never renders as nothing at all.
                          width: `${Math.max(((type.takePct ?? 0) / widest) * 100, type.takePct > 0 ? 2 : 0).toFixed(2)}%`
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-ink/50">
                      {formatCurrency(type.margin)} on {formatCurrency(type.gross)} across{" "}
                      {type.count} booking{type.count === 1 ? "" : "s"}
                    </p>
                  </li>
                );
              })}
            </ul>
          </AdminCard>

          <AdminCard className="p-5">
            <div className="flex items-start gap-2">
              <TrendingDown size={16} className="mt-0.5 shrink-0 text-critical" />
              <div>
                <h2 className="text-sm font-semibold text-ink">Zero-margin exposure</h2>
                <p className="mt-1 text-xs leading-5 text-ink/55">
                  Bookings delivered with no profit recorded.
                </p>
              </div>
            </div>

            {zero.count > 0 ? (
              <>
                <p className="mt-4 font-mono text-[clamp(1.75rem,3vw,2.4rem)] font-medium leading-none tabular-nums text-critical">
                  {formatPct(zero.shareOfGrossPct, 0)}
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  of revenue earns nothing — {zero.count} booking
                  {zero.count === 1 ? "" : "s"} worth {formatCurrency(zero.gross)} sold at
                  cost.
                </p>
                <ul className="mt-4 space-y-2 border-t border-ink/8 pt-3">
                  {zero.rows.map((row, index) => (
                    <li
                      key={row.id ?? `zero-${index}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="inline-block size-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: colorForType(row.booking_type) }}
                        />
                        <span className="truncate text-ink/75">
                          {[row.departure, row.arrival].filter(Boolean).join(" → ") ||
                            row.booking_code ||
                            row.booking_type}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-ink">
                        {formatCurrency(grossOf(row))}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink/55">
                {rows.length === 0
                  ? "Nothing to check yet."
                  : "Every booking recorded a margin."}
              </p>
            )}
          </AdminCard>
        </div>

        {packages.length > 0 && (
          <AdminCard className="p-5">
            <h2 className="text-sm font-semibold text-ink">Packages</h2>
            <p className="mt-1 text-xs leading-5 text-ink/55">
              Customers who booked across more than one type. A whole trip is priced as
              one decision, so its blended take is the number that matters.
            </p>
            <ul className="mt-4 space-y-3">
              {packages.map((customer) => (
                <li key={customer.key} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm text-ink/75">
                    {customer.types.map((type) => (
                      <span
                        key={type}
                        className="inline-block size-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: colorForType(type) }}
                      />
                    ))}
                    <span className="ml-1">{customer.name ?? "Unknown"}</span>
                    <span className="text-ink/45">
                      · {customer.bookings.length} bookings
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatCurrency(customer.gross)}
                    <span className="ml-2 font-normal text-ink/50">
                      {formatPct(customer.takePct, 2)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </AdminCard>
        )}

        <AdminCard>
          <div className="border-b border-ink/8 px-4 py-4 sm:px-5">
            <h2 className="text-sm font-semibold text-ink">Every booking, by what it earned</h2>
            <p className="mt-1 text-xs leading-5 text-ink/55">
              Sorted by travel date. Every figure above traces to a row here.
            </p>
          </div>
          <AdminTable columns={bookingColumns} rows={tableRows} />
        </AdminCard>
      </div>
    </>
  );
}
