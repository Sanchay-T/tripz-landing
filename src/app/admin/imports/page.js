import { AdminBadge, AdminCard, AdminTable, PageHeader } from "../components";
import { fetchAdminReferenceData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const columns = [
  { key: "file", label: "File" },
  { key: "created", label: "Created" },
  { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> }
];

export default async function ImportsPage() {
  const data = await fetchAdminReferenceData();
  const rows = data.imports.map((batch) => ({
    id: batch.id,
    file: batch.file_name,
    created: batch.created_at?.slice(0, 10) ?? "Not set",
    status: batch.status
  }));

  return (
    <>
      <PageHeader
        title="Imports"
        body="CSV/XLSX upload batches, row-level validation, error preview, and commit history."
      />
      <div className="p-4 sm:p-6">
        <AdminCard>
          <div className="border-b border-ink/10 p-5">
            <h2 className="text-lg font-semibold">Import batches</h2>
          </div>
          <AdminTable columns={columns} rows={rows} />
        </AdminCard>
      </div>
    </>
  );
}
