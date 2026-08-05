import { AdminBadge, AdminCard, AdminTable, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const columns = [
  { key: "file", label: "File" },
  { key: "customer", label: "Customer" },
  { key: "type", label: "Type" },
  { key: "uploaded", label: "Uploaded" },
  { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> }
];

export default async function DocumentsPage() {
  const data = await fetchAdminDashboardData();
  const rows = data.documents.map((document) => ({
    id: document.id,
    file: document.file_name,
    customer: document.customers?.name ?? "Unassigned",
    type: document.document_type,
    uploaded: document.uploaded_at?.slice(0, 10) ?? "Not set",
    status: document.status
  }));

  return (
    <>
      <PageHeader
        title="Documents"
        body="Tickets, vouchers, boarding passes, receipts, and verification status."
      />
      <div className="p-4 sm:p-6">
        <AdminCard>
          <AdminTable columns={columns} rows={rows} />
        </AdminCard>
      </div>
    </>
  );
}
