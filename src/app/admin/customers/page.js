import { AdminCard, AdminTable, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const columns = [
  { key: "customer", label: "Customer" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "source", label: "Source" },
  { key: "created", label: "Created" }
];

export default async function CustomersPage() {
  const data = await fetchAdminDashboardData();
  const rows = data.customers.map((customer) => ({
    id: customer.id,
    customer: customer.name,
    phone: customer.mobile_number ?? "Not set",
    location: customer.location ?? "Not set",
    source: "ticket_upload",
    created: customer.created_at?.slice(0, 10) ?? "Not set"
  }));

  return (
    <>
      <PageHeader
        title="Customers"
        body="Customer intake fields from the workbook converted into searchable CRM records."
      />
      <div className="p-4 sm:p-6">
        <AdminCard>
          <AdminTable columns={columns} rows={rows} />
        </AdminCard>
      </div>
    </>
  );
}
