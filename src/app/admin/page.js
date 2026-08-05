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
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { BookingsTable } from "@/components/bookings-table";
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

  const tableRows = rows.map((row) => {
      const gross = Number(row.selling_price ?? 0);
      const margin = Number(row.margin ?? 0);
    return {
      id: row.id,
      bookingCode: row.booking_code ?? "—",
      color: colorForType(row.booking_type),
      type: row.booking_type ?? "other",
      customer: row.customers?.name ?? "Unknown",
      route: [row.departure, row.arrival].filter(Boolean).join(" → ") || "Not set",
      travelDate: row.travel_date ? String(row.travel_date).slice(0, 10) : "",
      gross,
      margin,
      takePct: gross > 0 ? (margin / gross) * 100 : null,
      status: row.booking_status ?? "—"
    };
  });

  // Running totals by travel date. Eleven bookings plotted per-day would be mostly
  // zeroes with a few spikes; cumulative shows the shape of the business.
  const byDate = new Map();
  for (const row of billable) {
    if (!row.travel_date) continue;
    const key = String(row.travel_date).slice(0, 10);
    const current = byDate.get(key) ?? { revenue: 0, margin: 0 };
    current.revenue += Number(row.selling_price ?? 0);
    current.margin += Number(row.margin ?? 0);
    byDate.set(key, current);
  }
  // A point per DAY across the whole window, not just the days that had a booking.
  // Eight scattered points draw a line with visible corners and read as missing data;
  // carrying the running total forward gives a continuous curve. Still honest —
  // cumulative revenue on a day with no booking really is the previous day's figure.
  const dayKeys = [...byDate.keys()].sort();
  const series = [];
  if (dayKeys.length > 0) {
    const cursor = new Date(`${dayKeys[0]}T00:00:00Z`);
    const last = new Date(`${dayKeys[dayKeys.length - 1]}T00:00:00Z`);
    let revenue = 0;
    let margin = 0;
    while (cursor <= last) {
      const key = cursor.toISOString().slice(0, 10);
      const value = byDate.get(key);
      if (value) {
        revenue += value.revenue;
        margin += value.margin;
      }
      series.push({ date: key, revenue, margin });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  const topByMargin = [...types].sort((a, b) => b.margin - a.margin)[0];

  // Real month-over-month movement, not an invented "+12.5%".
  // The block ships a hardcoded badge on every card; a trend that never changes is a
  // decoration pretending to be information. This compares the most recent calendar
  // month of travel against the one before it, and returns null when there is not
  // enough history to say anything — in which case no badge renders at all.
  function trend(selector) {
    const months = new Map();
    for (const row of billable) {
      if (!row.travel_date) continue;
      const month = String(row.travel_date).slice(0, 7);
      months.set(month, (months.get(month) ?? 0) + selector(row));
    }
    const ordered = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    if (ordered.length < 2) return null;
    const [previousMonth, previous] = ordered[ordered.length - 2];
    const [latestMonth, latest] = ordered[ordered.length - 1];
    if (previous === 0) return null;
    const change = ((latest - previous) / Math.abs(previous)) * 100;
    const short = (month) =>
      new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        timeZone: "UTC"
      });
    return {
      direction: change >= 0 ? "up" : "down",
      label: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
      // Months here are sparse and non-contiguous, so an unlabelled percentage is
      // alarming rather than informative. Saying which two are being compared costs
      // nothing and stops the badge being read as a trend line.
      caption: `${short(latestMonth)} vs ${short(previousMonth)}`
    };
  }

  const revenueTrend = trend((row) => Number(row.selling_price ?? 0));
  const marginTrend = trend((row) => Number(row.margin ?? 0));
  const countTrend = trend(() => 1);
  const cards = [
    {
      label: "Revenue",
      value: formatCurrency(total.gross),
      delta: revenueTrend,
      headline: revenueTrend?.caption ?? null,
      detail: "Total selling price across customer bookings."
    },
    {
      label: "Margin earned",
      value: formatCurrency(total.margin),
      delta: marginTrend,
      headline: marginTrend?.caption ?? null,
      detail: "Selling price minus base cost, derived by the database."
    },
    {
      label: "Take rate",
      value: formatPct(total.takePct, 2),
      headline:
        topByMargin && total.margin > 0
          ? `${topByMargin.label} carry ${Math.round((topByMargin.margin / total.margin) * 100)}% of profit`
          : null,
      detail: "Margin as a share of revenue."
    },
    {
      label: "Bookings",
      value: total.count,
      delta: countTrend,
      headline: countTrend?.caption ?? null,
      detail: "Customer bookings on record."
    },
  ];

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

      <div className="@container/main space-y-5 px-4 py-5 sm:px-6">
        {error && (
          <Notice tone="warn" title="Bookings could not be loaded">
            The database did not answer, so every figure on this page is zero — that is
            an empty response, not a real result. {error}
          </Notice>
        )}

        <SectionCards cards={cards} />

        <ChartAreaInteractive data={series} />

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

        <BookingsTable rows={tableRows} />
      </div>
    </>
  );
}
