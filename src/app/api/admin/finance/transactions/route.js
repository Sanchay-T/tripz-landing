import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { financeTransactionSchema, financeTransactionsQuerySchema } from "@/lib/operations";
import { requireSession, requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function GET(request) {
  const gate = await requireSession();
  if (gate.response) return gate.response;
  let accountId;
  try {
    accountId = financeTransactionsQuerySchema.parse({
      accountId: new URL(request.url).searchParams.get("accountId") || ""
    }).accountId;
  } catch (error) {
    return invalid(error);
  }
  try {
    const sql = getDb();
    const rows = accountId
      ? await sql`select t.*, a.name as account_name from finance_transactions t join finance_accounts a on a.id=t.account_id where t.account_id=${accountId} order by t.transaction_date desc, t.created_at desc limit 500`
      : await sql`select t.*, a.name as account_name from finance_transactions t join finance_accounts a on a.id=t.account_id order by t.transaction_date desc, t.created_at desc limit 500`;
    return NextResponse.json({ rows });
  } catch (error) { return failed("Could not load finance transactions.", error); }
}

export async function POST(request) {
  const gate = await requireWrite();
  if (gate.response) return gate.response;
  let input;
  try { input = financeTransactionSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [account] = await sql`select id from finance_accounts where id=${input.accountId}`;
    if (!account) return missing("Finance account");
    const [row] = await sql`
      insert into finance_transactions (account_id, transaction_type, amount, transaction_date, description, reference)
      values (${input.accountId}, ${input.transactionType}, ${input.amount}, ${input.transactionDate}, ${input.description}, ${input.reference}) returning *
    `;
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) { return failed("Could not create finance transaction.", error); }
}
