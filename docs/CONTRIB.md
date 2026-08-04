# Contributing — LABMAREMI

Development guide for the LABMAREMI B2B catalog and quotation platform.

Generated from `package.json` and `.env.example` — those two files are the single
source of truth. If you add a script or an environment variable, update them
first and re-sync this document.

---

## 1. Prerequisites

| Tool     | Version   | Notes                                                  |
| -------- | --------- | ------------------------------------------------------ |
| Node.js  | ≥ 20      | Verified on v24. Vite 6 + `@types/node` 24 assume ≥ 20. |
| npm      | ≥ 10      | Verified on v11.                                       |
| Supabase | project   | Required for anything past the static shell — the app throws on boot without credentials (see §3). |

The repo is ESM (`"type": "module"`), so `scripts/*.mjs` and config files use
`import`, never `require`.

---

## 2. Setup

```bash
git clone https://github.com/riccardo-gbm/LABMAREMI.git
cd LABMAREMI
npm install
cp .env.example .env      # then fill in the values from §3
npm run dev               # http://localhost:5173
```

---

## 3. Environment variables

From `.env.example`. `.env` is gitignored — never commit it.

### Shipped to the browser

Vite inlines only `VITE_`-prefixed variables into the client bundle. Anything
with this prefix is **public** by definition; treat it as published.

| Variable                         | Required | Format                                     | Purpose |
| -------------------------------- | -------- | ------------------------------------------ | ------- |
| `VITE_SUPABASE_URL`              | Yes      | `https://<project-ref>.supabase.co`        | REST/Auth base URL. Read by `src/lib/supabase.ts`, `catalogData.ts`, `quoteSubmission.ts`. |
| `VITE_SUPABASE_PUBLISHABLE_KEY`  | Yes      | `sb_publishable_…`                         | Anon/publishable key. Safe to ship **only** because RLS restricts it to active catalog reads plus the `submit_quote_request` RPC. |

`src/lib/supabase.ts` throws at module load if either is missing, so a bad `.env`
produces a blank page and a clear console error rather than a silent failure.

### Local-only (never `VITE_`-prefixed, never in the bundle)

Used exclusively by `scripts/*.mjs`. Supply **either** the service role key
**or** an admin login — both paths work, neither needs the other.

| Variable                    | Required            | Purpose |
| --------------------------- | ------------------- | ------- |
| `SUPABASE_SERVICE_ROLE_KEY` | one of these two    | Bypasses RLS entirely. Highest privilege — keep off shared machines. |
| `ADMIN_EMAIL`               | one of these two    | Signs the script in as a Phase 2 admin; obeys RLS. |
| `ADMIN_PASSWORD`            | with `ADMIN_EMAIL`  | — |

| `QUOTE_NOTIFICATION_SECRET`  | for the email test  | Shared secret between the `quote_requests_notify` trigger and the `quote-notification` Edge Function. Used only by `scripts/test-quote-notification.mjs`. Must equal `private.notification_config.shared_secret`. |

`scripts/test-admin-rls.mjs` is the exception: it needs the service role key
**and** the admin login together, because it creates and deletes a throwaway
account to prove a logged-in stranger sees nothing.

### Edge Function secrets (not in `.env` at all)

The `quote-notification` function's own configuration — `RESEND_API_KEY`,
`QUOTE_NOTIFICATION_FROM`, `QUOTE_NOTIFICATION_RECIPIENTS`, `QUOTE_ADMIN_URL`,
and its copy of `QUOTE_NOTIFICATION_SECRET` — lives in Supabase, set with
`supabase secrets set`. It never touches this repo, `.env`, or Vercel. Setup is in
`docs/RUNBOOK.md` §3.

**Adding another notification recipient is one command and no deploy:**

```bash
npx supabase secrets set QUOTE_NOTIFICATION_RECIPIENTS="a@x.com,b@y.com,c@z.com"
```

---

## 4. Scripts

### npm scripts (`package.json`)

| Command            | Runs                    | What it does |
| ------------------ | ----------------------- | ------------ |
| `npm run dev`      | `vite`                  | Dev server with HMR on `:5173`. |
| `npm run build`    | `tsc -b && vite build`  | Type-checks the project references first, then emits `dist/`. A type error fails the build — this is the type-check gate. |
| `npm run preview`  | `vite preview`          | Serves the built `dist/` locally. Use it to sanity-check the production bundle before deploying. |
| `npm run doctor`   | `npx react-doctor@latest` | React lint / a11y / bundle-size / architecture scan. Config lives in `doctor.config.json`. |

### Node scripts (`scripts/`)

Run with plain `node`, from the repo root, with `.env` populated per §3.

| Command | Flags | What it does |
| ------- | ----- | ------------ |
| `node scripts/import-catalog.mjs` | `--dry-run` | Seeds `categories` + `business_types`, then imports `docs/labmaremi_catalog.csv` into `products`. **Safe to re-run** — every write is an upsert on a natural key (backed by migration `0002`), so ids survive and existing `quote_request_items` keep pointing at the right rows. |
| `node scripts/import-descriptions.mjs` | `--dry-run` | Loads the long-form **Descripción del Producto** / **Modo de Uso** copy from `description.txt` (repo root) into `products.description` and `products.recommended_use`. Matched on `slug`, not name — several products were renamed in Supabase after the original import. Products that already carry hand-written long-form copy are left alone, and the previous values are backed up to `docs/backups/` before the first write. **Safe to re-run**: every write is an `UPDATE`, never an insert. |
| `node scripts/export-catalog-csv.mjs` | `--dry-run` | Snapshots the live `products` table back into `docs/labmaremi_catalog.csv`. Read-only against the database. Run it after **any** change made directly in Supabase — otherwise the CSV drifts and `import-catalog.mjs` turns into a landmine that re-inserts renamed products and restores the old one-line descriptions. Category names in the output must match `CATEGORY_SEED` in `import-catalog.mjs`. |
| `node scripts/upload-product-images.mjs <folder>` | `--list`, `--dry-run` | Uploads a folder of photos to the `product-images` Storage bucket and sets each product's `image_url`. Files are matched by slugified product name (`Guantes de Nitrilo Azul` → `guantes-de-nitrilo-azul.jpg`; `.jpg/.jpeg/.png/.webp/.avif`). Run `--list` first to print the exact filename expected for every product. Upserts, so re-uploads overwrite rather than duplicate. |
| `node scripts/test-anon-rls.mjs` | — | Security proof, anon client. Asserts a logged-out visitor can submit a quote via the RPC but cannot read `quote_requests`, `quote_request_items`, or `customers`, and cannot insert directly. Leaves one marker row `__RLS_TEST__ (delete me)` for an admin to clear from the dashboard. |
| `node scripts/test-admin-rls.mjs` | — | Security proof for migration `0006`. Asserts the real admin passes `is_admin()`, while a freshly created ordinary account fails it, reads zero leads/items/customers, and cannot write the catalog. Creates and deletes its own throwaway user; touches nothing else. |
| `node scripts/test-quote-notification.mjs` | `--dry-run` | Verification for migration `0007` and the `quote-notification` Edge Function. Asserts the shared-secret gate rejects wrong and missing secrets, input is validated, an unknown id 404s, the newest real lead is emailed, a repeat call is skipped, and `notified_at` is stamped. **Sends a real email** to everyone in `QUOTE_NOTIFICATION_RECIPIENTS` — `--dry-run` stops before that step. |

`scripts/slugify.mjs` is a shared helper, not a runnable entry point.

---

## 5. Repository layout

```text
src/
  components/   about · admin · auth · catalog · hero · layout · quote · ui
  hooks/        useAsync, useRevealOnMount
  lib/          supabase client, catalog fetching, quote submission, admin derivations
  pages/        Home · Catalog · ProductDetail · Quote · About · Platform · Contact · AdminLogin · Admin · NotFound
  types/        database + application interfaces
supabase/
  migrations/   0001 … 0007, applied in order
  functions/    quote-notification — Deno, the only server code we run
  config.toml   CLI config, used for `functions deploy` and nothing else
scripts/               importers + RLS proofs + the notification test
docs/                  this file, RUNBOOK.md, phase plans, catalog CSV
```

Conventions worth keeping:

- **All user-facing copy is Spanish, formal register ("usted").** Code, comments,
  file names, variable names, and commit messages stay in English.
- Shared UI primitives live in `src/components/ui` and are built once, reused
  everywhere. Don't restyle per page.
- Admin routes are lazily loaded in `App.tsx` and code-split out of the public
  bundle deliberately — keep it that way.
- Framer Motion is imported as `m.` (not `motion.`) to keep the tree-shaken
  build small.

---

## 6. Development workflow

1. Branch off `main`.
2. Build the change. Check the real repo state before assuming what a previous
   session left behind.
3. Run the checks in §7.
4. Commit in English, imperative mood, conventional prefix
   (`feat:`, `fix:`, `perf:`, `refactor:`, `chore:`).
5. Open a PR against `main`. Vercel builds a preview deployment per PR.

If a change touches the database, the migration ships in the same PR as the code
that depends on it — see `docs/RUNBOOK.md` §3 for the apply order.

---

## 7. Testing procedures

There is **no unit-test runner in this repo** — no Vitest, no Jest, no Playwright.
Verification is the four gates below. Don't report work as done until they pass.

| Gate | Command | Passes when |
| ---- | ------- | ----------- |
| Types + build | `npm run build` | Exits 0. `tsc -b` runs in strict mode; any type error fails here. |
| React diagnostics | `npm run doctor` | No new findings. One rule is suppressed in `doctor.config.json` (`artifact-baas-authority-surface`) as a known false positive for the admin bundle. |
| Security / RLS | `node scripts/test-anon-rls.mjs` and `node scripts/test-admin-rls.mjs` | All assertions pass. Required after any change to `supabase/migrations/` or to auth/admin code. |
| Manual smoke | `npm run dev` (or `npm run preview`) | Zero console errors; catalog filters and search work; the quote flow submits; `/admin` rejects a non-admin session; responsive on mobile and desktop. |
| Quote notification (conditional) | `node scripts/test-quote-notification.mjs` | All assertions pass and the mail arrives. Required only after touching `0007`, the `quote-notification` function, or the quote write path. Sends a real email — use `--dry-run` to check the wiring without it. |

Adding a test framework is a real improvement — it just hasn't been done yet.
If you add one, wire it into `package.json` and update this table.

---

## 8. Related documents

- `docs/RUNBOOK.md` — deploy, migrations, incidents, rollback.
- `docs/phase2-plan.md` — Phase 2 scope and rationale.
- `docs/phase1-execution-plan_2.md` — historical, Phase 1.
- `CLAUDE.md` / `AGENTS.md` — agent working agreements.
