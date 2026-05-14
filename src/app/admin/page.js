import { UploadCloud } from "lucide-react";
import { AdminBadge, AdminButton, AdminCard, AdminTable, PageHeader } from "./components";
import { fetchAdminDashboardData } from "@/lib/admin/records";

export const dynamic = "force-dynamic";

const bookingColumns = [
  { key: "booking", label: "Booking" },
  { key: "customer", label: "Customer" },
  { key: "route", label: "Route / Stay" },
  { key: "date", label: "Travel date" },
  { key: "price", label: "Price" },
  { key: "margin", label: "Margin" },
  {
    key: "status",
    label: "Status",
    render: (row) => <AdminBadge tone={row.status === "ticketed" || row.status === "completed" ? "success" : "default"}>{row.status}</AdminBadge>
  }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function AdminDashboard() {
  const data = await fetchAdminDashboardData();
  const metrics = [
    {
      label: "Booked amount",
      value: formatCurrency(data.metrics.totalBooked),
      detail: "Confirmed booking value across live records.",
      trend: "live"
    },
    {
      label: "Margin earned",
      value: formatCurrency(data.metrics.totalMargin),
      detail: "Generated from selling price minus base cost.",
      trend: "live"
    },
    {
      label: "Customers",
      value: data.metrics.customerCount,
      detail: "Recent customer records currently visible.",
      trend: "live"
    },
    {
      label: "Open tasks",
      value: data.metrics.openTasks,
      detail: "Travel reminders, payment follow-ups, and boarding pass tasks.",
      trend: data.metrics.openTasks ? "urgent" : "clear"
    }
  ];

  const bookingRows = data.bookings.map((booking) => ({
    id: booking.id,
    booking: booking.booking_code,
    customer: booking.customers?.name ?? "Unknown",
    route: [booking.departure, booking.arrival].filter(Boolean).join(" -> ") || booking.booking_type,
    date: formatDate(booking.travel_date),
    price: formatCurrency(booking.selling_price),
    margin: formatCurrency(booking.margin),
    status: booking.booking_status
  }));

  return (
    <>
      <PageHeader
        eyebrow="TripZ operating system"
        title="Dashboard"
        body="Booking revenue, margin, documents, reminders, and Claude extraction work from one operating surface."
        action={
          <AdminButton href="/admin/intake">
            <UploadCloud size={16} />
            Upload tickets
          </AdminButton>
        }
      />
      <div className="space-y-5 p-4 sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <AdminCard key={metric.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink/55">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-ink">
                    {metric.value}
                  </p>
                </div>
                <AdminBadge tone={metric.trend === "urgent" ? "warn" : "default"}>
                  {metric.trend}
                </AdminBadge>
              </div>
              <p className="mt-3 text-sm text-ink/55">{metric.detail}</p>
            </AdminCard>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
          <AdminCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Revenue and margin</h2>
                <p className="text-sm text-ink/55">Workbook categories mapped into live dashboard buckets.</p>
              </div>
              <AdminBadge>Last 30 days</AdminBadge>
            </div>
            <div className="mt-5 grid h-64 grid-cols-6 items-end gap-3 rounded-md border border-ink/10 bg-[#fbfdfc] p-4">
              {[45, 70, 38, 85, 62, 95].map((height, index) => (
                <div key={height + index} className="flex h-full items-end">
                  <div
                    className="w-full rounded-t-md bg-accent"
                    style={{ height: `${height}%` }}
                    aria-label={`Chart bar ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard className="p-5">
            <h2 className="text-lg font-semibold">Finance snapshot</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Total revenue", formatCurrency(data.metrics.totalBooked)],
                ["Expenses", formatCurrency(data.metrics.totalExpenses)],
                ["Net profit", formatCurrency(data.metrics.netProfit)],
                ["Pending documents", data.metrics.pendingDocuments]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <dt className="text-ink/55">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </AdminCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <AdminCard className="p-5">
            <h2 className="text-lg font-semibold">24-hour travel queue</h2>
            <div className="mt-4 space-y-3">
              {data.tasks.length === 0 && <p className="text-sm text-ink/55">No open tasks yet.</p>}
              {data.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border border-ink/10 p-3">
                  <div>
                    <p className="font-medium">{task.task_type}</p>
                    <p className="text-sm text-ink/55">{task.customers?.name ?? "Unknown"} · {formatDate(task.due_at)}</p>
                  </div>
                  <AdminBadge tone={task.priority === "urgent" ? "danger" : "warn"}>
                    {task.priority}
                  </AdminBadge>
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard className="p-5">
            <h2 className="text-lg font-semibold">Pending extraction review</h2>
            <div className="mt-4 space-y-3">
              {data.documents.length === 0 && <p className="text-sm text-ink/55">No pending documents yet.</p>}
              {data.documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-md border border-ink/10 p-3">
                  <div>
                    <p className="font-medium">{doc.file_name}</p>
                    <p className="text-sm text-ink/55">{doc.customers?.name ?? "Unassigned"} · {doc.document_type}</p>
                  </div>
                  <AdminBadge tone={doc.status === "verified" ? "success" : "warn"}>
                    {doc.status}
                  </AdminBadge>
                </div>
              ))}
            </div>
          </AdminCard>
        </section>

        <AdminCard>
          <div className="border-b border-ink/10 p-5">
            <h2 className="text-lg font-semibold">Recent bookings</h2>
          </div>
          <AdminTable columns={bookingColumns} rows={bookingRows} />
        </AdminCard>
      </div>
    </>
  );
}
