/**
 * Read-only accounts.
 *
 * The single source of truth for "can this person change anything", shared by the
 * server guard in `require-session.js` and the UI so the two cannot disagree.
 *
 * The test is `role === "viewer"`, never `role !== "editor"`. Accounts created
 * before the column existed carry a NULL role and must keep the write access they
 * already had; an account is only read-only because something deliberately said so.
 *
 * Hiding a control is a courtesy, not a control. `requireWrite()` is what actually
 * refuses the request — this only stops read-only users being shown buttons that
 * would fail.
 */
export function isViewer(user) {
  return user?.role === "viewer";
}
