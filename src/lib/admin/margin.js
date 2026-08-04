import { safeQuery } from "@/lib/db";

export * from "./margin-metrics.js";

/**
 * All priced bookings, unpaginated.
 *
 * Deliberately not `fetchAdminDashboardData()`: that helper caps bookings at 20 and
 * does not select `base_cost`, so totals built on it would be a silent partial sum
 * with no way to tell from the page. A margin figure that is quietly wrong is worse
 * than none.
 *
 * Returns `{ rows, error }` rather than throwing, so the page can distinguish "no
 * bookings yet" from "the database could not be reached" and say which.
 */
export async function fetchMarginRows() {
  const { data, error } = await safeQuery(
    (sql) => sql`
      select b.id, b.booking_code, b.booking_type, b.market, b.departure, b.arrival,
             b.travel_date, b.base_cost, b.selling_price, b.margin,
             b.booking_status, b.payment_status, b.customer_id,
             coalesce(c.is_internal, false) as is_internal,
             json_build_object('name', c.name) as customers
      from bookings b
      left join customers c on c.id = b.customer_id
      order by b.travel_date desc nulls last
    `
  );

  return { rows: data ?? [], error };
}
