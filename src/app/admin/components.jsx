import Link from "next/link";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";
import { SectionLabel } from "../components/ui";

/**
 * Admin primitives, in the landing page's visual language.
 *
 * These used to be a shadcn dashboard: rounded-xl cards, a soft shadow on every
 * surface, stock Tailwind status colours, and a flat type scale where a section
 * heading was the same size as body text. `docs/admin/00-master-spec.md` asked for
 * exactly that — "the default shadcn admin template shape" — which is why it looked
 * like every other generated dashboard.
 *
 * The rules now, matching `src/app/page.js`:
 *   - Square. Radius is for controls and dots, nothing else.
 *   - Hairlines, not shadows. Panels are separated by 1px ink rules.
 *   - Three fonts with disjoint jobs: Geist for prose, Instrument Serif italic for
 *     emphasis, JetBrains Mono for every figure and every micro-label.
 *   - Accent is ink, not signal — it marks meaning, never decorates a surface.
 */

/** A square panel. No shadow: on a flat field, a border is enough. */
export function AdminCard({ children, className }) {
  return (
    <section className={cn("border border-ink/10 bg-paper", className)}>
      {children}
    </section>
  );
}

const buttonClass = cva(
  "inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        // The palette document is explicit: "CTA stays pure black."
        dark: "bg-ink text-paper hover:bg-accent-deep",
        light: "border border-ink/15 bg-paper text-ink hover:border-ink/35",
        ghost: "text-ink/60 hover:text-ink"
      }
    },
    defaultVariants: { tone: "dark" }
  }
);

/**
 * Matches `ButtonLink` in `src/app/components/ui.jsx` — same three tones, same
 * radius, same hover. It exists separately only because admin navigation needs
 * next/link for client-side routing, where the landing uses a plain anchor.
 */
export function AdminButton({ children, href, tone, className, ...props }) {
  const classes = cn(buttonClass({ tone }), className);

  if (href) {
    return (
      <Link className={classes} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

/**
 * Status marks, in brand colours.
 *
 * Carries a dot as well as the colour so status is never conveyed by hue alone —
 * which also means it survives being printed or screenshotted in greyscale.
 */
export function AdminBadge({ children, tone = "default" }) {
  const dot = {
    default: "bg-ink/30",
    good: "bg-good",
    warn: "bg-warn",
    critical: "bg-critical"
  }[tone];

  const text = {
    default: "text-ink/60",
    good: "text-good",
    warn: "text-warn",
    critical: "text-critical"
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.1em]",
        text
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      {children}
    </span>
  );
}

/**
 * Hairline table. Figures are mono and right-aligned so columns line up on the
 * decimal — the single biggest legibility win on a page of numbers.
 *
 * Pass `numeric: true` on a column to right-align it.
 */
export function AdminTable({ columns, rows }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-ink/15">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-2.5 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-ink/45",
                  column.numeric && "text-right"
                )}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                className="px-4 py-10 text-center text-sm text-ink/45"
                colSpan={columns.length}
              >
                No records yet.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id ?? row.booking ?? row.file ?? row.task}
              className="border-b border-ink/8 last:border-0 hover:bg-field/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-ink/80",
                    column.numeric && "text-right font-mono tabular-nums text-ink"
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Page header.
 *
 * `title` may contain an `<em>` — the base stylesheet renders every `<em>` as
 * Instrument Serif italic, which is this brand's signature gesture and appeared
 * nowhere in the admin before. Display type is fluid and set tight, against body
 * copy set loose; that contrast is most of what makes the landing page feel typeset.
 */
export function PageHeader({ eyebrow, title, body, action }) {
  return (
    <div className="flex flex-col gap-5 border-b border-ink/10 px-4 pb-7 pt-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        <h1 className="mt-4 text-balance font-sans text-[clamp(1.9rem,3.4vw,2.6rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
          {title}
        </h1>
        {body && (
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-ink/60">{body}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * A figure with its label. The number is the loud element and the label is quiet —
 * the reverse of the old stat tiles, where an uppercase label and a bold value
 * competed inside a rounded box.
 *
 * `accent` marks the one figure on a page that carries the meaning. Used sparingly,
 * per the palette document: the accent recedes so the human moments carry weight.
 */
export function Figure({ label, value, detail, accent = false, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-none tabular-nums tracking-[-0.02em]",
          accent ? "text-accent" : "text-ink"
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-2 text-[12.5px] leading-5 text-ink/50">{detail}</p>}
    </div>
  );
}

/**
 * A row of figures separated by hairlines rather than boxed into cards.
 *
 * This is the landing page's `gap-px` over an ink background trick: the parent
 * colour bleeds through the gaps as 1px rules, so the group reads as one ruled
 * object instead of four floating tiles.
 */
export function FigureRow({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Wraps each child of a FigureRow so the hairline gaps show through. */
export function FigureCell({ children, className }) {
  return <div className={cn("bg-paper p-5", className)}>{children}</div>;
}

/**
 * A titled block inside a page. The heading is a real step above body text — in the
 * old version every section heading was `text-sm`, identical to the prose beneath
 * it, so nothing established hierarchy.
 */
export function Panel({ title, meta, action, children, className }) {
  return (
    <AdminCard className={className}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">
                {title}
              </h2>
            )}
            {meta && <p className="mt-1.5 text-[12.5px] leading-5 text-ink/55">{meta}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </AdminCard>
  );
}

/**
 * A notice. Deliberately NOT a coloured left-border strip — that is the single most
 * recognisable generated-UI tell, and the old alert cards used it. A hairline box
 * with a status dot says the same thing without the tell.
 */
export function Notice({ tone = "default", title, children }) {
  const border = {
    default: "border-ink/15",
    good: "border-good/35",
    warn: "border-warn/35",
    critical: "border-critical/35"
  }[tone];

  return (
    <div className={cn("border bg-paper px-5 py-4", border)}>
      {title && (
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              { default: "bg-ink/30", good: "bg-good", warn: "bg-warn", critical: "bg-critical" }[tone]
            )}
          />
          {title}
        </p>
      )}
      <div className={cn("text-[13px] leading-[1.65] text-ink/65", title && "mt-2")}>
        {children}
      </div>
    </div>
  );
}
