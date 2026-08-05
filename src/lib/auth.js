import { betterAuth } from "better-auth";

import { buildAuthOptions } from "./auth-options";

/**
 * The server-side auth instance.
 *
 * Import this ONLY from Node contexts — the admin layout, API routes, scripts. It
 * opens a Postgres pool at module load, so it must never be pulled into
 * `src/middleware.js`, which Next runs as the proxy on the edge runtime. The proxy
 * does a cookie-presence check instead and the real validation happens here.
 */
export const auth = betterAuth(buildAuthOptions());
