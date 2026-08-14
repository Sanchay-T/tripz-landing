import { NextResponse } from "next/server";

import { validationMessage } from "@/lib/operations";

export function invalid(error) {
  return NextResponse.json({ error: "Request is not valid.", detail: validationMessage(error) }, { status: 400 });
}

export function missing(label = "Record") {
  return NextResponse.json({ error: `${label} was not found.` }, { status: 404 });
}

export function conflict(message) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function failed(label, error) {
  console.error(label, {
    name: error instanceof Error ? error.name : "UnknownError",
    code: typeof error?.code === "string" ? error.code : undefined
  });
  return NextResponse.json({ error: label }, { status: 500 });
}
