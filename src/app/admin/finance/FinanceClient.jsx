"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AdminButton, AdminCard, AdminTable, Figure, FigureCell, FigureRow, Notice, Panel } from "../components";
import { Field, SelectField, inr, jsonRequest, pretty } from "../operations-components";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const emptyAccount = () => ({ name: "", accountType: "bank", openingBalance: "0", isActive: true });
const emptyTransaction = () => ({ accountId: "", transactionType: "cash_in", amount: "", transactionDate: today(), description: "", reference: "" });
const emptyReconcile = () => ({ accountId: "", actualBalance: "", transactionDate: today(), description: "Balance reconciliation" });

export default function FinanceClient({ viewer }) {
  const [accounts, setAccounts] = useState([]), [transactions, setTransactions] = useState([]), [total, setTotal] = useState(0);
  const [accountForm, setAccountForm] = useState(emptyAccount), [transactionForm, setTransactionForm] = useState(emptyTransaction), [reconcileForm, setReconcileForm] = useState(emptyReconcile);
  const [editingAccount, setEditingAccount] = useState(null), [editingTransaction, setEditingTransaction] = useState(null), [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const [accountData, transactionData] = await Promise.all([jsonRequest("/api/admin/finance/accounts"), jsonRequest("/api/admin/finance/transactions")]); setAccounts(accountData.rows); setTotal(accountData.totalBalance); setTransactions(transactionData.rows); setError(""); }
    catch (cause) { setError(cause.message); }
  }, []);
  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);

  async function saveAccount(event) {
    event.preventDefault();
    try { await jsonRequest(editingAccount ? `/api/admin/finance/accounts/${editingAccount}` : "/api/admin/finance/accounts", { method: editingAccount ? "PATCH" : "POST", body: JSON.stringify(accountForm) }); toast.success(editingAccount ? "Account updated" : "Account added"); setEditingAccount(null); setAccountForm(emptyAccount()); await load(); }
    catch (cause) { setError(cause.message); }
  }
  function editAccount(row) { setEditingAccount(row.id); setAccountForm({ name: row.name, accountType: row.account_type, openingBalance: row.opening_balance, isActive: row.is_active }); }
  async function deleteAccount(row) { if (!window.confirm(`Delete ${row.name}?`)) return; try { await jsonRequest(`/api/admin/finance/accounts/${row.id}`, { method: "DELETE" }); toast.success("Account deleted"); await load(); } catch (cause) { setError(cause.message); } }

  async function saveTransaction(event) {
    event.preventDefault();
    try { await jsonRequest(editingTransaction ? `/api/admin/finance/transactions/${editingTransaction}` : "/api/admin/finance/transactions", { method: editingTransaction ? "PATCH" : "POST", body: JSON.stringify(transactionForm) }); toast.success(editingTransaction ? "Transaction updated" : "Transaction added"); setEditingTransaction(null); setTransactionForm(emptyTransaction()); await load(); }
    catch (cause) { setError(cause.message); }
  }
  function editTransaction(row) { if (row.transaction_type.startsWith("reconciliation_")) return; setEditingTransaction(row.id); setTransactionForm({ accountId: row.account_id, transactionType: row.transaction_type, amount: row.amount, transactionDate: row.transaction_date, description: row.description, reference: row.reference || "" }); }
  async function deleteTransaction(row) { if (!window.confirm(`Delete ${row.description}? This changes the account balance.`)) return; try { await jsonRequest(`/api/admin/finance/transactions/${row.id}`, { method: "DELETE" }); toast.success("Transaction deleted"); await load(); } catch (cause) { setError(cause.message); } }
  async function reconcile(event) { event.preventDefault(); try { const data = await jsonRequest("/api/admin/finance/reconcile", { method: "POST", body: JSON.stringify(reconcileForm) }); toast.success(data.row ? "Balance reconciled" : "Balance already matched"); setReconcileForm(emptyReconcile()); await load(); } catch (cause) { setError(cause.message); } }

  const accountOptions = accounts.map((row) => row.id);
  const accountName = (id) => accounts.find((row) => row.id === id)?.name || id;
  const accountColumns = [
    { key: "name", label: "Account" }, { key: "account_type", label: "Type", render: (row) => pretty(row.account_type) }, { key: "balance", label: "Balance", numeric: true, render: (row) => inr(row.balance) }, { key: "transaction_count", label: "Entries", numeric: true }, { key: "is_active", label: "State", render: (row) => row.is_active ? "Active" : "Inactive" },
    ...(!viewer ? [{ key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><AdminButton tone="ghost" onClick={() => editAccount(row)}>Edit</AdminButton><AdminButton tone="ghost" onClick={() => deleteAccount(row)}>Delete</AdminButton></div> }] : [])
  ];
  const transactionColumns = [
    { key: "transaction_date", label: "Date" }, { key: "account_name", label: "Account" }, { key: "description", label: "Description" }, { key: "reference", label: "Reference" }, { key: "transaction_type", label: "Type", render: (row) => pretty(row.transaction_type) }, { key: "amount", label: "Amount", numeric: true, render: (row) => inr(row.amount) },
    ...(!viewer ? [{ key: "actions", label: "Actions", render: (row) => <div className="flex gap-2">{!row.transaction_type.startsWith("reconciliation_") && <AdminButton tone="ghost" onClick={() => editTransaction(row)}>Edit</AdminButton>}<AdminButton tone="ghost" onClick={() => deleteTransaction(row)}>Delete</AdminButton></div> }] : [])
  ];

  return <div className="space-y-4 p-4 sm:p-6">
    {error && <Notice tone="critical">{error}</Notice>}
    <FigureRow><FigureCell><Figure label="Combined balance" value={inr(total)} accent /></FigureCell>{accounts.map((row) => <FigureCell key={row.id}><Figure label={`${pretty(row.account_type)} · ${row.name}`} value={inr(row.balance)} detail={`${row.transaction_count} ledger entries · ${row.is_active ? "Active" : "Inactive"}`} /></FigureCell>)}</FigureRow>
    {!viewer && <div className="grid gap-4 xl:grid-cols-3">
      <Panel title={editingAccount ? "Edit account" : "Add account"}><form className="grid gap-4" onSubmit={saveAccount}><Field label="Account name"><Input required value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} /></Field><Field label="Type"><SelectField value={accountForm.accountType} onChange={(value) => setAccountForm({ ...accountForm, accountType: value })} options={["bank", "cash"]} format={pretty} /></Field><Field label="State"><SelectField value={accountForm.isActive ? "active" : "inactive"} onChange={(value) => setAccountForm({ ...accountForm, isActive: value === "active" })} options={["active", "inactive"]} format={pretty} /></Field><Field label="Opening balance" hint={editingAccount && accounts.find((row) => row.id === editingAccount)?.transaction_count ? "Use reconciliation after transactions exist." : "Starting balance before ledger entries."}><Input disabled={Boolean(editingAccount && accounts.find((row) => row.id === editingAccount)?.transaction_count)} required step="0.01" type="number" value={accountForm.openingBalance} onChange={(event) => setAccountForm({ ...accountForm, openingBalance: event.target.value })} /></Field><div className="flex gap-2"><AdminButton type="submit">{editingAccount ? "Save account" : "Add account"}</AdminButton>{editingAccount && <AdminButton tone="light" type="button" onClick={() => { setEditingAccount(null); setAccountForm(emptyAccount()); }}>Cancel</AdminButton>}</div></form></Panel>
      <Panel title={editingTransaction ? "Edit transaction" : "Cash in or out"}><form className="grid gap-4" onSubmit={saveTransaction}><Field label="Account"><SelectField value={transactionForm.accountId} onChange={(value) => setTransactionForm({ ...transactionForm, accountId: value })} options={accountOptions} format={accountName} /></Field><Field label="Direction"><SelectField value={transactionForm.transactionType} onChange={(value) => setTransactionForm({ ...transactionForm, transactionType: value })} options={["cash_in", "cash_out"]} format={pretty} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Amount"><Input required min="0.01" step="0.01" type="number" value={transactionForm.amount} onChange={(event) => setTransactionForm({ ...transactionForm, amount: event.target.value })} /></Field><Field label="Date"><Input required type="date" value={transactionForm.transactionDate} onChange={(event) => setTransactionForm({ ...transactionForm, transactionDate: event.target.value })} /></Field></div><Field label="Description"><Input required value={transactionForm.description} onChange={(event) => setTransactionForm({ ...transactionForm, description: event.target.value })} /></Field><Field label="Reference"><Input value={transactionForm.reference} onChange={(event) => setTransactionForm({ ...transactionForm, reference: event.target.value })} /></Field><div className="flex gap-2"><AdminButton disabled={!transactionForm.accountId} type="submit">{editingTransaction ? "Save entry" : "Add entry"}</AdminButton>{editingTransaction && <AdminButton tone="light" type="button" onClick={() => { setEditingTransaction(null); setTransactionForm(emptyTransaction()); }}>Cancel</AdminButton>}</div></form></Panel>
      <Panel title="Reconcile balance"><form className="grid gap-4" onSubmit={reconcile}><Field label="Account"><SelectField value={reconcileForm.accountId} onChange={(value) => setReconcileForm({ ...reconcileForm, accountId: value })} options={accountOptions} format={accountName} /></Field><Field label="Actual balance"><Input required step="0.01" type="number" value={reconcileForm.actualBalance} onChange={(event) => setReconcileForm({ ...reconcileForm, actualBalance: event.target.value })} /></Field><Field label="Date"><Input required type="date" value={reconcileForm.transactionDate} onChange={(event) => setReconcileForm({ ...reconcileForm, transactionDate: event.target.value })} /></Field><Field label="Reason"><Input required value={reconcileForm.description} onChange={(event) => setReconcileForm({ ...reconcileForm, description: event.target.value })} /></Field><AdminButton disabled={!reconcileForm.accountId} type="submit">Reconcile</AdminButton></form></Panel>
    </div>}
    <AdminCard><AdminTable columns={accountColumns} rows={accounts} /></AdminCard>
    <AdminCard><AdminTable columns={transactionColumns} rows={transactions} /></AdminCard>
  </div>;
}
