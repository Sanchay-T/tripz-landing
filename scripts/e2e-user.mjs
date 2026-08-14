/** Create or delete a temporary E2E account without printing its password. */
import { betterAuth } from "better-auth";
import { buildAuthOptions, MIN_PASSWORD_LENGTH } from "../src/lib/auth-options.js";

if (process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
const [mode, rawUsername, role = "editor"] = process.argv.slice(2);
const username = rawUsername?.trim().toLowerCase();
if (!username || !["create", "delete"].includes(mode) || !["editor", "viewer"].includes(role)) throw new Error("Usage: e2e-user.mjs create|delete username editor|viewer");
const auth = betterAuth(buildAuthOptions({ allowSignUp: true }));
const ctx = await auth.$context;
const existing = await ctx.adapter.findMany({ model: "user", where: [{ field: "username", value: username }], limit: 2 });

if (mode === "delete") {
  for (const user of existing) {
    await ctx.internalAdapter.deleteUserSessions(user.id);
    await ctx.internalAdapter.deleteAccounts(user.id);
    await ctx.internalAdapter.deleteUser(user.id);
  }
  console.log(`Deleted ${existing.length} temporary account(s) for ${username}.`);
  process.exit(0);
}

if (existing.length) throw new Error(`Temporary username ${username} already exists.`);
const password = process.env.TRIPZ_E2E_PASSWORD || "";
if (password.length < MIN_PASSWORD_LENGTH) throw new Error("TRIPZ_E2E_PASSWORD does not meet the configured minimum.");
const email = `${username}@tripz.local`;
await auth.api.signUpEmail({ body: { name: `TripZ E2E ${role}`, email, username, displayUsername: username, password } });
const created = await ctx.internalAdapter.findUserByEmail(email);
await ctx.internalAdapter.updateUser(created.user.id, { role });
console.log(`Created temporary ${role} account ${username}.`);
