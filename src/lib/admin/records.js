import { randomUUID } from "node:crypto";

import { getDb, safeQuery } from "@/lib/db";

export function buildCustomerCode() {
  return `CUST-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

export function buildBookingCode() {
  return `TZ-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
}

export function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Dashboard data.
 *
 * Previously six PostgREST calls; now six SQL queries. One shape detail worth
 * knowing: PostgREST returned an embedded object (`customers: { name }`) and the
 * pages read `row.customers?.name`. The SQL reproduces that with json_build_object,
 * so no page had to change.
 *
 * `error` is now returned alongside the data. Callers that ignore it behave exactly
 * as before; the difference is that a page CAN now distinguish "no rows" from "no
 * database", which it previously could not - that ambiguity hid a long outage behind
 * a screen full of confident zeros.
 */
export async function fetchAdminDashboardData() {
  const { data, error } = await safeQuery(
    async (sql) => {
      const [customers, bookings, documents, tasks, expenses, extractions] =
        await Promise.all([
          sql`
            select id, name, mobile_number, location, created_at
            from customers order by created_at desc limit 10
          `,
          sql`
            select b.id, b.booking_code, b.booking_type, b.market, b.departure, b.arrival,
                   b.travel_date, b.selling_price, b.margin, b.booking_status,
                   b.payment_status, b.created_at,
                   json_build_object('name', c.name) as customers
            from bookings b
            left join customers c on c.id = b.customer_id
            order by b.created_at desc limit 20
          `,
          sql`
            select d.id, d.file_name, d.document_type, d.status, d.uploaded_at,
                   json_build_object('name', c.name) as customers
            from booking_documents d
            left join customers c on c.id = d.customer_id
            order by d.uploaded_at desc limit 20
          `,
          sql`
            select t.id, t.task_type, t.priority, t.status, t.due_at,
                   json_build_object('name', c.name) as customers
            from tasks t
            left join customers c on c.id = t.customer_id
            order by t.due_at asc limit 20
          `,
          sql`
            select id, category, name_or_vendor, amount, expense_date, payment_status
            from expenses order by expense_date desc limit 50
          `,
          sql`
            select id, status, confidence, created_at
            from ticket_extractions order by created_at desc limit 20
          `
        ]);

      return { customers, bookings, documents, tasks, expenses, extractions };
    },
    { customers: [], bookings: [], documents: [], tasks: [], expenses: [], extractions: [] }
  );

  const bookingRows = data.bookings ?? [];
  const expenseRows = data.expenses ?? [];
  const totalBooked = bookingRows.reduce((sum, row) => sum + Number(row.selling_price ?? 0), 0);
  const totalMargin = bookingRows.reduce((sum, row) => sum + Number(row.margin ?? 0), 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    customers: data.customers ?? [],
    bookings: bookingRows,
    documents: data.documents ?? [],
    tasks: data.tasks ?? [],
    expenses: expenseRows,
    extractions: data.extractions ?? [],
    error,
    metrics: {
      totalBooked,
      totalMargin,
      totalExpenses,
      netProfit: totalMargin - totalExpenses,
      customerCount: data.customers?.length ?? 0,
      openTasks: (data.tasks ?? []).filter((task) => task.status !== "done").length,
      pendingDocuments: (data.documents ?? []).filter(
        (doc) => doc.status !== "verified" && doc.status !== "sent_to_customer"
      ).length,
      pendingExtractions: (data.extractions ?? []).filter(
        (row) => row.status === "needs_review" || row.status === "ready_to_review"
      ).length
    }
  };
}

export async function fetchAdminReferenceData() {
  const { data, error } = await safeQuery(
    async (sql) => {
      const [providers, templates, imports] = await Promise.all([
        sql`select id, name, type, support_contact, is_active from providers order by created_at desc limit 50`,
        sql`select id, name, type, is_active from templates order by name asc limit 50`,
        sql`select id, file_name, status, created_at from import_batches order by created_at desc limit 50`
      ]);

      return { providers, templates, imports };
    },
    { providers: [], templates: [], imports: [] }
  );

  return {
    providers: data.providers ?? [],
    templates: data.templates ?? [],
    imports: data.imports ?? [],
    error
  };
}

/** Re-exported for the write routes, which need the client directly. */
export { getDb };
