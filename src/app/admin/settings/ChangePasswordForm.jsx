"use client";

import { useState } from "react";

import { AdminButton, Notice } from "../components";
import { authClient } from "@/lib/auth-client";

/**
 * Change your own password.
 *
 * This exists because the two accounts were seeded with generated passwords. Without
 * it those would be permanent, and a password nobody chose is a password that ends
 * up written down somewhere worse.
 *
 * `revokeOtherSessions: true` is not optional here. Changing a password because you
 * think it leaked, while every other signed-in browser keeps its session, achieves
 * nothing — and the scheme this replaced could not revoke anything at all, because
 * it was stateless.
 */

// Matches `minPasswordLength` in src/lib/auth-options.js. The server enforces it;
// this only spares the round trip.
const MIN_LENGTH = 12;

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-md border border-ink/12 bg-paper px-3.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-brand-vivid focus:ring-2 focus:ring-brand-vivid/20";
  const labelClass =
    "mb-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50";

  async function submit(event) {
    event.preventDefault();
    setStatus(null);

    if (next !== confirm) {
      setStatus({ tone: "critical", message: "The two new passwords do not match." });
      return;
    }

    if (next.length < MIN_LENGTH) {
      setStatus({
        tone: "critical",
        message: `Use at least ${MIN_LENGTH} characters.`
      });
      return;
    }

    setSubmitting(true);

    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true
    });

    setSubmitting(false);

    if (error) {
      setStatus({
        tone: "critical",
        message: error.message || "That current password is not right."
      });
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    setStatus({
      tone: "good",
      message: "Password changed. Any other signed-in browser was signed out."
    });
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={submit}>
      {status && <Notice tone={status.tone}>{status.message}</Notice>}

      <label className="block" htmlFor="current-password">
        <span className={labelClass}>Current password</span>
        <input
          autoComplete="current-password"
          className={inputClass}
          id="current-password"
          onChange={(event) => setCurrent(event.target.value)}
          required
          type="password"
          value={current}
        />
      </label>

      <label className="block" htmlFor="new-password">
        <span className={labelClass}>New password</span>
        <input
          autoComplete="new-password"
          className={inputClass}
          id="new-password"
          minLength={MIN_LENGTH}
          onChange={(event) => setNext(event.target.value)}
          required
          type="password"
          value={next}
        />
      </label>

      <label className="block" htmlFor="confirm-password">
        <span className={labelClass}>Repeat new password</span>
        <input
          autoComplete="new-password"
          className={inputClass}
          id="confirm-password"
          minLength={MIN_LENGTH}
          onChange={(event) => setConfirm(event.target.value)}
          required
          type="password"
          value={confirm}
        />
      </label>

      <AdminButton
        disabled={submitting || !current || !next || !confirm}
        type="submit"
      >
        {submitting ? "Changing..." : "Change password"}
      </AdminButton>
    </form>
  );
}
