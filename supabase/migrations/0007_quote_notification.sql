-- 0007_quote_notification.sql — LABMAREMI Phase 2, P7
-- Fire an email to the admins the moment a lead lands.
--
-- Before this, a submitted quote sat in quote_requests with nobody told. The
-- frontend is a pure SPA with no server runtime of ours, so there is nowhere in
-- the existing stack to hold a Resend API key. The notification therefore lives
-- entirely on the Supabase side: this trigger fires the `quote-notification`
-- Edge Function, and the function holds the key.
--
-- Two properties this file is built around:
--
--   1. The email is NOT the browser's job. A visitor who closes the tab the
--      instant they submit still generates the mail, and a lead created outside
--      the public form is covered too.
--   2. A mail failure can never cost a lead. quote_requests is the record of
--      business value; Resend is a nice-to-have on top. Everything below is
--      out-of-band and swallows its own errors.
--
-- Run in the Supabase SQL editor, then do the manual setup in
-- docs/RUNBOOK.md §3 "0007 requires manual setup".

-- pg_net gives Postgres an async HTTP client. net.http_post() only *enqueues*
-- the request inside the current transaction; a background worker sends it after
-- COMMIT. That is what keeps the trigger from blocking (or failing) the insert.
--
-- No `with schema` clause: pg_net is non-relocatable and pins itself to the `net`
-- schema, so naming any other one is an error rather than a preference.
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Delivery record
-- ---------------------------------------------------------------------------
-- Stamped by the Edge Function on a successful send. A null on an old lead means
-- the email never went out — which is the first thing to check when someone says
-- "we never got the notification". Also what makes re-sends idempotent.
alter table quote_requests add column if not exists notified_at timestamptz;

-- ---------------------------------------------------------------------------
-- Trigger configuration
-- ---------------------------------------------------------------------------
-- A private schema, NOT in PostgREST's exposed schema list (which is `public`
-- and `graphql_public`), so nothing here is reachable over the REST API no
-- matter what key the caller holds.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Holds the shared secret for the Edge Function — deliberately NOT the Resend
-- API key. The worst this secret buys someone who has already got into the
-- database is the ability to re-send a notification about a lead they can
-- already read.
--
-- Single-row by construction: the primary key is a boolean pinned to true, so a
-- second row is a key violation rather than a silent ambiguity.
create table if not exists private.notification_config (
  id             boolean primary key default true check (id),
  function_url   text not null,
  shared_secret  text not null,
  updated_at     timestamptz not null default now()
);
revoke all on private.notification_config from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Trigger
-- ---------------------------------------------------------------------------
create or replace function notify_quote_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare cfg private.notification_config;
begin
  -- scripts/test-anon-rls.mjs leaves a marker lead behind on every run. Mailing
  -- the admins each time someone runs the security proof would train them to
  -- ignore the notification, which defeats the point of having one.
  if new.company_name like '\_\_RLS\_TEST\_\_%' then
    return new;
  end if;

  select * into cfg from private.notification_config where id;

  -- Unconfigured is not broken. A fresh project, or one where 0007 ran before
  -- the Edge Function was deployed, saves leads normally and mails nobody.
  if cfg.function_url is null then
    return new;
  end if;

  perform net.http_post(
    url     := cfg.function_url,
    headers := jsonb_build_object(
      'Content-Type',     'application/json',
      'x-webhook-secret', cfg.shared_secret
    ),
    body    := jsonb_build_object('quote_request_id', new.id),
    timeout_milliseconds := 8000
  );

  return new;
exception
  -- THE important line in this file. pg_net being absent, the config table being
  -- dropped, a bad URL — none of it may roll back the lead. Swallow everything
  -- and let the row commit. The missing notified_at is the trail.
  when others then
    raise warning 'notify_quote_request failed for %: %', new.id, sqlerrm;
    return new;
end $$;

-- Deliberately NOT revoked from public. Postgres checks EXECUTE on a trigger
-- function at CREATE TRIGGER time, not on every fire, so a revoke here risks the
-- insert path for no gain — a trigger function called directly errors out on its
-- own ("can only be called as a trigger").

drop trigger if exists quote_requests_notify on quote_requests;
create trigger quote_requests_notify
  after insert on quote_requests
  for each row execute function notify_quote_request();

-- ---------------------------------------------------------------------------
-- Manual step — run this yourself, with your own secret
-- ---------------------------------------------------------------------------
-- Generate a secret (any long random string; `openssl rand -hex 32` is fine),
-- use the SAME value for the QUOTE_NOTIFICATION_SECRET function env var, and
-- run:
--
--   insert into private.notification_config (id, function_url, shared_secret)
--   values (
--     true,
--     'https://<project-ref>.supabase.co/functions/v1/quote-notification',
--     '<the-same-secret>'
--   )
--   on conflict (id) do update
--     set function_url  = excluded.function_url,
--         shared_secret = excluded.shared_secret,
--         updated_at    = now();
--
-- Note the ordering: the trigger is live from the moment this file is applied,
-- but does nothing until that row exists. Deploy the function first, then insert
-- the row — that way no lead ever fires at a URL that isn't answering yet.
