/**
 * Admin session: a signed cookie.
 *
 * Replaces HTTP Basic, which re-sent the password on every request, showed the
 * browser's own grey credential dialog, and had no way to sign out.
 *
 * Uses Web Crypto rather than `node:crypto` because middleware runs in the edge
 * runtime, where `node:crypto` is unavailable. That is the same constraint that
 * forced the hand-rolled constant-time compare below.
 *
 * The cookie proves one thing — that whoever holds it knew the password at some point
 * in the last seven days. It carries no identity, because there is only one shared
 * password. When more than a couple of people need access this should become real
 * accounts with a `users` table; a signed cookie is a front door, not an identity
 * system.
 */

export const SESSION_COOKIE = "tripz_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret() {
  // A dedicated secret is better, but falling back to the password means this works
  // without adding another environment variable to every environment.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

/** Constant-time string compare. `node:crypto.timingSafeEqual` is not in the edge runtime. */
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toBase64Url(signature);
}

/** `<issuedAtMs>.<signature>` */
export async function createSessionToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${await sign(issuedAt)}`;
}

/**
 * True only when the signature matches AND the token is inside its lifetime.
 *
 * Checking age as well as signature matters: without it a leaked cookie would be
 * valid forever, since nothing else can revoke one.
 */
export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !sessionSecret()) {
    return false;
  }

  const separator = token.lastIndexOf(".");
  if (separator <= 0) {
    return false;
  }

  const issuedAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!/^\d+$/.test(issuedAt)) {
    return false;
  }

  const ageSeconds = (Date.now() - Number(issuedAt)) / 1000;
  if (!Number.isFinite(ageSeconds) || ageSeconds < 0 || ageSeconds > MAX_AGE_SECONDS) {
    return false;
  }

  return timingSafeEqual(await sign(issuedAt), signature);
}

/** HttpOnly so client JS cannot read it; Lax so a cross-site POST cannot ride it. */
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  };
}

export function isPasswordCorrect(supplied) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  return timingSafeEqual(String(supplied ?? ""), expected);
}
