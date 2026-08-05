"use client";

import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

/**
 * The browser-side auth client.
 *
 * No `baseURL`: the auth routes are mounted at `/api/auth` on this same origin, so
 * the client infers it from `window.location`. Hardcoding one would break preview
 * deployments, which each get their own hostname.
 *
 * `usernameClient` is what adds `signIn.username`. Without it the plugin's endpoint
 * exists on the server but there is no typed method for it here.
 */
export const authClient = createAuthClient({
  plugins: [usernameClient()]
});

export const { signIn, signOut, useSession, changePassword } = authClient;
