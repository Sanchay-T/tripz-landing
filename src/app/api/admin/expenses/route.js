import { NextResponse } from "next/server";

import { failed, invalid } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { expenseSchema } from "@/lib/operations";
import { requireSession, requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession();
  if (gate.response) return gate.response;
  try {
    const sql = getDb();
    const rows = await sql`select * from expenses order by expense_date desc, created_at desc limit 500`;
    const categories = await sql`select distinct category from expenses where category <> '' order by category`;
    return NextResponse.json({ rows, categories: categories.map((row) => row.category) });
  } catch (error) {
    return failed("Could not load expenses.", error);
  }
}

export async function POST(request) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let input;
  try {
    input = expenseSchema.parse(await request.json());
  } catch (error) {
    return invalid(error);
  }
  try {
    const sql = getDb();
    const [row] = await sql`
      insert into expenses (category, name_or_vendor, amount, expense_date, payment_status, notes)
      values (${input.category}, ${input.nameOrVendor}, ${input.amount}, ${input.expenseDate}, ${input.paymentStatus}, ${input.notes})
      returning *
    `;
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) {
    return failed("Could not create expense.", error);
  }
}
