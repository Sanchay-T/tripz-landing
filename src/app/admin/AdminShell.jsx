"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronsUpDown,
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

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Wordmark } from "../components/ui";
import { authClient } from "@/lib/auth-client";

/**
 * The admin shell.
 *
 * This file used to contain THREE separate navigations: a fixed `<aside>` for xl
 * and up, a horizontally scrolling 14-item chip strip, and a fixed 5-item bottom
 * tab bar. The strip and the bar were both `xl:hidden`, so below 1280px they were
 * on screen simultaneously and the first five destinations appeared twice. Between
 * 768 and 1279px there was no sidebar at all, meaning an iPad in landscape got
 * phone chrome. Each of the three had its own copy of the link markup.
 *
 * All of that is now one `Sidebar` from the component library, which already
 * handles the desktop rail and swaps itself for a `Sheet` on mobile via
 * `useIsMobile`. There is one link implementation, one active state, and no
 * breakpoint where the navigation is missing or doubled.
 *
 * The dark colour comes from the `--sidebar` tokens in globals.css, so the look is
 * unchanged — it is the markup underneath that stopped being hand-rolled.
 */

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Upload", href: "/admin/intake", icon: UploadCloud },
  { label: "Bookings", href: "/admin/bookings", icon: Plane },
  { label: "Add booking", href: "/admin/bookings/new", icon: PlusCircle },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Tasks", href: "/admin/tasks", icon: ClipboardList },
  { label: "Documents", href: "/admin/documents", icon: FileStack },
  { label: "Finance", href: "/admin/finance", icon: BarChart3 },
  { label: "Margin", href: "/admin/margin", icon: TrendingUp },
  { label: "Expenses", href: "/admin/expenses", icon: WalletCards },
  { label: "Templates", href: "/admin/templates", icon: BookOpen },
  { label: "Providers", href: "/admin/providers", icon: ReceiptText },
  { label: "Imports", href: "/admin/imports", icon: UploadCloud },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

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

function initialsOf(user) {
  const source = user?.name || user?.username || user?.email || "";
  const parts = source.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    // Revokes the session row server-side, not just the cookie.
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    // TooltipProvider is required, not optional. SidebarMenuButton renders a
    // Tooltip whenever it is given a `tooltip` prop, and this version of
    // SidebarProvider does not include the provider itself, so the whole admin
    // threw "`Tooltip` must be used within `TooltipProvider`" at runtime. The build
    // does not catch that — it is a render-time error, not a type error.
    <TooltipProvider delayDuration={300}>
      <SidebarProvider>
        <Sidebar collapsible="offcanvas">
          <SidebarHeader>
            <Link href="/admin" aria-label="TripZ Admin home" className="px-2 py-1.5">
              <Wordmark onDark />
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton size="lg">
                      <Avatar className="size-8 rounded-md">
                        <AvatarFallback className="rounded-md text-xs">
                          {initialsOf(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate font-medium">
                          {user?.name || user?.username}
                        </span>
                        <span className="truncate text-xs opacity-60">
                          {user?.username ?? user?.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <span className="block truncate text-sm font-medium">
                        {user?.name || user?.username}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings">
                        <Settings />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleSignOut}>
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* min-w-0 is load-bearing. SidebarInset is `w-full flex-1` with no
            min-width override, and a flex item defaults to min-width:auto, so it
            refuses to shrink below its content: at 768px the inset stayed 718px
            wide beside a 256px sidebar and pushed the page past the viewport. */}
        <SidebarInset className="min-w-0 bg-base">
          {/* The only chrome above the page. On desktop the trigger collapses the
              rail; on mobile it opens the sheet. `overflow-x-hidden` used to sit on
              the root here, which clipped any overflow rather than preventing it and
              hid every responsive bug underneath it. */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-ink/8 bg-base/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="-ml-1" />
            <Link href="/admin" className="md:hidden" aria-label="TripZ Admin home">
              <Wordmark size="text-lg" />
            </Link>
          </header>

          <div className="min-w-0 flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
