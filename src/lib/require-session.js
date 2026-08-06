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

/**
 * Validate the session AND refuse the request if the account is read-only.
 *
 * Every mutating handler uses this instead of `requireSession`. Hiding a button
 * in the UI is a courtesy, not a control: without a server-side refusal, a
 * read-only account can still POST to the endpoint directly with curl. This is
 * the actual restriction; the hidden buttons just stop people trying.
 *
 * The test is `role === "viewer"`, not `role !== "editor"`. Accounts created
 * before the column existed have a NULL role and must keep the write access they
 * already had — a viewer is only ever a viewer because something set it so.
 */
export async function requireWrite() {
  const gate = await requireSession();

  if (gate.response) {
    return gate;
  }

  if (gate.session.user?.role === "viewer") {
    return {
      session: gate.session,
      response: NextResponse.json(
        {
          error: "This account is read-only.",
          detail: "Ask Sanchay if you need to be able to add or change bookings."
        },
        { status: 403 }
      )
    };
  }

  return gate;
}
