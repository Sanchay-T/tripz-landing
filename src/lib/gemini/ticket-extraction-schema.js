import { Type } from "@google/genai";
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

export const ticketExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      enum: ticketDocumentTypes
    },
    customerName: { type: Type.STRING, nullable: true },
    mobileNumber: { type: Type.STRING, nullable: true },
    email: { type: Type.STRING, nullable: true },
    bookingType: {
      type: Type.STRING,
      enum: ticketBookingTypes
    },
    market: {
      type: Type.STRING,
      enum: ticketMarkets
    },
    journeyType: {
      type: Type.STRING,
      enum: ticketJourneyTypes
    },
    departure: { type: Type.STRING, nullable: true },
    arrival: { type: Type.STRING, nullable: true },
    travelDate: { type: Type.STRING, nullable: true },
    returnDate: { type: Type.STRING, nullable: true },
    provider: { type: Type.STRING, nullable: true },
    pnrOrConfirmation: { type: Type.STRING, nullable: true },
    baseCost: { type: Type.NUMBER, nullable: true },
    sellingPrice: { type: Type.NUMBER, nullable: true },
    currency: { type: Type.STRING, nullable: true },
    confidence: { type: Type.NUMBER },
    missingFields: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    rawNotes: { type: Type.STRING, nullable: true }
  },
  required: [
    "documentType",
    "customerName",
    "bookingType",
    "market",
    "journeyType",
    "departure",
    "arrival",
    "travelDate",
    "provider",
    "pnrOrConfirmation",
    "sellingPrice",
    "currency",
    "confidence",
    "missingFields",
    "rawNotes"
  ],
  propertyOrdering: [
    "documentType",
    "customerName",
    "mobileNumber",
    "email",
    "bookingType",
    "market",
    "journeyType",
    "departure",
    "arrival",
    "travelDate",
    "returnDate",
    "provider",
    "pnrOrConfirmation",
    "baseCost",
    "sellingPrice",
    "currency",
    "confidence",
    "missingFields",
    "rawNotes"
  ]
};

export const anthropicTicketExtractionInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    documentType: {
      type: "string",
      enum: ticketDocumentTypes
    },
    customerName: { type: ["string", "null"] },
    mobileNumber: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    bookingType: {
      type: "string",
      enum: ticketBookingTypes
    },
    market: {
      type: "string",
      enum: ticketMarkets
    },
    journeyType: {
      type: "string",
      enum: ticketJourneyTypes
    },
    departure: { type: ["string", "null"] },
    arrival: { type: ["string", "null"] },
    travelDate: { type: ["string", "null"] },
    returnDate: { type: ["string", "null"] },
    provider: { type: ["string", "null"] },
    pnrOrConfirmation: { type: ["string", "null"] },
    baseCost: { type: ["number", "null"] },
    sellingPrice: { type: ["number", "null"] },
    currency: { type: ["string", "null"] },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    missingFields: {
      type: "array",
      items: { type: "string" }
    },
    rawNotes: { type: ["string", "null"] }
  },
  required: [
    "documentType",
    "customerName",
    "mobileNumber",
    "email",
    "bookingType",
    "market",
    "journeyType",
    "departure",
    "arrival",
    "travelDate",
    "returnDate",
    "provider",
    "pnrOrConfirmation",
    "baseCost",
    "sellingPrice",
    "currency",
    "confidence",
    "missingFields",
    "rawNotes"
  ]
};

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
