import { AdminBadge, AdminCard, AdminTable, PageHeader } from "../components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const columns = [
  { key: "booking", label: "Booking" },
  { key: "customer", label: "Customer" },
  { key: "type", label: "Type" },
  { key: "market", label: "Market" },
  { key: "route", label: "Route / Stay" },
  { key: "date", label: "Travel date" },
  { key: "price", label: "Price" },
  { key: "margin", label: "Margin" },
  { key: "status", label: "Status", render: (row) => <AdminBadge>{row.status}</AdminBadge> }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

export default async function BookingsPage() {
  const data = await fetchAdminDashboardData();
  const rows = data.bookings.map((booking) => ({
    id: booking.id,
    booking: booking.booking_code,
    customer: booking.customers?.name ?? "Unknown",
    type: booking.booking_type,
    market: booking.market,
    route: [booking.departure, booking.arrival].filter(Boolean).join(" -> ") || "Not set",
    date: booking.travel_date ?? "Not set",
    price: formatCurrency(booking.selling_price),
    margin: formatCurrency(booking.margin),
    status: booking.booking_status
  }));

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        body="Search and manage travel bookings by customer, market, type, status, payment, price, and margin."
      />
      <div className="p-4 sm:p-6">
        <AdminCard>
          <div className="border-b border-ink/10 p-5">
            <h2 className="text-lg font-semibold">Booking records</h2>
          </div>
          <AdminTable columns={columns} rows={rows} />
        </AdminCard>
      </div>
    </>
  );
}
