import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { buildBookingCode, buildCustomerCode, toNumberOrNull } from "@/lib/admin/records";
import { ticketExtractionZodSchema } from "@/lib/gemini/ticket-extraction-schema";

export const runtime = "nodejs";

function normalizeDate(value) {
  return value || null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const extractionId = body.extractionId;
    const documentId = body.documentId;
    const extraction = ticketExtractionZodSchema.parse({
      ...body.extraction,
      baseCost: toNumberOrNull(body.extraction?.baseCost),
      sellingPrice: toNumberOrNull(body.extraction?.sellingPrice),
      confidence: Number(body.extraction?.confidence ?? 0)
    });

    if (!extractionId || !documentId) {
      return NextResponse.json(
        { error: "extractionId and documentId are required." },
        { status: 400 }
      );
    }

    if (!extraction.customerName) {
      return NextResponse.json(
        { error: "Customer name is required before confirmation." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    const customerInsert = await supabase
      .from("customers")
      .insert({
        customer_code: buildCustomerCode(),
        name: extraction.customerName,
        mobile_number: extraction.mobileNumber,
        email: extraction.email,
        location: extraction.departure,
        source: "ticket_upload",
        remarks: extraction.rawNotes
      })
      .select("id, name")
      .single();

    if (customerInsert.error) {
      throw customerInsert.error;
    }

    const bookingInsert = await supabase
      .from("bookings")
      .insert({
        booking_code: buildBookingCode(),
        customer_id: customerInsert.data.id,
        booking_type: extraction.bookingType,
        market: extraction.market,
        journey_type: extraction.journeyType,
        departure: extraction.departure,
        arrival: extraction.arrival,
        travel_date: normalizeDate(extraction.travelDate),
        return_date: normalizeDate(extraction.returnDate),
        pnr_or_confirmation: extraction.pnrOrConfirmation,
        base_cost: extraction.baseCost,
        selling_price: extraction.sellingPrice,
        payment_status: "unpaid",
        booking_status: extraction.documentType === "boarding_pass" ? "in_travel" : "ticketed",
        notes: extraction.rawNotes
      })
      .select("id, booking_code")
      .single();

    if (bookingInsert.error) {
      throw bookingInsert.error;
    }

    await supabase
      .from("booking_documents")
      .update({
        booking_id: bookingInsert.data.id,
        customer_id: customerInsert.data.id,
        document_type: extraction.documentType,
        status: "verified",
        verified_at: new Date().toISOString()
      })
      .eq("id", documentId);

    await supabase
      .from("ticket_extractions")
      .update({
        status: "saved",
        normalized_json: extraction,
        reviewed_at: new Date().toISOString(),
        created_booking_id: bookingInsert.data.id
      })
      .eq("id", extractionId);

    const dueAt = extraction.travelDate
      ? new Date(`${extraction.travelDate}T09:00:00.000Z`)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const tasks = [
      {
        booking_id: bookingInsert.data.id,
        customer_id: customerInsert.data.id,
        task_type: "24-hour travel reminder",
        priority: "high",
        status: "open",
        due_at: dueAt.toISOString(),
        description: `Send travel reminder for ${extraction.customerName}.`
      },
      {
        booking_id: bookingInsert.data.id,
        customer_id: customerInsert.data.id,
        task_type: "payment follow-up",
        priority: "normal",
        status: "open",
        due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        description: `Confirm payment status for ${bookingInsert.data.booking_code}.`
      }
    ];

    if (extraction.bookingType === "flight") {
      tasks.push({
        booking_id: bookingInsert.data.id,
        customer_id: customerInsert.data.id,
        task_type: "upload boarding pass",
        priority: "high",
        status: "open",
        due_at: dueAt.toISOString(),
        description: "Upload and verify boarding pass before travel."
      });
    }

    const taskInsert = await supabase.from("tasks").insert(tasks);

    if (taskInsert.error) {
      throw taskInsert.error;
    }

    return NextResponse.json({
      customer: customerInsert.data,
      booking: bookingInsert.data,
      tasksCreated: tasks.length
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not confirm extraction.",
        detail: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
