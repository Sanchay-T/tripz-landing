import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { credentialKind, signInPayload } from "../src/lib/credential-kind.js";

/**
 * The sign-in form has one box but Better Auth has two endpoints, and neither
 * accepts the other's field. Picking the wrong one does not fail loudly — it fails
 * as "invalid username" for someone who typed a perfectly good email — so the
 * branch is worth pinning down.
 *
 * Offline by design, matching the rest of `tests/`: nothing here opens a database.
 * The real sign-in path is proven in the browser instead.
 */

describe("credentialKind", () => {
  it("treats anything containing @ as an email", () => {
    assert.equal(credentialKind("sanchaythalnerkar@gmail.com"), "email");
    assert.equal(credentialKind("charan@tripz.local"), "email");
  });

  it("treats a bare handle as a username", () => {
    assert.equal(credentialKind("sanchay"), "username");
    assert.equal(credentialKind("charan"), "username");
  });

  it("does not crash on empty or missing input", () => {
    assert.equal(credentialKind(""), "username");
    assert.equal(credentialKind(null), "username");
    assert.equal(credentialKind(undefined), "username");
  });
});

describe("signInPayload", () => {
  it("builds an email body for an address", () => {
    assert.deepEqual(signInPayload("sanchaythalnerkar@gmail.com", "secret"), {
      kind: "email",
      body: { email: "sanchaythalnerkar@gmail.com", password: "secret" }
    });
  });

  it("builds a username body for a handle", () => {
    assert.deepEqual(signInPayload("charan", "secret"), {
      kind: "username",
      body: { username: "charan", password: "secret" }
    });
  });

  it("trims and lowercases the identifier", () => {
    // Phone keyboards capitalise the first letter, and the username plugin
    // normalises to lowercase on write — so "Charan" must still find "charan".
    assert.deepEqual(signInPayload("  Charan  ", "secret"), {
      kind: "username",
      body: { username: "charan", password: "secret" }
    });
    assert.deepEqual(signInPayload(" Sanchay@Gmail.com ", "secret"), {
      kind: "email",
      body: { email: "sanchay@gmail.com", password: "secret" }
    });
  });

  it("leaves the password exactly as typed", () => {
    // Trimming or case-folding a password would silently reject a correct one.
    const password = "  Pa ss WORD  ";
    assert.equal(signInPayload("charan", password).body.password, password);
  });
});
