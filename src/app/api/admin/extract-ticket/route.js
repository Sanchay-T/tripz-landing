import { NextResponse } from "next/server";
import { extractTicketFromFile } from "@/lib/anthropic/ticket-extraction";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const STORAGE_BUCKET = "tripz-documents";

function getStoragePath(fileName) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `ticket-intake/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
}

export async function POST(request) {
  let extractionId = null;
  let documentId = null;
  const supabase = createSupabaseServiceClient();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Upload a ticket file using the `file` field." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Ticket file must be 8 MB or smaller." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = getStoragePath(file.name);
    const mimeType = file.type || "application/octet-stream";

    const upload = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (upload.error) {
      throw upload.error;
    }

    const documentInsert = await supabase
      .from("booking_documents")
      .insert({
        document_type: "unknown",
        file_url: storagePath,
        file_name: file.name,
        mime_type: mimeType,
        status: "uploaded"
      })
      .select("id")
      .single();

    if (documentInsert.error) {
      throw documentInsert.error;
    }

    documentId = documentInsert.data.id;

    const extractionInsert = await supabase
      .from("ticket_extractions")
      .insert({
        document_id: documentId,
        status: "extracting",
        model: process.env.TRIPZ_ANTHROPIC_MODEL || "claude-haiku-4-5-20251001"
      })
      .select("id")
      .single();

    if (extractionInsert.error) {
      throw extractionInsert.error;
    }

    extractionId = extractionInsert.data.id;

    const result = await extractTicketFromFile({
      buffer,
      mimeType
    });

    const updateExtraction = await supabase
      .from("ticket_extractions")
      .update({
        status: result.status,
        raw_response: result.rawJson,
        normalized_json: result.extraction,
        confidence: result.extraction.confidence,
        model: result.model
      })
      .eq("id", extractionId);

    if (updateExtraction.error) {
      throw updateExtraction.error;
    }

    await supabase
      .from("booking_documents")
      .update({
        document_type: result.extraction.documentType,
        status: "uploaded"
      })
      .eq("id", documentId);

    return NextResponse.json({
      fileName: file.name,
      documentId,
      extractionId,
      storagePath,
      ...result
    });
  } catch (error) {
    if (extractionId) {
      await supabase
        .from("ticket_extractions")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error"
        })
        .eq("id", extractionId);
    }

    return NextResponse.json(
      {
        error: "Ticket extraction failed.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
