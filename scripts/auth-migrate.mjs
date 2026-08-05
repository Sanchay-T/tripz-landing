/**
 * Create Better Auth's tables: user, session, account, verification.
 *
 *   node --env-file=.env.local scripts/auth-migrate.mjs [--apply]
 *
 * Prints the pending changes by default and only writes with `--apply`, because
 * this runs against the client's live database.
 *
 * Two things worth knowing before running it:
 *
 * 1. It forces `DATABASE_URL_UNPOOLED`. `DATABASE_URL` points at Neon's PgBouncer
 *    endpoint, and DDL through a transaction pooler is a bad idea — the pooler can
 *    hand successive statements to different backends mid-migration.
 * 2. It uses `getMigrations` rather than `npx @better-auth/cli migrate`. The CLI
 *    loads the auth config itself and this project is plain JavaScript with a `@/`
 *    alias the CLI does not resolve. Calling the same underlying function directly
 *    sidesteps that entirely.
 *
 * None of Better Auth's four table names collide with the existing 13-table schema.
 * The `admin_users` table is a separate, unused thing and is left alone — six
 * columns still carry foreign keys to it.
 */
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";

import { buildAuthOptions } from "../src/lib/auth-options.js";

const apply = process.argv.includes("--apply");

if (!process.env.DATABASE_URL_UNPOOLED) {
  console.error(
    "DATABASE_URL_UNPOOLED is not set. DDL must not run through the PgBouncer endpoint."
  );
  process.exit(1);
}

// buildAuthOptions reads DATABASE_URL; point it at the direct endpoint for DDL only.
process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;

const auth = betterAuth(buildAuthOptions());
const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);

const created = toBeCreated.map((t) => t.table);
const added = toBeAdded.map((t) => `${t.table} (+${Object.keys(t.fields).join(", ")})`);

console.log("Tables to create:", created.length ? created.join(", ") : "none");
console.log("Columns to add:  ", added.length ? added.join("; ") : "none");

if (!created.length && !added.length) {
  console.log("\nSchema is already up to date.");
  process.exit(0);
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write these changes.");
  process.exit(0);
}

await runMigrations();
console.log("\nApplied.");
process.exit(0);
