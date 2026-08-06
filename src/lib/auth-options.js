import { username } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth's configuration, as a factory.
 *
 * It is a factory rather than a plain object for one reason: the running app must
 * refuse sign-ups, but `scripts/seed-users.mjs` has to create the initial accounts,
 * and `disableSignUp` blocks `auth.api.signUpEmail` as well as the HTTP route. The
 * seed script builds a second instance from this same factory with `allowSignUp`,
 * so both paths share one definition of the secret, the schema and the hashing.
 * Duplicating the config in the seed script instead would let the two drift.
 */

/**
 * A `pg` pool, deliberately NOT the postgres.js client in `src/lib/db.js`.
 *
 * Two independent reasons, either one sufficient on its own:
 *
 * 1. `db.js` overrides the datetime parser to return timestamps as raw strings,
 *    preserving the contract the pages inherited from PostgREST. Better Auth
 *    compares `Date` objects to decide whether a session has expired; handed a
 *    string, that comparison stops meaning anything.
 * 2. `DATABASE_URL` is Neon's pooled (PgBouncer) endpoint, and postgres.js has
 *    prepared statements on by default, which transaction pooling does not support.
 *    `pg` — which Better Auth's built-in Kysely adapter uses — does not issue named
 *    prepared statements, so it is safe against the same endpoint.
 */
function authPool() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  const local = url.includes("localhost") || url.includes("127.0.0.1");

  return new Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: true },
    max: 1
  });
}

const WEEK_SECONDS = 60 * 60 * 24 * 7;

export function buildAuthOptions({ allowSignUp = false } = {}) {
  const secret = process.env.BETTER_AUTH_SECRET;

  // Fail loudly and immediately. The scheme this replaced did the opposite: if its
  // password variable was missing, the middleware waved every request through to
  // real customer records. A missing secret must stop the app, not open it.
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not configured. Set it in .env.local and in the Vercel project."
    );
  }

  return {
    database: authPool(),
    secret,
    // Undefined lets Better Auth infer the origin from the request, which is what we
    // want on Vercel preview URLs. Set it explicitly in production.
    baseURL: process.env.BETTER_AUTH_URL || undefined,
    emailAndPassword: {
      enabled: true,
      // No public registration. This is an internal admin over real customer names
      // and phone numbers; accounts are created by running the seed script.
      disableSignUp: !allowSignUp,
      minPasswordLength: 12
    },
    // Adds `username` and `displayUsername` to the user table and a
    // POST /sign-in/username endpoint. Email sign-in keeps working alongside it.
    plugins: [username()],
    user: {
      additionalFields: {
        /**
         * "editor" or "viewer". Viewers can read every screen but every write is
         * refused server-side.
         *
         * `input: false` is the load-bearing part: without it the role is an
         * accepted field on the sign-up payload, and anyone able to create an
         * account could hand themselves write access. Roles are set by the seed
         * script, never by a request.
         */
        role: { type: "string", defaultValue: "editor", input: false, required: false }
      }
    },
    session: {
      expiresIn: WEEK_SECONDS,
      // Refresh the expiry at most once a day rather than on every request, so a
      // normal working session does not write to the database on each page load.
      updateAge: 60 * 60 * 24
    }
  };
}
