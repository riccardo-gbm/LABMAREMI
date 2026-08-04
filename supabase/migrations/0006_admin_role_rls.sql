-- 0006_admin_role_rls.sql — LABMAREMI Phase 2 security fix
-- Replaces "any logged-in user is an admin" with a real admin roster.
--
-- WHY: 0001 granted every write (and every lead/customer read) to the whole
-- `authenticated` role with `using (true)`. That is only safe while nobody can
-- create an account. Supabase projects allow public signup by DEFAULT, and the
-- publishable key ships inside the browser bundle — so any visitor could sign
-- themselves up, log in at /admin, and read every lead, every customer record,
-- and edit or delete the catalog. This migration gates all of it on membership
-- in `admin_users`, which no client can write to.
--
-- Run in the Supabase SQL editor AFTER 0005.
-- ALSO do this in the dashboard: Authentication → Sign In / Providers → Email →
-- turn OFF "Allow new users to sign up". Defense in depth; this file cannot set it.

-- ---------------------------------------------------------------------------
-- Admin roster
-- Membership is granted here, in the SQL editor (or by the service role) only.
-- There is deliberately no INSERT/UPDATE/DELETE policy: a client with a valid
-- session still cannot promote itself.
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null default '',
  created_at  timestamptz not null default now()
);

alter table admin_users enable row level security;

drop policy if exists "admin_users self read" on admin_users;
create policy "admin_users self read" on admin_users
  for select to authenticated using (user_id = auth.uid());

-- Single source of truth for "is the caller an admin?".
-- security definer so it reads the roster regardless of the caller's own RLS
-- (and so policies that call it can never recurse back into admin_users).
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

-- ---------------------------------------------------------------------------
-- GRANT ADMIN  ←  EDIT THIS BEFORE RUNNING
-- Replace the address below with the real admin login. Nothing in the admin
-- panel works until at least one account is on the roster. The guard at the
-- bottom of this file aborts the whole migration if you forget, so a typo
-- cannot lock you out — it just makes the migration fail loudly.
-- Add more admins later with the same INSERT.
-- ---------------------------------------------------------------------------
insert into admin_users (user_id, email)
select id, coalesce(email, '')
from auth.users
where email = 'ricardocango2007@gmail.com'
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- Catalog: everyone still reads, only roster admins write.
-- (The `for select ... using (true)` public-read policies from 0001 are correct
-- and stay untouched — the catalog is meant to be public.)
-- ---------------------------------------------------------------------------
drop policy if exists "categories admin write" on categories;
create policy "categories admin write" on categories
  for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "business_types admin write" on business_types;
create policy "business_types admin write" on business_types
  for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "products admin write" on products;
create policy "products admin write" on products
  for all to authenticated using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Leads and customers: roster admins only, reads included.
-- anon has no policy on these at all (0005 dropped the direct-insert ones);
-- the public form writes through the security-definer submit_quote_request RPC.
-- ---------------------------------------------------------------------------
drop policy if exists "quote_requests admin read" on quote_requests;
create policy "quote_requests admin read" on quote_requests
  for select to authenticated using (is_admin());

drop policy if exists "quote_requests admin update" on quote_requests;
create policy "quote_requests admin update" on quote_requests
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "quote_requests admin delete" on quote_requests;
create policy "quote_requests admin delete" on quote_requests
  for delete to authenticated using (is_admin());

drop policy if exists "qri admin read" on quote_request_items;
create policy "qri admin read" on quote_request_items
  for select to authenticated using (is_admin());

drop policy if exists "qri admin update" on quote_request_items;
create policy "qri admin update" on quote_request_items
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "qri admin delete" on quote_request_items;
create policy "qri admin delete" on quote_request_items
  for delete to authenticated using (is_admin());

drop policy if exists "customers admin all" on customers;
create policy "customers admin all" on customers
  for all to authenticated using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Storage: product photos stay publicly readable (public bucket), but only
-- roster admins may upload, replace, or delete them. Supersedes 0003.
-- ---------------------------------------------------------------------------
drop policy if exists "product-images admin write" on storage.objects;
create policy "product-images admin write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "product-images admin update" on storage.objects;
create policy "product-images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "product-images admin delete" on storage.objects;
create policy "product-images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and is_admin());

-- ---------------------------------------------------------------------------
-- Lock-out guard. If the roster is empty the admin panel would be dead on
-- arrival, so fail the migration instead. The SQL editor runs this file in one
-- transaction, so nothing above is kept.
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from admin_users) then
    raise exception
      'admin_users is empty — edit REPLACE_WITH_ADMIN_EMAIL above to a real account in Authentication > Users, then run this file again.';
  end if;
end $$;
