import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { toNumberOrNull } from "@/lib/admin/records";
import { ticketExtractionZodSchema } from "@/lib/gemini/ticket-extraction-schema";

export const runtime = "nodejs";

function formatRoute(extraction) {
  const departure = extraction?.departure;
  const arrival = extraction?.arrival;

  if (departure && arrival) {
    return `${departure} -> ${arrival}`;
  }

  if (departure || arrival) {
    return departure || arrival;
  }

  return "Needs review";
}

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();

    const { data: extractions, error: extractionError } = await supabase
      .from("ticket_extractions")
      .select("id, document_id, status, confidence, normalized_json, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (extractionError) {
      throw extractionError;
    }

    const documentIds = [...new Set((extractions ?? []).map((row) => row.document_id).filter(Boolean))];
    const documentMap = new Map();

    if (documentIds.length) {
      const { data: documents, error: documentError } = await supabase
        .from("booking_documents")
        .select("id, file_name, document_type, file_url, mime_type, status, uploaded_at")
        .in("id", documentIds);

      if (documentError) {
        throw documentError;
      }

      for (const document of documents ?? []) {
        documentMap.set(document.id, document);
      }
    }

    const rows = (extractions ?? []).map((row) => {
      const document = documentMap.get(row.document_id);
      const extraction = row.normalized_json ?? {};

      return {
        id: row.id,
        extractionId: row.id,
        documentId: row.document_id,
        fileName: document?.file_name ?? "Uploaded ticket",
        documentType: extraction.documentType ?? document?.document_type ?? "unknown",
        customerName: extraction.customerName || row.error_message || "Needs review",
        route: formatRoute(extraction),
        status: row.status,
        confidence: Number(row.confidence ?? extraction.confidence ?? 0),
        extraction,
        storagePath: document?.file_url ?? null,
        uploadedAt: document?.uploaded_at ?? row.created_at
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not load intake rows.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { action, extractionId, documentId } = body;

    if (!action || !extractionId || !documentId) {
      return NextResponse.json(
        { error: "action, extractionId, and documentId are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    if (action === "save_document") {
      const extraction = ticketExtractionZodSchema.parse({
        ...body.extraction,
        baseCost: toNumberOrNull(body.extraction?.baseCost),
        sellingPrice: toNumberOrNull(body.extraction?.sellingPrice),
        confidence: Number(body.extraction?.confidence ?? 0)
      });

      const extractionUpdate = await supabase
        .from("ticket_extractions")
        .update({
          status: "needs_review",
          normalized_json: extraction,
          confidence: extraction.confidence,
          raw_response: extraction
        })
        .eq("id", extractionId);

      if (extractionUpdate.error) {
        throw extractionUpdate.error;
      }

      const documentUpdate = await supabase
        .from("booking_documents")
        .update({
          document_type: extraction.documentType,
          status: "uploaded",
          notes: "Document saved without creating a booking."
        })
        .eq("id", documentId);

      if (documentUpdate.error) {
        throw documentUpdate.error;
      }

      return NextResponse.json({ status: "needs_review", extraction });
    }

    if (action === "mark_failed") {
      const reason = body.reason || "Marked failed during manual review.";

      const extractionUpdate = await supabase
        .from("ticket_extractions")
        .update({
          status: "failed",
          error_message: reason
        })
        .eq("id", extractionId);

      if (extractionUpdate.error) {
        throw extractionUpdate.error;
      }

      const documentUpdate = await supabase
        .from("booking_documents")
        .update({
          status: "uploaded",
          notes: reason
        })
        .eq("id", documentId);

      if (documentUpdate.error) {
        throw documentUpdate.error;
      }

      return NextResponse.json({ status: "failed", reason });
    }

    return NextResponse.json(
      { error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not update intake row.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
