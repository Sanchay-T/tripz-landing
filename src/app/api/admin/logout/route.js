import { NextResponse } from "next/server";

import { sessionCookieOptions } from "@/lib/session";

export const runtime = "nodejs";

/** Expire the session cookie. Until this existed there was no way to sign out at all. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
  return response;
}
