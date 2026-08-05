"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileStack,
  LayoutDashboard,
  Plane,
  PlusCircle,
  ReceiptText,
  LogOut,
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
        "flex items-center gap-3 rounded-md text-[13.5px] font-medium transition-colors",
        compact ? "min-w-max px-3 py-2" : "px-3 py-2.5",
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/6 hover:text-white"
      )}
    >
      {/* The active item is marked twice: a lifted fill and a live-green icon. A
          full white block was the old treatment and it punched a hole in the
          sidebar — the loudest thing on screen was a nav item rather than a
          figure. */}
      <Icon size={16} className={active ? "text-brand-live" : undefined} />
      <span>{compact ? item.shortLabel : item.label}</span>
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // The login page lives under /admin so the middleware matcher covers the whole
  // section with one rule, but it must not wear the shell: every sidebar link leads
  // to a gated page, so showing that nav to someone who is not signed in is a menu of
  // dead ends.
  if (pathname === "/admin/login") {
    return children;
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-base text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-ink text-white xl:flex xl:flex-col">
        <div className="flex h-16 items-center px-5">
          <Link href="/admin" aria-label="TripZ Admin home">
            <Wordmark onDark />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActivePath(pathname, item.href)}
            />
          ))}
        </nav>
        <div className="p-3">
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium text-white/55 transition-colors hover:bg-white/6 hover:text-white"
            onClick={signOut}
            type="button"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 xl:pl-72">
        {/* Below xl only. On a wide screen the sidebar already carries the wordmark
            and an "Add booking" nav entry, which left this bar holding nothing but a
            duplicate of that button — 64px of empty chrome above every page, pushing
            the figures down for no reason. Pages put their primary action in
            PageHeader instead, where it sits beside the title it belongs to.
            Tinted glass rather than a white bar, so on the sizes that do show it the
            page reads through and only the hairline marks the edge. */}
        <header className="sticky top-0 z-20 border-b border-ink/8 bg-base/80 backdrop-blur-md xl:hidden">
          {/* Wordmark only. The "Add booking" button that used to sit here now lives
              in PageHeader, and keeping both meant it rendered twice on tablet. */}
          <div className="flex h-16 items-center gap-3 px-4 sm:px-5 lg:px-6">
            <Link href="/admin" className="shrink-0" aria-label="TripZ Admin home">
              <Wordmark size="text-xl" />
            </Link>
          </div>

          <nav className="scrollbar-none flex max-w-full gap-1.5 overflow-x-auto border-t border-ink/8 px-4 py-2.5 xl:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 text-[12px] font-medium transition-colors",
                    active
                      ? "bg-ink text-white"
                      : "bg-paper text-ink/60 shadow-card hover:text-ink"
                  )}
                >
                  <Icon size={15} />
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="min-w-0 pb-24 xl:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/8 bg-paper/90 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-md sm:px-4 xl:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
            {mobilePrimaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium transition-colors",
                    active ? "bg-ink text-white" : "text-ink/55 hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <Icon size={16} />
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
