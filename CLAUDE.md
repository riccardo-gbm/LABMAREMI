# LABMAREMI — Phase 1 (Frontend Demo)

## What this is
A professional, clickable frontend demo for LABMAREMI, a B2B distributor of cleaning, disinfection, protection, and hygiene supplies based in Quito, Ecuador, serving Quito and nearby provinces. Customers are restaurants, hotels, offices, schools, clinics, cleaning companies, and local stores. This is Phase 1: mock data only, no real backend, no auth. The full spec lives in `docs/00-phase-1-scope.md` — read it whenever a requirement is unclear instead of guessing.

## Stack (fixed for Phase 1)
- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Spline (`@splinetool/react-spline`) — Home hero only, isolated component, lazy-loaded
- Mock data as typed `.ts` files in `src/data/`
- No Supabase, no backend, no auth. That's Phase 2 — don't reach for it early.

## Language and copy
All user-facing text is in Spanish, formal register ("usted," not "tú") — this is a B2B tool speaking to business owners and purchasing managers. Code, comments, commit messages, file names, and variable names stay in English.

## Visual identity
- Palette: blue / white / cyan. Should read clean, clinical, and trustworthy — not playful, not generic-SaaS-gradient.
- Build shared primitives once in `src/components/ui` (Button, Card, Section, Badge, PageHeader) and reuse them on every page. Don't restyle per page.
- No Lorem Ipsum and no unlabeled placeholder copy in anything you consider "done."

## Working style
- One milestone at a time. Finish it, report what you built plus any assumptions you made, then stop — don't chain into the next milestone unprompted.
- Check the actual current repo state before building instead of assuming what a past session left behind.
- If a design or copy decision isn't specified in the spec, pick the most reasonable option, note the assumption in your summary, and keep moving — don't block on it.
- If a Phase 1 decision would make the Phase 2 Supabase migration harder (an awkward data shape, for example), flag it before proceeding.

## Out of scope for Phase 1
Real database, Supabase, authentication/admin login, real quote persistence, payments, cart, invoices, inventory, customer portal, AI lead scoring, advanced maps/geospatial features, route optimization. A basic embedded Google Maps location widget is fine — nothing beyond that.

## Definition of done
- Runs locally, zero console errors
- Responsive on mobile and desktop
- Every page in `docs/00-phase-1-scope.md`'s Main Pages section is implemented
- Mock data is realistic and contains no real customer information
- Clean README, working deployed link
