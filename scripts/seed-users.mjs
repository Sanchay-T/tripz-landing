/**
 * Create the admin accounts.
 *
 *   node --env-file=.env.local scripts/seed-users.mjs
 *
 * Generates a strong password for each account that does not exist yet and prints
 * it ONCE. Nothing is written to disk by this script and nothing is committed —
 * capture the output or the password is gone and you reset it by re-running against
 * a deleted user.
 *
 * Why it builds its own auth instance: the running app sets `disableSignUp`, which
 * blocks `auth.api.signUpEmail` as well as the HTTP route, so the app's instance
 * cannot create these. This one flips that single flag via the shared factory in
 * `src/lib/auth-options.js` — same secret, same tables, same scrypt hashing — so
 * public sign-up stays closed while seeding still works. Sharing the factory is the
 * point: a hand-rolled INSERT here would have to reimplement Better Auth's password
 * hashing and would drift from it silently.
 */
import { randomBytes } from "node:crypto";

import { betterAuth } from "better-auth";

import { buildAuthOptions } from "../src/lib/auth-options.js";

// Runs DDL-adjacent writes; use the direct endpoint rather than the PgBouncer one.
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const ACCOUNTS = [
  {
    name: "Sanchay Thalnerkar",
    email: "sanchaythalnerkar@gmail.com",
    username: "sanchay"
  },
  {
    name: "Charan",
    // Placeholder. Charan signs in with the username; swap this for his real
    // address when we have it and the account keeps working either way.
    email: "charan@tripz.local",
    username: "charan"
  }
];

/** 24 URL-safe characters. Comfortably past the 12-char floor in auth-options.js. */
function generatePassword() {
  return randomBytes(18).toString("base64url");
}

const auth = betterAuth(buildAuthOptions({ allowSignUp: true }));
const created = [];

for (const account of ACCOUNTS) {
  const password = generatePassword();

  try {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        username: account.username,
        displayUsername: account.username,
        password
      }
    });
    created.push({ ...account, password });
  } catch (cause) {
    const message = cause?.body?.message ?? cause?.message ?? String(cause);

    // Re-running must not be destructive. An existing account is reported and
    // skipped, never overwritten with a fresh password.
    if (/exist|unique|taken/i.test(message)) {
      console.log(`skip   ${account.username} — already exists, left untouched`);
      continue;
    }

    console.error(`FAILED ${account.username}: ${message}`);
    process.exitCode = 1;
  }
}

if (created.length) {
  console.log("\nCreated. These passwords are shown once:\n");
  for (const account of created) {
    console.log(`  ${account.username.padEnd(10)} ${account.email}`);
    console.log(`  ${" ".repeat(10)} ${account.password}\n`);
  }
  console.log("Sign in with either the email or the username. Change it in /admin/settings.");
}

process.exit(process.exitCode ?? 0);
