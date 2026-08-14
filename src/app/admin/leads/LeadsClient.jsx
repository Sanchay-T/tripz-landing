"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminBadge, AdminButton, AdminCard, AdminTable, Notice, Panel } from "../components";
import { Field, SelectField, jsonRequest, pretty } from "../operations-components";
import { followUpBucket, leadStatuses } from "@/lib/operations";

const empty = () => ({ name: "", company: "", location: "", mobileNumber: "", email: "", designation: "", campaignName: "", remarks: "", followUpDate: "", status: "new" });
const emptyFilters = { q: "", status: "all", campaign: "", location: "", followUp: "all" };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export default function LeadsClient({ viewer }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState(empty), [filters, setFilters] = useState(emptyFilters);
  const [editing, setEditing] = useState(null), [error, setError] = useState(""), [total, setTotal] = useState(0), [page, setPage] = useState(1);
  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" }); Object.entries(filters).forEach(([key, value]) => { if (value && value !== "all") params.set(key, value); });
      const data = await jsonRequest(`/api/admin/leads?${params}`); setRows(data.rows); setTotal(data.total); setError("");
    } catch (cause) { setError(cause.message); }
  }, [filters, page]);
  useEffect(() => { const timer = setTimeout(load, 150); return () => clearTimeout(timer); }, [load]);

  async function save(event) {
    event.preventDefault();
    try { await jsonRequest(editing ? `/api/admin/leads/${editing}` : "/api/admin/leads", { method: editing ? "PATCH" : "POST", body: JSON.stringify(form) }); toast.success(editing ? "Lead updated" : "Lead added"); setEditing(null); setForm(empty()); await load(); }
    catch (cause) { setError(cause.message); }
  }
  function edit(row) { setEditing(row.id); setForm({ name: row.name, company: row.company || "", location: row.location || "", mobileNumber: row.mobile_number || "", email: row.email || "", designation: row.designation || "", campaignName: row.campaign_name || "", remarks: row.remarks || "", followUpDate: row.follow_up_date || "", status: row.status }); }
  async function remove(row) { if (!window.confirm(`Delete lead ${row.name}?`)) return; try { await jsonRequest(`/api/admin/leads/${row.id}`, { method: "DELETE" }); toast.success("Lead deleted"); await load(); } catch (cause) { setError(cause.message); } }
  const badgeTone = (status) => status === "converted" ? "good" : status === "lost" ? "critical" : status === "qualified" ? "warn" : "default";
  const columns = [
    { key: "name", label: "Lead", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-ink/45">{row.company || row.designation || "—"}</p></div> },
    { key: "contact", label: "Contact", render: (row) => <div><p>{row.mobile_number || "—"}</p><p className="text-xs text-ink/45">{row.email}</p></div> },
    { key: "designation", label: "Designation" }, { key: "campaign_name", label: "Campaign" }, { key: "location", label: "Location" }, { key: "remarks", label: "Remarks" },
    { key: "follow_up_date", label: "Follow-up", render: (row) => <div>{row.follow_up_date || "Not set"}<p className="text-xs text-ink/45">{pretty(followUpBucket(row.follow_up_date, today()))}</p></div> },
    { key: "status", label: "Status", render: (row) => <AdminBadge tone={badgeTone(row.status)}>{pretty(row.status)}</AdminBadge> },
    ...(!viewer ? [{ key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><AdminButton tone="ghost" onClick={() => edit(row)}>Edit</AdminButton><AdminButton tone="ghost" onClick={() => remove(row)}>Delete</AdminButton></div> }] : [])
  ];

  return <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-3">
    {!viewer && <Panel title={editing ? "Edit lead" : "Add lead"}><form className="grid gap-4" onSubmit={save}>
      <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field><Field label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Mobile"><Input inputMode="tel" value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} /></Field><Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field><Field label="Campaign"><Input value={form.campaignName} onChange={(e) => setForm({ ...form, campaignName: e.target.value })} /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Follow-up"><Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></Field><Field label="Status"><SelectField value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={leadStatuses} format={pretty} /></Field></div>
      <Field label="Remarks"><Textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></Field>
      <div className="flex gap-2"><AdminButton type="submit">{editing ? "Save lead" : "Add lead"}</AdminButton>{editing && <AdminButton tone="light" type="button" onClick={() => { setEditing(null); setForm(empty()); }}>Cancel</AdminButton>}</div>
    </form></Panel>}
    <div className={`min-w-0 ${viewer ? "xl:col-span-3" : "xl:col-span-2"}`}>{error && <Notice tone="critical">{error}</Notice>}<AdminCard className="mt-4 first:mt-0"><div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5"><Input aria-label="Search leads" placeholder="Search name or contact" value={filters.q} onChange={(e) => { setPage(1); setFilters({ ...filters, q: e.target.value }); }} /><SelectField value={filters.status} onChange={(value) => { setPage(1); setFilters({ ...filters, status: value }); }} options={["all", ...leadStatuses]} format={pretty} /><Input aria-label="Filter campaign" placeholder="Campaign" value={filters.campaign} onChange={(e) => { setPage(1); setFilters({ ...filters, campaign: e.target.value }); }} /><Input aria-label="Filter location" placeholder="Location" value={filters.location} onChange={(e) => { setPage(1); setFilters({ ...filters, location: e.target.value }); }} /><SelectField value={filters.followUp} onChange={(value) => { setPage(1); setFilters({ ...filters, followUp: value }); }} options={["all", "overdue", "today", "upcoming", "none"]} format={pretty} /></div><div className="flex items-center justify-between gap-3 px-4 pb-3 text-xs text-ink/45"><span>{total} matching leads · page {page}</span><div className="flex gap-2"><AdminButton disabled={page === 1} tone="light" onClick={() => setPage((value) => value - 1)}>Previous</AdminButton><AdminButton disabled={page * 50 >= total} tone="light" onClick={() => setPage((value) => value + 1)}>Next</AdminButton></div></div><AdminTable columns={columns} rows={rows} /></AdminCard></div>
  </div>;
}
