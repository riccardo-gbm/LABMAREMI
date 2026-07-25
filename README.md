# LABMAREMI — B2B Supply & Distribution Platform

A modern B2B digital catalog and quotation platform built for **LABMAREMI Cía. Ltda.**, a distributor of cleaning, disinfection, protection, and hygiene supplies based in Quito, Ecuador. Serving restaurants, hotels, offices, clinics, educational institutions, and cleaning service providers.

---

## 🚀 Features

- **Interactive Product Catalog (`/catalogo`)**: Real-time multi-category filtering, instant search, and detailed specification sheets with presentation formats and recommended usage.
- **B2B Quote Request Flow (`/cotizacion`)**: Multi-product picker with URL parameter pre-selection (`?productos=<ids>`), real-time quote summary, and honeypot spam protection.
- **Real-time Supabase Integration**:
  - Secure Security Definer RPC (`submit_quote_request`) for atomic quote submission.
  - Automatic fallback to structured mock data when offline or in demonstration mode.
- **Protected Admin Portal (`/admin`)**:
  - Role-based access control backed by Supabase Auth and server-side RPC verification (`is_admin`).
  - Interactive lead management dashboard with status tracking (`nuevo`, `contactado`, `interesado`, `cliente`, `rechazado`).
  - Business intelligence panels displaying top-requested products, customer activity, and lead conversion metrics.
- **Company & Operations Showcase**:
  - `/nosotros`: Interactive company history timeline.
  - `/platform`: Visualizer of B2B distribution workflow.
  - Floating glassmorphism hero and floating elements built with Framer Motion.
  - Direct WhatsApp integration widget for instant customer inquiries.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)-style primitives (`class-variance-authority`, `clsx`, `tailwind-merge`)
- **Routing**: [React Router v7](https://reactrouter.com/) (with lazy-loaded admin routes & Vercel SPA rewrites)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, RPCs, Storage)
- **Animations & Icons**: [Framer Motion](https://motion.dev/) + [Lucide React](https://lucide.dev/)

---

## 📁 Repository Structure

```text
├── src/
│   ├── components/
│   │   ├── about/       # Timeline & team components
│   │   ├── admin/       # Dashboard tables, status selectors & analytics
│   │   ├── auth/        # AuthProvider context & ProtectedRoute guards
│   │   ├── catalog/     # Product cards & filters
│   │   ├── hero/        # Interactive hero animations & canvas
│   │   ├── layout/      # Header, Footer, WhatsApp widget & page layouts
│   │   ├── quote/       # Product picker, quote summary & success states
│   │   └── ui/          # Reusable UI primitives (Button, Card, Badge, PageHeader, etc.)
│   ├── hooks/           # Custom React hooks (useAsync, useRevealOnMount)
│   ├── lib/             # Supabase client, catalog logic, quote submissions & admin helpers
│   ├── pages/           # Application route pages
│   ├── types/           # Database & application TypeScript interfaces
│   ├── App.tsx          # Router configuration & protected routes
│   └── index.css        # Tailwind v4 configuration & global styles
├── supabase/
│   └── migrations/      # Production SQL database schema, RLS policies & RPC functions
├── scripts/             # Automated data importers & RLS test suites
└── vercel.json          # Production Vercel SPA rewrite rules
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/riccardo-gbm/LABMAREMI.git
   cd LABMAREMI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Run locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Launches the Vite development server.
- `npm run build` — Runs TypeScript type-checks (`tsc -b`) and generates the production build in `dist/`.
- `npm run preview` — Serves the production build locally.
- `npm run doctor` — Diagnostic utility for checking React components.

---

## 🌐 Deployment (Vercel)

This repository includes a preconfigured [vercel.json](vercel.json) for single-page application (SPA) client-side routing.

1. Connect the GitHub repository to Vercel.
2. Ensure Framework Preset is set to **Vite**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in **Project Settings -> Environment Variables**.
4. Deploy!

---

## 🔒 Database & Security Schema

The database architecture is managed under `supabase/migrations/` and includes:

- **Tables**: `products`, `categories`, `business_types`, `quote_requests`, `quote_request_items`, `customers`, `admin_users`.
- **Row-Level Security (RLS)**: Public read access for active catalog items; strict admin-only read/write access for quotes and customer data.
- **RPC Functions**:
  - `submit_quote_request`: Atomic creation of quotes and line items with honeypot validation.
  - `is_admin`: Server-side roster check to verify admin privileges.
