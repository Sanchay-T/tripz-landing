import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "./auth";

/**
 * Validate the session for an API route, or return the 401 to send back.
 *
 * This exists because the proxy can only check that a session cookie is *present*
 * — it runs on the edge and cannot reach Postgres. A cookie that is forged,
 * revoked or expired still satisfies that check, so anything serving real data has
 * to validate properly, and that is here.
 *
 * Before this, the four admin API routes contained no auth code whatsoever: they
 * inherited the proxy matcher and nothing else, which meant a single matcher
 * mistake exposed every booking and customer record with no second line of defence.
 *
 * Usage:
 *   const gate = await requireSession();
 *   if (gate.response) return gate.response;
 *   // gate.session is real from here
 */
export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    // JSON, not a redirect. An API client told to follow a redirect to an HTML
    // login page reports a parse error rather than "not signed in".
    return {
      session: null,
      response: NextResponse.json(
        {
          error: "Not signed in.",
          detail: "POST /api/auth/sign-in/email or /api/auth/sign-in/username first."
        },
        { status: 401 }
      )
    };
  }

  return { session, response: null };
}
