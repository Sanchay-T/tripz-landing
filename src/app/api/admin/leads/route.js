import { NextResponse } from "next/server";

import { failed, invalid } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { followUpBucket, leadsQuerySchema, leadSchema } from "@/lib/operations";
import { requireSession, requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function GET(request) {
  const gate = await requireSession(); if (gate.response) return gate.response;
  const search = new URL(request.url).searchParams;
  let query;
  try {
    query = leadsQuerySchema.parse(Object.fromEntries(search.entries()));
  } catch (error) {
    return invalid(error);
  }
  const { status, followUp, page, limit } = query;
  const q = query.q.toLowerCase();
  const campaign = query.campaign.toLowerCase();
  const location = query.location.toLowerCase();
  try {
    const sql = getDb();
    const allRows = await sql`select * from leads order by follow_up_date asc nulls last, created_at desc limit 2000`;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const filtered = allRows.filter((row) => {
      const haystack = [row.name, row.company, row.mobile_number, row.email, row.designation, row.remarks].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (!status || row.status === status) &&
        (!campaign || (row.campaign_name || "").toLowerCase().includes(campaign)) &&
        (!location || (row.location || "").toLowerCase().includes(location)) &&
        (!followUp || followUpBucket(row.follow_up_date, today) === followUp);
    });
    const offset = (page - 1) * limit;
    return NextResponse.json({ rows: filtered.slice(offset, offset + limit), total: filtered.length, page, limit });
  } catch (error) { return failed("Could not load leads.", error); }
}

export async function POST(request) {
  const gate = await requireWrite(); if (gate.response) return gate.response;
  let input; try { input = leadSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql = getDb();
    const [row] = await sql`
      insert into leads (name, company, location, mobile_number, email, designation, campaign_name, remarks, follow_up_date, status)
      values (${input.name},${input.company},${input.location},${input.mobileNumber},${input.email},${input.designation},${input.campaignName},${input.remarks},${input.followUpDate},${input.status}) returning *
    `;
    return NextResponse.json({ row }, { status: 201 });
  } catch (error) { return failed("Could not create lead.", error); }
}
