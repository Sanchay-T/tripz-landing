"use client";

import { cloneElement, useId } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Field({ label, children, hint }) {
  const id = useId();
  return <div className="grid gap-1.5">
    <Label className="font-mono text-xs uppercase tracking-widest text-ink/50" htmlFor={id}>{label}</Label>
    {cloneElement(children, { id })}
    {hint && <p className="text-xs leading-4 text-ink/45">{hint}</p>}
  </div>;
}

export function SelectField({ id, value, onChange, options, format = (item) => item }) {
  return <Select onValueChange={onChange} value={value}>
    <SelectTrigger className="w-full" id={id}><SelectValue /></SelectTrigger>
    <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{format(option)}</SelectItem>)}</SelectContent>
  </Select>;
}

export function inr(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function pretty(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { ...options, headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || "Request failed.");
  return payload;
}
