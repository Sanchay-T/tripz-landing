import { NextResponse } from "next/server";

import { failed, invalid } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { financeAccountSchema } from "@/lib/operations";
import { requireSession, requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requireSession();
  if (gate.response) return gate.response;
  try {
    const sql = getDb();
    const rows = await sql`
      select a.*,
        a.opening_balance + coalesce(sum(case
          when t.transaction_type in ('cash_out','reconciliation_debit') then -t.amount else t.amount end), 0) as balance,
        count(t.id)::int as transaction_count
      from finance_accounts a left join finance_transactions t on t.account_id=a.id
      group by a.id order by a.account_type, a.name
    `;
    return NextResponse.json({ rows, totalBalance: rows.reduce((sum, row) => sum + Number(row.balance), 0) });
  } catch (error) {
    return failed("Could not load finance accounts.", error);
  }
}

export async function POST(request) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let input;
  try { input = financeAccountSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [row] = await sql`
      insert into finance_accounts (name, account_type, opening_balance, is_active)
      values (${input.name}, ${input.accountType}, ${input.openingBalance}, ${input.isActive}) returning *
    `;
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) {
    return failed("Could not create finance account.", error);
  }
}
