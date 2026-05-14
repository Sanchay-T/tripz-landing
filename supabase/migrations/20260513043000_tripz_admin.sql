create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'manager', 'agent', 'finance')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  customer_code text not null unique,
  name text not null,
  gender text,
  location text,
  mobile_number text,
  email text,
  remarks text,
  source text not null default 'manual',
  assigned_agent_id uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('airline', 'hotel', 'vendor')),
  logo_url text,
  support_contact text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_id uuid not null references customers(id),
  booking_type text not null check (booking_type in ('flight', 'hotel', 'package', 'visa', 'insurance', 'transfer', 'other')),
  market text not null check (market in ('domestic', 'international', 'unknown')),
  journey_type text not null check (journey_type in ('one_way', 'return', 'multi_city', 'stay_only', 'not_applicable', 'unknown')),
  departure text,
  arrival text,
  travel_date date,
  return_date date,
  provider_id uuid references providers(id),
  pnr_or_confirmation text,
  base_cost numeric(12, 2),
  selling_price numeric(12, 2),
  margin numeric(12, 2) generated always as (coalesce(selling_price, 0) - coalesce(base_cost, 0)) stored,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid', 'refunded', 'cancelled')),
  booking_status text not null default 'draft' check (booking_status in ('draft', 'quoted', 'confirmed', 'ticketed', 'in_travel', 'completed', 'cancelled')),
  assigned_agent_id uuid references admin_users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists booking_segments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  segment_number integer not null,
  segment_type text not null,
  from_location text,
  to_location text,
  start_datetime timestamptz,
  end_datetime timestamptz,
  provider_id uuid references providers(id),
  flight_number text,
  confirmation_number text,
  notes text
);

create table if not exists booking_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  document_type text not null,
  file_url text not null,
  file_name text not null,
  mime_type text,
  status text not null default 'uploaded' check (status in ('needed', 'uploaded', 'verified', 'sent_to_customer', 'not_required')),
  uploaded_by_id uuid references admin_users(id),
  uploaded_at timestamptz not null default now(),
  verified_by_id uuid references admin_users(id),
  verified_at timestamptz,
  sent_at timestamptz,
  notes text
);

create table if not exists ticket_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references booking_documents(id) on delete cascade,
  status text not null default 'extracting' check (status in ('extracting', 'ready_to_review', 'needs_review', 'failed', 'saved')),
  model text not null,
  raw_response jsonb,
  normalized_json jsonb,
  confidence numeric(4, 3),
  error_message text,
  reviewed_by_id uuid references admin_users(id),
  reviewed_at timestamptz,
  created_booking_id uuid references bookings(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  task_type text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done', 'cancelled')),
  due_at timestamptz not null,
  assigned_to_id uuid references admin_users(id),
  description text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  booking_id uuid not null references bookings(id),
  direction text not null check (direction in ('customer_payment', 'vendor_payment', 'refund')),
  amount numeric(12, 2) not null,
  payment_date date,
  payment_method text,
  status text not null default 'pending',
  reference_number text,
  receipt_document_id uuid references booking_documents(id),
  notes text
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name_or_vendor text not null,
  amount numeric(12, 2) not null,
  expense_date date not null,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  notes text
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true
);

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  status text not null default 'uploaded',
  summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references import_batches(id) on delete cascade,
  row_number integer not null,
  raw_json jsonb not null,
  normalized_json jsonb,
  errors jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
);
