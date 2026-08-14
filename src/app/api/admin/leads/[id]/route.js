import { NextResponse } from "next/server";

import { failed, invalid, missing } from "@/lib/api-utils";
import { getDb } from "@/lib/db";
import { idSchema, leadSchema } from "@/lib/operations";
import { requireWrite } from "@/lib/require-session";

export const runtime = "nodejs";
async function parseId(params) { return idSchema.parse({ id: (await params).id }).id; }

export async function PATCH(request, { params }) {
  const gate = await requireWrite(); if (gate.response) return gate.response;
  let id, input; try { id=await parseId(params); input=leadSchema.parse(await request.json()); } catch (error) { return invalid(error); }
  try {
    const sql=getDb(); const [row]=await sql`
      update leads set name=${input.name}, company=${input.company}, location=${input.location}, mobile_number=${input.mobileNumber},
        email=${input.email}, designation=${input.designation}, campaign_name=${input.campaignName}, remarks=${input.remarks},
        follow_up_date=${input.followUpDate}, status=${input.status}, updated_at=now() where id=${id} returning *
    `;
    return row ? NextResponse.json({row}) : missing("Lead");
  } catch (error) { return failed("Could not update lead.", error); }
}

export async function DELETE(_request,{params}) {
  const gate=await requireWrite(); if(gate.response)return gate.response;
  let id; try{id=await parseId(params);}catch(error){return invalid(error);}
  try{const sql=getDb();const rows=await sql`delete from leads where id=${id} returning id`;return rows.length?NextResponse.json({deleted:id}):missing("Lead");}
  catch(error){return failed("Could not delete lead.",error);}
}
