begin;

alter table expenses
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists finance_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type text not null check (account_type in ('bank', 'cash')),
  opening_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance_transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references finance_accounts(id) on delete restrict,
  transaction_type text not null check (
    transaction_type in ('cash_in', 'cash_out', 'reconciliation_credit', 'reconciliation_debit')
  ),
  amount numeric(14, 2) not null check (amount > 0),
  transaction_date date not null,
  description text not null,
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_transactions_account_date_idx
  on finance_transactions (account_id, transaction_date desc, created_at desc);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  location text,
  mobile_number text,
  email text,
  designation text,
  campaign_name text,
  remarks text,
  follow_up_date date,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_follow_up_idx on leads (follow_up_date);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_campaign_idx on leads (lower(campaign_name));
create index if not exists leads_location_idx on leads (lower(location));

create table if not exists operational_accounts (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  login_id text not null,
  owner_name text,
  login_url text,
  password_manager_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists operational_accounts_service_idx
  on operational_accounts (lower(service_name));
create index if not exists operational_accounts_owner_idx
  on operational_accounts (lower(owner_name));

commit;
