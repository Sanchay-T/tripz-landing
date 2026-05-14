import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { randomUUID } from "node:crypto";

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

export async function fetchAdminDashboardData() {
  const supabase = createSupabaseServiceClient();

  const [
    customers,
    bookings,
    documents,
    tasks,
    expenses,
    extractions
  ] = await Promise.all([
    supabase.from("customers").select("id, name, mobile_number, location, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("bookings").select("id, booking_code, booking_type, market, departure, arrival, travel_date, selling_price, margin, booking_status, payment_status, created_at, customers(name)").order("created_at", { ascending: false }).limit(20),
    supabase.from("booking_documents").select("id, file_name, document_type, status, uploaded_at, customers(name)").order("uploaded_at", { ascending: false }).limit(20),
    supabase.from("tasks").select("id, task_type, priority, status, due_at, customers(name)").order("due_at", { ascending: true }).limit(20),
    supabase.from("expenses").select("id, category, name_or_vendor, amount, expense_date, payment_status").order("expense_date", { ascending: false }).limit(50),
    supabase.from("ticket_extractions").select("id, status, confidence, created_at").order("created_at", { ascending: false }).limit(20)
  ]);

  const bookingRows = bookings.data ?? [];
  const expenseRows = expenses.data ?? [];
  const totalBooked = bookingRows.reduce((sum, row) => sum + Number(row.selling_price ?? 0), 0);
  const totalMargin = bookingRows.reduce((sum, row) => sum + Number(row.margin ?? 0), 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    customers: customers.data ?? [],
    bookings: bookingRows,
    documents: documents.data ?? [],
    tasks: tasks.data ?? [],
    expenses: expenseRows,
    extractions: extractions.data ?? [],
    metrics: {
      totalBooked,
      totalMargin,
      totalExpenses,
      netProfit: totalMargin - totalExpenses,
      customerCount: customers.data?.length ?? 0,
      openTasks: (tasks.data ?? []).filter((task) => task.status !== "done").length,
      pendingDocuments: (documents.data ?? []).filter((doc) => doc.status !== "verified" && doc.status !== "sent_to_customer").length,
      pendingExtractions: (extractions.data ?? []).filter((row) => row.status === "needs_review" || row.status === "ready_to_review").length
    }
  };
}

export async function fetchAdminReferenceData() {
  const supabase = createSupabaseServiceClient();

  const [providers, templates, imports] = await Promise.all([
    supabase.from("providers").select("id, name, type, support_contact, is_active").order("created_at", { ascending: false }).limit(50),
    supabase.from("templates").select("id, name, type, is_active").order("name", { ascending: true }).limit(50),
    supabase.from("import_batches").select("id, file_name, status, created_at").order("created_at", { ascending: false }).limit(50)
  ]);

  return {
    providers: providers.data ?? [],
    templates: templates.data ?? [],
    imports: imports.data ?? []
  };
}
