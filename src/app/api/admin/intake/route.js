import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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
    const sql = getDb();

    // One query with a join, where PostgREST needed two round trips plus an
    // id-to-document map assembled by hand in JS.
    const rows = await sql`
      select e.id, e.document_id, e.status, e.confidence, e.normalized_json,
             e.error_message, e.created_at,
             d.file_name, d.document_type, d.file_url, d.mime_type, d.uploaded_at
      from ticket_extractions e
      left join booking_documents d on d.id = e.document_id
      order by e.created_at desc
      limit 50
    `;

    return NextResponse.json({
      rows: rows.map((row) => {
        const extraction = row.normalized_json ?? {};

        return {
          id: row.id,
          extractionId: row.id,
          documentId: row.document_id,
          fileName: row.file_name ?? "Uploaded ticket",
          documentType: extraction.documentType ?? row.document_type ?? "unknown",
          customerName: extraction.customerName || row.error_message || "Needs review",
          route: formatRoute(extraction),
          status: row.status,
          confidence: Number(row.confidence ?? extraction.confidence ?? 0),
          extraction,
          storagePath: row.file_url ?? null,
          uploadedAt: row.uploaded_at ?? row.created_at
        };
      })
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not load intake rows.",
        // Name the real cause. This used to collapse to "Unknown error", which meant
        // an unreachable database looked identical to an empty one for weeks.
        detail: error instanceof Error ? error.message : String(error)
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

    const sql = getDb();

    if (action === "save_document") {
      const extraction = ticketExtractionZodSchema.parse({
        ...body.extraction,
        baseCost: toNumberOrNull(body.extraction?.baseCost),
        sellingPrice: toNumberOrNull(body.extraction?.sellingPrice),
        confidence: Number(body.extraction?.confidence ?? 0)
      });

      // Both updates in one transaction. Two separate calls could leave the
      // extraction saved while the document row still said something else.
      await sql.begin(async (tx) => {
        await tx`
          update ticket_extractions
          set status = 'needs_review',
              normalized_json = ${sql.json(extraction)},
              confidence = ${extraction.confidence},
              raw_response = ${sql.json(extraction)}
          where id = ${extractionId}
        `;
        await tx`
          update booking_documents
          set document_type = ${extraction.documentType},
              status = 'uploaded',
              notes = 'Document saved without creating a booking.'
          where id = ${documentId}
        `;
      });

      return NextResponse.json({ status: "needs_review", extraction });
    }

    if (action === "mark_failed") {
      const reason = body.reason || "Marked failed during manual review.";

      await sql.begin(async (tx) => {
        await tx`
          update ticket_extractions
          set status = 'failed', error_message = ${reason}
          where id = ${extractionId}
        `;
        await tx`
          update booking_documents
          set status = 'uploaded', notes = ${reason}
          where id = ${documentId}
        `;
      });

      return NextResponse.json({ status: "failed", reason });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not update intake row.",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
