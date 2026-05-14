import Anthropic from "@anthropic-ai/sdk";
import {
  anthropicTicketExtractionInputSchema,
  getExtractionReviewStatus,
  ticketExtractionZodSchema
} from "../gemini/ticket-extraction-schema.js";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

function getDocumentContentBlock({ buffer, mimeType }) {
  const data = buffer.toString("base64");

  if (mimeType === "application/pdf") {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data
      }
    };
  }

  if (["image/png", "image/jpeg", "image/gif", "image/webp"].includes(mimeType)) {
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType,
        data
      }
    };
  }

  throw new Error(`Unsupported ticket MIME type for Claude extraction: ${mimeType}`);
}

function findExtractionToolUse(content) {
  return content.find((block) => block.type === "tool_use" && block.name === "extract_ticket");
}

export async function extractTicketFromFile({ buffer, mimeType }) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("extractTicketFromFile requires a Buffer");
  }

  if (!mimeType) {
    throw new TypeError("extractTicketFromFile requires a MIME type");
  }

  const client = getAnthropicClient();
  const model = process.env.TRIPZ_ANTHROPIC_MODEL || DEFAULT_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    temperature: 0,
    tools: [
      {
        name: "extract_ticket",
        description:
          "Extract normalized travel booking fields from a flight ticket, hotel voucher, boarding pass, invoice, or payment receipt.",
        input_schema: anthropicTicketExtractionInputSchema
      }
    ],
    tool_choice: {
      type: "tool",
      name: "extract_ticket"
    },
    messages: [
      {
        role: "user",
        content: [
          getDocumentContentBlock({ buffer, mimeType }),
          {
            type: "text",
            text:
              "Extract only fields visibly present in this travel document. Use null for unavailable values. Do not infer prices, dates, routes, passenger names, email, phone, or confirmation numbers that are not visible."
          }
        ]
      }
    ]
  });

  const toolUse = findExtractionToolUse(response.content);

  if (!toolUse) {
    throw new Error("Claude did not return the required extract_ticket tool call");
  }

  const rawJson = toolUse.input;
  const extraction = ticketExtractionZodSchema.parse(rawJson);

  return {
    extraction,
    rawJson,
    model,
    status: getExtractionReviewStatus(extraction),
    usageMetadata: response.usage ?? null
  };
}
