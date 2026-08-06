import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "./AdminShell";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "TripZ Admin",
  description: "TripZ internal operations panel"
};

/**
 * The real gate.
 *
 * Until now nothing in the entire app read the session server-side — a grep of
 * `src/` for `cookies()` or `next/headers` returned nothing at all. Edge middleware
 * was the only thing between the internet and every customer record, so a single
 * mistake in its matcher would have been a total bypass with nothing behind it.
 *
 * The proxy can only see that a session cookie exists; it cannot reach Postgres to
 * learn whether that cookie is real, current, or revoked. This can, and does.
 *
 * Every page under /admin renders inside this layout, so the check cannot be
 * forgotten when a new screen is added — which is precisely why it lives here
 * rather than being repeated in each page. Sign-in is at /login, outside this
 * tree, so guarding everything here cannot loop back on itself.
 */
export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?next=/admin");
  }

  return (
    <AdminShell user={session.user}>
      {children}
      <Toaster />
    </AdminShell>
  );
}
