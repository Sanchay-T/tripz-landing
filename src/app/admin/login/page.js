import { Suspense } from "react";

import LoginForm from "./LoginForm";
import { Wordmark } from "../../components/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in · TripZ Admin"
};

/**
 * Split screen, after shadcn's `login-03`: a brand panel on one side, the form on the
 * other. The panel is hidden below `lg` so a phone gets the form full width rather
 * than a decorative block pushing it down the page.
 *
 * This route sits inside /admin but must NOT use AdminShell — the shell's sidebar
 * links all lead to gated pages, so showing it to someone who is not signed in offers
 * a nav full of dead ends.
 */
export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-ink p-10 text-white lg:flex">
        <Wordmark onDark />

        <div className="max-w-sm">
          <p className="font-serif text-[clamp(1.75rem,2.4vw,2.25rem)] italic leading-[1.2] text-white">
            Every booking, and what it actually earned.
          </p>
          <p className="mt-5 text-[14px] leading-[1.7] text-white/55">
            Margin is recomputed from selling price minus base cost on every row, so the
            take rate is a number you can price against.
          </p>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
          Bookings · Margin · Documents
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-16 sm:px-10">
        {/* useSearchParams needs a Suspense boundary to prerender. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
