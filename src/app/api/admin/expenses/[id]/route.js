import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { expenseSchema, idSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

async function recordId(params) {
  return idSchema.parse({ id: (await params).id }).id;
}

export async function PATCH(request, { params }) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let id, input;
  try {
    id = await recordId(params);
    input = expenseSchema.parse(await request.json());
  } catch (error) {
    return invalid(error);
  }
  try {
    const sql = getDb();
    const [row] = await sql`
      update expenses set category=${input.category}, name_or_vendor=${input.nameOrVendor}, amount=${input.amount},
        expense_date=${input.expenseDate}, payment_status=${input.paymentStatus}, notes=${input.notes}, updated_at=now()
      where id=${id} returning *
    `;
    return row ? NextResponse.json({ row }) : missing("Expense");
  } catch (error) {
    return failed("Could not update expense.", error);
  }
}

export async function DELETE(_request, { params }) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let id;
  try { id = await recordId(params); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const rows = await sql`delete from expenses where id=${id} returning id`;
    return rows.length ? NextResponse.json({ deleted: id }) : missing("Expense");
  } catch (error) {
    return failed("Could not delete expense.", error);
  }
}
