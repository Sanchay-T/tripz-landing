import { NextResponse } from "next/server";

import { conflict, failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { financeAccountSchema, idSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

async function parseId(params) { return idSchema.parse({ id: (await params).id }).id; }

export async function PATCH(request, { params }) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let id, input;
  try { id = await parseId(params); input = financeAccountSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [{ count }] = await sql`select count(*)::int as count from finance_transactions where account_id=${id}`;
    const [existing] = await sql`select opening_balance from finance_accounts where id=${id}`;
    if (!existing) return missing("Finance account");
    if (count > 0 && Number(existing.opening_balance) !== input.openingBalance) {
      return conflict("Opening balance cannot change after transactions exist. Use reconciliation instead.");
    }
    const [row] = await sql`
      update finance_accounts set name=${input.name}, account_type=${input.accountType}, opening_balance=${input.openingBalance},
        is_active=${input.isActive}, updated_at=now() where id=${id} returning *
    `;
    return NextResponse.json({ row });
  } catch (error) { return failed("Could not update finance account.", error); }
}

export async function DELETE(_request, { params }) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let id;
  try { id = await parseId(params); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [{ count }] = await sql`select count(*)::int as count from finance_transactions where account_id=${id}`;
    if (count > 0) return conflict("Delete this account's transactions before deleting the account.");
    const rows = await sql`delete from finance_accounts where id=${id} returning id`;
    return rows.length ? NextResponse.json({ deleted: id }) : missing("Finance account");
  } catch (error) { return failed("Could not delete finance account.", error); }
}
