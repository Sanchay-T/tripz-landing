import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ctaActions,
  desk,
  heroAgent,
  heroStats,
  liveStatus,
  metrics,
  navLinks,
  pullQuote,
  services,
  situations,
  steps,
  supportPhoneDisplay,
  supportPhoneE164
} from "../src/lib/site-data.mjs";

describe("TripZ landing content", () => {
  it("exposes the three primary contact channels", () => {
    assert.equal(typeof ctaActions.call.href, "string");
    assert.equal(ctaActions.call.href, `tel:${supportPhoneE164}`);
    assert.ok(ctaActions.whatsapp.href.startsWith("https://wa.me/"));
    assert.ok(ctaActions.chat.href.length > 0);
  });

  it("uses an India-formatted display phone", () => {
    assert.match(supportPhoneDisplay, /^\+91 /);
    assert.equal(supportPhoneE164.startsWith("+91"), true);
  });

  it("renders the four service tiles with one live tile", () => {
    assert.equal(services.length, 4);
    const live = services.filter((s) => s.live);
    assert.equal(live.length, 1, "exactly one service must be live");
    assert.equal(live[0].n, "No. 04");
  });

  it("keeps the editorial sections populated", () => {
    assert.equal(navLinks.length >= 3, true);
    assert.equal(heroStats.length, 3);
    assert.equal(situations.length, 3);
    assert.equal(steps.length, 3);
    assert.equal(desk.length, 4);
    assert.equal(metrics.length, 4);
  });

  it("keeps the hero agent and pull quote populated", () => {
    assert.ok(heroAgent.quote.length > 0);
    assert.ok(heroAgent.name.length > 0);
    assert.ok(pullQuote.body.length > 0);
    assert.ok(pullQuote.attribution.length > 0);
  });

  it("publishes a live status the brand can quote", () => {
    assert.equal(typeof liveStatus.humansOnline, "number");
    assert.equal(typeof liveStatus.avgPickupSeconds, "number");
    assert.ok(liveStatus.humansOnline > 0);
    assert.ok(liveStatus.avgPickupSeconds > 0);
  });
});
