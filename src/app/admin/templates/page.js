import { AdminBadge, AdminCard, PageHeader } from "../components";
import { fetchAdminReferenceData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const data = await fetchAdminReferenceData();

  return (
    <>
      <PageHeader title="Templates" body="Reusable ticket, voucher, reminder, and WhatsApp copy templates." />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
        {data.templates.length === 0 && (
          <AdminCard className="p-5">
            <h2 className="font-semibold">No templates yet</h2>
            <p className="mt-3 text-sm leading-6 text-ink/55">Reusable ticket and reminder templates appear here once they are created.</p>
          </AdminCard>
        )}
        {data.templates.map((template) => (
          <AdminCard key={template.id} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{template.name}</h2>
              <AdminBadge tone={template.is_active ? "success" : "default"}>{template.is_active ? "Active" : "Inactive"}</AdminBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/55">{template.type}</p>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
