import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import {
  anthropicTicketExtractionInputSchema,
  getExtractionReviewStatus,
  ticketExtractionSchema,
  ticketExtractionZodSchema
} from "../src/lib/gemini/ticket-extraction-schema.js";

const fixtureDir = path.join(process.cwd(), "test-fixtures", "tickets");

describe("Gemini ticket extraction schema", () => {
  it("uses structured output schema fields expected by the SDK", () => {
    assert.equal(ticketExtractionSchema.type, "OBJECT");
    assert.equal(ticketExtractionSchema.properties.documentType.type, "STRING");
    assert.deepEqual(
      ticketExtractionSchema.required.includes("confidence"),
      true
    );
    assert.deepEqual(
      ticketExtractionSchema.propertyOrdering.includes("pnrOrConfirmation"),
      true
    );
  });

  it("exposes an Anthropic tool schema for forced structured extraction", () => {
    assert.equal(anthropicTicketExtractionInputSchema.type, "object");
    assert.equal(anthropicTicketExtractionInputSchema.properties.documentType.type, "string");
    assert.equal(
      anthropicTicketExtractionInputSchema.required.includes("pnrOrConfirmation"),
      true
    );
  });

  it("validates every expected fixture JSON", async () => {
    const manifest = JSON.parse(
      await fs.readFile(path.join(fixtureDir, "manifest.json"), "utf8")
    );

    assert.equal(manifest.fixtures.length, 10);

    for (const fixture of manifest.fixtures) {
      const expected = JSON.parse(
        await fs.readFile(path.join(fixtureDir, fixture.expected), "utf8")
      );

      assert.doesNotThrow(() => ticketExtractionZodSchema.parse(expected));
    }
  });

  it("keeps incomplete or low-confidence fixture outputs in human review", async () => {
    const missingPnr = JSON.parse(
      await fs.readFile(
        path.join(fixtureDir, "expected", "missing-pnr-ticket.json"),
        "utf8"
      )
    );
    const lowQuality = JSON.parse(
      await fs.readFile(
        path.join(fixtureDir, "expected", "low-quality-photo.json"),
        "utf8"
      )
    );
    const clean = JSON.parse(
      await fs.readFile(
        path.join(fixtureDir, "expected", "domestic-flight-indigo.json"),
        "utf8"
      )
    );

    assert.equal(getExtractionReviewStatus(missingPnr), "needs_review");
    assert.equal(getExtractionReviewStatus(lowQuality), "needs_review");
    assert.equal(getExtractionReviewStatus(clean), "ready_to_review");
  });
});
