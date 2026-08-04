-- Mark customers that are actually us.
--
-- Rao books his own travel through the same system. Those are real bookings, but
-- they are not customer business: they carry no margin, and counting them drags the
-- blended take rate down (5.29% becomes 5.08%) and inflates domestic booking value
-- by the cost of his own tickets. Reporting needs to tell the two apart.
--
-- A boolean on the customer rather than the booking, because the distinction belongs
-- to the person, not the transaction - every booking for an internal customer is
-- internal by definition.

alter table customers
  add column if not exists is_internal boolean not null default false;

comment on column customers.is_internal is
  'True when this "customer" is the business itself. Excluded from take-rate reporting.';

create index if not exists customers_is_internal_idx
  on customers (is_internal) where is_internal;
