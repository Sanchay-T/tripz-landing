"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminButton, AdminCard, AdminTable, Notice, Panel } from "../components";
import { Field, SelectField, inr, jsonRequest } from "../operations-components";
import { expenseCategories } from "@/lib/operations";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const empty = () => ({ category: "Operations", customCategory: "", nameOrVendor: "", amount: "", expenseDate: today(), paymentStatus: "pending", notes: "" });

export default function ExpensesClient({ viewer }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState(empty), [editing, setEditing] = useState(null);
  const [query, setQuery] = useState(""), [error, setError] = useState(""), [saving, setSaving] = useState(false), [usedCategories, setUsedCategories] = useState([]);
  const load = useCallback(async () => { try { const data = await jsonRequest("/api/admin/expenses"); setRows(data.rows); setUsedCategories(data.categories); setError(""); } catch (cause) { setError(cause.message); } }, []);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);
  const filtered = useMemo(() => rows.filter((row) => [row.name_or_vendor, row.category, row.notes].join(" ").toLowerCase().includes(query.toLowerCase())), [rows, query]);

  function edit(row) {
    setEditing(row.id); setForm({ category: row.category, customCategory: "", nameOrVendor: row.name_or_vendor, amount: row.amount, expenseDate: row.expense_date, paymentStatus: row.payment_status, notes: row.notes || "" });
  }
  async function remove(row) {
    if (!window.confirm(`Delete ${row.name_or_vendor}? This cannot be undone.`)) return;
    try { await jsonRequest(`/api/admin/expenses/${row.id}`, { method: "DELETE" }); toast.success("Expense deleted"); await load(); } catch (cause) { setError(cause.message); }
  }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError("");
    const payload = { ...form, category: form.category === "Other" ? form.customCategory : form.category };
    try { await jsonRequest(editing ? `/api/admin/expenses/${editing}` : "/api/admin/expenses", { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) }); toast.success(editing ? "Expense updated" : "Expense added"); setEditing(null); setForm(empty()); await load(); }
    catch (cause) { setError(cause.message); } finally { setSaving(false); }
  }
  const columns = [
    { key: "name_or_vendor", label: "Vendor / expense" }, { key: "category", label: "Category" }, { key: "expense_date", label: "Date" },
    { key: "amount", label: "Amount", numeric: true, render: (row) => inr(row.amount) }, { key: "payment_status", label: "Status" }, { key: "notes", label: "Notes" },
    ...(!viewer ? [{ key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><AdminButton tone="ghost" onClick={() => edit(row)}>Edit</AdminButton><AdminButton tone="ghost" onClick={() => remove(row)}>Delete</AdminButton></div> }] : [])
  ];

  return <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
    {!viewer && <Panel title={editing ? "Edit expense" : "Add expense"}><form className="grid gap-4" onSubmit={submit}>
      <Field label="Category"><SelectField value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={[...new Set([...expenseCategories, ...usedCategories])]} /></Field>
      {form.category === "Other" && <Field label="Custom category"><Input required value={form.customCategory} onChange={(event) => setForm({ ...form, customCategory: event.target.value })} /></Field>}
      <Field label="Vendor or expense"><Input required value={form.nameOrVendor} onChange={(event) => setForm({ ...form, nameOrVendor: event.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Amount"><Input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></Field><Field label="Date"><Input required type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} /></Field></div>
      <Field label="Payment status"><SelectField value={form.paymentStatus} onChange={(value) => setForm({ ...form, paymentStatus: value })} options={["pending", "paid"]} /></Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
      <div className="flex gap-2"><AdminButton disabled={saving} type="submit">{saving ? "Saving…" : editing ? "Save changes" : "Add expense"}</AdminButton>{editing && <AdminButton tone="light" type="button" onClick={() => { setEditing(null); setForm(empty()); }}>Cancel</AdminButton>}</div>
    </form></Panel>}
    <div className={`min-w-0 ${viewer ? "lg:col-span-3" : "lg:col-span-2"}`}>{error && <Notice tone="critical">{error}</Notice>}<AdminCard className="mt-4 first:mt-0"><div className="p-4"><Input aria-label="Search expenses" placeholder="Search expenses" value={query} onChange={(event) => setQuery(event.target.value)} /></div><AdminTable columns={columns} rows={filtered} /></AdminCard></div>
  </div>;
}
