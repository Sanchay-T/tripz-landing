import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { reconciliationEntry, reconciliationSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function POST(request) {
  const gate = await requireWrite(); if (gate.response) return gate.response;
  let input; try { input = reconciliationSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const result = await sql.begin(async (tx) => {
      const [account] = await tx`select * from finance_accounts where id=${input.accountId} for update`;
      if (!account) return null;
      const [{ delta }] = await tx`
        select coalesce(sum(case when transaction_type in ('cash_out','reconciliation_debit') then -amount else amount end),0) as delta
        from finance_transactions where account_id=${input.accountId}
      `;
      const currentBalance = Number(account.opening_balance) + Number(delta);
      const entry = reconciliationEntry(currentBalance, input.actualBalance);
      if (!entry) return { row: null, currentBalance, balance: currentBalance };
      const [row] = await tx`
        insert into finance_transactions (account_id, transaction_type, amount, transaction_date, description)
        values (${input.accountId}, ${entry.transactionType}, ${entry.amount}, ${input.transactionDate}, ${input.description}) returning *
      `;
      return { row, currentBalance, balance: input.actualBalance };
    });
    return result ? NextResponse.json(result) : missing("Finance account");
  } catch (error) { return failed("Could not reconcile finance account.", error); }
}
