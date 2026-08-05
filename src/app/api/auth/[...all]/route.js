import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

/**
 * Every Better Auth endpoint: sign-in, sign-out, get-session, change-password.
 *
 * Node runtime because the handler talks to Postgres. This path is deliberately
 * outside the proxy's matcher (`/admin/:path*`, `/api/admin/:path*`) — gating the
 * sign-in endpoint behind a signed-in check would lock everyone out of the door
 * they use to get in.
 */
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
