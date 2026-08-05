import { AdminBadge, AdminCard, PageHeader } from "../components";
import { fetchAdminReferenceData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const data = await fetchAdminReferenceData();

  return (
    <>
      <PageHeader title="Providers" body="Airline, hotel, and vendor records with logo support." />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-3">
        {data.providers.length === 0 && (
          <AdminCard className="p-5">
            <h2 className="font-semibold">No providers yet</h2>
            <p className="mt-2 text-sm text-ink/55">Airlines, hotels and vendors are added automatically as you use them on a booking.</p>
          </AdminCard>
        )}
        {data.providers.map((provider) => (
          <AdminCard key={provider.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{provider.name}</h2>
                <p className="mt-2 text-sm text-ink/55">{provider.support_contact || "No support contact set."}</p>
              </div>
              <AdminBadge tone={provider.is_active ? "good" : "default"}>{provider.type}</AdminBadge>
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
