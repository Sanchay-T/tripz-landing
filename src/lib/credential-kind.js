/**
 * Decide whether a typed identifier is an email address or a username.
 *
 * Better Auth exposes two separate sign-in endpoints and neither accepts both:
 * `POST /sign-in/email` takes only `email`, and the username plugin's
 * `POST /sign-in/username` takes only `username` — its zod schema has no email
 * branch. The single "Email or username" box therefore has to pick an endpoint
 * before it calls, and this is that decision.
 *
 * An "@" is the whole test, and deliberately so. A stricter email regex would be
 * worse here: usernames cannot contain "@" (the plugin rejects them), so anything
 * carrying one is an attempted email, and sending it to the email endpoint gets the
 * user "no account with that email" rather than the baffling "invalid username".
 * Validating the address shape is the server's job, not this function's.
 *
 * Extracted so it can be tested without a database or a browser, matching the
 * offline style of the rest of `tests/`.
 */
export function credentialKind(identifier) {
  return String(identifier ?? "").includes("@") ? "email" : "username";
}

/**
 * Build the body for whichever sign-in endpoint `credentialKind` selected.
 * Usernames are trimmed and lowercased to match the plugin's own normalisation;
 * passwords are passed through untouched, since whitespace can be significant.
 */
export function signInPayload(identifier, password) {
  const trimmed = String(identifier ?? "").trim();

  return credentialKind(trimmed) === "email"
    ? { kind: "email", body: { email: trimmed.toLowerCase(), password } }
    : { kind: "username", body: { username: trimmed.toLowerCase(), password } };
}
