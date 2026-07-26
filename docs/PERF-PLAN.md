# Mobile performance — diagnosis and fix plan

**Reported (Vercel Analytics, mobile):** LCP 3.94 s (target < 2.5 s) · FID 192 ms (target < 100 ms)

> **Status: implemented 2026-07-25.** P0, P1-a, P1-c and P2 shipped.
> **P1-b (mobile cull) was implemented and then reverted at the owner's
> request — all twelve brand logos render at every breakpoint by design.**
> That is affordable post-P0: the full set is ~110 KB instead of 8.3 MB, and
> the twelve clouds now share one rAF loop rather than running twelve.
> `public/` went from
> 9,849.6 KB to 113.8 KB (−98.8 %); the entry chunk from 101 KB to 83.9 KB
> gzipped. `scripts/check-asset-budget.mjs` failed with 3 violations before the
> change and passes after. Build exits 0, react-doctor 100/100.
>
> **Not yet confirmed:** field data. Lab verification in a real browser is still
> outstanding — the Chrome extension was not connected during implementation, so
> the Lighthouse mobile run and the visual smoke test in §4 have **not** been
> done. Do those before treating the numbers as proven, and re-check Vercel
> Analytics after ~7 days.
>
> Two things found during implementation that were not in the original diagnosis:
> the hero art is **supplier brand logos** (Familia, Tork, Scott, 3M, WypAll,
> Tips, Lava, Master, Estrella, Krik, ISO, Microlimpia), not the product photos
> the code comments described; and `--font-goodtimes: "Good Times"` in
> `src/index.css:45` has no `@font-face` and no font file anywhere in the repo,
> so the `<h1>` has always rendered in fallback sans-serif.

---

## 1. Root cause

**`public/` ships ~9.6 MB of base64-encoded raster photos wrapped in SVG, and the mobile home page loads all of them.**

Every `photo*.svg` and `logo*.svg` is not a vector. Each contains two `<image>` elements holding base64 payloads plus an `feColorMatrix` filter — zero or one `<path>`. They are JPEGs in an SVG costume.

| File | Size | Rendered at | Notes |
| --- | ---: | --- | --- |
| `photo4.svg` | **5,222 KB** | 75–110 px | single worst asset |
| `photo3.svg` | 752 KB | 70–100 px | |
| `photo2.svg` | 716 KB | 80–120 px | |
| `photo5.svg` | 701 KB | 70–105 px | |
| `photo11.svg` | 390 KB | 75–110 px | |
| `photo1.svg` | 160 KB | 70–105 px | |
| `photo9.svg` | 138 KB | 75–110 px | |
| `photo8.svg` | 108 KB | 70–105 px | |
| `photo7.svg` | 89 KB | 75–110 px | |
| `photo12.svg` | 85 KB | 80–115 px | |
| `photo6.svg` | 72 KB | 75–110 px | |
| `photo10.svg` | 27 KB | 70–105 px | |
| `logo1.svg` | **694 KB** | 60 px (`h-15 w-15`) | Header — **every page**, plus Footer |
| `logo2.svg` | **694 KB** | 16–32 px | favicon + apple-touch-icon, `index.html:10-11` |
| **Total** | **~9.6 MB** | | |

### Compression does not save this

Measured gzip ratios: `photo4.svg` 75.1 %, `photo2.svg` 75.2 %, `logo1.svg` 49.2 %. The 75 % figure is exactly base64's 4:3 expansion being undone — the underlying JPEG bytes are already compressed and incompressible. **`photo4.svg` still costs ~3.9 MB on the wire after gzip.** Estimated mobile home payload: **~7.2 MB compressed**.

### Why this format is uniquely bad

1. **Opts out of image optimization.** Vercel's optimizer, `srcset`, WebP/AVIF negotiation — all skipped for `.svg`. The browser gets the full-resolution original regardless of viewport.
2. **Main-thread decode.** SVG-wrapped images are parsed as XML, base64-decoded, then raster-decoded — largely on the main thread, unlike a plain `<img>` which can decode off-thread.
3. **`feColorMatrix` forces CPU rasterization** on every paint. Each of these 12 images is also transform-animated every frame (§2), so the filter re-rasterizes continuously instead of compositing on the GPU.

### Contributing factor: `loading="lazy"` on the LCP element

`HeroFloatingCanvas.tsx:97` sets `loading="lazy"` on all 12 hero images. These are above the fold, so lazy-loading does not skip them — it **delays** them: lazy images are invisible to the preload scanner and are requested only after layout. This is an LCP anti-pattern applied directly to the LCP candidate.

### Contributing factor: the mobile cull was never implemented

`HeroFloatingCanvas.tsx:16-17` comments: *"Odd indices are hidden on mobile so the 5 that remain stay evenly spread around the ring."* The code does not do this — line 260 maps all 12 unconditionally, and the mobile branch lays them out on a full 360° ring. **Mobile downloads and animates all 12.**

---

## 2. Why FID is 192 ms

FID measures how long the main thread is blocked when the user first interacts. Four sources stack up during hero mount:

1. **Image decode** — 12 base64-in-SVG decodes, ~9.6 MB, largely main-thread.
2. **12 independent `useAnimationFrame` loops.** Each `FloatingCloud` (line 78) runs its own rAF callback writing three motion values (`x`, `y`, `rotate`) — **36 motion-value writes per frame**, plus a `useSpring` pair driving parallax.
3. **Filtered SVGs under animated transforms** — per-frame CPU raster, not GPU composite.
4. **~168 KB gzip of JS parses and evaluates before anything is interactive**: entry `index` 343 KB (101 KB gzip) + `react` 50 KB (18 KB) + `motion` 148 KB (50 KB, eagerly `modulepreload`ed). All eight public pages are statically imported in `App.tsx:7-14`, so the entry chunk contains the whole public site.

Note: Vercel reports FID, which Google retired in favour of INP in March 2024. The fixes below target main-thread blocking, which improves both.

### Also on the critical path

`index.html:27-29` loads three Google Font families via a render-blocking third-party stylesheet — Playfair Display (variable 400–900 **plus** the italic axis), Manrope (5 weights), IBM Plex Mono (2 weights). This creates a blocking chain: HTML → `fonts.googleapis.com` CSS → `fonts.gstatic.com` font files, before first paint. `preconnect` is present, which helps but does not unblock.

---

## 3. Fix plan

Ordered by impact per unit of effort. **P0 alone should resolve LCP.**

### P0-a — Convert all 14 assets to real rasters

Add `sharp` as a devDependency and write `scripts/optimize-hero-assets.mjs`: extract each embedded base64 payload, decode, resize to display size, re-encode as WebP.

Target sizes — hero photos render at 70–120 CSS px, so 240 px covers 2× DPR; header logo renders at 60 px → 128 px; favicon → 32/180 px PNG.

Expected: **~9.6 MB → ~150 KB (≈98 % reduction).**

Keep the originals in a `design-assets/` folder outside `public/` so the source images aren't lost.

### P0-b — Fix the hero image loading attributes

In `HeroFloatingCanvas.tsx:97`: drop `loading="lazy"`, add `decoding="async"`, explicit `width`/`height` (prevents CLS), and `fetchpriority="high"` on the first few. Add a `<link rel="preload" as="image">` in `index.html` for the LCP candidate.

### P1-a — Replace the 694 KB favicon

`index.html:10-11` points both `icon` and `apple-touch-icon` at `logo2.svg` (1800×1800, 694 KB) for a 16–32 px slot. Ship a real `favicon.ico`/32 px PNG plus a 180 px apple-touch-icon — roughly 1 KB and 8 KB.

### P1-b — ~~Implement the mobile cull the comment already promises~~ (rejected)

~~Render odd indices only at `sm+`.~~ **Not doing this.** The full ring of twelve supplier brands is intentional at every breakpoint. The stale comment claiming otherwise has been corrected in `HeroFloatingCanvas.tsx` rather than implemented. With P0 done the cull buys little: twelve logos cost ~110 KB, and the per-frame saving is already captured by P2-a's shared loop.

### P1-c — Trim the font payload

Cheapest: drop Playfair's italic axis and narrow Manrope to the weights actually used. Better: self-host the subset with `font-display: swap` and `<link rel="preload">`, removing the third-party blocking chain entirely. Audit real usage first — three families for this design is likely one too many.

### P2-a — Consolidate the 12 rAF loops into one

One `useAnimationFrame` in the parent writing to all clouds, instead of 12 independent loops. Removes per-loop overhead and makes the work schedulable in a single frame budget.

### P2-b — Lazy-load the hero canvas

`HeroFloatingCanvas` is the only reason `motion` (148 KB / 50 KB gzip) is on the eager critical path. `lazy()` it behind the hero text so the LCP text paints before Framer Motion loads.

### P2-c — Route-split the public pages

`App.tsx` statically imports all eight public pages into a 343 KB entry chunk. Lazy-load everything except `HomePage`; expect the entry to drop substantially.

---

## 4. Verification

This repo has **no test runner** (no Vitest/Jest/Playwright), so "write the test first" is not available as literal unit tests. The TDD equivalent here is a **budget that fails before the fix and passes after** — assert on measurements, not on implementation.

### Write these first, confirm they fail

Add `scripts/check-asset-budget.mjs` (runnable in CI later) asserting:

| Assertion | Now | Target |
| --- | ---: | ---: |
| No single file in `public/` > 150 KB | fails (5 over) | pass |
| Total `public/` < 500 KB | fails (~9.6 MB) | pass |
| No `.svg` in `public/` contains `base64` | fails (14/14) | pass |
| Entry chunk gzip < 120 KB | 101 KB — passes | keep |

### Then measure end-to-end

1. `npm run build && npm run preview`
2. Lighthouse **mobile** preset, throttled, on `/` — record LCP and TBT before and after. TBT is the lab proxy for FID/INP.
3. Chrome DevTools → Performance, 4× CPU throttle + Slow 4G: confirm no long task > 50 ms during hero mount, and that the LCP element is the hero text/image, not a late-decoded photo.
4. `npm run build` exits 0 and `npm run doctor` shows no new findings.
5. Manual: hero still animates correctly at 360 px, 768 px, and desktop widths; `prefers-reduced-motion` still freezes it.
6. Ship, then re-check Vercel Analytics after ~7 days of field data — lab numbers are directional, field data is the actual target.

### Rollback

Asset and loading-attribute changes are self-contained; revert the commit and redeploy via Vercel's instant rollback (`docs/RUNBOOK.md` §7).
