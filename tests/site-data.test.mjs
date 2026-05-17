import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aboutBand,
  ctaActions,
  desk,
  heroAgent,
  heroStats,
  indianBases,
  liveStatus,
  metrics,
  navLinks,
  outcomeFeature,
  pillars,
  pullQuote,
  recoveryProof,
  services,
  steps,
  stepsVisual,
  supportEmail,
  supportPhoneDisplay,
  supportPhoneE164,
  promiseVisuals,
  visualAssets,
  visualInterlude,
  whyTripz
} from "../src/lib/site-data.mjs";

describe("TripZ landing content", () => {
  it("exposes the two primary contact channels", () => {
    assert.equal(typeof ctaActions.call.href, "string");
    assert.equal(ctaActions.call.href, `tel:${supportPhoneE164}`);
    assert.ok(ctaActions.whatsapp.href.startsWith("https://wa.me/"));
    assert.equal(ctaActions.chat, undefined, "live chat should be removed");
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
    services.forEach((service) => {
      assert.equal(
        "visual" in service,
        false,
        "service tiles should stay text-first to avoid repeated imagery"
      );
    });
  });

  it("keeps the editorial sections populated", () => {
    assert.equal(navLinks.length >= 3, true);
    assert.equal(heroStats.length, 3);
    assert.equal(indianBases.length, 4);
    assert.equal(whyTripz.length, 4);
    assert.equal(steps.length, 3);
    assert.equal(desk.length, 4);
    assert.equal(metrics.length, 2);
  });

  it("publishes the foreword and contact email", () => {
    assert.ok(aboutBand.paragraphs.length >= 3);
    assert.equal(supportEmail, "Booking@trips.co.in");
  });

  it("publishes four deep pillars with sub-points and callouts", () => {
    assert.equal(pillars.length, 4);
    pillars.forEach((p, i) => {
      assert.equal(p.id, `pillar-0${i + 1}`);
      assert.ok(p.marker.length > 0);
      assert.ok(Array.isArray(p.headline) && p.headline.length > 0);
      assert.ok(p.lede.length > 0);
      assert.ok(p.callout.value.length > 0);
      assert.ok(p.callout.label.length > 0);
      assert.equal(p.points.length, 4);
    });
    assert.equal(pillars[1].tinted, true, "pillar 02 should be tinted");
  });

  it("services tiles anchor to the matching pillars", () => {
    assert.equal(services[0].href, "#pillar-01");
    assert.equal(services[1].href, "#pillar-02");
    assert.equal(services[2].href, "#pillar-03");
  });

  it("keeps the hero agent and pull quote populated", () => {
    assert.ok(heroAgent.quote.length > 0);
    assert.ok(heroAgent.name.length > 0);
    assert.ok(pullQuote.body.length > 0);
    assert.ok(pullQuote.attribution.length > 0);
  });

  it("publishes a live status the brand can quote", () => {
    assert.equal(typeof liveStatus.expertsOnShift, "number");
    assert.equal(typeof liveStatus.avgPickupSeconds, "number");
    assert.ok(liveStatus.expertsOnShift > 0);
    assert.ok(liveStatus.avgPickupSeconds > 0);
  });

  it("publishes the visual system assets used by the page", () => {
    assert.equal(Object.keys(visualAssets).length >= 6, true);
    Object.values(visualAssets).forEach((asset) => {
      assert.match(asset.src, /^\/images\/tripz-[\w-]+\.png$/);
      assert.ok(asset.alt.length > 16);
      assert.ok(asset.caption.length > 0);
    });
    assert.ok(visualInterlude.image.src.startsWith("/images/"));
    assert.ok(visualInterlude.headline.length > 0);
    assert.ok(recoveryProof.image.src.startsWith("/images/"));
    assert.equal(recoveryProof.facts.length, 3);
    assert.ok(outcomeFeature.image.src.startsWith("/images/"));
    assert.ok(outcomeFeature.headline.length > 0);
    assert.equal(promiseVisuals.length, 1);
    promiseVisuals.forEach((asset) => {
      assert.ok(asset.src.startsWith("/images/"));
    });
    assert.ok(stepsVisual.src.startsWith("/images/"));
    const majorImageFlow = [
      visualAssets.nightDesk,
      visualInterlude.image,
      ...promiseVisuals,
      recoveryProof.image,
      stepsVisual,
      outcomeFeature.image,
      visualAssets.operatorRoster,
      visualAssets.postcards
    ].map((asset) => asset.src);
    assert.equal(new Set(majorImageFlow).size, majorImageFlow.length);
  });
});
