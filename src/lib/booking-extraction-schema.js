/**
 * The shape of a booking extracted from a ticket, and the rule for whether it still
 * needs a human.
 *
 * Previously `src/lib/gemini/ticket-extraction-schema.js`, where it also carried
 * provider-specific structured-output specs for Gemini and Anthropic and imported
 * `Type` from `@google/genai` purely for four string constants. Automatic extraction
 * is off and both SDKs are gone, so what survives is the part that was never
 * provider-specific: the Zod schema every write path validates against, and
 * `getExtractionReviewStatus`.
 *
 * It still applies with extraction off - a manually entered booking is validated by
 * exactly the same schema, which is why the enums are worth keeping strict.
 */

import { z } from "zod";

export const ticketDocumentTypes = [
  "flight_ticket",
  "hotel_voucher",
  "boarding_pass",
  "invoice",
  "payment_receipt",
  "unknown"
];

export const ticketBookingTypes = [
  "flight",
  "hotel",
  "package",
  "visa",
  "insurance",
  "transfer",
  "other"
];

export const ticketMarkets = ["domestic", "international", "unknown"];

export const ticketJourneyTypes = [
  "one_way",
  "return",
  "multi_city",
  "stay_only",
  "not_applicable",
  "unknown"
];

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

export const ticketExtractionZodSchema = z.object({
  documentType: z.enum(ticketDocumentTypes),
  customerName: nullableString,
  mobileNumber: nullableString.optional(),
  email: nullableString.optional(),
  bookingType: z.enum(ticketBookingTypes),
  market: z.enum(ticketMarkets),
  journeyType: z.enum(ticketJourneyTypes),
  departure: nullableString,
  arrival: nullableString,
  travelDate: nullableString,
  returnDate: nullableString.optional(),
  provider: nullableString,
  pnrOrConfirmation: nullableString,
  baseCost: nullableNumber.optional(),
  sellingPrice: nullableNumber,
  currency: nullableString,
  confidence: z.number().min(0).max(1),
  missingFields: z.array(z.string()),
  rawNotes: nullableString
});

export function getExtractionReviewStatus(extraction) {
  const requiredReviewFields = [
    "customerName",
    "bookingType",
    "market",
    "travelDate",
    "sellingPrice"
  ];

  const missingRequiredField = requiredReviewFields.some((field) => {
    const value = extraction[field];
    return value === null || value === undefined || value === "" || value === "unknown";
  });

  if (missingRequiredField || extraction.missingFields.length > 0) {
    return "needs_review";
  }

  return extraction.confidence >= 0.8 ? "ready_to_review" : "needs_review";
}
