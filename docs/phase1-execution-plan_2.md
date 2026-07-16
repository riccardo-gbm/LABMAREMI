# LABMAREMI Phase 1 — Execution Plan for Claude Code

This turns `phase1-scope.md` into a sequence of scoped Claude Code prompts instead of one giant build instruction. Each milestone is meant to be its own session (or at least its own reviewed step) — the point is a review gate between each one, not speed.

## How to use this

1. Save your scope document into the repo as `docs/phase1-scope.md`. Drop `CLAUDE.md` at the repo root.
2. Work through the milestones below in order. Paste each milestone's prompt into Claude Code as-is, or edit it if something's changed since this was written.
3. Review the diff before starting the next milestone. This is the actual point of splitting the build up — catching a bad call at M0 is cheap; catching it at M6, after four milestones were built on top of it, is not.
4. You don't need to re-explain prior milestones in each new prompt. Claude Code will read `CLAUDE.md` and inspect the current repo; that's what `CLAUDE.md` is for.
5. Run Graphify at the checkpoints you already defined: after `docs/` exists (before M0), after the first frontend structure exists (right after M0), and again once major features have landed (a good point is after M4, and again after M6).

## Milestone map

| # | Milestone | Deliverable |
|---|---|---|
| M0 | Foundation & design system | Scaffolding, routing, shared UI primitives, README stub |
| M1 | Mock data layer | Typed products, categories, leads, business types |
| M2 | Home page (core, real hero) | Full home page including the finished hero visual |
| M3 | Catalog + product detail | Full catalog browsing flow |
| M4 | Quote request flow | Working simulated quote form with success state |
| M5 | Contact + About Us | Two content pages |
| M6 | Admin dashboard + flow visualizer | Internal-preview page and portfolio-explainer page |
| M7 | Hero rebuild — full-bleed, centered, Manrope | Full-bleed centered hero replacing M2's two-column layout, site-wide font applied |
| M8 | Polish, QA, deploy | Responsive/hover/empty-state pass, README, live link |
| M9 | About Us — scroll-morph intro | Scroll-linked (not hijacked) circle-to-arc image morph above M5's About content |
| M10 | WhatsApp widget | Floating button + popup card, site-wide except /admin |

The hero went through two real revisions, which is exactly what milestone-based building is for: M2 built a working two-column hero, M7 (first pass) added a floating-image visual to it, and this version of M7 changed the layout direction entirely to full-bleed/centered after seeing the first result. Each revision landed as its own reviewed step instead of getting buried inside one giant "build the home page" prompt.

---

## M0 — Foundation & design system

**Prompt:**

Set up the LABMAREMI Phase 1 foundation. Read docs/phase1-scope.md and CLAUDE.md first.

Build:
- Vite + React + TypeScript project, with Tailwind and shadcn/ui installed and configured
- React Router with stub pages for: / , /catalogo , /producto/:id , /cotizacion , /contacto , /nosotros , /admin , /platform — each just rendering its Spanish page title for now
- Shared layout: Header (logo placeholder, main nav, "Solicitar cotización" button) and Footer. /admin and /platform don't need to be in the main public nav — a footer link or direct URL access is fine, since these are portfolio-preview features, not real customer-facing flows.
- Shared UI primitives in src/components/ui: Button, Card, Section, Badge, PageHeader — style these once against the blue/white/cyan palette and reuse them everywhere
- Folder structure: src/components, src/pages, src/data, src/types, src/lib
- A README.md stub with just setup/run instructions for now (the full README comes in M8)

Scaffolding only. No real page content yet, no Spline.

When done, tell me the final route list, what primitives you built, and any assumption you made along the way. Then stop and wait for me.

---

## M1 — Mock data layer

**Prompt:**

Build the Phase 1 mock data layer. Reference docs/phase1-scope.md's mock-data section and business description.

Create:
- src/types/index.ts — interfaces for Product, Category, BusinessType, Lead, QuoteRequest
- src/data/categories.ts — the 8 spec categories (disinfectants, degreasers, paper products, cleaning tools, trash bags, bathroom supplies, industrial cleaning, personal hygiene), Spanish labels
- src/data/products.ts — 4-6 realistic products per category: name, category, short description, presentation/unit, all in Spanish, no pricing needed, no Lorem Ipsum
- src/data/businessTypes.ts — the 7 spec business types, Spanish labels
- src/data/leads.ts — 12-15 mock leads with varied statuses (Nuevo, Contactado, Interesado, Cliente, Rechazado), business types, and product interest — invented Ecuadorian-sounding company names, no real people or companies

Note: the business description also mentions protection equipment (gloves, kitchen coats) that doesn't map cleanly onto the 8 listed categories. Pick the best fit, or add a category, and tell me which you chose.

Data only — no UI in this milestone.

When done, tell me the total product count and confirm none of this resembles real customer data. Then stop.

---

## M2 — Home page (core, real hero)

**Prompt:**

Build the Home page per docs/phase1-scope.md's Home Page section, using the primitives from M0 and the data from M1 where relevant.

Hero section — build this as a real, finished visual, not a placeholder:
- Layout: left side = value-prop copy ("Soluciones profesionales de limpieza e higiene para empresas en Quito y Ecuador," or your own take on the spec's example copy) plus "Solicitar cotización" / "Ver catálogo" buttons. Right side = a floating-imagery composition: 3-5 images in masked circular/blob shapes (CSS clip-path or border-radius), positioned asymmetrically, with a slow floating animation (CSS keyframes or Framer Motion, subtle — a few px of vertical drift, nothing distracting). Respect prefers-reduced-motion.
- This is a code-built visual, not a 3D scene — no external editor, no Spline, no runtime dependency to load.
- I don't have real product photography yet. Use styled placeholder shapes instead — one per product category (a bottle silhouette for chemicals, a glove/coat silhouette for protection equipment, a roll silhouette for paper products, etc.), rendered as simple SVG or icon-in-colored-blob rather than stock photos, so the composition reads as "clean product distribution" without pretending to be real photography.
- Palette: strictly blue/white/cyan — no other colors in the composition, so it doesn't compete visually with the copy or buttons.
- Keep the hero visual in its own component (e.g., src/components/hero/HeroVisual.tsx) so it's easy to swap the placeholder shapes for real photos later without touching the rest of HeroSection.tsx.

Rest of the page: "why choose us," business customer types, product category preview (pull real categories from src/data/categories.ts), service area, contact/WhatsApp CTA, and a basic embedded Google Maps iframe for the office location (a placeholder Quito address/coordinates is fine for now).

Keep the formal "usted" register throughout.

Don't build the Business Flow Visualizer here. Even though the spec allows it as a Home section, keep it as its own milestone (M6) so it gets reviewed on its own.

When done, tell me which sections you adapted from the spec's suggested copy, what shapes/technique you used for the hero visual, and why. Then stop.

---

## M3 — Catalog + product detail

**Prompt:**

Build the Product Catalog (/catalogo) and Product Detail (/producto/:id) per docs/phase1-scope.md, using src/data/products.ts and categories.ts.

Catalog: category filter, a search bar (client-side, matching name/description), product cards (name, category badge, short description, presentation/unit, "Solicitar cotización" button), and a good empty state when a filter or search returns nothing.

Detail: build it as its own page rather than a modal, so it's linkable — flag this as a deviation from the spec's "modal or page" option. Include name, category, description, presentation, recommended use, and a quote button.

The quote button on both the catalog cards and the detail page should route to /cotizacion. If it isn't much extra complexity, carry the selected product(s) into the quote form as a pre-filled "products of interest" field — your call on the mechanism, just describe what you did.

When done, tell me your filter/search approach and how (or whether) product pre-selection works. Then stop.

---

## M4 — Quote request flow

**Prompt:**

Build the Quote Request page (/cotizacion) per docs/phase1-scope.md.

Fields: company name, contact person, phone, email, business type (select, from src/data/businessTypes.ts), location/sector, products of interest (multi-select from src/data/products.ts, pre-filled if arriving from M3's flow), message.

Add basic required-field validation — native HTML5 or a lightweight approach already in the stack. Don't pull in a new form library just for this unless you think it's clearly worth it, and say so if you do.

On submit: no real persistence — show a polished success state (confirmation message, optional cosmetic reference number) that replaces the form, with an option to submit another request.

When done, tell me your validation approach and confirm nothing in the success copy implies real backend persistence. Then stop.

---

## M5 — Contact + About Us

**Prompt:**

Build the Contact and About Us pages per docs/phase1-scope.md.

Contact (/contacto): a WhatsApp button using a proper wa.me link format (placeholder number is fine), phone and email placeholders, service-area text (Quito plus nearby provinces), and either a contact form or a direct WhatsApp/email CTA — your call, tell me which and why.

About Us (/nosotros): a company timeline (founded 5 years ago — invent 4-5 plausible milestones between then and now), family-business framing in the copy, and placeholder avatar/photo slots for the owners and team (styled placeholders, not real stock photos — real photos get swapped in later).

When done, tell me which contact approach you chose and confirm the About Us timeline lines up with today's date. Then stop.

---

## M6 — Admin dashboard + business flow visualizer

**Prompt:**

Build the Admin Dashboard Preview (/admin) and Business Flow Visualizer (/platform) per docs/phase1-scope.md, using the mock leads from src/data/leads.ts.

Admin dashboard: summary cards (total quote requests, new leads, most-requested categories), a recent-quote-requests table or list, lead status badges (Nuevo, Contactado, Interesado, Cliente, Rechazado — distinct colors per status), and a product-interest summary (simple chart or ranked list). Add a small, visible label that this is a preview with simulated data, not a live system.

Business flow visualizer: a visual flow — Visitante → Catálogo de productos → Solicitud de cotización → Panel de leads → Seguimiento → Cliente. A horizontal step diagram is enough; it doesn't need to be elaborate. This page exists to explain the business logic to portfolio reviewers.

When done, tell me what approach you used for the product-interest summary (custom SVG vs. a library) and why. Then stop.

---

## M7 — Hero rebuild: full-bleed, centered, Manrope

**Prompt:**

Rebuild the Home hero from a full-bleed, centered-text layout, replacing the two-column left-copy/right-image structure from M2. Reuse the existing copy, CTA text, and stats exactly as already written in M2 — this milestone changes layout and typography, not content.

**Step 1 — site-wide font.** Add Manrope via Google Fonts (link tag in index.html or `@import` in your global CSS, weights 400/500/600/700/800). In tailwind.config, set it as the `sans` font family so it applies everywhere, not just the hero — headings, body, buttons, nav, everything switches to Manrope. Don't add a second display font.

**Step 2 — widen the floating canvas.** Update `src/components/hero/HeroFloatingCanvas.tsx` (built in the earlier version of this milestone) as follows:
- Bump the `images` array from 7 to 9 entries (same shape/size pattern, two more variants) — full-bleed width can carry more without feeling cramped
- Change the grid from `cols = 3, rows = 3` to `cols = 4, rows = 3` (12 cells, 9 images placed, a few gaps left for breathing room)
- Add a radial "clearing" layer so the center of the composition is naturally lighter, between the images (z-10) and where the text panel will sit (z-20):

```tsx
{/* Radial clearing for the centered text panel */}
<div
  className="absolute inset-0 z-[15] pointer-events-none"
  style={{
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 45%, transparent 70%)",
  }}
/>
```

The existing `HeroFloatingCanvas.tsx` already has no "use client" directive, no dark-mode variants, no custom cursor takeover, and respects `prefers-reduced-motion` — none of that needs to change, you're only touching the image count, grid dimensions, and adding the radial clearing layer above. Also replace the (now 9) `REPLACE_WITH_UNSPLASH_URL_*` placeholders with real, verified image URLs, or your own product photos if ready.

**Step 3 — rebuild HeroSection.tsx:**

```tsx
export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] overflow-hidden">
      <HeroFloatingCanvas />
      <div className="relative z-20 flex items-center justify-center min-h-[85vh] px-4 py-16">
        <div className="max-w-2xl w-full rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl px-8 py-10 md:px-14 md:py-14 text-center">
          <span className="inline-block text-sm font-semibold tracking-[0.2em] text-blue-600 uppercase mb-3">
            LABMAREMI
          </span>
          <h1 className="font-sans font-extrabold tracking-tight text-4xl md:text-6xl text-slate-900 leading-tight">
            Soluciones profesionales de limpieza e higiene para empresas en Quito y Ecuador.
          </h1>
          <p className="mt-5 text-slate-600 text-base md:text-lg max-w-xl mx-auto">
            LABMAREMI distribuye productos de limpieza, desinfección, protección e higiene para
            restaurantes, oficinas, instituciones, hoteles y negocios que necesitan un
            abastecimiento confiable.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            {/* reuse the exact Button components/props from M2 — don't rewrite these */}
            <Button variant="primary">Solicitar cotización →</Button>
            <Button variant="outline">Ver catálogo</Button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center gap-8 flex-wrap">
            <Stat value="5+" label="años abasteciendo empresas" />
            <Stat value="9" label="categorías de producto" />
            <Stat value="Quito" label="y provincias cercanas" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

Use whatever `Stat` markup already exists from M2 (small inline component or repeated div, your call) rather than inventing a new pattern.

**Step 4 — responsive.** On mobile: drop the image count the canvas renders to 4 (not all 9), reduce `min-h-[85vh]` to something that fits content rather than forcing a fixed viewport height on a small screen, and check the glass panel doesn't touch the screen edges (keep at least 16px of side padding).

When done, tell me: what you used for the Stat markup, confirm the M2 copy/CTA text carried over unchanged, and how you handled the mobile image count reduction. Then stop.

---

## M8 — Polish, QA, deploy

**Prompt:**

Final QA and polish pass for Phase 1. Reference docs/phase1-scope.md's Professional Quality Requirements and Acceptance Criteria sections.

- Walk every page at mobile (375px), tablet (768px), and desktop (1280px+) widths; fix any breakage
- Check hover states on every interactive element (buttons, cards, nav links)
- Check empty states (catalog with no results, admin with hypothetically zero leads)
- Search the whole codebase for "Lorem," "TODO," and "placeholder" text left in user-facing copy, and resolve or flag each one
- Confirm zero console errors or warnings across all routes
- Write the real README: what this is, tech stack, how to run locally, project structure, what's mocked vs. real, a link to docs/phase1-scope.md, and a short Phase 2 plan summary
- Prepare for deploy (Vercel or Netlify — your call, tell me which and why) and either walk me through the exact final steps, or deploy it yourself if I've given you the access you need

Finish with a checklist against the spec's acceptance-criteria section: pass/fail on each item, with an explanation for anything that fails.

---

## M9 — About Us: scroll-morph intro

Numbered after M8 because it was added to the plan later, but run it *before* your final M8 polish pass so that pass covers this page too.

**Prompt:**

Add a scroll-driven visual intro to the top of the About Us page (/nosotros), above the existing timeline/team content from M5. This is a cover moment for the page, not a replacement for the content that follows it.

Install: `framer-motion` (already installed from M7 — skip if so).

Create `src/components/about/AboutHeroMorph.tsx` with the code below.

```tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, useScroll } from "framer-motion";

type AnimationPhase = "scatter" | "line" | "circle";

interface FlipCardProps {
  src: string;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

const IMG_WIDTH = 70;
const IMG_HEIGHT = 95;

function FlipCard({ src, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{ x: target.x, y: target.y, rotate: target.rotation, scale: target.scale, opacity: target.opacity }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{ position: "absolute", width: IMG_WIDTH, height: IMG_HEIGHT, transformStyle: "preserve-3d" }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-slate-200" style={{ backfaceVisibility: "hidden" }}>
          <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-blue-950 flex flex-col items-center justify-center p-3 border border-blue-800"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest">LABMAREMI</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;

// Mix of product photography and team/workplace shots, interleaved on purpose so the
// circle doesn't read as visually segregated. Replace every REPLACE_* with a real,
// verified image URL. Product search terms: "spray bottle", "cleaning supplies",
// "rubber gloves", "paper towels", "disinfectant bottle", "industrial cleaning".
// Team/workplace search terms: "warehouse worker", "small business team", "delivery
// logistics", "office team Latin America" — keep these wide/environmental (hands at
// work, warehouse, delivery van) rather than single posed portraits. These are
// decorative brand imagery, not "meet our team" photos — that's the separate section
// already built in M5.
const IMAGES = [
  "REPLACE_PRODUCT_1", "REPLACE_TEAM_1", "REPLACE_PRODUCT_2", "REPLACE_TEAM_2",
  "REPLACE_PRODUCT_3", "REPLACE_TEAM_3", "REPLACE_PRODUCT_4", "REPLACE_TEAM_4",
  "REPLACE_PRODUCT_5", "REPLACE_TEAM_5", "REPLACE_PRODUCT_6", "REPLACE_TEAM_6",
  "REPLACE_PRODUCT_7", "REPLACE_TEAM_7", "REPLACE_PRODUCT_8", "REPLACE_TEAM_8",
  "REPLACE_PRODUCT_9", "REPLACE_TEAM_9", "REPLACE_PRODUCT_10", "REPLACE_TEAM_10",
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function AboutHeroMorph() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const stickyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!stickyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(stickyRef.current);
    setContainerSize({ width: stickyRef.current.offsetWidth, height: stickyRef.current.offsetHeight });
    return () => observer.disconnect();
  }, []);

  // Real scroll progress across the tall wrapper section below — no wheel/touch
  // interception, no preventDefault. Normal page scroll drives this directly.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const morphProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
  const scrollRotate = useTransform(scrollYProgress, [0.2, 1], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const el = stickyRef.current;
    if (!el || prefersReducedMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 80);
    };
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t1 = setTimeout(() => setIntroPhase("line"), 500);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [prefersReducedMotion]);

  const scatterPositions = useMemo(
    () =>
      IMAGES.map(() => ({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 180,
        scale: 0.6,
        opacity: 0,
      })),
    []
  );

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMorphValue);
    const u2 = smoothScrollRotate.on("change", setRotateValue);
    const u3 = smoothMouseX.on("change", setParallaxValue);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  // Reduced-motion users get the resting arc state immediately, no scroll-driven
  // sequence and no scatter/line/circle intro. Build this branch as a simple static
  // arc or grid with both text blocks visible right away.
  if (prefersReducedMotion) {
    return (
      <section className="relative py-20 px-4 text-center bg-[#FAFAFA]">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Tu satisfacción es nuestro éxito
        </h1>
        <p className="mt-4 text-slate-600 max-w-lg mx-auto">
          Cinco años cuidando la higiene de su negocio. Desde Quito, LABMAREMI abastece a
          restaurantes, hoteles, oficinas e instituciones en todo Ecuador con un servicio confiable.
        </p>
        {/* Simple static grid — replace with same IMAGES array */}
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#FAFAFA]">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1 }}
              className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl"
            >
              Tu satisfacción es nuestro éxito
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === "circle" && morphValue < 0.5
                  ? { opacity: 0.6 - morphValue }
                  : { opacity: 0 }
              }
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase"
            >
              Desliza para explorar
            </motion.p>
          </div>

          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Cinco años cuidando la higiene de su negocio.
            </h2>
            <p className="text-sm md:text-base text-slate-600 max-w-lg leading-relaxed">
              Desde Quito, LABMAREMI abastece a restaurantes, hoteles, oficinas e instituciones
              en todo Ecuador con un servicio confiable.
            </p>
          </motion.div>

          <div className="relative flex items-center justify-center w-full h-full">
            {IMAGES.map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 78;
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                target = { x: i * lineSpacing - lineTotalWidth / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
              } else {
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(containerSize.width, containerSize.height);
                const circleRadius = Math.min(minDimension * 0.35, 350);
                const circleAngle = (i / TOTAL_IMAGES) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };

                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
                const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);
                const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                const maxRotation = spreadAngle * 0.8;
                const boundedRotation = -scrollProgress * maxRotation;
                const currentArcAngle = startAngle + i * step + boundedRotation;
                const arcRad = (currentArcAngle * Math.PI) / 180;
                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxValue,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: isMobile ? 1.4 : 1.8,
                };

                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return <FlipCard key={i} src={src} target={target} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

What changed from the original 21st.dev snippet, so you don't have to re-derive it:
- No "use client" (Next.js-only, inert in Vite)
- **Scroll is no longer hijacked.** The original intercepted wheel/touch events with `preventDefault()` and drove everything off a synthetic "virtual scroll" value — that breaks normal scrolling and is a real accessibility problem, not a style choice. This version uses `useScroll` tied to a real `300vh` wrapper section that's sticky-pinned while you scroll past it, so `scrollYProgress` drives the morph off actual page scroll. Nothing is intercepted; normal scrolling, keyboard, and touch all work as expected.
- Headline: "Tu satisfacción es nuestro éxito" — kept as "tú" per your instruction, an intentional exception to the site's "usted" register. Swap to "Su satisfacción es nuestro éxito" if you'd rather stay fully consistent.
- Subtext: "Desliza para explorar"
- Second content block: "Cinco años cuidando la higiene de su negocio." plus a Quito/Ecuador coverage line — this is a placeholder tied to the About page's timeline; swap in your actual slogan if it differs
- FlipCard back face: replaced the generic "View / Details" (which promised a click action that doesn't exist here) with a small "LABMAREMI" mark — decorative, not a fake link
- Added a `prefers-reduced-motion` branch that skips the whole scroll-driven sequence and renders a plain static section instead — fill in the simple grid where noted

Mount `<AboutHeroMorph />` at the very top of the About Us page, above the timeline/team content from M5 — it's an intro, not a replacement.

When done, tell me: how you filled in the reduced-motion static fallback, confirm the rest of the About Us page still renders normally below this section, and flag if the 20-card arc feels cramped or fine at actual screen sizes once you see it live.

---

## M10 — WhatsApp widget

**Prompt:**

Add a floating WhatsApp contact widget: fixed bottom-right button on every page except /admin. Clicking it opens a small popup card first (not a direct redirect) with a greeting and an "Iniciar chat" button that opens WhatsApp.

Uses framer-motion, already installed. No new dependencies.

Create `src/components/layout/WhatsAppWidget.tsx`:

```tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// No real number provided yet — replace this in BOTH this file and the Contact
// page's WhatsApp button (M5) when you have it. Digits only, no + or spaces,
// country code included (e.g. "593987654321" for Ecuador).
const WHATSAPP_NUMBER = "REPLACE_WITH_WHATSAPP_NUMBER";
const DEFAULT_MESSAGE = "Hola, me gustaría más información sobre los productos de LABMAREMI.";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.42.678 4.68 1.855 6.605L3 29l7.09-2.31A12.44 12.44 0 0 0 16 28c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3Zm0 22.688a10.15 10.15 0 0 1-5.176-1.42l-.371-.22-4.207 1.37 1.39-4.1-.242-.386a10.13 10.13 0 0 1-1.582-5.432c0-5.626 4.576-10.202 10.202-10.202 5.626 0 10.202 4.576 10.202 10.202 0 5.626-4.576 10.188-10.216 10.188Zm5.59-7.638c-.306-.153-1.81-.893-2.09-.994-.28-.102-.484-.153-.688.153-.204.306-.79.994-.968 1.198-.178.204-.357.23-.663.077-.306-.153-1.293-.477-2.463-1.52-.91-.812-1.525-1.815-1.703-2.121-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.05-.383-.026-.535-.077-.153-.688-1.658-.943-2.27-.248-.596-.5-.516-.688-.526l-.586-.01c-.204 0-.535.077-.815.383-.28.306-1.068 1.043-1.068 2.545 0 1.502 1.093 2.955 1.245 3.159.153.204 2.15 3.283 5.209 4.604.728.314 1.296.502 1.739.642.73.232 1.394.2 1.92.121.586-.087 1.81-.74 2.065-1.454.255-.714.255-1.325.178-1.454-.076-.128-.28-.204-.586-.357Z" />
    </svg>
  );
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  const chatLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm">LABMAREMI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-white/80 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-slate-700">
                ¿En qué podemos ayudarle? Escríbanos y le responderemos a la brevedad.
              </p>
              <a
                href={chatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold py-2.5 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Iniciar chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat de WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
```

Mount `<WhatsAppWidget />` once in the root layout (wherever Header/Footer already render from M0) — not per-page. Confirm `z-50` doesn't collide with any existing modal or overlay z-index in the app; adjust if it does.

Optional, not required: close the popup card when clicking outside it, in addition to the × button — add it if it's a quick addition, skip it if it complicates state handling more than it's worth.

When done, tell me where you mounted it, confirm it's hidden on /admin, and flag any z-index conflict you found.
