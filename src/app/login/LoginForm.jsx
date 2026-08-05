"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AdminButton, Notice } from "../admin/components";
import { SectionLabel } from "../components/ui";
import { authClient } from "@/lib/auth-client";
import { signInPayload } from "@/lib/credential-kind";

/**
 * The sign-in form.
 *
 * One identifier box, not two. Better Auth exposes `POST /sign-in/email` and
 * `POST /sign-in/username` and neither endpoint accepts the other's field — the
 * username plugin's schema has no email branch — so the form picks the endpoint by
 * looking for an "@" before it calls. `signInPayload` in `@/lib/credential-kind`
 * makes that decision, and it lives there so it can be unit tested without a
 * database or a browser.
 *
 * This replaced a single password box gating one shared account.
 */
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Only ever follow a path on this site. An absolute URL here would make the login
  // page an open redirect: /login?next=https://evil.example bouncing a signed-in
  // user straight off the product.
  const rawNext = searchParams.get("next") ?? "/admin";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { kind, body } = signInPayload(identifier, password);

    try {
      const { error: cause } =
        kind === "email"
          ? await authClient.signIn.email(body)
          : await authClient.signIn.username(body);

      if (cause) {
        // Better Auth distinguishes "no such user" from "wrong password". That is
        // deliberately collapsed into one message here: telling an anonymous caller
        // which of the two it hit turns this form into an account oracle.
        throw new Error("That email or username and password do not match.");
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
        This is the operating system for TripZ bookings. Sign in with your email or
        your username.
      </p>

      {error && (
        <div className="mt-6">
          <Notice tone="critical">{error}</Notice>
        </div>
      )}

      <form className="mt-7 space-y-5" onSubmit={submit}>
        <label className="block" htmlFor="identifier">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
            Email or username
          </span>
          <input
            aria-invalid={error ? "true" : undefined}
            // "username" is the field name password managers expect beside a
            // current-password field, and it does not stop them offering a saved
            // email address either.
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            className="w-full rounded-md border border-ink/12 bg-paper px-3.5 py-2.5 text-[14px] text-ink shadow-card outline-none transition focus:border-brand-vivid focus:ring-2 focus:ring-brand-vivid/20"
            id="identifier"
            name="identifier"
            onChange={(event) => setIdentifier(event.target.value)}
            required
            type="text"
            value={identifier}
          />
        </label>

        <label className="block" htmlFor="password">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
            Password
          </span>
          <input
            aria-describedby={error ? "login-error" : undefined}
            aria-invalid={error ? "true" : undefined}
            autoComplete="current-password"
            className="w-full rounded-md border border-ink/12 bg-paper px-3.5 py-2.5 text-[14px] text-ink shadow-card outline-none transition focus:border-brand-vivid focus:ring-2 focus:ring-brand-vivid/20"
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
          className="w-full"
          disabled={submitting || identifier.length === 0 || password.length === 0}
          type="submit"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </AdminButton>
      </form>

      <p className="mt-7 border-t border-ink/8 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
        Per-user accounts · change your password in settings
      </p>
    </div>
  );
}
