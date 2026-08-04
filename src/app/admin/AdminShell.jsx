"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileStack,
  LayoutDashboard,
  Plane,
  PlusCircle,
  ReceiptText,
  Search,
  Settings,
  TrendingUp,
  UploadCloud,
  Users,
  WalletCards
} from "lucide-react";
import { Wordmark } from "../components/ui";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Dashboard", shortLabel: "Dash", href: "/admin", icon: LayoutDashboard },
  { label: "Upload", shortLabel: "Upload", href: "/admin/intake", icon: UploadCloud },
  { label: "Bookings", shortLabel: "Bookings", href: "/admin/bookings", icon: Plane },
  { label: "Add booking", shortLabel: "Add", href: "/admin/bookings/new", icon: PlusCircle },
  { label: "Customers", shortLabel: "Customers", href: "/admin/customers", icon: Users },
  { label: "Tasks", shortLabel: "Tasks", href: "/admin/tasks", icon: ClipboardList },
  { label: "Documents", shortLabel: "Docs", href: "/admin/documents", icon: FileStack },
  { label: "Finance", shortLabel: "Finance", href: "/admin/finance", icon: BarChart3 },
  { label: "Margin", shortLabel: "Margin", href: "/admin/margin", icon: TrendingUp },
  { label: "Expenses", shortLabel: "Expenses", href: "/admin/expenses", icon: WalletCards },
  { label: "Templates", shortLabel: "Templates", href: "/admin/templates", icon: BookOpen },
  { label: "Providers", shortLabel: "Providers", href: "/admin/providers", icon: ReceiptText },
  { label: "Imports", shortLabel: "Imports", href: "/admin/imports", icon: UploadCloud },
  { label: "Settings", shortLabel: "Settings", href: "/admin/settings", icon: Settings }
];

const mobilePrimaryItems = navItems.slice(0, 5);

/**
 * Active when this is the closest nav entry to the current path.
 *
 * A plain prefix match lit up both "Bookings" and "Add booking" on
 * /admin/bookings/new, because the first is a prefix of the second. Whichever entry
 * matches with the longest href wins, so a child route with its own nav item takes
 * precedence over its parent.
 */
function isActivePath(pathname, href) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  const matches = (candidate) =>
    pathname === candidate || pathname.startsWith(`${candidate}/`);

  if (!matches(href)) {
    return false;
  }

  return !navItems.some(
    (item) => item.href !== href && item.href.length > href.length && matches(item.href)
  );
}

function NavLink({ item, active, compact = false }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition",
        compact ? "min-w-max px-3 py-2" : "px-3 py-2.5",
        active
          ? "bg-white text-ink shadow-sm"
          : "text-white/68 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon size={17} />
      <span>{compact ? item.shortLabel : item.label}</span>
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(126,199,157,0.20),transparent_30%),linear-gradient(180deg,#f8fbf9_0%,#eef4f0_100%)] text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-ink text-white xl:flex xl:flex-col">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/admin" aria-label="TripZ Admin home">
            <Wordmark onDark />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-accent-live" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                Margin
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">Where profit comes from</p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Recomputed from selling price minus cost on every booking.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/86 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-5 lg:px-6">
            <Link href="/admin" className="shrink-0 xl:hidden" aria-label="TripZ Admin home">
              <Wordmark size="text-xl" />
            </Link>
            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink/45 shadow-sm md:flex">
              <Search size={16} />
              <span className="truncate">Search customers, bookings, PNRs...</span>
            </div>
            <Link
              href="/admin/bookings/new"
              className="ml-auto hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent md:inline-flex"
            >
              <PlusCircle size={16} />
              Add booking
            </Link>
          </div>

          <nav className="scrollbar-none flex max-w-full gap-2 overflow-x-auto border-t border-ink/10 px-4 py-2 xl:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition",
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink/65 hover:border-ink/25 hover:text-ink"
                  )}
                >
                  <Icon size={14} />
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 pb-24 xl:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/92 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-18px_60px_rgba(15,26,22,0.12)] backdrop-blur-xl sm:px-4 xl:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
            {mobilePrimaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition",
                    active ? "bg-ink text-white" : "text-ink/55 hover:bg-accent-soft hover:text-ink"
                  )}
                >
                  <Icon size={17} />
                  {item.shortLabel}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
