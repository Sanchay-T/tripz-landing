"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminButton, AdminCard, AdminTable, Notice, Panel } from "../components";
import { Field, jsonRequest } from "../operations-components";

const empty = () => ({ serviceName: "", loginId: "", ownerName: "", loginUrl: "", passwordManagerReference: "", notes: "" });

export default function AccountsClient({ viewer }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState(empty), [editing, setEditing] = useState(null), [query, setQuery] = useState(""), [error, setError] = useState("");
  const load = useCallback(async () => { try { const data = await jsonRequest(`/api/admin/operational-accounts?q=${encodeURIComponent(query)}`); setRows(data.rows); setError(""); } catch (cause) { setError(cause.message); } }, [query]);
  useEffect(() => { const timer = setTimeout(load, 150); return () => clearTimeout(timer); }, [load]);
  async function save(event) { event.preventDefault(); try { await jsonRequest(editing ? `/api/admin/operational-accounts/${editing}` : "/api/admin/operational-accounts", { method: editing ? "PATCH" : "POST", body: JSON.stringify(form) }); toast.success(editing ? "Directory entry updated" : "Directory entry added"); setEditing(null); setForm(empty()); await load(); } catch (cause) { setError(cause.message); } }
  function edit(row) { setEditing(row.id); setForm({ serviceName: row.service_name, loginId: row.login_id, ownerName: row.owner_name || "", loginUrl: row.login_url || "", passwordManagerReference: row.password_manager_reference || "", notes: row.notes || "" }); }
  async function remove(row) { if (!window.confirm(`Delete ${row.service_name} from the directory?`)) return; try { await jsonRequest(`/api/admin/operational-accounts/${row.id}`, { method: "DELETE" }); toast.success("Directory entry deleted"); await load(); } catch (cause) { setError(cause.message); } }
  const columns = [
    { key: "service_name", label: "Service" }, { key: "login_id", label: "Login ID" }, { key: "owner_name", label: "Owner" },
    { key: "login_url", label: "Login", render: (row) => row.login_url ? <a className="underline" href={row.login_url} rel="noreferrer" target="_blank">Open</a> : "—" },
    { key: "password_manager_reference", label: "Password manager reference" }, { key: "notes", label: "Notes" },
    ...(!viewer ? [{ key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><AdminButton tone="ghost" onClick={() => edit(row)}>Edit</AdminButton><AdminButton tone="ghost" onClick={() => remove(row)}>Delete</AdminButton></div> }] : [])
  ];
  return <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
    {!viewer && <Panel title={editing ? "Edit directory entry" : "Add directory entry"}><form className="grid gap-4" onSubmit={save}>
      <Field label="Service"><Input required value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} /></Field>
      <Field label="Login ID"><Input autoComplete="off" required value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} /></Field>
      <Field label="Owner"><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></Field>
      <Field label="Login URL"><Input placeholder="https://" type="url" value={form.loginUrl} onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} /></Field>
      <Field label="Password manager reference" hint="Record name or item ID only—never the password."><Input autoComplete="off" value={form.passwordManagerReference} onChange={(e) => setForm({ ...form, passwordManagerReference: e.target.value })} /></Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      <div className="flex gap-2"><AdminButton type="submit">{editing ? "Save entry" : "Add entry"}</AdminButton>{editing && <AdminButton tone="light" type="button" onClick={() => { setEditing(null); setForm(empty()); }}>Cancel</AdminButton>}</div>
    </form></Panel>}
    <div className={`min-w-0 ${viewer ? "lg:col-span-3" : "lg:col-span-2"}`}>{error && <Notice tone="critical">{error}</Notice>}<AdminCard className="mt-4 first:mt-0"><div className="p-4"><Input aria-label="Search login directory" placeholder="Search service, login ID or owner" value={query} onChange={(e) => setQuery(e.target.value)} /></div><AdminTable columns={columns} rows={rows} /></AdminCard></div>
  </div>;
}
