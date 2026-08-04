import postgres from "postgres";

/**
 * Postgres connection for the admin app.
 *
 * Replaces the Supabase client. The schema was always plain Postgres - the only
 * extension it needs is pgcrypto - so nothing about the data model changed; what
 * changed is that queries are now SQL instead of PostgREST calls.
 *
 * Works against any Postgres: a local instance in development, Neon in production.
 * On Neon use the **pooled** connection string (the host containing `-pooler`),
 * because each serverless invocation opens its own connection and the direct
 * endpoint exhausts quickly.
 *
 * `max: 1` for the same reason: in a serverless function a pool larger than one is
 * wasted, since each invocation is single-threaded and short-lived.
 */

let client = null;

export function getDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  client ??= postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    // Managed Postgres requires TLS; a local instance generally has none.
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
    onnotice: () => {},
    types: {
      // Hand dates back as strings, the way PostgREST did.
      //
      // postgres.js parses date/timestamp/timestamptz into JS Date objects, but every
      // page here was written against Supabase and treats them as strings - rendering
      // them directly into JSX and calling `.slice(0, 10)`. Returning Date objects
      // instead threw "Objects are not valid as a React child" on /admin/bookings and
      // "created_at?.slice is not a function" on /admin/customers.
      //
      // Overriding the parser at the driver keeps that contract in one place rather
      // than casting in a dozen queries or editing every page.
      datetime: {
        to: 1184,
        from: [1082, 1114, 1184], // date, timestamp, timestamptz
        serialize: (value) => (value instanceof Date ? value.toISOString() : value),
        parse: (value) => value
      }
    }
  });

  return client;
}

/**
 * Run a read and never throw.
 *
 * Every admin page previously coalesced a failed Supabase query to an empty array,
 * which meant an unreachable database and a genuinely empty one rendered
 * identically - a page full of confident zeros. That ambiguity hid a month-long
 * outage. This returns the error alongside the rows so a page can say which it is,
 * and `lib/admin/records.js` propagates it.
 */
export async function safeQuery(run, fallback = []) {
  try {
    return { data: await run(getDb()), error: null };
  } catch (cause) {
    return {
      data: fallback,
      error: cause?.message ?? "Database query failed"
    };
  }
}
