import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const routes = [
  "src/app/api/admin/expenses/route.js",
  "src/app/api/admin/expenses/[id]/route.js",
  "src/app/api/admin/finance/accounts/route.js",
  "src/app/api/admin/finance/accounts/[id]/route.js",
  "src/app/api/admin/finance/transactions/route.js",
  "src/app/api/admin/finance/transactions/[id]/route.js",
  "src/app/api/admin/finance/reconcile/route.js",
  "src/app/api/admin/leads/route.js",
  "src/app/api/admin/leads/[id]/route.js",
  "src/app/api/admin/operational-accounts/route.js",
  "src/app/api/admin/operational-accounts/[id]/route.js"
];

describe("operations route authorization", () => {
  for (const route of routes) {
    it(`${route} gates every mutation`, () => {
      const source = readFileSync(route, "utf8");
      const mutationCount = [...source.matchAll(/export async function (POST|PATCH|DELETE)/g)].length;
      const writeGateCount = [...source.matchAll(/requireWrite\(\)/g)].length;
      assert.equal(writeGateCount, mutationCount, "each mutation must invoke requireWrite exactly once");
      if (/export async function GET/.test(source)) assert.match(source, /requireSession\(\)/);
    });
  }
});
