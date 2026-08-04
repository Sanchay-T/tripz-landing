import { createSupabaseServiceClient } from "@/lib/supabase/server";

export * from "./margin-metrics.js";

/**
 * All priced bookings, unpaginated.
 *
 * Deliberately not `fetchAdminDashboardData()`: that helper caps bookings at 20 and
 * does not select `base_cost`, so totals built on it would silently be a partial
 * sum with no way to tell from the page. A margin figure that is quietly wrong is
 * worse than none.
 *
 * Returns `{ rows, error }` rather than throwing, so a page can distinguish "no
 * bookings yet" from "the backend could not be reached" and say which.
 */
export async function fetchMarginRows() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_code, booking_type, market, departure, arrival, travel_date, base_cost, selling_price, margin, booking_status, payment_status, customer_id, customers(name)"
      )
      .order("travel_date", { ascending: false });

    if (error) {
      return { rows: [], error: error.message };
    }

    return { rows: data ?? [], error: null };
  } catch (cause) {
    return { rows: [], error: cause?.message ?? "Supabase request failed" };
  }
}
