import { cn } from "@/lib/cn";

/**
 * The chart pieces shared by the dashboard and the margin page.
 *
 * They live here rather than in either page because both screens must encode a
 * booking type with the same hue. A colour that means "hotel" on one screen and
 * something else on the next is worse than no colour at all.
 */

/**
 * Fixed hue per booking type. Colour follows the entity, never its rank, so a type
 * dropping out of the data never repaints the others.
 *
 * These are NOT the brand palette, deliberately. TripZ's accent is a desaturated
 * spine green chosen to recede — right for ink, but it fails the chroma floor and
 * the protan CVD gate the moment you ask it to encode categories (green against the
 * palette's clay reads as one colour to a protanope). So encoding uses a validated
 * categorical set and the brand accent stays reserved for meaning. Verified with the
 * dataviz validator at `--pairs all`: worst CVD ΔE 9.2, worst normal-vision ΔE 24.0.
 * Its contrast warning is discharged by the direct labels and the table beneath.
 */
export const TYPE_COLOR = {
  flight: "#2a78d6",
  hotel: "#eb6834",
  package: "#1baf7a",
  transfer: "#4a3aa7",
  visa: "#eda100",
  insurance: "#e87ba4",
  other: "#8a8a80"
};

export function colorForType(type) {
  return TYPE_COLOR[type] ?? TYPE_COLOR.other;
}

/** A 100% stacked bar. Segments keep a 1px gap so adjacent hues never touch. */
export function ShareBar({ segments, className }) {
  const shown = segments.filter((segment) => segment.value > 0);
  const total = shown.reduce((sum, segment) => sum + segment.value, 0);

  if (total <= 0) {
    return <p className="text-sm text-ink/45">Nothing to show yet.</p>;
  }

  return (
    <div className={className}>
      <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-ink/8">
        {shown.map((segment) => (
          <div
            key={segment.label}
            className="h-full"
            style={{
              backgroundColor: segment.color,
              flexGrow: segment.value,
              flexBasis: 0,
              minWidth: 2
            }}
          />
        ))}
      </div>
      {/* Direct labels, always. Identity is never carried by colour alone. */}
      <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
        {shown.map((segment) => (
          <li key={segment.label} className="flex items-center gap-1.5 text-[12px] text-ink/60">
            <span
              className="inline-block size-2 shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="font-mono tabular-nums text-ink">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The two bars that carry the whole argument: revenue share above, profit share
 * below, in the same colours. Reading one colour down the pair shows whether a line
 * turns money into profit or just moves it.
 */
export function RevenueVersusProfit({ types, formatCurrency }) {
  const withRevenue = types.filter((t) => t.gross > 0);
  const withMargin = types.filter((t) => t.margin > 0);
  const totalMargin = types.reduce((sum, t) => sum + t.margin, 0);
  const totalGross = types.reduce((sum, t) => sum + t.gross, 0);
  const top = [...types].sort((a, b) => b.margin - a.margin)[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
          Share of revenue
        </p>
        <ShareBar
          segments={withRevenue.map((t) => ({
            color: colorForType(t.type),
            label: t.label,
            value: t.gross
          }))}
        />
      </div>
      <div>
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
          Share of profit
        </p>
        {withMargin.length > 0 ? (
          <ShareBar
            segments={withMargin.map((t) => ({
              color: colorForType(t.type),
              label: t.label,
              value: t.margin
            }))}
          />
        ) : (
          <p className="text-sm text-ink/45">No line recorded any profit.</p>
        )}
      </div>

      {top && totalMargin > 0 && totalGross > 0 && (
        <p className="border-t border-ink/8 pt-5 text-[13.5px] leading-[1.65] text-ink/75">
          <strong className="font-semibold text-ink">{top.label}</strong> are{" "}
          {Math.round((top.gross / totalGross) * 100)}% of revenue but{" "}
          {Math.round((top.margin / totalMargin) * 100)}% of profit —{" "}
          {formatCurrency(top.margin)} of the {formatCurrency(totalMargin)} earned.
          Everything else is close to pass-through.
        </p>
      )}
    </div>
  );
}

/** Take rate per type, scaled against the best performer so a 0.5% bar is still visible. */
export function TakeRateBars({ types, formatCurrency, formatPct }) {
  const shown = types.filter((t) => t.count > 0);
  const widest = Math.max(...shown.map((t) => t.takePct ?? 0), 1);

  if (shown.length === 0) {
    return <p className="text-sm text-ink/45">No bookings yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {shown.map((type) => (
        <li key={type.type}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 text-[13.5px] text-ink/75">
              <span
                className="inline-block size-2 shrink-0"
                style={{ backgroundColor: colorForType(type.type) }}
              />
              {type.label}
            </span>
            <span className="font-mono text-[13.5px] tabular-nums text-ink">
              {formatPct(type.takePct, 2)}
            </span>
          </div>
          {/* 6px, not 1px. These were `h-px`, which is a hairline rule rather than a
              bar — "thin marks" is a rule about restraint, not about making the data
              invisible. At this height the fill is legible and the rounded end reads
              as a measured quantity. */}
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-ink/8">
            <div
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: colorForType(type.type),
                width: `${Math.max(((type.takePct ?? 0) / widest) * 100, type.takePct > 0 ? 2 : 0).toFixed(2)}%`
              }}
            />
          </div>
          <p className={cn("mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40")}>
            {formatCurrency(type.margin)} on {formatCurrency(type.gross)} · {type.count} booking
            {type.count === 1 ? "" : "s"}
          </p>
        </li>
      ))}
    </ul>
  );
}
