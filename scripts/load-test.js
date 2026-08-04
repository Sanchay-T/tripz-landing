// k6 load test for the TripZ admin surface.
//
//   BASE_URL=http://127.0.0.1:3300 k6 run scripts/load-test.js
//   BASE_URL=https://tripz-landing-pi.vercel.app k6 run scripts/load-test.js
//
// The `zeroed_pages` check is the one that matters most here. Every admin page
// coalesces a failed Supabase query to an empty array, so a page that has lost its
// database still returns HTTP 200 with a perfectly rendered layout full of zeros.
// Status codes alone therefore cannot tell a healthy page from a broken one, and a
// load test that only asserted `status === 200` would pass against a dead backend.

import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3300";

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
  const res = http.get(`${BASE}${path}`, { tags: { kind, route: path } });

  if (kind === "db") {
    dbPageDuration.add(res.timings.duration);
    // "₹0" next to a metric label, or the table's empty-state string, both mean the
    // page rendered without data.
    const looksEmpty =
      res.body === null ||
      res.body.includes("No records yet") ||
      /₹0(?![0-9,])/.test(res.body);
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

export default function () {
  for (const route of STATIC_ROUTES) {
    visit(route, "static");
  }
  for (const route of DB_ROUTES) {
    visit(route, "db");
  }
}
