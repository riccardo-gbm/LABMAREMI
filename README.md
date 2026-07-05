# LABMAREMI — Phase 1 Frontend Demo

A professional, clickable frontend demo for **LABMAREMI Cía. Ltda.**, a family-run B2B distributor of cleaning, disinfection, protection, and hygiene supplies based in Quito, Ecuador. The demo presents the business, its product catalog, and a quote-request flow, plus a preview of the internal lead dashboard — all running on realistic mock data, with no backend.

The full Phase 1 specification lives in [`docs/00-phase-1-scope.md`](docs/00-phase-1-scope.md).

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config) + [shadcn/ui](https://ui.shadcn.com/)-style primitives
- [React Router](https://reactrouter.com/) v7
- [framer-motion](https://motion.dev/) — Home hero floating-image canvas
- [lucide-react](https://lucide.dev/) icons · Manrope + IBM Plex Mono via Google Fonts

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, categories, sectors, coverage, contact CTA, map |
| `/catalogo` | Product catalog — search + category filter |
| `/producto/:id` | Product detail (spec sheet) |
| `/cotizacion` | Quote request form (supports `?productos=<ids>` pre-selection) |
| `/contacto` | Contact — WhatsApp / phone / email, service area |
| `/nosotros` | About us — family history timeline, team |
| `/admin` | Admin dashboard **preview** (footer link) |
| `/platform` | Business flow visualizer (footer link) |

## Project structure

```
src/
  components/
    ui/         # shared primitives (Button, Card, Badge, Section, Eyebrow, …)
    layout/     # Header, Footer, Layout shell
    hero/       # Home hero (HeroSection, HeroFloatingCanvas)
    catalog/    # ProductCard
    quote/      # ProductPicker, QuoteSuccess
    admin/      # StatusBadge
    about/      # Timeline
  pages/        # one component per route
  data/         # mock data (products, categories, businessTypes, leads)
  types/        # shared TypeScript interfaces
  lib/          # helpers (catalog lookups, admin stats, icons, contact info)
docs/           # Phase 1 scope document
graphify-out/   # generated knowledge graph of this codebase (not app code)
```

## What's mocked vs. real

Everything you see runs entirely in the browser — **there is no backend in Phase 1**:

- **Products, categories, business types, and leads** are static TypeScript files in `src/data/`. All company names, contacts, phones, and emails in the lead data are fictional.
- **The quote form** validates and shows a polished success state, but nothing is persisted — the reference number is cosmetic.
- **The admin dashboard** is a visual preview: every metric is derived at render time from the mock leads.
- **Contact details** (WhatsApp, phone, email) and the map location are placeholders.
- **Hero imagery** is verified Unsplash stock, to be swapped for real product photography.

## Phase 2 (planned)

Supabase backend: real product management, quote persistence, and authentication; the admin preview becomes a live internal tool for the sales team. Real product photos (and optionally a Spline 3D hero scene), plus deployment hardening. The mock data files were shaped to match the future database schema so migration is straightforward.
