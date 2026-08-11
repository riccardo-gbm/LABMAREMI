# LABMAREMI — B2B Supply & Distribution Platform

A modern, high-performance B2B digital catalog, quotation engine, and lead management portal built for **LABMAREMI Cía. Ltda.**, a distributor of cleaning, disinfection, protection, and hygiene supplies based in Quito, Ecuador. Serving restaurants, hotels, offices, clinics, educational institutions, and industrial cleaning providers across Quito and Pichincha.

---

## 🏗️ Architecture & Core Design Principles

LABMAREMI's architecture is engineered around strict security boundaries, low initial bundle overhead, optimized SEO for local B2B discovery, and asynchronous out-of-band transaction processing.

### 1. Three-Tier Data Access Architecture
To ensure maximum security and minimal public bundle sizes, the platform enforces three distinct data access paths:

* **Public Catalog Reads (`src/lib/catalogData.ts`)**: Direct `fetch` requests against Supabase's PostgREST API using the public key. This completely excludes `@supabase/supabase-js` from the public client bundle, saving network payload and keeping the runtime light. Query parameters are sanitized via `URLSearchParams` to prevent PostgREST operator injection, and product slugs are pre-validated client-side (`SLUG_PATTERN`) before sending network calls. Features an in-memory TTL cache (5 minutes) for catalog data.
* **Public Quote Writes (`src/lib/quoteSubmission.ts`)**: Anonymous visitors have **zero direct `INSERT` access** to database tables. All lead submissions execute via the atomic `submit_quote_request` Security Definer RPC (migration `0005`), which validates a server-side honeypot field before creating quote records.
* **Admin Management (`src/lib/adminDashboard.ts` & `src/lib/supabase.ts`)**: The `@supabase/supabase-js` SDK lives exclusively inside the code-split admin chunk. Authentication checks verify identity against a server-side `admin_users` roster via the `is_admin()` RPC—a valid Supabase Auth session alone does not grant authority.

### 2. Frontend Performance & Code-Splitting
* **Eager vs. Lazy Loading**: `HomePage` is eagerly imported to ensure instant Largest Contentful Paint (LCP). All secondary public routes (`Catalog`, `Product Detail`, `Quote`, `About`, `Contact`) are code-split using custom `lazyWithPrefetch` components.
* **Smart Route Warm-Up**: Links warm route chunks on `mouseenter` / `focus`. Idle browser time uses `requestIdleCallback` (`RoutePrefetchWarmup`) to prefetch nav routes unless `navigator.connection.saveData` is enabled.
* **Scroll Synchronization**: Integrates smooth scrolling with Lenis (`ReactLenis`), keeping Lenis's internal scroll position in sync with React Router route changes via a custom `ScrollToTop` hook.
* **UI & Styling System**: Built with **Tailwind CSS v4** `@theme` tokens in OKLCH space, using a clinical blue/cyan palette. UI components leverage `class-variance-authority`, `clsx`, and `tailwind-merge`. Framer Motion is tree-shaken by importing as `m.`.

### 3. Asynchronous Out-of-Band Lead Notifications
* **Decoupled Edge Function**: Lead submission triggers an asynchronous Postgres notification (`quote_requests_notify` trigger, migration `0007`) that calls a Supabase Deno Edge Function (`quote-notification`) via `pg_net` after transaction commit.
* **Resend Email Integration**: Generates responsive HTML/text emails formatted in Quito local time (`America/Guayaquil`), complete with product line items and deep links to the admin portal.
* **Resilient Non-Blocking Architecture**: Mail sending failures will **never** roll back a customer's quote request; errors are caught and logged independently.

### 4. B2B Local SEO & Metadata Infrastructure
* **Dynamic Serverless Sitemap (`api/sitemap.ts`)**: Vercel Serverless Function rendering live XML sitemaps by fetching active categories and products from Supabase REST API on demand.
* **Structured Data (JSON-LD)**: Integrated `LocalBusiness` / `WholesaleStore`, `Product`, and `BreadcrumbList` schemas via `src/lib/schemaData.ts`.
* **Hardened Security & Headers (`vercel.json`)**: Enforces strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy, and granular asset caching rules.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
* **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) primitives (`class-variance-authority`, `clsx`, `tailwind-merge`)
* **Routing**: [React Router v7](https://reactrouter.com/) (with prefetchable lazy loading & Vercel SPA rewrites)
* **Smooth Scroll & Animations**: [Lenis](https://lenis.darkroom.engineering/) + [Framer Motion](https://motion.dev/) + [Lucide React](https://lucide.dev/)
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Security Definer RPCs, Storage)
* **Serverless & Edge**: Supabase Deno Edge Functions (`quote-notification`), Vercel Serverless Functions (`sitemap`), Resend API
* **Analytics & Performance**: Vercel Analytics & Speed Insights

---

## 📁 Repository Structure

```text
├── api/
│   └── sitemap.ts            # Serverless Edge Function generating dynamic sitemap.xml
├── docs/                     # Operations runbooks, contribution guidelines, SEO guides, and catalog CSVs
├── scripts/                  # Data import/export utilities, storage image uploaders, RLS security tests
├── src/
│   ├── components/
│   │   ├── about/            # Company history timeline & team components
│   │   ├── admin/            # Dashboard tables, status selectors & analytics metrics
│   │   ├── auth/             # AdminRoot code-split boundary, AuthProvider & ProtectedRoute
│   │   ├── catalog/          # Dynamic search, category filters & product specification cards
│   │   ├── common/           # SeoHead & JsonLd structured data injection
│   │   ├── hero/             # Floating hero elements & interactive graphics
│   │   ├── layout/           # Shared Header, Footer, WhatsApp floating CTA & Layout wrappers
│   │   ├── quote/            # Multi-product selector, live quote calculation & submission form
│   │   └── ui/               # Reusable UI primitives (Button, Card, Badge, Section, PageHeader, etc.)
│   ├── hooks/                # Custom hooks (useAsync, useLenis scroll sync)
│   ├── lib/                  # Catalog REST client, RPC submission logic, schema generators, admin helpers
│   ├── pages/                # Public SPA pages & lazy-loaded admin routes
│   ├── types/                # Strict TypeScript database & domain model definitions
│   ├── App.tsx               # Application root, router, prefetching warmup & Vercel analytics
│   └── index.css             # Tailwind v4 configuration, OKLCH palette & keyframe animations
├── supabase/
│   ├── functions/            # Edge Function (quote-notification) for out-of-band email dispatch
│   └── migrations/           # Database schema, RLS policies, triggers, and RPC functions (0001-0007)
├── vercel.json               # SPA client-side rewrite rules, CSP headers, and asset cache headers
└── package.json              # Dependency declarations & npm scripts
```

---

## 🔒 Security & Database Schema

The database relies on Supabase PostgreSQL with strict Row-Level Security (RLS) policies:

* **Tables**: `products`, `categories`, `business_types`, `quote_requests`, `quote_request_items`, `customers`, `admin_users`.
* **Row-Level Security (RLS)**: Public read access is restricted to active catalog items (`is_active = true`). All quote submissions and customer lead management tables deny direct public reads or writes.
* **Security Definer RPCs**:
  * `submit_quote_request`: Enforces server-side honeypot validation and atomically inserts lead details and requested products.
  * `is_admin`: Verifies authenticated user ID against the restricted `admin_users` table roster.
* **Database Migrations (`supabase/migrations/`)**: Applied sequentially in the Supabase SQL editor:
  * `0001_phase2_foundation.sql`: Core schema tables, indexes, and initial RLS.
  * `0002_catalog_import_keys.sql`: Natural unique keys for idempotent catalog imports.
  * `0003_product_images_bucket.sql`: Storage bucket rules for product assets.
  * `0004_catalog_presentation.sql`: Product presentation and recommended use fields.
  * `0005_quote_submission_rpc.sql`: `submit_quote_request` RPC implementation.
  * `0006_admin_role_rls.sql`: Roster-backed `is_admin` security policies.
  * `0007_quote_notification.sql`: `pg_net` out-of-band email notification trigger.

---

## ⚙️ Development & Scripts

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher

### Environment Setup

Create `.env` in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts local Vite development server on `http://localhost:5173`. |
| `npm run build` | Enforces strict TypeScript checks (`tsc -b`) and builds production output in `dist/`. |
| `npm run preview` | Serves the production `dist/` bundle locally for verification. |
| `npm run doctor` | Audits React component performance, accessibility, and bundle integrity. |

### Data & Security Verification Scripts

Run from repository root with `.env` populated:

```bash
node scripts/import-catalog.mjs --dry-run          # Seed categories/business types & import catalog CSV
node scripts/import-descriptions.mjs --dry-run     # Sync product descriptions from copy file
node scripts/export-catalog-csv.mjs                # Export live database catalog state to CSV snapshot
node scripts/upload-product-images.mjs --list      # Batch upload product images matched by slug
node scripts/test-anon-rls.mjs                     # Verify anonymous RLS restrictions & RPC quote submission
node scripts/test-admin-rls.mjs                    # Verify admin roster access control & dashboard RLS
node scripts/test-quote-notification.mjs --dry-run # Verify Edge Function notification configuration
```

---

## 🌐 Deployment (Vercel & Supabase)

1. **Frontend (Vercel)**:
   * Connect repo to Vercel with **Vite** preset.
   * Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables.
   * Deployment automatically applies headers, CSP, and route rewrites configured in `vercel.json`.

2. **Edge Function (Supabase)**:
   * Set secrets via Supabase CLI: `supabase secrets set RESEND_API_KEY=... QUOTE_NOTIFICATION_SECRET=...`
   * Deploy function: `supabase functions deploy quote-notification`

