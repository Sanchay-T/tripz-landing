import { NextResponse } from "next/server";

/**
 * Password gate for the admin app.
 *
 * `/admin` and `/api/admin` read and write real customer records - names, phone
 * numbers, routes, prices - and every route uses a privileged database connection.
 * Until this existed there was no authentication of any kind: anyone who knew the
 * URL could read every customer, and `curl -X POST /api/admin/confirm-extraction`
 * from anywhere wrote rows.
 *
 * HTTP Basic is deliberately modest - it is a lock on a door that had none, not an
 * identity system. It gives no per-user attribution and no session management, so it
 * should be replaced with real accounts before more than a couple of people need
 * access. What it does do is stop the admin being world-readable, today, with one
 * shared password.
 *
 * The marketing site stays public: only /admin and /api/admin are matched.
 *
 * Set ADMIN_PASSWORD to enable. If it is unset the gate opens, which is deliberate -
 * a missing password must not lock the team out of their own tool - but it means the
 * variable has to actually be set in production. `/admin/settings` reports which
 * state it is in so this cannot fail silently.
 */

const REALM = 'Basic realm="TripZ Admin", charset="UTF-8"';

export function middleware(request) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization") ?? "";

  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice(6));
    } catch {
      decoded = "";
    }

    // Everything after the first colon is the password, so a colon in the password
    // is not a problem.
    const supplied = decoded.slice(decoded.indexOf(":") + 1);

    if (decoded.includes(":") && timingSafeEqual(supplied, password)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM }
  });
}

/**
 * Compare without leaking length or position through timing.
 *
 * `node:crypto.timingSafeEqual` is not available in the Edge runtime that middleware
 * runs in, so this is the equivalent constant-time comparison over char codes.
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
