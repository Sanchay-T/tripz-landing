import {
  getExtractionReviewStatus,
  ticketExtractionZodSchema
} from "@/lib/booking-extraction-schema";

/**
 * The no-AI path for ticket intake.
 *
 * AI extraction is off. Uploading a ticket still stores the file and creates the
 * document and extraction rows, but no model is called - the reviewer types the
 * fields in instead. The upload, review and confirm flow is otherwise unchanged, so
 * bookings can still be recorded from a ticket.
 *
 * Set `TRIPZ_AI_EXTRACTION=on` (with a valid ANTHROPIC_API_KEY) to turn it back on.
 */
export function isAiExtractionEnabled() {
  return (
    process.env.TRIPZ_AI_EXTRACTION === "on" &&
    Boolean(process.env.ANTHROPIC_API_KEY)
  );
}

/**
 * An empty extraction shaped exactly like a model's output, so everything
 * downstream - the Zod parse, the review form, the status derivation - behaves
 * identically whether a model filled it or a person will.
 *
 * `confidence: 0` and a populated `missingFields` guarantee
 * `getExtractionReviewStatus` returns "needs_review", which is the honest state: a
 * human has not looked at it yet, and nothing was inferred.
 */
export function buildManualExtraction() {
  const extraction = ticketExtractionZodSchema.parse({
    documentType: "unknown",
    customerName: null,
    mobileNumber: null,
    email: null,
    bookingType: "unknown",
    market: "unknown",
    journeyType: "unknown",
    departure: null,
    arrival: null,
    travelDate: null,
    returnDate: null,
    provider: null,
    pnrOrConfirmation: null,
    baseCost: null,
    sellingPrice: null,
    currency: null,
    confidence: 0,
    missingFields: ["manual entry - no automatic extraction"],
    rawNotes: null
  });

  return {
    extraction,
    rawJson: null,
    model: "manual",
    status: getExtractionReviewStatus(extraction),
    usageMetadata: null
  };
}
