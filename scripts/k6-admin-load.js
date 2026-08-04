// k6 load test for the TripZ admin surface.
//
//   BASE_URL=http://127.0.0.1:3300 k6 run scripts/k6-admin-load.js
//   BASE_URL=https://tripz-landing-pi.vercel.app k6 run scripts/k6-admin-load.js
//
// Named `k6-admin-load.js`, NOT `load-test.js`: Node's test runner globs
// `**/*-test.js`, so the original name made `npm test` try to execute this file and
// fail on `import ... from "k6/http"`, which only exists inside the k6 runtime.
//
// The `zeroed_pages` check is the one that matters most here. Every admin page
// coalesces a failed Supabase query to an empty array, so a page that has lost its
// database still returns HTTP 200 with a perfectly rendered layout full of zeros.
// Status codes alone therefore cannot tell a healthy page from a broken one, and a
// load test that only asserted `status === 200` would pass against a dead backend.

import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";
import encoding from "k6/encoding";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3300";
// /admin is password-gated, so the load test has to authenticate or it just measures
// how fast the app can return 401.
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "";
const AUTH_HEADERS = ADMIN_PASSWORD
  ? { Authorization: `Basic ${encoding.b64encode(`admin:${ADMIN_PASSWORD}`)}` }
  : {};

const zeroedPages = new Rate("zeroed_pages");
const dbPageDuration = new Trend("db_page_duration", true);
const staticPageDuration = new Trend("static_page_duration", true);

// Routes that query Supabase, and routes that do not. Kept apart because mixing
// them produces an average that describes neither.
const DB_ROUTES = ["/admin", "/admin/bookings", "/admin/margin", "/admin/finance"];
const STATIC_ROUTES = ["/", "/admin/settings"];

export const options = {
  scenarios: {
    ramp: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "20s", target: 5 },
        { duration: "30s", target: 25 },
        { duration: "30s", target: 50 },
        { duration: "20s", target: 0 }
      ],
      gracefulRampDown: "10s"
    }
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    "http_req_duration{kind:static}": ["p(95)<2000"],
    // Deliberately not a hard threshold on DB routes: with the database down every
    // one of them sits at the ~7.3s connection timeout, and failing the run on that
    // would just restate a fact already established rather than surface anything new.
    zeroed_pages: ["rate<0.01"]
  }
};

function visit(path, kind) {
  const res = http.get(`${BASE}${path}`, { tags: { kind, route: path }, headers: AUTH_HEADERS });

  if (kind === "db") {
    dbPageDuration.add(res.timings.duration);
    // A page is "empty" when it says so, or when it contains no substantial rupee
    // figure at all.
    //
    // NOT "contains ₹0": /admin/margin legitimately shows ₹0 for International hotel
    // booking, because there genuinely are none. Testing for ₹0 flagged every healthy
    // response and reported a 100% failure rate against a perfectly working system.
    // The signal is the ABSENCE of a real number, not the presence of a zero.
    const looksEmpty =
      res.body === null ||
      res.body.includes("No records yet") ||
      res.body.includes("could not be loaded") ||
      !/₹[1-9][0-9,]{3,}/.test(res.body);
    zeroedPages.add(looksEmpty);
  } else {
    staticPageDuration.add(res.timings.duration);
  }

  check(res, {
    "status is 200": (r) => r.status === 200,
    "body is not empty": (r) => r.body !== null && r.body.length > 500
  });

  return res;
}

// Named rather than anonymous so `import/no-anonymous-default-export` stays quiet;
// k6 only requires that the default export be a function.
export default function adminLoadScenario() {
  for (const route of STATIC_ROUTES) {
    visit(route, "static");
  }
  for (const route of DB_ROUTES) {
    visit(route, "db");
  }
}
