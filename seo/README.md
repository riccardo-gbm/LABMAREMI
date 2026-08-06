# LABMAREMI — SEO workspace

Working folder for SEO context, exports, keyword maps, briefs, and reports.
Kept in-repo on purpose: almost every fix this site needs is a code change in
`src/` or `index.html`, so the research should sit beside the code. Nothing here
is built or deployed — Vercel publishes `dist/` from `vite build`, and this
folder never enters it.

Copy conventions from the root `CLAUDE.md` still apply: **user-facing copy is
Spanish, formal "usted"**; notes, briefs, and file names here stay English.

## Structure

```
seo/
  README.md       this file — project context, goals, open decisions
  gsc/            Search Console exports (see naming below)
  keywords/       keyword lists, clusters, keyword→page maps
  competitors/    competitor teardowns and SERP landscape notes
  content/        content briefs and drafts
  reports/        audits and progress reports
```

## Scope

| Item | Value |
| --- | --- |
| Business | LABMAREMI ECUADOR CIA. LTDA. — B2B distributor of cleaning, disinfection, protection and hygiene supplies |
| Market | Quito / Pichincha, Ecuador |
| Language | Spanish (es-EC) |
| Apex domain | `labmaremi.com` — **currently a REINEC hosting placeholder, not the app** (verified 2026-08-04) |
| www domain | `www.labmaremi.com` — serves the Vercel SPA (verified 2026-08-04) |
| Stack | React 19 + Vite 6 SPA on Vercel. No SSR, no prerender. `vercel.json` rewrites all paths to `index.html` |
| OpenSEO project | `LABMAREMI` — id `e7baeff0-ba8e-4ae8-9c28-264c3f371c8a`, location 2218 (Ecuador), language `es` |

### Page types in scope

- Home (`/`) — eager-loaded, the LCP route
- Catalog (`/catalogo`, filtered by `?categoria=<slug>`)
- Product detail (`/producto/:slug`) — the long tail, one page per SKU
- Marketing pages (about, contact, quote request)
- Admin tree — **excluded from SEO entirely**; it is code-split out of the public
  bundle deliberately and must never be linked or indexed

### Catalog categories (slugs are the `?categoria=` keys)

`materiales-limpieza`, `papel`, `equipos-proteccion`, `fundas-basura`,
`empaques`, `limpieza-industrial`, `higiene-personal`, `desinfectantes`,
`desechables`, `insumos-bano` (displays as "Plásticos Industriales" — slug
predates the rename), `salud`

### Buyer segments (`business_types`, the seven canonical segments)

Restaurantes · Hoteles · Oficinas · Instituciones Educativas · Clínicas ·
Empresas de Limpieza · Tiendas Locales

These are the natural modifier axis for keyword work: category × segment
(e.g. "desinfectantes para restaurantes Quito").

## Goals

Stated 2026-08-04:

1. **More quote requests (leads)** — primary. The conversion event is a row in
   `quote_requests`, submitted through the `submit_quote_request` RPC. That table
   is the ground truth for whether SEO is working; organic sessions are a proxy.
2. **Rank for product/category buying-intent terms** — non-branded terms tied to
   the eleven catalog categories, ideally qualified by Quito/Pichincha and by
   buyer segment.

Not yet defined: a numeric target and a timeframe. Worth setting once GSC has
baseline data — targets picked before any baseline tend to be fiction.

## Positioning

**Not yet captured.** Open questions for the business:

- Who is the best-fit customer, and who is a bad fit?
- Why do buyers pick LABMAREMI over other Quito distributors — price, delivery
  speed, credit terms, breadth of catalog, technical advice, certifications?
- Which categories carry the margin, and which are traffic-drivers only?
- Any categories or claims we should *not* target?
- Existing offline lead sources — referrals, WhatsApp, trade contacts?

## Known technical constraints (verified in-repo, 2026-08-04)

These are findings, not yet a prioritized plan.

1. **Empty SPA shell.** No SSR or prerender. A crawler that doesn't execute JS
   sees `<div id="root"></div>`. Googlebot does render, but on a delay and not
   guaranteed — for a catalog whose value is per-product long-tail pages, this
   is the structural ceiling on everything else.
2. **No per-route metadata.** Nothing in `src/` sets `document.title` or meta
   tags. Every route — every product, every category — serves the homepage title
   and description from `index.html`. Search results for distinct products would
   be indistinguishable.
3. **Split hosts.** Apex serves a REINEC hosting placeholder; www serves the app.
   No canonical host is declared. Needs one decision (recommend www as canonical)
   plus a 301 from the other.
4. **No canonical / `og:url` / `og:image`.** `index.html` defers these with a
   comment awaiting a deployed domain. The domain now exists.
5. **No `robots.txt`, no `sitemap.xml`.** Neither exists in `public/`. A sitemap
   is generatable from the products table — the same data `scripts/export-catalog-csv.mjs`
   already reads.
6. **No structured data.** No JSON-LD anywhere. `Organization`, `LocalBusiness`,
   and `Product` are all applicable and would matter for a local B2B supplier.

## Search Console

**No property verified yet** (as of 2026-08-04). This is the first blocker for
real keyword work — without it we're inferring demand instead of reading it.

Once verified, prefer connecting GSC natively on the OpenSEO project's
Integrations page so `get_search_console_performance` reads it live. If exporting
CSVs instead, drop them in `gsc/` with these names:

```
gsc/queries-last-3-months.csv
gsc/pages-last-3-months.csv
gsc/queries-last-16-months.csv
gsc/pages-last-16-months.csv
```

## Assets inventory

| Asset | Status |
| --- | --- |
| Sitemap | None |
| robots.txt | None |
| Existing keyword list | None |
| Rank tracking | None (OpenSEO project just created) |
| Backlink assets | Unknown — not asked yet |
| Linkable assets (studies, calculators, guides) | None identified |
| Google Business Profile | Unknown — worth checking; high value for a Quito B2B supplier |

## Log

- **2026-08-04** — Workspace created. OpenSEO project `LABMAREMI` created
  (Ecuador/es). Repo-side SEO state audited; six constraints recorded above.
  Goals captured; positioning and GSC still outstanding.
