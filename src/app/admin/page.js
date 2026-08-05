import {
  AdminBadge,
  AdminButton,
  AdminTable,
  Figure,
  FigureCell,
  FigureRow,
  Notice,
  PageHeader,
  Panel
} from "./components";
import { RevenueVersusProfit, TakeRateBars, colorForType } from "./charts";
import { fetchAdminDashboardData } from "@/lib/admin/records";
import {
  byType,
  customerBookings,
  fetchMarginRows,
  internalBookings,
  requestedFigures,
  summarise,
  zeroMargin
} from "@/lib/admin/margin";

export const dynamic = "force-dynamic";

/**
 * The operating screen.
 *
 * This is what you land on, so it carries the figures the business is actually run
 * on rather than a summary that sends you somewhere else to find them. It used to
 * show a hardcoded bar chart and four counts, with the money two clicks away.
 *
 * Money comes from `fetchMarginRows()`, deliberately not `fetchAdminDashboardData()`
 * — that helper caps bookings at 20 and omits `base_cost`, so any total built on it
 * would be a silent partial sum. The operational panels still use it, because for
 * "the most recent tasks" a cap is the correct behaviour.
 */

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

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

const bookingColumns = [
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="inline-block size-2 shrink-0" style={{ backgroundColor: row.color }} />
        {row.type}
      </span>
    )
  },
  { key: "customer", label: "Customer" },
  { key: "route", label: "Route / Stay" },
  { key: "date", label: "Travel date" },
  { key: "price", label: "Price", numeric: true },
  { key: "margin", label: "Margin", numeric: true },
  {
    key: "take",
    label: "Take",
    numeric: true,
    render: (row) =>
      row.isZero ? <AdminBadge tone="critical">0%</AdminBadge> : <span>{row.take}</span>
  }
];

export default async function AdminDashboard() {
  const [{ rows, error }, ops] = await Promise.all([
    fetchMarginRows(),
    fetchAdminDashboardData()
  ]);

  const billable = customerBookings(rows);
  const internal = internalBookings(rows);
  const total = summarise(billable);
  const types = byType(billable);
  const zero = zeroMargin(billable);
  const asked = requestedFigures(billable);

  // Rao's list, in the order he asked for it on 2026-08-04.
  const askedRows = [
    { label: "International booking", cut: asked.internationalBooking, type: "flight" },
    { label: "Domestic booking", cut: asked.domesticBooking, type: "flight" },
    { label: "International hotel booking", cut: asked.internationalHotel, type: "hotel" },
    { label: "Domestic hotel booking", cut: asked.domesticHotel, type: "hotel" }
  ];

  const recent = [...rows]
    .sort((a, b) => String(b.travel_date ?? "").localeCompare(String(a.travel_date ?? "")))
    .slice(0, 8)
    .map((row) => {
      const gross = Number(row.selling_price ?? 0);
      const margin = Number(row.margin ?? 0);
      return {
        id: row.id,
        color: colorForType(row.booking_type),
        type: row.booking_type ?? "other",
        customer: row.customers?.name ?? "Unknown",
        route: [row.departure, row.arrival].filter(Boolean).join(" → ") || "Not set",
        date: formatDate(row.travel_date),
        price: formatCurrency(gross),
        margin: formatCurrency(margin),
        take: formatPct(gross > 0 ? (margin / gross) * 100 : null, 2),
        isZero: gross > 0 && margin === 0
      };
    });

  const openTasks = (ops.tasks ?? []).filter((task) => task.status !== "done");

  return (
    <>
      <PageHeader
        eyebrow="TripZ operating system"
        title={
          <>
            Where the money <em>actually comes from</em>
          </>
        }
        body="Every figure here is recomputed from selling price minus base cost on each booking, never read from a stored total."
      />

      <div className="space-y-5 px-4 py-5 sm:px-6">
        {error && (
          <Notice tone="warn" title="Bookings could not be loaded">
            The database did not answer, so every figure on this page is zero — that is
            an empty response, not a real result. {error}
          </Notice>
        )}

        <FigureRow>
          <FigureCell>
            <Figure label="Revenue" value={formatCurrency(total.gross)} detail="Total selling price." />
          </FigureCell>
          <FigureCell>
            <Figure label="Margin earned" value={formatCurrency(total.margin)} detail="Selling price minus base cost." />
          </FigureCell>
          <FigureCell>
            {/* The one figure that carries the argument. */}
            <Figure accent label="Take rate" value={formatPct(total.takePct, 2)} detail="Margin as a share of revenue." />
          </FigureCell>
          <FigureCell>
            <Figure label="Bookings" value={total.count} detail="Customer business only." />
          </FigureCell>
        </FigureRow>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Panel
            title="Where the revenue comes from, and where the profit does"
            meta="Same colours, two bars. A line that is wide on top and narrow below is turning revenue into no profit."
          >
            <RevenueVersusProfit types={types} formatCurrency={formatCurrency} />
          </Panel>

          <Panel title="The numbers" meta="Bookings and value by market, plus totals.">
            <dl className="divide-y divide-ink/10">
              {askedRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0"
                >
                  <dt className="flex items-center gap-2 text-[13px] text-ink/75">
                    <span
                      className="inline-block size-2 shrink-0"
                      style={{ backgroundColor: colorForType(row.type) }}
                    />
                    {row.label}
                  </dt>
                  <dd className="flex shrink-0 items-baseline gap-4">
                    <span className="font-mono text-[11px] tabular-nums text-ink/40">
                      {row.cut.count}
                    </span>
                    <span className="min-w-[6.5rem] text-right font-mono text-[14px] tabular-nums text-ink">
                      {formatCurrency(row.cut.value)}
                    </span>
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[13px] font-semibold text-ink">Total booking value</dt>
                <dd className="font-mono text-[15px] font-medium tabular-nums text-ink">
                  {formatCurrency(asked.totalBookingValue)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[13px] font-semibold text-ink">Total margin earned</dt>
                <dd className="font-mono text-[15px] font-medium tabular-nums text-ink">
                  {formatCurrency(asked.totalMarginEarned)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-2.5">
                <dt className="flex items-center gap-2 text-[13px] text-ink/75">
                  <span
                    className="inline-block size-2 shrink-0"
                    style={{ backgroundColor: colorForType("package") }}
                  />
                  Package vendor booking value
                </dt>
                <dd className="font-mono text-[14px] tabular-nums text-ink">
                  {formatCurrency(asked.packageVendorValue)}
                </dd>
              </div>
            </dl>
            {internal.length > 0 && (
              <p className="mt-4 border-t border-ink/10 pt-3 text-[11.5px] leading-5 text-ink/50">
                Excludes {internal.length} internal booking{internal.length === 1 ? "" : "s"} worth{" "}
                {formatCurrency(
                  internal.reduce((sum, row) => sum + Number(row.selling_price ?? 0), 0)
                )}{" "}
                made on the company&apos;s own account.
              </p>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Take rate by type" meta="Margin as a percentage of what the customer paid.">
            <TakeRateBars types={types} formatCurrency={formatCurrency} formatPct={formatPct} />
          </Panel>

          <Panel title="Zero-margin exposure" meta="Bookings delivered with no profit recorded.">
            {zero.count > 0 ? (
              <>
                <p className="font-mono text-[clamp(1.75rem,3vw,2.4rem)] font-medium leading-none tabular-nums text-critical">
                  {formatPct(zero.shareOfGrossPct, 0)}
                </p>
                <p className="mt-2.5 text-[13px] text-ink/60">
                  of revenue earns nothing — {zero.count} booking{zero.count === 1 ? "" : "s"} worth{" "}
                  {formatCurrency(zero.gross)} sold at cost.
                </p>
                <ul className="mt-4 space-y-2 border-t border-ink/10 pt-3.5">
                  {zero.rows.map((row, index) => (
                    <li
                      key={row.id ?? index}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="inline-block size-2 shrink-0"
                          style={{ backgroundColor: colorForType(row.booking_type) }}
                        />
                        <span className="truncate text-ink/75">
                          {[row.departure, row.arrival].filter(Boolean).join(" → ") ||
                            row.booking_code}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono tabular-nums text-ink">
                        {formatCurrency(row.selling_price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-ink/55">
                {rows.length === 0 ? "Nothing to check yet." : "Every booking recorded a margin."}
              </p>
            )}
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Open tasks" meta="Travel reminders, payment follow-ups and boarding passes.">
            {openTasks.length === 0 ? (
              <p className="text-sm text-ink/45">Nothing outstanding.</p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {openTasks.slice(0, 6).map((task) => (
                  <li
                    key={task.id}
                    className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0"
                  >
                    <span className="min-w-0 truncate text-[13px] text-ink/75">
                      {task.task_type}
                      <span className="text-ink/40"> · {task.customers?.name ?? "Unknown"}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink/45">
                      {formatDate(task.due_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Finance" meta="Money in and out.">
            <dl className="divide-y divide-ink/10">
              {[
                ["Revenue", formatCurrency(total.gross)],
                ["Margin earned", formatCurrency(total.margin)],
                ["Expenses", formatCurrency(ops.metrics.totalExpenses)],
                ["Net after expenses", formatCurrency(total.margin - ops.metrics.totalExpenses)]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0"
                >
                  <dt className="text-[13px] text-ink/60">{label}</dt>
                  <dd className="font-mono text-[13.5px] tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>

        <Panel
          title="Recent bookings"
          meta="Newest by travel date. Every figure above traces back to a row here."
          action={
            <AdminButton href="/admin/margin" tone="light">
              Full breakdown
            </AdminButton>
          }
        >
          <AdminTable columns={bookingColumns} rows={recent} />
        </Panel>
      </div>
    </>
  );
}
