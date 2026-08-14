/** Reset exactly one existing username. The password is read from stdin and never logged. */
import { betterAuth } from "better-auth";
import { pathToFileURL } from "node:url";
import { buildAuthOptions, MIN_PASSWORD_LENGTH } from "../src/lib/auth-options.js";

if (process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;

export function validateResetInput(username, password) {
  if (!username?.trim()) throw new Error("A username is required.");
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  if (password.length > 128) throw new Error("Password must be no more than 128 characters.");
  return username.trim().toLowerCase();
}

export function successMessage(username) {
  return `Password reset and sessions revoked for ${username}.`;
}

async function readStdin() {
  let value = "";
  for await (const chunk of process.stdin) value += chunk;
  return value.replace(/[\r\n]+$/, "");
}

export async function resetPassword({ username, password, authInstance }) {
  const normalized = validateResetInput(username, password);
  const ctx = await authInstance.$context;
  const users = await ctx.adapter.findMany({ model: "user", where: [{ field: "username", value: normalized }], limit: 2 });
  if (users.length === 0) throw new Error(`No account exists for ${normalized}.`);
  if (users.length !== 1) throw new Error(`More than one account matched ${normalized}; nothing changed.`);
  const accounts = await ctx.internalAdapter.findAccounts(users[0].id);
  const credentials = accounts.filter((account) => account.providerId === "credential");
  if (credentials.length === 0) throw new Error(`No credential account exists for ${normalized}.`);
  if (credentials.length !== 1) throw new Error(`More than one credential account matched ${normalized}; nothing changed.`);
  const hash = await ctx.password.hash(password);
  await ctx.internalAdapter.updatePassword(users[0].id, hash);
  await ctx.internalAdapter.deleteUserSessions(users[0].id);
  return successMessage(normalized);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const username = process.argv[2];
  try {
    const password = await readStdin();
    const auth = betterAuth(buildAuthOptions());
    console.log(await resetPassword({ username, password, authInstance: auth }));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Password reset failed.");
    process.exitCode = 1;
  }
}
