import { AdminCard, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

export default async function FinancePage() {
  const data = await fetchAdminDashboardData();
  const financeRows = [
    ["Total booking revenue", formatCurrency(data.metrics.totalBooked)],
    ["Total margin", formatCurrency(data.metrics.totalMargin)],
    ["Operating expenses", formatCurrency(data.metrics.totalExpenses)],
    ["Net profit", formatCurrency(data.metrics.netProfit)],
    ["Pending documents", data.metrics.pendingDocuments]
  ];

  return (
    <>
      <PageHeader
        title="Finance"
        body="Workbook revenue and expense scratch work converted into reportable finance metrics."
      />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
        {financeRows.map(([label, value]) => (
          <AdminCard key={label} className="p-5">
            <p className="text-sm text-ink/55">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tighter">{value}</p>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
