import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

/**
 * The first of two gates.
 *
 * `/admin` and `/api/admin` read and write real customer records — names, phone
 * numbers, routes, prices — over a privileged database connection.
 *
 * Next 16 runs this file as the proxy, on the edge runtime, so it cannot reach
 * Postgres and therefore cannot tell a real session from a forged cookie. All it
 * does is check that a session cookie is *present*, which is enough to bounce
 * anonymous traffic to the login page without a database round trip on every
 * request.
 *
 * The real check is `auth.api.getSession()`, and it happens behind this in two
 * places: `src/app/admin/layout.js` for pages, and `requireSession()` for API
 * routes. That split is Better Auth's documented pattern, and it is why this file
 * must never import `@/lib/auth` — that would pull a `pg` pool into the edge bundle.
 *
 * What is deliberately GONE from the previous version: a branch that returned
 * `NextResponse.next()` for everything whenever the admin password variable was
 * unset. It was meant to stop a missing variable locking the team out of their own
 * tool. What it actually did was make one absent environment variable enough to
 * publish every customer name, phone number and booking to anyone who found the
 * URL. This now fails closed, which is the correct failure for an admin over real
 * client data.
 */

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // No public-path list any more. Sign-in moved from /admin/login to /login and the
  // Better Auth endpoints live at /api/auth/*, so neither is covered by the matcher
  // below — everything this proxy sees genuinely requires a session. That also
  // removed the loop where a layout guarding /admin would have redirected the login
  // page to itself.
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  // Answer in the shape the caller asked for. An API client that follows a redirect
  // to an HTML login page gets markup where it expected JSON, and reports a parse
  // error rather than "not signed in".
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Not signed in.",
        detail: "POST /api/auth/sign-in/email or /api/auth/sign-in/username first."
      },
      { status: 401 }
    );
  }

  const login = new URL("/login", request.url);
  // Carry where they were headed so signing in lands there rather than the dashboard.
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
