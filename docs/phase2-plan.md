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
| P4 | Catalog data import (PDF) | Structure 150-200 products from your PDF into Supabase — needs the actual file when we get here |
| P5 | Replace mock data everywhere | Wire every component off `src/data/*.ts` to live Supabase queries, add loading/error states |
| P6 | Quote form → real persistence | Public quote submissions write to Supabase instead of the current fake success state |

I'll write each of these out as a full ready-to-paste prompt once we get there, same as Phase 1's milestones did — writing all six in complete detail right now means guessing at things I don't have yet (your PDF's actual structure, your auth preference, final RLS needs).

One thing worth flagging now, not later: **P1 and P2 are the two places in this entire project where a mistake actually costs something** — a misconfigured RLS policy can expose customer data or let anyone write to your database; a broken admin auth flow can lock you out or let someone in who shouldn't be. When we get there, run those two specifically with Opus, not Sonnet or Fable, and actually review the generated policies line by line before deploying — not just skim Claude Code's "when done" summary.

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
