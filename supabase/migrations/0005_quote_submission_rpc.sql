-- 0005_quote_submission_rpc.sql — LABMAREMI Phase 2, P6
-- The public quote form's write path.
--
-- anon has INSERT but NO SELECT on quote_requests / quote_request_items (P1),
-- so `.insert().select()` is impossible. This security-definer RPC is the anon
-- write path instead: it inserts the lead and its items atomically (one
-- transaction), drops honeypot hits, and validates input server-side — none of
-- which the raw table policies can do. Run in the Supabase SQL editor.

create or replace function submit_quote_request(
  company_name     text,
  contact_person   text,
  phone            text,
  email            text,
  business_type_id uuid,
  location         text,
  message          text,
  product_ids      uuid[],
  honeypot         text default ''
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid;
begin
  -- Bot trap: a filled honeypot is a script, not a person. Return quietly so
  -- the bot sees success; write nothing.
  if honeypot is not null and length(trim(honeypot)) > 0 then
    return;
  end if;

  -- Server-side mirror of the client validation, so a direct API call can't
  -- create an empty or contentless lead.
  if length(trim(coalesce(company_name, ''))) = 0
     or length(trim(coalesce(contact_person, ''))) = 0 then
    raise exception 'company_name and contact_person are required';
  end if;
  if coalesce(array_length(product_ids, 1), 0) = 0
     and length(trim(coalesce(message, ''))) = 0 then
    raise exception 'at least one product or a message is required';
  end if;

  insert into quote_requests
    (company_name, contact_person, phone, email, business_type_id, location, message)
  values
    (company_name, contact_person, phone, email, business_type_id, location, message)
  returning id into new_id;

  if product_ids is not null then
    insert into quote_request_items (quote_request_id, product_id)
    select new_id, pid from unnest(product_ids) as pid;
  end if;
end $$;

revoke all on function submit_quote_request(
  text, text, text, text, uuid, text, text, uuid[], text) from public;
grant execute on function submit_quote_request(
  text, text, text, text, uuid, text, text, uuid[], text) to anon, authenticated;

-- Make the RPC the ONLY anon write path. Without this, a bot bypasses the
-- honeypot + validation by inserting into the tables directly via P1's
-- "anon insert" policies. Admin (authenticated) writes and the security-definer
-- RPC are both unaffected.
drop policy if exists "quote_requests anon insert" on quote_requests;
drop policy if exists "qri anon insert"            on quote_request_items;
