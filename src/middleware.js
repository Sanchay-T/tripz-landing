import { NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Gate for the admin app.
 *
 * `/admin` and `/api/admin` read and write real customer records — names, phone
 * numbers, routes, prices — over a privileged database connection. Before this
 * existed there was no authentication of any kind: anyone with the URL could read
 * every customer, and an unauthenticated POST to /api/admin/confirm-extraction wrote
 * rows.
 *
 * This replaces HTTP Basic with a signed session cookie. Basic worked, but it re-sent
 * the password on every request, could not be signed out of, and put the browser's
 * own grey credential dialog in front of a client-facing product.
 *
 * Still one shared password, so there is no per-user attribution. Real accounts are
 * the answer once more than a couple of people need access.
 */

// Reachable without a session, or the gate locks out its own login page.
const PUBLIC_PATHS = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

function isPublic(pathname) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // No password configured means the gate is open. Deliberate: a missing environment
  // variable must not lock the team out of their own tool. `/admin/settings` reports
  // which state it is in so this cannot fail silently.
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.next();
  }

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  // Answer in the shape the caller asked for. An API client that follows a redirect
  // to an HTML login page gets markup where it expected JSON, and reports a parse
  // error rather than "not signed in".
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Not signed in.", detail: "POST /api/admin/login to obtain a session." },
      { status: 401 }
    );
  }

  const login = new URL("/admin/login", request.url);
  // Carry where they were headed so signing in lands there rather than the dashboard.
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
