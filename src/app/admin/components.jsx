import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
 * Admin primitives — now adapters, not implementations.
 *
 * Every export here used to build its own markup out of divs and Tailwind, which
 * is how the admin ended up with a card, a badge, a button and a table that each
 * existed twice and drifted apart. They are now thin wrappers over the component
 * library, keeping the app-level API (`tone`, `{columns, rows}`, `meta`) so the
 * fourteen consumer pages did not have to change, while the actual rendering
 * comes from `@/components/ui`.
 *
 * That is the deliberate middle ground. Deleting these outright would mean
 * repeating `Card` + `CardHeader` + `CardTitle` markup in twelve files and the
 * table markup in six, which is not "using the library", it is copy-paste with
 * extra steps.
 */

/** A raised surface. */
export function AdminCard({ children, className }) {
  return <Card className={cn("min-w-0 max-w-full", className)}>{children}</Card>;
}

/**
 * Keeps the `tone` vocabulary the pages already speak, mapped onto Button's
 * variants: dark is the black CTA the palette document specifies, light is the
 * outlined secondary, ghost is text-only. `asChild` lets the href branch render a
 * next/link while still being a Button.
 */
const TONE_TO_VARIANT = { dark: "default", light: "outline", ghost: "ghost" };

export function AdminButton({ children, href, tone = "dark", className, ...props }) {
  const variant = TONE_TO_VARIANT[tone] ?? "default";

  if (href) {
    return (
      <Button asChild className={className} variant={variant}>
        <Link href={href} {...props}>
          {children}
        </Link>
      </Button>
    );
  }

  return (
    <Button className={className} variant={variant} {...props}>
      {children}
    </Button>
  );
}

/**
 * Status marks.
 *
 * The dot is kept deliberately: status must never be carried by hue alone, so it
 * survives greyscale printing and colour-blind readers. Badge supplies the shape,
 * the dot supplies the redundancy.
 *
 * The tone lookup falls back rather than resolving to undefined. Call sites passed
 * "success" and "danger" — neither a key here — and those badges rendered with no
 * colour at all, silently, in six places.
 */
const BADGE_TONES = {
  default: { dot: "bg-ink/30", text: "text-ink/60" },
  good: { dot: "bg-good", text: "text-good" },
  warn: { dot: "bg-warn", text: "text-warn" },
  critical: { dot: "bg-critical", text: "text-critical" }
};

export function AdminBadge({ children, tone = "default" }) {
  const { dot, text } = BADGE_TONES[tone] ?? BADGE_TONES.default;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-mono uppercase tracking-widest", text)}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dot)} />
      {children}
    </Badge>
  );
}

/**
 * Table with a column API.
 *
 * Built on the library `Table` rather than raw `<table>` markup. That wrapper
 * already provides the `overflow-x-auto` scroll container, which is why this
 * returns a fragment — a second wrapper would nest two scroll containers.
 *
 * Pass `numeric: true` on a column to right-align it. Figures are mono and
 * right-aligned so columns line up on the decimal, which is the single biggest
 * legibility win on a page of numbers.
 */
export function AdminTable({ columns, rows }) {
  return (
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
            <TableCell className="h-24 text-center text-ink/45" colSpan={columns.length}>
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
  );
}

/**
 * Page header.
 *
 * Deliberately small: a dashboard's title is a label telling you where you are,
 * and the largest thing on the screen should be a number. Title and primary action
 * share one line, which is the convention every product screen follows.
 *
 * `title` may contain an `<em>`, rendered as Instrument Serif italic by the base
 * stylesheet — this brand's one signature gesture, and it survives precisely
 * because it is used at a normal size.
 */
export function PageHeader({ title, body, action }) {
  return (
    <div className="px-4 pb-2 pt-8 sm:px-6 lg:px-8">
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

/** A figure with its label. The number is loud, the label quiet. */
export function Figure({ label, value, detail, accent = false, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-mono text-xs uppercase tracking-widest text-ink/45">{label}</p>
      <p
        className={cn(
          "mt-2.5 font-mono text-2xl font-medium leading-none tabular-nums tracking-tight sm:text-3xl",
          accent ? "text-brand-vivid" : "text-ink"
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-2.5 text-xs leading-5 text-ink/50">{detail}</p>}
    </div>
  );
}

/** A row of figures, each its own raised surface. */
export function FigureRow({ children, className }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

export function FigureCell({ children, className }) {
  return (
    <Card className={cn("p-6", className)}>
      {children}
    </Card>
  );
}

/** A titled block inside a page. */
export function Panel({ title, meta, action, children, className }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      {(title || action) && (
        <CardHeader>
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {meta && <CardDescription>{meta}</CardDescription>}
          {action}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * A persistent notice.
 *
 * Deliberately inline rather than a toast: these report that something is wrong
 * with the data on screen — "the database did not answer, so these zeros are an
 * empty response, not a real result" — and an error you must act on should not
 * disappear on a timer. Transient save confirmations use sonner instead.
 */
/**
 * Alert ships exactly two variants, `default` and `destructive`. Mapping good and
 * warn onto invented "success"/"warning" names would have them fall through to
 * default silently — the same failure that left six AdminBadges colourless. So
 * only critical claims the real variant, and the other tones carry their colour on
 * a dot, which also keeps status off hue alone.
 */
const NOTICE_DOT = {
  default: "bg-ink/30",
  good: "bg-good",
  warn: "bg-warn",
  critical: "bg-critical"
};

export function Notice({ tone = "default", title, children }) {
  const dot = NOTICE_DOT[tone] ?? NOTICE_DOT.default;

  return (
    <Alert variant={tone === "critical" ? "destructive" : "default"}>
      {title && (
        <AlertTitle className="flex items-center gap-2">
          <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dot)} />
          {title}
        </AlertTitle>
      )}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
