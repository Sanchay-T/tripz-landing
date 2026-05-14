import { GoogleGenAI } from "@google/genai";
import {
  getExtractionReviewStatus,
  ticketExtractionSchema,
  ticketExtractionZodSchema
} from "./ticket-extraction-schema.js";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_LOCATION = "global";
const DEFAULT_PROJECT = "cyphersol-prod";

function getGeminiClient() {
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT || DEFAULT_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || DEFAULT_LOCATION,
    apiVersion: "v1"
  });
}

function parseGeminiJson(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text);
}

export async function extractTicketFromFile({ buffer, mimeType }) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("extractTicketFromFile requires a Buffer");
  }

  if (!mimeType) {
    throw new TypeError("extractTicketFromFile requires a MIME type");
  }

  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: process.env.TRIPZ_GEMINI_MODEL || DEFAULT_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Extract travel booking fields from this document. Use null for unavailable values. Do not infer prices, dates, routes, passenger names, or confirmation numbers that are not visible."
          },
          {
            inlineData: {
              mimeType,
              data: buffer.toString("base64")
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ticketExtractionSchema,
      temperature: 0
    }
  });

  const rawJson = parseGeminiJson(response.text);
  const extraction = ticketExtractionZodSchema.parse(rawJson);

  return {
    extraction,
    rawJson,
    model: process.env.TRIPZ_GEMINI_MODEL || DEFAULT_MODEL,
    status: getExtractionReviewStatus(extraction),
    usageMetadata: response.usageMetadata ?? null
  };
}
