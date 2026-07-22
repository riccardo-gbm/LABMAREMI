# LABMAREMI Phase 2 — Corrections & Implementation Plan

## How to use this
Same pattern as Phase 1: one item at a time, review before moving on. Run Part 1 (corrections) before Part 2 (new features) — some corrections touch components the new features will build on top of.

---

## Part 1 — Phase 1 corrections (business feedback)

### C1 — Hero redesign

**Prompt:**

Note: inspect the actual current hero component(s) first — the floating images, the two glass cards on the right, and the mouse-parallax logic — rather than assuming they match earlier plans. This describes what's visible in a screenshot, not known file names.

Restructure the Home hero as follows:

**1. Center the LABMAREMI block.** Move the "QUITO, ECUADOR" kicker tag, the "LABMAREMI" wordmark, and the two CTA buttons ("Solicitar cotización" / "Ver catálogo") from their current left-aligned position to horizontally centered, as one centered column. Keep their existing styling (colors, sizes, button variants) — only the alignment/position changes.

**2. Consolidate the two glass cards into one rectangle at the bottom of the hero.** There's currently an upper-right card (200+ Productos disponibles, the 5+/Quito/B2B stat row, the two pill badges) and a separate lower card ("Atendemos sectores como" with a sector list that's currently overflowing/clipped at the card edges). Merge these into a single glass rectangle positioned at the bottom of the hero section, not floating on the right anymore:
   - Top portion: the existing stats (200+ Productos disponibles, 5+ Años de experiencia, Quito y provincias, B2B Atención empresarial) and the two pill badges (Catálogo activo, Cotización directa) — keep exactly as styled now.
   - Bottom portion, same rectangle: "Atendemos sectores como:" plus the sector badges (Clínicas, Instituciones, and whichever others exist). Fix the current overflow — either wrap every badge onto visible rows, or if it stays a horizontal scroller, add a proper fade/scroll affordance at the edges instead of the current abrupt cut-off mid-label.
   - On mobile, this rectangle should stack vertically and can shrink font sizes or show fewer sector badges rather than force everything into one cramped row.

**3. Redistribute the floating images to surround the centered wordmark.** Instead of the current distribution (scattered across the full width, denser toward the corners), reposition them along a loose ring around the center point where LABMAREMI now sits — vary radius and angle per image slightly so it stays organic, not a perfect circle. This uses the space freed up by removing the two glass cards from the right side.

**4. Remove mouse-parallax entirely.** Find the mousemove listener and the transform tied to cursor position currently driving the floating images, and delete that logic. Keep the idle floating animation (slow up/down drift, slight rotation loop) — only the cursor-follow behavior goes.

When done, tell me: what the current hero component(s) actually turned out to be named/structured as, how you handled the sector-badge overflow fix, and how the bottom rectangle stacks on mobile.

### C2 — About page: Mission/Vision/Values + photo simplification

**Prompt:**

Update the About Us page (/nosotros) in two ways. Don't touch the M9 scroll-morph intro section at the top — leave it exactly as-is.

**1. Add a Misión / Visión / Valores section**, placed after the M9 intro and before (or integrated into) the existing timeline. I don't have your exact wording yet, so use this as placeholder copy — swap in the real text whenever it's ready:

- **Misión:** "Proveer a las empresas de Quito y Ecuador productos de limpieza, desinfección e higiene de calidad, con un servicio confiable y oportuno que les permita mantener los más altos estándares de higiene para sus clientes y colaboradores."
- **Visión:** "Ser el distribuidor de productos de limpieza e higiene de mayor confianza para las empresas ecuatorianas, reconocido por nuestra calidad, cercanía y compromiso con cada cliente."
- **Valores:** four short value cards — Confiabilidad, Calidad, Compromiso, Cercanía — each with a one-line description you can write or I can draft further if asked.

Style this using the existing shared primitives (Card, Section) — don't invent a new visual pattern for this one section.

**2. Simplify the team photos in the M5 section only.** Replace the current individual avatar-placeholder grid with exactly two photo blocks:
- One labeled for the board/leadership photo ("Junta directiva" or similar)
- One labeled for a general team group photo ("Nuestro equipo" or similar)

Real photos aren't ready yet, so use styled placeholder blocks (not stock photos of random people) — same principle as the original M5 instruction: these represent specific real people, so a generic stock photo pretending to be them would be misleading. A simple bordered box with an icon and a caption like "Foto próximamente" is enough for now.

When done, tell me where you placed the Misión/Visión/Valores section relative to the existing timeline, and confirm the M9 intro above it wasn't touched.

---

## Part 2 — Phase 2 new features (milestone map)

| # | Milestone | Scope |
|---|---|---|
| P1 | Supabase foundation | Project setup, schema (products, categories, business_types, quote_requests, customers), RLS policies |
| P2 | Admin auth | Supabase Auth, email + password, login-gated /admin route, no public signup — 1-2 admin accounts created directly, not self-serve |
| P3 | Real admin page | Replace M6's mock-data preview with live queries: real leads, editable status, real stats |
| P4 | Catalog import (CSV + images) | Import the `labmaremi_catalog.csv` into Supabase, wire up product images |
| P5 | Replace mock data everywhere | Wire every component off `src/data/*.ts` to live Supabase queries, add loading/error states |
| P6 | Quote form → real persistence | Public quote submissions write to Supabase instead of the current fake success state |

**Run P1 and P2 with Opus, and review the generated RLS policies line by line before deploying** — these are the two places in the whole project where a mistake actually costs something. A misconfigured RLS policy can expose customer data or let anyone write to your database; a broken auth flow can lock you out or let the wrong person in. Don't just skim Claude Code's "when done" summary on these two.

---

### P1 — Supabase foundation

**You do first (Claude Code can't do these — they involve account creation and credentials):**
1. Create a Supabase project at supabase.com, choose a region close to Ecuador (e.g. `sa-east-1` São Paulo).
2. Copy the project URL and the anon/public key into a `.env` file (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Add `.env` to `.gitignore` — never commit it.
3. Keep the service-role key somewhere safe but do NOT put it in the frontend `.env` or anywhere that ships to the browser.

**Prompt (run with Opus):**

Set up the Supabase foundation for LABMAREMI Phase 2. I've created the project and put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (gitignored).

1. Install `@supabase/supabase-js` and create a typed Supabase client in `src/lib/supabase.ts` that reads from the env vars. Fail loudly with a clear error if the env vars are missing.

2. Design and generate the SQL schema for these tables — give me the SQL as a migration file I can run in the Supabase SQL editor, and explain each table before I run it:
   - `categories` — id, name (Spanish), slug, sort_order
   - `products` — id, name, category_id (FK), description, presentation, recommended_use, image_url (nullable), is_active (default true), created_at
   - `business_types` — id, name (Spanish)
   - `quote_requests` — id, company_name, contact_person, phone, email, business_type_id (FK, nullable), location, message, status (enum: nuevo/contactado/interesado/cliente/rechazado, default nuevo), created_at
   - `quote_request_items` — join table: quote_request_id (FK), product_id (FK) — the products a lead asked about
   - `customers` — id, company_name, contact_person, phone, email, notes, created_at (for leads that convert)

3. Write Row Level Security policies and explain each one in plain language before I apply it:
   - `categories`, `products`, `business_types`: public read (anon can SELECT), no public write
   - `quote_requests` and `quote_request_items`: anon can INSERT (so the public form works) but NOT select/update/delete — a random visitor must never be able to read other people's quote requests
   - `quote_requests` (read/update), `customers` (all), and product/category writes: authenticated users only (admins)
   - Double-check there's no policy that lets anon read `quote_requests` or `customers`. Call this out explicitly in your explanation.

4. Generate TypeScript types from the schema (Supabase CLI `gen types` or hand-written to match) so the rest of the app is typed against the real tables.

Don't wire any UI to this yet — schema, client, RLS, and types only. Walk me through the SQL and every RLS policy before telling me to run anything. When done, summarize exactly which tables anon can read, which it can write, and confirm customer/lead data is not anon-readable.

---

### P2 — Admin authentication

**Prompt (run with Opus):**

Add admin authentication using Supabase Auth (email + password). There is NO public signup — this is admin-only.

1. In the Supabase dashboard I'll create the 1-2 admin accounts manually (Auth → Users → Add user). Disable public signups in the Supabase Auth settings — remind me to do this and tell me exactly where.

2. Build a login page at `/admin/login`: email + password fields, Spanish labels, error handling for wrong credentials (a generic "Credenciales incorrectas" — don't reveal whether the email exists).

3. Protect every `/admin` route (except `/admin/login`) with an auth guard: unauthenticated users get redirected to `/admin/login`. Use Supabase's session, and handle the loading state so there's no flash of admin content before the auth check resolves.

4. Add a logout control in the admin layout.

5. Keep the session persistent across refreshes (Supabase does this by default — just confirm it works and the guard reads the restored session correctly).

Security checks to confirm in your summary: that admin content never renders before auth resolves, that the redirect can't be bypassed by direct URL entry, and that no admin API calls would succeed for an anon user even if the UI guard were bypassed (the RLS from P1 is the real backstop — confirm it's doing its job, the UI guard is just UX).

When done, walk me through testing it: what happens logged out, logged in, and on refresh.

---

### P3 — Real admin dashboard

**Prompt:**

Replace the mock-data admin dashboard (built in Phase 1's M6) with live Supabase data. Keep the existing layout and visual design — only the data source changes.

- Summary cards (total quote requests, new leads, most-requested categories): real counts from `quote_requests` and `quote_request_items`.
- Recent quote requests: real rows from `quote_requests`, newest first, showing company, contact, business type, date, and the products they asked about (join through `quote_request_items`).
- Lead status: make the status badge editable — an admin can change a lead's status (nuevo → contactado → interesado → cliente → rechazado) and it persists to Supabase. Optimistic update is fine, but handle the error case if the write fails.
- Add loading skeletons and an empty state (no leads yet) — don't show a broken or blank dashboard while data fetches.
- Remove the "preview / simulated data" label from M6 now that it's real.

All reads/writes here are gated behind the P2 auth + P1 RLS. When done, confirm the dashboard shows nothing to an unauthenticated user and tell me how you handled the status-update write failure case.

---

### P4 — Catalog import (CSV + images)

See the dedicated import prompt in the next section — it's the most detailed step, so it's written out separately below the milestone list.

---

### P5 — Replace mock data everywhere

**Prompt:**

Now that products, categories, and business types live in Supabase (from P1 and P4), replace every remaining use of the mock `src/data/*.ts` files with live Supabase queries.

- Catalog page: fetch products and categories from Supabase instead of `products.ts` / `categories.ts`. Keep the existing filter/search UX. (If product count and search feel sluggish, switch the search to a Supabase `ilike` query instead of client-side filtering — your call, tell me which you did.)
- Product detail page: fetch the single product by id from Supabase.
- Quote form: populate the business-type select and the product multi-select from Supabase.
- Add loading and error states everywhere you're now fetching — no blank screens, no uncaught promise errors. A failed fetch should show a friendly Spanish retry message, not a crash.
- Once everything reads from Supabase, delete the now-unused mock data files (or keep one as a typed seed reference if useful — tell me which and why).

When done, list every file that switched from mock to live data, and confirm the catalog, detail page, and quote form all still work end to end.

---

### P6 — Quote form → real persistence

**Prompt:**

Make the public quote form actually persist to Supabase, replacing the Phase 1 fake success state.

- On submit, insert a row into `quote_requests` and the selected products into `quote_request_items` (from P1's schema). This uses the anon INSERT policy — confirm it works for a logged-out visitor, since real customers won't be authenticated.
- Keep the polished success state, but now it reflects a real save. Handle the failure case: if the insert fails, show a real error and don't show a false success.
- Add a honeypot field (a hidden input real users won't fill but bots will) and silently reject submissions that fill it — cheap spam protection now that the form is live.
- Basic validation before submit: required fields, valid email format, at least one product or a message.
- Do NOT add any field that writes to `customers` — a quote request is a lead, not yet a customer. Conversion to `customers` happens in the admin dashboard (P3), by an admin.

Security check: confirm the anon user can insert a quote but cannot read back any quote requests (test it — try to SELECT as anon and confirm RLS blocks it). When done, walk me through submitting a quote logged out and seeing it appear in the admin dashboard.

---

## CSV import (P4, detailed)

**You do first:** put `labmaremi_catalog.csv` somewhere in the project (e.g. a `data/` or `scripts/` folder — not in `src`, since it's a one-time import artifact, not app code).

**Prompt:**

Import the product catalog from `labmaremi_catalog.csv` into the Supabase `products` and `categories` tables (schema from P1).

The CSV columns are: `name, category, description, presentation, recommended_use` (there may also be a `product_line` column — ignore it if present, it's not needed).

Steps:
1. First, read the CSV and read `src/data/categories.ts` (or the `categories` table if already seeded). List every distinct `category` value in the CSV and show me how each maps to an existing category row. **Stop and show me this mapping before importing anything** — if a CSV category doesn't match an existing category exactly, I need to resolve it, not have you guess. Flag in particular any category that ends up with zero products, and any CSV category with no matching table row.
2. Seed the `categories` table (and `business_types`, using Phase 1's list) if not already populated, before inserting products that reference them.
3. Write an import script (Node/TypeScript, run once) that inserts each CSV row as a product, linking `category_id` by matching the category name. Set `is_active = true` and leave `image_url` null for now — images come next.
4. Make the script idempotent or safe to re-run — I may need to run it more than once. Either upsert on a natural key (product name), or clearly tell me it truncates-and-reloads so I don't create duplicates by running it twice.
5. After import, report: total products inserted, count per category, and any rows that failed to import and why.

**Product images (second part, after the CSV rows are in):**
6. I have product images. Set up Supabase Storage: create a public bucket for product images, and tell me the naming convention you want me to use for the files (e.g. based on product name or id) so they map cleanly to rows. Then either: (a) give me a script that uploads a local folder of images and sets each product's `image_url`, or (b) if that's fiddly, tell me exactly how to upload them via the Supabase dashboard and how the `image_url` should be formatted. Your call which is simpler — explain the tradeoff.
7. Make sure the catalog and product-detail pages fall back gracefully to a placeholder when `image_url` is null, so products without a photo yet don't show broken images.

Don't modify unrelated app code. Stop at the category-mapping review in step 1 before importing. When done, confirm the product count and that image fallbacks work for products without photos.

---

I wrote P1-P6 in full now rather than "when we get there" since you've confirmed the shape (full DB, images ready, project not yet created). Two things carried into the prompts from earlier decisions: the RLS emphasis on `quote_requests`/`customers` being anon-unreadable (the one security detail that matters most for real customer data), and the "stop and show me the category mapping first" gate on the import — since that's exactly where the Desengrasantes-is-empty and label-matching questions from the CSV work will resurface, and you want to resolve them, not have Claude Code guess.

---

## Suggestions for Phase 2 (things you didn't ask for, but I'd fold in)

- **Quote notification email** — right now a quote request just sits in the database with nobody told. Wire Supabase to Resend (or similar) so an email fires to your dad/admin the moment a real lead comes in. Small effort, directly determines whether this tool actually gets used day-to-day.
- **Spam protection on the public quote form** — once submissions are real, the form is exposed to bots. A honeypot field is nearly free to add and stops the low-effort spam; skip reCAPTCHA unless it becomes an actual problem.
- **Catalog search at 200 products** — M3's client-side filter (fetch everything, filter in the browser) still works fine at this size, but server-side search (Supabase full-text or `ilike`) will feel snappier and won't need revisiting if the catalog grows further. Worth doing once, now.
- **Product photos** — 200 real products eventually need real photos. Set up Supabase Storage (or Cloudflare R2/Images) now, even before you have all 200 photos, so the data model is ready and you're not doing a second migration later.
- **Basic SEO** — meta tags, Open Graph image/title (so a link shared on WhatsApp shows something real instead of a blank preview), sitemap.xml, robots.txt. About an hour of work, meaningfully changes how the site looks when shared.
- **Error monitoring + uptime check** — Sentry and UptimeRobot free tiers, mentioned when we talked deployment. Costs nothing, means you find out about a broken form before a customer does.
- **Ecuador data protection** — flagged this before: once you're storing real names, emails, and phone numbers, it's worth an actual look at what Ley Orgánica de Protección de Datos Personales requires for a small business, even if the answer ends up being "nothing extra needed." Not something I can advise on directly — a local resource or basic legal check is the right move.

---

## Part 3 — Maintenance budget (rough estimate)

| Item | Cost | Notes |
|---|---|---|
| Domain | ~$10-15/year | One-time annual, any registrar |
| Vercel (frontend hosting) | $0 likely | Free tier covers this traffic level; revisit only if it ever doesn't |
| Supabase | $0-25/month | Free tier works at launch; Pro (~$25/mo, verify current price) once you need automated backups and no project-pausing on inactivity — worth it the moment this holds real customer data |
| Business email | $0-6/month | Google Workspace or similar, per mailbox |
| Resend (quote notifications) | $0 | Free tier covers low-volume transactional email at this scale |
| Sentry + UptimeRobot | $0 | Free tiers sufficient here |
| **Total, realistic** | **~$15-35/month + ~$15/year domain** | Once Supabase Pro is in the picture; closer to $5-10/month before that |

I can't confirm today's exact pricing on any of these — Supabase and Vercel both adjust tiers periodically — treat this as a planning estimate and verify current numbers before committing, especially for Supabase Pro.
