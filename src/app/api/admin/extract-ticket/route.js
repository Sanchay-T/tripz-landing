import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

import { getDb } from "@/lib/db";
import { buildManualExtraction, isAiExtractionEnabled } from "@/lib/manual-extraction";

import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// Ticket files live in Vercel Blob rather than Supabase Storage. `booking_documents.file_url`
// now holds the returned blob URL instead of a bucket-relative path, which is a
// superset of what it held before - the value is still opaque to every reader.
function getStoragePath(fileName) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `ticket-intake/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
}

export async function POST(request) {
  // Real session check. The proxy only sees that a cookie exists; it runs on the
  // edge and cannot ask Postgres whether that cookie is still valid.
  const gate = await requireWrite();
  if (gate.response) return gate.response;


  let extractionId = null;
  const sql = getDb();

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
    const mimeType = file.type || "application/octet-stream";

    const blob = await put(getStoragePath(file.name), buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false
    });

    // The document and its extraction row are created together: an uploaded file with
    // no extraction row is invisible to the intake queue and effectively lost.
    const { documentId, id } = await sql.begin(async (tx) => {
      const [document] = await tx`
        insert into booking_documents ${tx({
          document_type: "unknown",
          file_url: blob.url,
          file_name: file.name,
          mime_type: mimeType,
          status: "uploaded"
        })}
        returning id
      `;

      const [extraction] = await tx`
        insert into ticket_extractions ${tx({
          document_id: document.id,
          status: "extracting",
          model: isAiExtractionEnabled()
            ? process.env.TRIPZ_ANTHROPIC_MODEL || "claude-haiku-4-5-20251001"
            : "manual"
        })}
        returning id
      `;

      return { documentId: document.id, id: extraction.id };
    });

    extractionId = id;

    // Automatic extraction is off: no model is called and no AI SDK is installed.
    // The file is still stored and queued, and the reviewer types the booking details
    // in. `buildManualExtraction` returns the same shape a model would have, so the
    // review form, validation and status derivation are all unchanged.
    const result = buildManualExtraction();

    await sql.begin(async (tx) => {
      await tx`
        update ticket_extractions
        set status = ${result.status},
            raw_response = ${tx.json(result.rawJson)},
            normalized_json = ${tx.json(result.extraction)},
            confidence = ${result.extraction.confidence},
            model = ${result.model}
        where id = ${extractionId}
      `;
      await tx`
        update booking_documents
        set document_type = ${result.extraction.documentType}, status = 'uploaded'
        where id = ${documentId}
      `;
    });

    return NextResponse.json({
      fileName: file.name,
      documentId,
      extractionId,
      storagePath: blob.url,
      ...result
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    if (extractionId) {
      // Best effort: if the database is what failed, this will fail too, and the
      // original error is the one worth returning.
      try {
        await sql`
          update ticket_extractions
          set status = 'failed', error_message = ${detail}
          where id = ${extractionId}
        `;
      } catch {
        // swallowed deliberately - see above
      }
    }

    return NextResponse.json(
      { error: "Ticket extraction failed.", detail },
      { status: 500 }
    );
  }
}
