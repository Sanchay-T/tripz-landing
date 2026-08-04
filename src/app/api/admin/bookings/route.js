import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { buildBookingCode, buildCustomerCode, toNumberOrNull } from "@/lib/admin/records";
import {
  ticketBookingTypes,
  ticketJourneyTypes,
  ticketMarkets
} from "@/lib/booking-extraction-schema";

export const runtime = "nodejs";

/**
 * Create a booking directly, without a ticket file.
 *
 * The only way to add data used to be the upload flow: attach a document, wait, then
 * review and confirm. Most bookings are typed from a screen or a phone call, and
 * inventing a file to attach just to record one is friction that stops the numbers
 * being kept up to date - and a margin dashboard is worth exactly as much as the data
 * behind it is current.
 *
 * Margin is not accepted from the client and never will be: `bookings.margin` is a
 * generated column, so entering cost and price is what derives it. That is the whole
 * point - the figure cannot drift from the prices.
 */

// Optional first, then normalise: a field the caller omitted entirely, sent as null,
// or sent as an empty string all mean the same thing here, and all become null. The
// earlier version listed z.undefined() inside the union, which Zod still treats as a
// required key, so omitting `email` or `returnDate` was rejected.
const nullableText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    const trimmed = typeof value === "string" ? value.trim() : "";
    return trimmed === "" ? null : trimmed;
  });

const bookingInputSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required"),
  mobileNumber: nullableText,
  email: nullableText,
  bookingType: z.enum(ticketBookingTypes),
  market: z.enum(ticketMarkets),
  journeyType: z.enum(ticketJourneyTypes),
  departure: nullableText,
  arrival: nullableText,
  travelDate: nullableText,
  returnDate: nullableText,
  pnrOrConfirmation: nullableText,
  provider: nullableText,
  baseCost: z.number().nonnegative().nullable(),
  sellingPrice: z.number().nonnegative().nullable(),
  paymentStatus: z.enum(["unpaid", "partial", "paid", "refunded", "cancelled"]),
  bookingStatus: z.enum([
    "draft",
    "quoted",
    "confirmed",
    "ticketed",
    "in_travel",
    "completed",
    "cancelled"
  ]),
  isInternal: z.boolean().optional().default(false),
  notes: nullableText
});

export async function POST(request) {
  try {
    const body = await request.json();

    let input;
    try {
      input = bookingInputSchema.parse({
        ...body,
        baseCost: toNumberOrNull(body.baseCost),
        sellingPrice: toNumberOrNull(body.sellingPrice)
      });
    } catch (validationError) {
      return NextResponse.json(
        {
          error: "Booking details are not valid.",
          detail: validationError?.issues
            ? validationError.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")
            : String(validationError)
        },
        { status: 400 }
      );
    }

    // Selling below cost is allowed - an agency really does discount to win a package -
    // but it is worth saying out loud rather than silently recording a negative margin.
    const soldBelowCost =
      input.baseCost !== null &&
      input.sellingPrice !== null &&
      input.sellingPrice < input.baseCost;

    const sql = getDb();

    const result = await sql.begin(async (tx) => {
      // Same dedupe rule as the ticket flow: one customer per mobile number.
      let customer = null;
      if (input.mobileNumber) {
        const [existing] = await tx`
          select id, name from customers where mobile_number = ${input.mobileNumber} limit 1
        `;
        customer = existing ?? null;
      }

      if (!customer) {
        [customer] = await tx`
          insert into customers ${tx({
            customer_code: buildCustomerCode(),
            name: input.customerName,
            mobile_number: input.mobileNumber,
            email: input.email,
            location: input.departure,
            source: "manual",
            is_internal: input.isInternal
          })}
          returning id, name
        `;
      } else if (input.isInternal) {
        // Flagging an existing customer as internal is a correction worth honouring.
        await tx`update customers set is_internal = true where id = ${customer.id}`;
      }

      let providerId = null;
      if (input.provider) {
        const [existingProvider] = await tx`
          select id from providers where lower(name) = lower(${input.provider}) limit 1
        `;
        if (existingProvider) {
          providerId = existingProvider.id;
        } else {
          const [created] = await tx`
            insert into providers ${tx({
              name: input.provider,
              type:
                input.bookingType === "hotel"
                  ? "hotel"
                  : input.bookingType === "flight"
                    ? "airline"
                    : "vendor",
              is_active: true
            })}
            returning id
          `;
          providerId = created.id;
        }
      }

      const [booking] = await tx`
        insert into bookings ${tx({
          booking_code: buildBookingCode(),
          customer_id: customer.id,
          booking_type: input.bookingType,
          market: input.market,
          journey_type: input.journeyType,
          departure: input.departure,
          arrival: input.arrival,
          travel_date: input.travelDate,
          return_date: input.returnDate,
          provider_id: providerId,
          pnr_or_confirmation: input.pnrOrConfirmation,
          // margin is derived by the database from these two.
          base_cost: input.baseCost,
          selling_price: input.sellingPrice,
          payment_status: input.paymentStatus,
          booking_status: input.bookingStatus,
          notes: input.notes
        })}
        returning id, booking_code, margin, selling_price
      `;

      return { customer, booking };
    });

    return NextResponse.json({
      booking: result.booking,
      customer: result.customer,
      // Returned so the form can show what the database derived, rather than the UI
      // recomputing it and risking a different answer.
      margin: Number(result.booking.margin ?? 0),
      warning: soldBelowCost
        ? "Selling price is below base cost, so this booking records a negative margin."
        : null
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not create the booking.",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
