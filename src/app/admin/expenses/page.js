import { AdminBadge, AdminCard, AdminTable, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const columns = [
  { key: "name", label: "Name / vendor" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount", numeric: true },
  { key: "date", label: "Date" },
  { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

export default async function ExpensesPage() {
  const data = await fetchAdminDashboardData();
  const rows = data.expenses.map((expense) => ({
    id: expense.id,
    name: expense.name_or_vendor,
    category: expense.category,
    amount: formatCurrency(expense.amount),
    date: expense.expense_date ?? "Not set",
    status: expense.payment_status
  }));

  return (
    <>
      <PageHeader title="Expenses" body="Operating expenses from the workbook as editable finance records." />
      <div className="p-4 sm:p-6">
        <AdminCard>
          <AdminTable columns={columns} rows={rows} />
        </AdminCard>
      </div>
    </>
  );
}
