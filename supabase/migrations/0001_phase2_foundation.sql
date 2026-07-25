-- 0001_phase2_foundation.sql — LABMAREMI Phase 2 foundation
-- Schema, enum, and Row Level Security for the Supabase backend.
-- Run in the Supabase SQL editor on a fresh project.
--
-- AMENDED 2026-07-24: the admin policies here originally granted every write
-- (and every lead/customer read) to the whole `authenticated` role with
-- `using (true)`. Since Supabase allows public signup by default, any visitor
-- could have signed up and inherited admin rights. They are now gated on
-- `is_admin()` / the `admin_users` roster, defined below. Projects that already
-- ran the original version get the identical end state from
-- 0006_admin_role_rls.sql — do NOT re-run this file against them.

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enum
-- Lowercase per spec. NOTE: the app's LeadStatus type is capitalized
-- ("Nuevo" | ...) — map between the two in P3/P5, do not change this enum.
-- ---------------------------------------------------------------------------
do $$ begin
  create type quote_status as enum
    ('nuevo','contactado','interesado','cliente','rechazado');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists business_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category_id      uuid not null references categories(id) on delete restrict,
  description      text not null default '',
  presentation     text not null default '',
  recommended_use  text not null default '',
  image_url        text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists products_category_id_idx on products(category_id);

create table if not exists quote_requests (
  id                uuid primary key default gen_random_uuid(),
  company_name      text not null,
  contact_person    text not null,
  phone             text not null default '',
  email             text not null default '',
  business_type_id  uuid references business_types(id) on delete set null,
  location          text not null default '',
  message           text not null default '',
  status            quote_status not null default 'nuevo',
  created_at        timestamptz not null default now()
);
create index if not exists quote_requests_business_type_id_idx on quote_requests(business_type_id);
create index if not exists quote_requests_status_idx on quote_requests(status);

create table if not exists quote_request_items (
  id                uuid primary key default gen_random_uuid(),
  quote_request_id  uuid not null references quote_requests(id) on delete cascade,
  product_id        uuid not null references products(id) on delete restrict,
  created_at        timestamptz not null default now()
);
create index if not exists qri_quote_request_id_idx on quote_request_items(quote_request_id);
create index if not exists qri_product_id_idx on quote_request_items(product_id);

create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  company_name    text not null,
  contact_person  text not null,
  phone           text not null default '',
  email           text not null default '',
  notes           text not null default '',
  created_at      timestamptz not null default now()
);

-- Admin roster. Holding a Supabase session is NOT authority — anyone can sign
-- up for one. Only accounts listed here are admins. Membership is granted from
-- the SQL editor (or by the service role); no client-writable policy exists.
create table if not exists admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null default '',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Model: deny by default. RLS is enabled on every table; a role can do only
-- what a policy explicitly grants.
-- ---------------------------------------------------------------------------
alter table categories          enable row level security;
alter table business_types      enable row level security;
alter table products            enable row level security;
alter table quote_requests      enable row level security;
alter table quote_request_items enable row level security;
alter table customers           enable row level security;
alter table admin_users         enable row level security;

-- A signed-in user may check their own roster row; nobody may write the roster
-- from a client, so no session can promote itself to admin.
create policy "admin_users self read" on admin_users for select to authenticated using (user_id = auth.uid());

-- Single source of truth for "is the caller an admin?". security definer so it
-- reads the roster regardless of the caller's own RLS, which also stops policies
-- that call it from recursing back into admin_users.
create or replace function is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated;

-- Seed the roster before anyone tries to use the admin panel:
--   insert into admin_users (user_id, email)
--   select id, email from auth.users where email = 'your-admin@example.com';

-- Public catalog: everyone reads, only roster admins write.
create policy "categories public read"      on categories     for select to anon, authenticated using (true);
create policy "categories admin write"      on categories     for all    to authenticated using (is_admin()) with check (is_admin());

create policy "business_types public read"  on business_types for select to anon, authenticated using (true);
create policy "business_types admin write"  on business_types for all    to authenticated using (is_admin()) with check (is_admin());

create policy "products public read"        on products       for select to anon, authenticated using (true);
create policy "products admin write"        on products       for all    to authenticated using (is_admin()) with check (is_admin());

-- Leads: no anon policy at all. The public quote form writes through the
-- security-definer submit_quote_request() RPC (0005), which validates input and
-- drops honeypot hits — a direct table insert would skip both, so anon never
-- gets one. Reads and edits are roster-admin only, so a stranger who signs
-- themselves up sees nothing.
create policy "quote_requests admin read"   on quote_requests for select to authenticated using (is_admin());
create policy "quote_requests admin update" on quote_requests for update to authenticated using (is_admin()) with check (is_admin());
create policy "quote_requests admin delete" on quote_requests for delete to authenticated using (is_admin());

create policy "qri admin read"              on quote_request_items for select to authenticated using (is_admin());
create policy "qri admin update"            on quote_request_items for update to authenticated using (is_admin()) with check (is_admin());
create policy "qri admin delete"            on quote_request_items for delete to authenticated using (is_admin());

-- Customers: admin-only. No anon policy of any kind — anon has zero access.
create policy "customers admin all"         on customers      for all    to authenticated using (is_admin()) with check (is_admin());
