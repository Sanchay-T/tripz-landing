"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AdminButton, Notice } from "../components";
import { SectionLabel } from "../../components/ui";

/**
 * The sign-in form.
 *
 * Structure follows shadcn's `login-03` block — label, field, full-width submit, error
 * above the form — rendered with this app's primitives so it does not look like a
 * different product from the admin behind it.
 *
 * There is no username field because there is no username: one shared password gates
 * the whole admin. Pretending otherwise with a disabled "admin" box would be theatre.
 */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Only ever follow a path on this site. An absolute URL here would make the login
  // page an open redirect: /admin/login?next=https://evil.example bouncing a signed-in
  // user straight off the product.
  const rawNext = searchParams.get("next") ?? "/admin";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Could not sign in.");
      }

      router.replace(next);
      // The admin pages are force-dynamic, so the router cache has to be dropped for
      // the first authenticated render to actually fetch.
      router.refresh();
    } catch (cause) {
      setError(cause.message);
      setPassword("");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <SectionLabel>TripZ admin</SectionLabel>
      <h1 className="mt-5 font-sans text-[clamp(1.9rem,3.4vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-ink">
        Sign <em>in</em>
      </h1>
      <p className="mt-3 text-[14px] leading-[1.65] text-ink/60">
        This is the operating system for TripZ bookings. Ask Sanchay or Rao for the
        password.
      </p>

      {error && (
        <div className="mt-6">
          <Notice tone="critical">{error}</Notice>
        </div>
      )}

      <form className="mt-7" onSubmit={submit}>
        <label className="block" htmlFor="password">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
            Password
          </span>
          <input
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={error ? "true" : undefined}
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-control border border-ink/15 bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && (
          <p className="sr-only" id="login-error" role="alert">
            {error}
          </p>
        )}

        <AdminButton
          className="mt-5 w-full"
          disabled={submitting || password.length === 0}
          type="submit"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </AdminButton>
      </form>

      <p className="mt-7 border-t border-ink/10 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
        One shared password · no per-user accounts yet
      </p>
    </div>
  );
}
