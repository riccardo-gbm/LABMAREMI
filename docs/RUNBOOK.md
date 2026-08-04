# Runbook — LABMAREMI

Operational guide: deploying, applying migrations, running data jobs, diagnosing
incidents, and rolling back.

Companion to `docs/CONTRIB.md` (development setup, scripts, testing). Environment
variables are defined once, in `.env.example` — this document references them but
does not redefine them.

---

## 1. Production topology

| Layer            | Service                          | Config in repo |
| ---------------- | -------------------------------- | -------------- |
| Static frontend  | Vercel (Vite preset)             | `vercel.json`  |
| Database + Auth  | Supabase (Postgres, RLS, RPC)    | `supabase/migrations/` |
| Object storage   | Supabase Storage, `product-images` bucket | `0003_product_images_bucket.sql` |
| Lead notification | Supabase Edge Function → Resend  | `supabase/functions/quote-notification/`, `0007_quote_notification.sql` |
| Telemetry        | Vercel Analytics + Speed Insights | mounted in `src/App.tsx:55-56` |

The frontend is a pure SPA. There is no server runtime of ours in the request path
— the browser talks to Supabase's REST API directly, gated by RLS.

The one piece of server code we run is the `quote-notification` Edge Function, and
it is deliberately **out of band**: nothing in the browser calls it or holds a
credential for it. A Postgres trigger fires it after a lead commits. That is why a
Resend outage cannot fail a submission, and why the Resend API key never has to
exist anywhere the public can reach.

---

## 2. Deploy

### First-time setup

1. Connect the GitHub repo (`riccardo-gbm/LABMAREMI`) to Vercel.
2. Framework Preset: **Vite**. Build `npm run build`, output `dist/`.
3. Project Settings → Environment Variables, for **each** environment
   (Production / Preview / Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

   Never add `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, or `ADMIN_PASSWORD` to
   Vercel. They are local-only, used by `scripts/*.mjs`, and have no role in the
   build.
4. `vercel.json` already rewrites `/(.*)` → `/index.html`. Without it every deep
   link (`/catalogo`, `/admin`) 404s on refresh.

### Routine deploy

Merge to `main` → Vercel builds and promotes automatically. PRs get preview
deployments.

### Pre-deploy checks

```bash
npm run build      # tsc -b gate + production bundle
npm run preview    # smoke-test the built output, not the dev server
```

Vercel env vars are read **at build time** — changing one requires a redeploy, not
just a save.

---

## 3. Database migrations

### Apply order

`supabase/migrations/` is applied **in filename order**, in the Supabase SQL editor:

| File | What it does |
| ---- | ------------ |
| `0001_phase2_foundation.sql` | Core schema: `products`, `categories`, `business_types`, `quote_requests`, `quote_request_items`, `customers`, plus first-pass RLS. |
| `0002_catalog_import_keys.sql` | Unique indexes on natural keys. These are what make `import-catalog.mjs` idempotent. |
| `0003_product_images_bucket.sql` | `product-images` Storage bucket and its policies. |
| `0004_catalog_presentation.sql` | `presentation` / `recommended_use` product columns. |
| `0005_quote_submission_rpc.sql` | `submit_quote_request` security-definer RPC — atomic lead + line items, honeypot rejected server-side. The only write path anon has. |
| `0006_admin_role_rls.sql` | Security fix: replaces "any authenticated user is an admin" with the `admin_users` roster and the `is_admin()` function. |
| `0007_quote_notification.sql` | `pg_net`, `quote_requests.notified_at`, the private `notification_config` row, and the `after insert` trigger that fires the `quote-notification` Edge Function. |

### `0006` requires a manual dashboard step

`0001` granted writes and lead/customer reads to the whole `authenticated` role
with `using (true)`. Supabase allows public signup **by default**, and the
publishable key ships inside the browser bundle — so before `0006`, any visitor
could sign themselves up, log in at `/admin`, and read every lead and customer.

Applying `0006` closes the RLS half. The other half cannot be done in SQL:

> Supabase Dashboard → Authentication → Sign In / Providers → Email →
> turn **off** "Allow new users to sign up".

Do both. Defence in depth.

### `0007` requires manual setup

Applying the SQL is only half of it. The trigger is live the moment `0007` runs,
but it does nothing until `private.notification_config` has a row — an
unconfigured project saves leads normally and mails nobody. **Do these in order.**
Deploying the function last would leave a window where a real lead fires at a URL
that isn't answering.

**1. Resend.** Confirm `labmaremi.com` still shows **Verified** under Domains — an
unverified domain is the single most common cause of a silent non-delivery. Then
create an API key for it.

**2. Generate a shared secret.** Any long random string:

```bash
openssl rand -hex 32
```

This value goes in three places and must match in all of them: the function
secret below, the config row below, and `QUOTE_NOTIFICATION_SECRET` in your local
`.env` (so `scripts/test-quote-notification.mjs` can run).

**3. Set the function secrets and deploy.**

```bash
npx supabase secrets set \
  QUOTE_NOTIFICATION_SECRET="<the secret from step 2>" \
  RESEND_API_KEY="<the key from step 1>" \
  QUOTE_NOTIFICATION_FROM="LABMAREMI Cotizaciones <cotizaciones@labmaremi.com>" \
  QUOTE_NOTIFICATION_RECIPIENTS="diego_cango_r@hotmail.com,ricardocango2007@gmail.com" \
  QUOTE_ADMIN_URL="https://<your-domain>/admin"

npx supabase functions deploy quote-notification
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — do not
set them, and never put the Resend key in `.env` or in Vercel.

**4. Point the trigger at the deployed function**, in the SQL editor:

```sql
insert into private.notification_config (id, function_url, shared_secret)
values (
  true,
  'https://alyjdwsblnedadlfplgw.supabase.co/functions/v1/quote-notification',
  '<the same secret from step 2>'
)
on conflict (id) do update
  set function_url  = excluded.function_url,
      shared_secret = excluded.shared_secret,
      updated_at    = now();
```

**5. Prove it.** `node scripts/test-quote-notification.mjs` — then actually open
both inboxes. Hotmail is the fussier of the two; check its junk folder before
concluding anything failed.

### Adding or changing notification recipients

One command, no code change, no deploy of the frontend:

```bash
npx supabase secrets set QUOTE_NOTIFICATION_RECIPIENTS="a@x.com,b@y.com,c@z.com"
```

The list is comma-separated and read on every invocation. Supabase restarts the
function on a secret change, so it takes effect on the next lead.

### Verify, don't assume

```bash
node scripts/test-anon-rls.mjs     # logged-out visitor sees nothing
node scripts/test-admin-rls.mjs    # logged-in stranger sees nothing either
```

`test-admin-rls.mjs` is the direct proof that `0006` is live. Run it after any
migration, any auth change, and after restoring a database backup — a restore can
silently revert policies.

### Granting admin access

Membership in `admin_users` is granted from the SQL editor or by the service role
only. There is deliberately no INSERT/UPDATE/DELETE policy on that table, so a
client with a valid session cannot promote itself.

```sql
insert into admin_users (user_id, email)
values ('<auth.users.id>', '<email>')
on conflict (user_id) do nothing;
```

---

## 4. Data operations

Both jobs run locally from the repo root with `.env` populated. Both are **safe to
re-run** — every write is an upsert, nothing is truncated, and product ids survive,
so existing `quote_request_items` keep pointing at the right rows.

### Catalog import

```bash
node scripts/import-catalog.mjs --dry-run     # validate, write nothing
node scripts/import-catalog.mjs
```

Seeds `categories` + `business_types`, then imports `docs/labmaremi_catalog.csv`
into `products`. The canonical category list — names, slugs, and the public copy
Home renders — lives in the `CATEGORY_SEED` array inside the script; array order
becomes `sort_order`. Edit the CSV or that array, never the rows by hand.

### Product images

```bash
node scripts/upload-product-images.mjs --list                    # expected filenames
node scripts/upload-product-images.mjs ./product-photos --dry-run
node scripts/upload-product-images.mjs ./product-photos
```

Files are matched to products by slugified product name
(`Guantes de Nitrilo Azul` → `guantes-de-nitrilo-azul.jpg`). Accepts
`.jpg/.jpeg/.png/.webp/.avif`. Run `--list` first so you name files without
guessing. Uploads upsert, so a re-upload overwrites the same path rather than
duplicating it.

---

## 5. Monitoring

| Signal | Where | Watch for |
| ------ | ----- | --------- |
| Traffic, page views | Vercel Analytics | Sudden drop after a deploy = broken route or bad env var. |
| Core Web Vitals | Vercel Speed Insights | LCP regressions on Home — the hero is the heaviest surface. |
| Build status | Vercel Deployments | `tsc -b` failures fail the build; the previous deployment stays live. |
| API errors, RLS denials | Supabase → Logs / API | A spike in 401/403 usually means a policy changed. |
| Lead flow | `/admin` dashboard | Zero new leads over a normally-busy period is the first sign the quote form is broken. |
| Notification delivery | `quote_requests.notified_at` | A recent lead with `notified_at` null means the email never went out. This is the one signal that catches a broken notification without anyone noticing the absence of a mail. |
| Edge Function runs | Supabase → Edge Functions → `quote-notification` → Logs | `resend rejected` lines carry the upstream reason verbatim. |
| Email delivery | Resend dashboard | Bounces and spam complaints, especially on the Hotmail address. |

There is no alerting configured. Vercel and Supabase email on build/project
failures; everything else is checked by looking.

A useful weekly glance:

```sql
select company_name, created_at, notified_at
from quote_requests
where notified_at is null and created_at > now() - interval '7 days'
order by created_at desc;
```

Empty is healthy.

---

## 6. Common issues

### Blank page, console error about missing Supabase env vars

`src/lib/supabase.ts:7` throws at module load when `VITE_SUPABASE_URL` or
`VITE_SUPABASE_PUBLISHABLE_KEY` is missing. This is deliberate — loud beats silent.

- Local: `.env` missing or unpopulated. Copy `.env.example`, fill it, restart the
  dev server (Vite reads `.env` at startup).
- Production: env var missing for that specific Vercel environment, or set after
  the last build. Add it, then **redeploy** — values are inlined at build time.

### Deep links 404 on refresh, but work when clicked

The SPA rewrite is missing. Confirm `vercel.json` is present at the repo root and
contains the `/(.*)` → `/index.html` rewrite. Clicking works because React Router
handles it client-side; refreshing asks the CDN for a path that has no file.

### Catalog is empty or the page shows a load error

`src/lib/catalogData.ts` throws on any non-OK response — there is **no mock-data
fallback**, so a failure surfaces as an error state, never as stale content.
Check in order:

1. Supabase project paused (free tier pauses on inactivity) — resume it.
2. Products exist but `is_active = false`; the public query filters on it.
3. RLS blocking anon reads on `products` / `categories` — `node scripts/test-anon-rls.mjs`.
4. Wrong `VITE_SUPABASE_URL` for the environment.

### Quote form fails to submit

The write goes through the `submit_quote_request` RPC (`0005`), not a table insert
— anon has no direct insert. `src/lib/quoteSubmission.ts:44` surfaces the RPC's own
error message. Check the RPC exists and is `security definer`; check the honeypot
field isn't being auto-filled by a password manager (server-side rejection looks
identical to spam).

### Admin can't log in / dashboard is empty for a real admin

The session is valid but the user is not in `admin_users`, so `is_admin()` returns
false and every policy denies. Add them per §3, then re-run
`node scripts/test-admin-rls.mjs`. An empty dashboard for a *non*-admin is correct
behaviour, not a bug.

### A `__RLS_TEST__ (delete me)` lead in the dashboard

Left intentionally by `scripts/test-anon-rls.mjs`: proving anon can submit means
one row survives, and anon has no delete. Remove it from the admin dashboard.

These rows do **not** send a notification — `notify_quote_request()` skips any
`company_name` starting with `__RLS_TEST__` on purpose. A notification that fires
on every security run is a notification people learn to ignore.

### Quote submitted but no email arrived

The lead itself is never at risk here: the trigger is out of band and swallows its
own errors, so the row commits either way. Work down this ladder — each step rules
out everything above it.

```sql
-- 1. Did the function even report success?
select id, company_name, created_at, notified_at
from quote_requests order by created_at desc limit 5;
```

- **`notified_at` is set** → the email left Resend. It is a delivery problem, not a
  code problem. Check the Hotmail junk folder, then the Resend dashboard for a
  bounce. Verify the recipient list: `npx supabase secrets list`.
- **`notified_at` is null** → keep going.

```sql
-- 2. Is the trigger configured at all? No row = it never fired.
select function_url, updated_at from private.notification_config;

-- 3. What did pg_net get back? net.* is only readable as the service role.
select created, status_code, content
from net._http_response order by created desc limit 5;
```

- **No `net._http_response` rows** → `pg_net` isn't installed, or the config row is
  missing. Re-run §3 step 4.
- **`401`** → the secret in `private.notification_config.shared_secret` and the
  `QUOTE_NOTIFICATION_SECRET` function secret have drifted apart. Set both to the
  same value again.
- **`404`** → the function isn't deployed, or `function_url` is wrong.
  `npx supabase functions deploy quote-notification`.
- **`500`** → the reason is in the response body and in the function logs.
  `missing env: …` means a secret was never set. `resend rejected` carries Resend's
  own message — most often the sending domain is no longer verified, which happens
  quietly when DNS records get edited.

To re-send for a lead that was missed, once the cause is fixed:

```bash
curl -X POST "https://alyjdwsblnedadlfplgw.supabase.co/functions/v1/quote-notification" \
  -H "x-webhook-secret: <the shared secret>" \
  -H "Content-Type: application/json" \
  -d '{"quote_request_id":"<uuid>","force":true}'
```

`force` is needed only if `notified_at` is already set; without it the call is a
no-op by design.

---

## 7. Rollback

### Frontend

Vercel → Deployments → previous good deployment → **Promote to Production**.
Instant, no rebuild. Then fix forward in a branch.

### Database

**There are no down migrations in this repo.** `supabase/migrations/` is
forward-only, so a schema rollback is hand-written SQL, written and reviewed at the
time. Before any migration that drops or rewrites data, take a Supabase backup
first.

Frontend and schema rollback are **not symmetric**: promoting an older frontend
build against a newer schema is usually fine (additive migrations), but rolling the
*schema* back under a current frontend will break it. Roll the frontend back first,
then decide about the schema.

### Never roll back `0006`

Reverting it re-opens the "any authenticated user is an admin" hole described in
§3. If something built on `0006` is broken, fix forward.

### `0007` is the one safe exception

Unlike the rest of the schema, the notification is additive and inert on its own —
disabling it costs nothing but the emails. If it is misbehaving and you want it off
while you work out why:

```sql
alter table quote_requests disable trigger quote_requests_notify;
```

Leads keep saving exactly as before. `enable trigger` puts it back. Emptying
`private.notification_config` has the same effect. Do **not** drop the
`notified_at` column to "clean up" — it is the delivery record, and the ladder in
§6 depends on it.

---

## 8. Related documents

- `docs/CONTRIB.md` — setup, scripts reference, environment variables, testing gates.
- `docs/phase2-plan.md` — Phase 2 scope and rationale.
- `supabase/migrations/0006_admin_role_rls.sql` — the security rationale, in full,
  at the top of the file.
