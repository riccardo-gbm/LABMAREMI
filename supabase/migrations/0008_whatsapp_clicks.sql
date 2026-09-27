-- 0008_whatsapp_clicks.sql — WhatsApp click tracking
-- Most leads arrive over WhatsApp, not through the quote form, and the site had
-- no record of them. This logs every click on a WhatsApp link (which product,
-- which button) so the admin dashboard can rank what people ask about.
--
-- A click is not a sent message — it is the closest signal the site can see.
--
-- Same shape as 0005: anon gets no policy on the table at all; the only write
-- path is a security-definer RPC that validates its input. Only roster admins
-- can read. Run in the Supabase SQL editor.

create table if not exists whatsapp_clicks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  source      text not null
                check (source in ('product', 'widget', 'home', 'contact')),
  product_id  uuid references products (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  page_path   text check (page_path is null or length(page_path) <= 200)
);

create index if not exists whatsapp_clicks_created_at_idx
  on whatsapp_clicks (created_at desc);
create index if not exists whatsapp_clicks_product_id_idx
  on whatsapp_clicks (product_id);

alter table whatsapp_clicks enable row level security;

drop policy if exists "whatsapp_clicks admin read" on whatsapp_clicks;
create policy "whatsapp_clicks admin read" on whatsapp_clicks
  for select to authenticated using (is_admin());

drop policy if exists "whatsapp_clicks admin delete" on whatsapp_clicks;
create policy "whatsapp_clicks admin delete" on whatsapp_clicks
  for delete to authenticated using (is_admin());

-- Parameter names are the JSON keys PostgREST exposes, so they stay short;
-- inside the body they are qualified with the function name to avoid clashing
-- with the identically named columns.
create or replace function log_whatsapp_click(
  source     text,
  product_id uuid default null,
  page_path  text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_product  uuid;
  resolved_category uuid;
begin
  if log_whatsapp_click.source is null
     or log_whatsapp_click.source not in ('product', 'widget', 'home', 'contact') then
    raise exception 'invalid source';
  end if;

  -- Category comes from the product row, never from the client. An unknown or
  -- inactive product id is recorded as a click without a product.
  if log_whatsapp_click.product_id is not null then
    select p.id, p.category_id
      into resolved_product, resolved_category
      from products p
     where p.id = log_whatsapp_click.product_id
       and p.is_active;
  end if;

  insert into whatsapp_clicks (source, product_id, category_id, page_path)
  values (
    log_whatsapp_click.source,
    resolved_product,
    resolved_category,
    nullif(left(log_whatsapp_click.page_path, 200), '')
  );
end $$;

revoke all on function log_whatsapp_click(text, uuid, text) from public;
grant execute on function log_whatsapp_click(text, uuid, text) to anon, authenticated;
