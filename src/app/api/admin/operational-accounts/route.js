import { NextResponse } from "next/server";

import { failed, invalid } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { operationalAccountSchema } from "@/lib/operations";
import { requireSession, requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";

export async function GET(request) {
  const gate=await requireSession(); if(gate.response)return gate.response;
  const q=(new URL(request.url).searchParams.get("q")||"").trim();
  try{
    const sql=getDb();
    const rows=q
      ? await sql`select * from operational_accounts where service_name ilike ${`%${q}%`} or login_id ilike ${`%${q}%`} or owner_name ilike ${`%${q}%`} order by service_name limit 500`
      : await sql`select * from operational_accounts order by service_name limit 500`;
    return NextResponse.json({rows});
  }catch(error){return failed("Could not load account directory.",error);}
}

export async function POST(request){
  const gate=await requireWrite();if(gate.response)return gate.response;
  let input;try{input=operationalAccountSchema.parse(await request.json());}catch(error){return invalid(error);}
  try{const sql=getDb();const [row]=await sql`
    insert into operational_accounts(service_name,login_id,owner_name,login_url,password_manager_reference,notes)
    values(${input.serviceName},${input.loginId},${input.ownerName},${input.loginUrl},${input.passwordManagerReference},${input.notes}) returning *
  `;return NextResponse.json({row},{status:201});}catch(error){return failed("Could not create directory entry.",error);}
}
