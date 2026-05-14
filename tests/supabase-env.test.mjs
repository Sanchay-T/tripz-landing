import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSupabasePublicEnv,
  getSupabaseServerEnv,
  supabaseEnvSchema
} from "../src/lib/supabase/env.js";

const testEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test"
};

function withEnv(env, callback) {
  const originalEnv = { ...process.env };

  process.env = { ...env };

  try {
    callback();
  } finally {
    process.env = originalEnv;
  }
}

describe("Supabase environment schema", () => {
  it("declares public and server-only keys explicitly", () => {
    assert.deepEqual(supabaseEnvSchema, {
      public: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      ],
      server: ["SUPABASE_SERVICE_ROLE_KEY"]
    });
  });

  it("reads the public Supabase client environment", () => {
    withEnv(testEnv, () => {
      assert.deepEqual(getSupabasePublicEnv(), {
        url: testEnv.NEXT_PUBLIC_SUPABASE_URL,
        publishableKey: testEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      });
    });
  });

  it("reads the server-only Supabase environment", () => {
    withEnv(testEnv, () => {
      assert.deepEqual(getSupabaseServerEnv(), {
        url: testEnv.NEXT_PUBLIC_SUPABASE_URL,
        publishableKey: testEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        serviceRoleKey: testEnv.SUPABASE_SERVICE_ROLE_KEY
      });
    });
  });

  it("fails fast when a required key is missing", () => {
    withEnv({}, () => {
      assert.throws(
        () => getSupabasePublicEnv(),
        /Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL/
      );
    });
  });
});
