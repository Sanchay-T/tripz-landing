import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  accountBalance,
  expenseSchema,
  financeTransactionsQuerySchema,
  followUpBucket,
  leadsQuerySchema,
  leadSchema,
  operationalAccountSchema,
  reconciliationEntry,
  transactionDelta
} from "../src/lib/operations.js";
import { resetPassword, successMessage, validateResetInput } from "../scripts/reset-user-password.mjs";

describe("operations validation", () => {
  it("accepts default and custom expense categories", () => {
    for (const category of ["Marketing", "Temple partnerships"]) {
      assert.equal(expenseSchema.parse({ category, nameOrVendor: "Campaign", amount: 100, expenseDate: "2026-08-14", paymentStatus: "paid", notes: "" }).category, category);
    }
  });
  it("refuses non-positive expenses", () => assert.throws(() => expenseSchema.parse({ category: "Salary", nameOrVendor: "Rao", amount: 0, expenseDate: "2026-08-14", paymentStatus: "paid" })));
  it("validates finance and lead query parameters", () => {
    assert.equal(financeTransactionsQuerySchema.parse({ accountId: "4dca87ad-d937-4ca7-b9ce-2b8aac48bb95" }).accountId, "4dca87ad-d937-4ca7-b9ce-2b8aac48bb95");
    assert.throws(() => financeTransactionsQuerySchema.parse({ accountId: "not-a-uuid" }));
    assert.deepEqual(leadsQuerySchema.parse({ page: "2", limit: "25", status: "qualified", followUp: "today" }), {
      q: "", status: "qualified", campaign: "", location: "", followUp: "today", page: 2, limit: 25
    });
    assert.throws(() => leadsQuerySchema.parse({ status: "invalid" }));
    assert.throws(() => leadsQuerySchema.parse({ page: "0" }));
  });
  it("validates lead lifecycle and optional fields", () => {
    assert.equal(leadSchema.parse({ name: "A Lead", status: "qualified" }).status, "qualified");
    assert.throws(() => leadSchema.parse({ name: "A Lead", status: "unknown" }));
  });
  it("rejects password-like fields from the account directory", () => {
    assert.throws(() => operationalAccountSchema.parse({ serviceName: "Portal", loginId: "rao", password: "must-not-enter" }));
    assert.doesNotThrow(() => operationalAccountSchema.parse({ serviceName: "Portal", loginId: "rao", passwordManagerReference: "TripZ/Portal" }));
  });
});

describe("finance ledger", () => {
  const account = { id: "a", opening_balance: 1000 };
  const transactions = [
    { account_id: "a", transaction_type: "cash_in", amount: 400 },
    { account_id: "a", transaction_type: "cash_out", amount: 125 },
    { account_id: "a", transaction_type: "reconciliation_debit", amount: 25 },
    { account_id: "b", transaction_type: "cash_in", amount: 999 }
  ];
  it("derives a balance per account", () => assert.equal(accountBalance(account, transactions), 1250));
  it("signs outflows and reconciliation debits negatively", () => assert.equal(transactionDelta(transactions[1]), -125));
  it("creates positive and negative reconciliation entries", () => {
    assert.deepEqual(reconciliationEntry(100, 125), { transactionType: "reconciliation_credit", amount: 25 });
    assert.deepEqual(reconciliationEntry(100, 80), { transactionType: "reconciliation_debit", amount: 20 });
    assert.equal(reconciliationEntry(100, 100), null);
  });
});

describe("follow-up workflow", () => {
  it("classifies overdue, today, upcoming and unset dates", () => {
    assert.equal(followUpBucket("2026-08-13", "2026-08-14"), "overdue");
    assert.equal(followUpBucket("2026-08-14", "2026-08-14"), "today");
    assert.equal(followUpBucket("2026-08-15", "2026-08-14"), "upcoming");
    assert.equal(followUpBucket(null, "2026-08-14"), "none");
  });
});

describe("password reset safety", () => {
  it("requires the global minimum and normalizes the username", () => {
    assert.equal(validateResetInput(" Rao ", "a".repeat(12)), "rao");
    assert.throws(() => validateResetInput("rao", "too-short"));
    assert.throws(() => validateResetInput("", "a".repeat(12)));
  });
  it("never includes a password in success output", () => {
    const output = successMessage("rao");
    assert.equal(output, "Password reset and sessions revoked for rao.");
    assert.equal(output.includes("a".repeat(12)), false);
  });
  it("rejects unknown and ambiguous users without changing credentials", async () => {
    const makeAuth = (users) => ({
      $context: Promise.resolve({
        adapter: { findMany: async () => users },
        internalAdapter: {
          findAccounts: async () => [{ providerId: "credential" }],
          updatePassword: async () => assert.fail("must not update"),
          deleteUserSessions: async () => assert.fail("must not revoke")
        },
        password: { hash: async () => assert.fail("must not hash") }
      })
    });
    await assert.rejects(resetPassword({ username: "missing", password: "valid-password", authInstance: makeAuth([]) }), /No account exists/);
    await assert.rejects(resetPassword({ username: "duplicate", password: "valid-password", authInstance: makeAuth([{ id: "1" }, { id: "2" }]) }), /More than one account/);
  });
  it("hashes through Better Auth, updates only the credential account, and revokes sessions", async () => {
    const calls = [];
    const password = "valid-password";
    const authInstance = {
      $context: Promise.resolve({
        adapter: { findMany: async (query) => { calls.push(["lookup", query]); return [{ id: "user-1" }]; } },
        internalAdapter: {
          findAccounts: async (id) => { calls.push(["accounts", id]); return [{ providerId: "credential" }]; },
          updatePassword: async (id, hash) => calls.push(["update", id, hash]),
          deleteUserSessions: async (id) => calls.push(["revoke", id])
        },
        password: { hash: async (value) => { calls.push(["hash", value]); return "configured-hash"; } }
      })
    };
    const output = await resetPassword({ username: " Rao ", password, authInstance });
    assert.equal(output, "Password reset and sessions revoked for rao.");
    assert.deepEqual(calls.map((entry) => entry[0]), ["lookup", "accounts", "hash", "update", "revoke"]);
    assert.deepEqual(calls[3], ["update", "user-1", "configured-hash"]);
    assert.deepEqual(calls[4], ["revoke", "user-1"]);
    assert.equal(output.includes(password), false);
  });
  it("refuses users without a credential account", async () => {
    const authInstance = {
      $context: Promise.resolve({
        adapter: { findMany: async () => [{ id: "user-1" }] },
        internalAdapter: { findAccounts: async () => [{ providerId: "google" }] },
        password: { hash: async () => assert.fail("must not hash") }
      })
    };
    await assert.rejects(resetPassword({ username: "oauth-only", password: "valid-password", authInstance }), /No credential account/);
  });
  it("refuses ambiguous credential accounts without hashing", async () => {
    const authInstance = {
      $context: Promise.resolve({
        adapter: { findMany: async () => [{ id: "user-1" }] },
        internalAdapter: { findAccounts: async () => [{ providerId: "credential" }, { providerId: "credential" }] },
        password: { hash: async () => assert.fail("must not hash") }
      })
    };
    await assert.rejects(resetPassword({ username: "ambiguous", password: "valid-password", authInstance }), /More than one credential account/);
  });
});
