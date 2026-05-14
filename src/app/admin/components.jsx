import Link from "next/link";
import { cn } from "@/lib/cn";

export function AdminCard({ children, className }) {
  return (
    <section className={cn("rounded-xl border border-ink/10 bg-white/95 shadow-[0_18px_60px_rgba(15,26,22,0.06)]", className)}>
      {children}
    </section>
  );
}

export function AdminButton({ children, href, tone = "dark", className, ...props }) {
  const classes = cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
    tone === "dark" && "bg-ink text-white shadow-sm hover:bg-accent",
    tone === "light" && "border border-ink/10 bg-white text-ink hover:border-ink/30",
    tone === "ghost" && "text-ink/65 hover:bg-accent-soft hover:text-ink",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
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

export function AdminBadge({ children, tone = "default" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-accent-soft text-accent",
        tone === "dark" && "bg-ink text-white",
        tone === "warn" && "bg-amber-100 text-amber-800",
        tone === "danger" && "bg-red-100 text-red-700",
        tone === "success" && "bg-emerald-100 text-emerald-700"
      )}
    >
      {children}
    </span>
  );
}

export function AdminTable({ columns, rows }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-ink/10 text-xs uppercase tracking-[0.12em] text-ink/45">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-ink/45" colSpan={columns.length}>
                No records yet.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id ?? row.booking ?? row.file ?? row.task} className="hover:bg-accent-soft/45">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-ink/75">
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

export function PageHeader({ eyebrow, title, body, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink/10 bg-white/80 px-4 py-5 backdrop-blur sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-3xl min-w-0">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/45">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          {title}
        </h1>
        {body && <p className="mt-2 text-sm leading-6 text-ink/60">{body}</p>}
      </div>
      {action}
    </div>
  );
}
