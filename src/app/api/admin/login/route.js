import { NextResponse } from "next/server";

import {
  createSessionToken,
  isPasswordCorrect,
  sessionCookieOptions
} from "@/lib/session";

export const runtime = "nodejs";

/**
 * Exchange the shared password for a session cookie.
 *
 * This route is excluded from the middleware matcher — gating it would lock the login
 * page out of its own sign-in call.
 */
export async function POST(request) {
  let password = "";
  try {
    ({ password = "" } = await request.json());
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a password." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    // No password configured means the gate is open by design (see middleware), so
    // there is nothing to sign in to.
    return NextResponse.json(
      { error: "No password is configured for this environment." },
      { status: 503 }
    );
  }

  if (!isPasswordCorrect(password)) {
    // Fixed delay on failure so response time cannot be used to probe the password.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "That password is not right." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...sessionCookieOptions(), value: await createSessionToken() });
  return response;
}
