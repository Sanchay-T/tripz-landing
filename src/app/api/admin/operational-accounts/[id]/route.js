import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { idSchema, operationalAccountSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime="nodejs";
async function parseId(params){return idSchema.parse({id:(await params).id}).id;}

export async function PATCH(request,{params}){
  const gate=await requireWrite();if(gate.response)return gate.response;
  let id,input;try{id=await parseId(params);input=operationalAccountSchema.parse(await request.json());}catch(error){return invalid(error);}
  try{const sql=getDb();const [row]=await sql`
    update operational_accounts set service_name=${input.serviceName},login_id=${input.loginId},owner_name=${input.ownerName},
      login_url=${input.loginUrl},password_manager_reference=${input.passwordManagerReference},notes=${input.notes},updated_at=now()
    where id=${id} returning *
  `;return row?NextResponse.json({row}):missing("Directory entry");}catch(error){return failed("Could not update directory entry.",error);}
}

export async function DELETE(_request,{params}){
  const gate=await requireWrite();if(gate.response)return gate.response;
  let id;try{id=await parseId(params);}catch(error){return invalid(error);}
  try{const sql=getDb();const rows=await sql`delete from operational_accounts where id=${id} returning id`;return rows.length?NextResponse.json({deleted:id}):missing("Directory entry");}
  catch(error){return failed("Could not delete directory entry.",error);}
}
