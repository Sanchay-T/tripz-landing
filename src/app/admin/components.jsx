import Link from "next/link";
import { cva } from "class-variance-authority";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/cn";

/**
 * Admin primitives.
 *
 * These have been through two wrong genres. First a stock shadcn dashboard —
 * rounded-xl, a shadow on every surface, Tailwind's default status ramp — which read
 * as generated. The fix over-corrected into an editorial print language: square
 * corners, a 1px rule between every pair of surfaces, and a mint-tinted page. That is
 * a coherent object and it is a *printed* one, which is the wrong thing for software
 * someone sits in front of all day.
 *
 * The rules now:
 *   - Depth, not outlines. A white card on a near-neutral base, lifted by a two-layer
 *     shadow. Borders survive only *inside* a card, to divide its own rows.
 *   - Air. Padding and gaps are roughly 40% larger than the print version, because
 *     most of what reads as cheap in a dashboard is crowding.
 *   - Figures lead. The number is the loud element; its label is quiet.
 *   - One saturated accent (`brand-vivid`), spent on the figure that carries the
 *     page's meaning and nowhere else. `brand` is nearly black and cannot do this job.
 *   - Instrument Serif italic stays, sparingly. It is the one thing here that is not
 *     interchangeable with every other dashboard.
 */

/** A raised surface. The shadow does the separating, so there is no outline. */
export function AdminCard({ children, className }) {
  return (
    <section className={cn("rounded-lg bg-paper shadow-card", className)}>
      {children}
    </section>
  );
}

const buttonClass = cva(
  "inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-vivid disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        // The palette document is explicit: "CTA stays pure black."
        dark: "bg-ink text-paper shadow-card hover:bg-brand-deep",
        light: "bg-paper text-ink shadow-card ring-1 ring-ink/8 hover:ring-ink/20",
        ghost: "text-ink/60 hover:bg-ink/5 hover:text-ink"
      }
    },
    defaultVariants: { tone: "dark" }
  }
);

/**
 * Mirrors `ButtonLink` in `src/app/components/ui.jsx`, with one deliberate departure:
 * the radius comes from shadcn's scale (8px) rather than `--radius-control` (6px), so
 * admin buttons sit correctly inside 10px cards. The landing page keeps 6px and is
 * untouched. It exists separately because admin navigation needs next/link.
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
  // Fall back rather than resolve to undefined. Call sites passed "success" and
  // "danger" — neither is a key here — and the badge rendered with no colour at
  // all, silently, in four places. An unknown tone should look plain, not invisible.
  const key = ["default", "good", "warn", "critical"].includes(tone) ? tone : "default";
  const dot = {
    default: "bg-ink/30",
    good: "bg-good",
    warn: "bg-warn",
    critical: "bg-critical"
  }[key];

  const text = {
    default: "text-ink/60",
    good: "text-good",
    warn: "text-warn",
    critical: "text-critical"
  }[key];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-mono text-xs uppercase tracking-widest",
        text
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      {children}
    </span>
  );
}

/**
 * Table. Figures are mono and right-aligned so columns line up on the decimal — the
 * single biggest legibility win on a page of numbers.
 *
 * The row rules stay: these are divisions *within* one surface, which is what a
 * hairline is actually for. What went away is the outline around the whole thing,
 * because the card underneath already establishes the edge.
 *
 * Built on the library `Table` rather than raw `<table>` markup. That wrapper
 * already provides the `overflow-x-auto` scroll container, which is why this
 * returns a fragment — a second wrapper would nest two scroll containers.
 *
 * Pass `numeric: true` on a column to right-align it.
 */
export function AdminTable({ columns, rows }) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-mono text-xs font-normal uppercase tracking-widest text-ink/45",
                  column.numeric && "text-right"
                )}
                scope="col"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                className="h-24 text-center text-ink/45"
                colSpan={columns.length}
              >
                No records yet.
              </TableCell>
            </TableRow>
          )}
          {rows.map((row) => (
            <TableRow key={row.id ?? row.booking ?? row.file ?? row.task}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    "text-ink/80",
                    column.numeric && "text-right font-mono tabular-nums text-ink"
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

/**
 * Page header.
 *
 * Deliberately small. It used to open every screen with a fluid display headline up
 * to 2.6rem — magazine scale — which pushed the actual figures below the fold and
 * made the page announce itself instead of reporting. A dashboard's title is a label
 * telling you where you are; the largest thing on the screen should be a number.
 *
 * `title` may contain an `<em>`, rendered as Instrument Serif italic by the base
 * stylesheet. That is this brand's one signature gesture and it survives the change
 * of genre precisely because it is now used at a normal size.
 */
export function PageHeader({ title, body, action }) {
  return (
    <div className="px-4 pb-2 pt-8 sm:px-6">
      {/* Title and primary action share one line, which is the convention every
          product screen follows. Previously the action was a sibling of the whole
          text column and aligned to its top, so it landed beside the eyebrow — a
          10px label — leaving the title it belongs to stranded on the line below.

          The eyebrow itself is gone. Every screen opened with a category label
          above its own name ("TRIPZ OPERATING SYSTEM" over "Dashboard"), which is
          magazine furniture: it spent the first line of every page on something
          nobody needs told twice, and delayed the title. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h1 className="min-w-0 text-balance font-sans text-xl font-semibold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {body && (
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ink/55">{body}</p>
      )}
    </div>
  );
}

/**
 * A figure with its label. The number is the loud element and the label is quiet.
 *
 * `accent` marks the one figure on a page that carries the meaning, and it now has a
 * colour that can actually carry it: `brand-vivid` rather than `brand`, which is dark
 * enough to be indistinguishable from body ink.
 */
export function Figure({ label, value, detail, accent = false, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-mono text-xs uppercase tracking-widest text-ink/45">
        {label}
      </p>
      <p
        className={cn(
          "mt-2.5 font-mono text-2xl sm:text-3xl font-medium leading-none tabular-nums tracking-tight",
          accent ? "text-brand-vivid" : "text-ink"
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-2.5 text-xs leading-5 text-ink/50">{detail}</p>}
    </div>
  );
}

/**
 * A row of figures.
 *
 * This used to be the landing page's `gap-px` trick — cells over an ink background so
 * the parent bled through the gaps as 1px rules. That reads as one ruled table, which
 * is right on a marketing page and wrong here: it welds four independent metrics into
 * a single object. Real gaps and individual elevation let each figure be its own
 * thing, which is what it is.
 */
export function FigureRow({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Wraps each child of a FigureRow as its own raised surface. */
export function FigureCell({ children, className }) {
  return (
    <div className={cn("rounded-lg bg-paper p-6 shadow-card", className)}>{children}</div>
  );
}

/**
 * A titled block inside a page.
 *
 * The header no longer sits above a full-width rule. Inside a card that is already
 * separated from the page by elevation, a divider under the title is a second
 * separator doing the first one's job — spacing says it more quietly.
 */
export function Panel({ title, meta, action, children, className }) {
  return (
    <AdminCard className={cn("flex flex-col", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 pb-5 pt-6">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold leading-tight tracking-tight text-ink">
                {title}
              </h2>
            )}
            {meta && <p className="mt-1.5 text-xs leading-5 text-ink/50">{meta}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("px-6 pb-6", !title && !action && "pt-6")}>{children}</div>
    </AdminCard>
  );
}

/**
 * A notice.
 *
 * Deliberately NOT a coloured left-border strip — that is the most recognisable
 * generated-UI tell. A soft tint of the status colour with a dot says the same thing:
 * the tone is legible at a glance, and the dot means it is not colour alone.
 */
export function Notice({ tone = "default", title, children }) {
  const surface = {
    default: "bg-ink/4",
    good: "bg-good/8",
    warn: "bg-warn/8",
    critical: "bg-critical/8"
  }[tone];

  return (
    <div className={cn("rounded-lg px-5 py-4", surface)}>
      {title && (
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              { default: "bg-ink/30", good: "bg-good", warn: "bg-warn", critical: "bg-critical" }[tone]
            )}
          />
          {title}
        </p>
      )}
      <div className={cn("text-sm leading-relaxed text-ink/65", title && "mt-2")}>
        {children}
      </div>
    </div>
  );
}
