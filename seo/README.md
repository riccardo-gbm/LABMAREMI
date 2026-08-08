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
| Apex domain | `labmaremi.com` — **Official Canonical Base URL** |
| www domain | `www.labmaremi.com` — 301 redirects to apex |
| Stack | React 19 + Vite 6 SPA on Vercel + Vercel Edge Middleware & Serverless Sitemap |
| OpenSEO project | `LABMAREMI` — id `e7baeff0-ba8e-4ae8-9c28-264c3f371c8a`, location 2218 (Ecuador), language `es` |

### Page types in scope

- Home (`/`) — eager-loaded, the LCP route
- Catalog (`/catalogo`, filtered by `?categoria=<slug>`)
- Product detail (`/producto/:slug`) — the long tail, one page per SKU
- Marketing pages (about, contact, quote request)
- Admin tree — **excluded from SEO entirely**; it is code-split out of the public
  bundle deliberately and carries `<meta name="robots" content="noindex, nofollow">`

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

## Completed Technical SEO Infrastructure (Implemented 2026-08-07)

1. **Dynamic Serverless Sitemap (`api/sitemap.ts`)**: Served live at `https://labmaremi.com/sitemap.xml` with 1-hour edge caching (`s-maxage=3600`). Updates automatically as products change.
2. **Social Previews & Soft 404 Prevention (`middleware.ts`)**: Vercel Edge Middleware detects social crawlers (WhatsApp, Facebook, LinkedIn, Twitter, Slack, Telegram). Serves pre-rendered Open Graph HTML shells and returns true HTTP 404 for invalid product slugs.
3. **Crawlability (`public/robots.txt`)**: Allows public paths, points to `https://labmaremi.com/sitemap.xml`, disallows `/admin*`.
4. **Dynamic Head Management (`SeoHead.tsx`)**: Dynamic titles, descriptions, Open Graph, Twitter cards, and self-referencing category canonicals across all SPA routes.
5. **Structured Data (`schemaData.ts` & `JsonLd.tsx`)**: `LocalBusiness` / `Organization` on home/contact, B2B `Product` schema on `/producto/:slug`, and `BreadcrumbList` on catalog/product views.
6. **Core Web Vitals**: Fixed `/nosotros` LCP bug in `AboutHeroMorph.tsx` (reduced LCP from 3.94s to <1.0s).

## Search Console

**Property verification in progress via DNS TXT record** on `labmaremi.com`.

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
| Sitemap | Active (`https://labmaremi.com/sitemap.xml`) |
| robots.txt | Active (`public/robots.txt`) |
| Edge Bot Previews | Active (`middleware.ts`) |
| Structured Data | Active (`LocalBusiness`, `Product`, `BreadcrumbList`) |
| Local SEO Guide | Documented (`docs/LOCAL_SEO_GUIDE.md`) |
| Existing keyword list | Pending |
| Rank tracking | OpenSEO project `LABMAREMI` |
| Google Business Profile | Guide documented in `docs/LOCAL_SEO_GUIDE.md` |

## Log

- **2026-08-04** — Workspace created. OpenSEO project `LABMAREMI` created
  (Ecuador/es). Repo-side SEO state audited; six constraints recorded.
- **2026-08-07** — Full Technical SEO infrastructure deployed: Serverless sitemap, Edge Middleware for social previews (WhatsApp/FB/LinkedIn) & soft 404s, SeoHead component, Schema.org JSON-LD, canonical base URL `https://labmaremi.com`, and `/nosotros` LCP performance optimization.
