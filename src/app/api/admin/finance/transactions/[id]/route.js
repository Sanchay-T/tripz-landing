import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { financeTransactionSchema, idSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";
async function parseId(params) { return idSchema.parse({ id: (await params).id }).id; }

export async function PATCH(request, { params }) {
  const gate = await requireWrite(); if (gate.response) return gate.response;
  let id, input;
  try { id = await parseId(params); input = financeTransactionSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [existing] = await sql`select transaction_type from finance_transactions where id=${id}`;
    if (!existing) return missing("Finance transaction");
    const [account] = await sql`select id from finance_accounts where id=${input.accountId}`;
    if (!account) return missing("Finance account");
    if (existing.transaction_type.startsWith("reconciliation_")) {
      return NextResponse.json({ error: "Reconciliation entries cannot be edited; delete and reconcile again." }, { status: 409 });
    }
    const [row] = await sql`
      update finance_transactions set account_id=${input.accountId}, transaction_type=${input.transactionType}, amount=${input.amount},
        transaction_date=${input.transactionDate}, description=${input.description}, reference=${input.reference}, updated_at=now()
      where id=${id} returning *
    `;
    return NextResponse.json({ row });
  } catch (error) { return failed("Could not update finance transaction.", error); }
}

export async function DELETE(_request, { params }) {
  const gate = await requireWrite(); if (gate.response) return gate.response;
  let id; try { id = await parseId(params); } catch (error) { return invalid(error); }
  try {
    const sql = getDb(); const rows = await sql`delete from finance_transactions where id=${id} returning id`;
    return rows.length ? NextResponse.json({ deleted: id }) : missing("Finance transaction");
  } catch (error) { return failed("Could not delete finance transaction.", error); }
}
