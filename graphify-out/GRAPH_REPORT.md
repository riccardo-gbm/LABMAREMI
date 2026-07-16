# Graph Report - .  (2026-07-11)

## Corpus Check
- 39 files · ~24,542 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 332 nodes · 468 edges · 24 communities (16 shown, 8 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.85)
- Token cost: 120,412 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Root & ProductQuote UI|App Root & Product/Quote UI]]
- [[_COMMUNITY_shadcnui Primitives|shadcn/ui Primitives]]
- [[_COMMUNITY_Mock Data & Admin Selectors|Mock Data & Admin Selectors]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_Phase 1 Plan & Milestones|Phase 1 Plan & Milestones]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_Layout Chrome & WhatsApp Widget|Layout Chrome & WhatsApp Widget]]
- [[_COMMUNITY_shadcn Components Config|shadcn Components Config]]
- [[_COMMUNITY_About Page & Timeline|About Page & Timeline]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_Home Hero Components|Home Hero Components]]
- [[_COMMUNITY_TypeScript Base Config|TypeScript Base Config]]
- [[_COMMUNITY_ContactAbout Scroll-Morph Design|Contact/About Scroll-Morph Design]]
- [[_COMMUNITY_White Logo & Brand Identity|White Logo & Brand Identity]]
- [[_COMMUNITY_Icon Mapping Helpers|Icon Mapping Helpers]]
- [[_COMMUNITY_Blue Logo & Palette|Blue Logo & Palette]]
- [[_COMMUNITY_Phase 2 Supabase Guard|Phase 2 Supabase Guard]]
- [[_COMMUNITY_WhatsApp Widget Milestone|WhatsApp Widget Milestone]]
- [[_COMMUNITY_Project Shell & Structure|Project Shell & Structure]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Spanish Formal Copy Rule|Spanish Formal Copy Rule]]
- [[_COMMUNITY_BlueWhiteCyan Palette|Blue/White/Cyan Palette]]
- [[_COMMUNITY_Social Meta Tags|Social Meta Tags]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 21 edges
2. `compilerOptions` - 20 edges
3. `compilerOptions` - 13 edges
4. `Reveal()` - 11 edges
5. `Card()` - 10 edges
6. `RevealItem()` - 8 edges
7. `RevealGroup()` - 7 edges
8. `Product` - 7 edges
9. `tailwind` - 6 edges
10. `aliases` - 6 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Project Instructions` --semantically_similar_to--> `LABMAREMI Phase 1 Frontend Demo`  [INFERRED] [semantically similar]
  CLAUDE.md → AGENTS.md
- `README Tech Stack (Tailwind v4, RR v7, framer-motion)` --semantically_similar_to--> `Phase 1 Fixed Stack (React/Vite/TS/Tailwind/shadcn)`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `README — LABMAREMI Phase 1 Demo` --references--> `LABMAREMI Phase 1 Frontend Demo`  [INFERRED]
  README.md → AGENTS.md
- `M0 — Foundation & Design System` --implements--> `Shared UI Primitives Reuse Principle`  [INFERRED]
  docs/phase1-execution-plan_2.md → AGENTS.md
- `One-Milestone-At-A-Time Working Style` --conceptually_related_to--> `Review Gate Between Milestones`  [INFERRED]
  AGENTS.md → docs/phase1-execution-plan_2.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 1 Milestone Build Sequence** — docs_phase1_execution_plan_2_m0, docs_phase1_execution_plan_2_m1, docs_phase1_execution_plan_2_m2, docs_phase1_execution_plan_2_m8 [EXTRACTED 0.90]
- **M7 Hero Rebuild Components** — docs_phase1_execution_plan_2_m7, docs_phase1_execution_plan_2_herofloatingcanvas, docs_phase1_execution_plan_2_herosection, docs_phase1_execution_plan_2_manrope_font [EXTRACTED 0.90]
- **Quote/Lead Data Flow Across Milestones** — docs_phase1_execution_plan_2_m3, docs_phase1_execution_plan_2_m4, docs_phase1_execution_plan_2_m6, readme_mock_data_layer [INFERRED 0.75]

## Communities (24 total, 8 thin omitted)

### Community 0 - "App Root & Product/Quote UI"
Cohesion: 0.06
Nodes (38): ProductCard(), ProductPicker(), ProductPickerProps, QuoteSuccess(), QuoteSuccessProps, Card(), MediaFrame(), MediaFrameProps (+30 more)

### Community 1 - "shadcn/ui Primitives"
Cohesion: 0.10
Nodes (23): StatusBadge(), statusStyles, Avatar(), AvatarProps, getInitials(), sizeClasses, Badge(), BadgeProps (+15 more)

### Community 2 - "Mock Data & Admin Selectors"
Cohesion: 0.10
Nodes (23): StatusBadgeProps, ProductCardProps, businessTypes, leads, products, CategoryCount, getProductInterestRanking(), getTopCategories() (+15 more)

### Community 3 - "NPM Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, class-variance-authority, clsx, framer-motion, lucide-react, react, react-dom, react-router-dom (+19 more)

### Community 4 - "Phase 1 Plan & Milestones"
Cohesion: 0.08
Nodes (25): Phase 1 Definition of Done, Phase 1 Fixed Stack (React/Vite/TS/Tailwind/shadcn), One-Milestone-At-A-Time Working Style, LABMAREMI Phase 1 Frontend Demo, Shared UI Primitives Reuse Principle, CLAUDE.md Project Instructions, Graphify Extraction Checkpoints, HeroFloatingCanvas Component (+17 more)

### Community 5 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 6 - "Layout Chrome & WhatsApp Widget"
Cohesion: 0.12
Nodes (12): demoLinks, Footer(), FooterLinkProps, publicLinks, Header(), navItems, Layout(), getTag() (+4 more)

### Community 7 - "shadcn Components Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "About Page & Timeline"
Cohesion: 0.13
Nodes (12): AboutHeroMorph(), AnimationPhase, FlipCardProps, IMAGES, lerp(), Timeline(), TimelineEntry, TimelineProps (+4 more)

### Community 9 - "TypeScript Node Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+6 more)

### Community 10 - "Home Hero Components"
Cohesion: 0.22
Nodes (6): HeroFloatingCanvas(), images, random(), clientSegments, StatItemProps, trustStats

### Community 11 - "TypeScript Base Config"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 12 - "Contact/About Scroll-Morph Design"
Cohesion: 0.40
Nodes (5): AboutHeroMorph Component, M5 — Contact + About Us, M9 — About Us Scroll-Morph Intro, prefers-reduced-motion Accessibility Branch, Non-Hijacked Scroll (useScroll + sticky 300vh)

### Community 13 - "White Logo & Brand Identity"
Cohesion: 0.60
Nodes (5): LABMAREMI Logo (White Variant), Embedded PNG Raster via SVG Mask, B2B Cleaning & Hygiene Supplier, LABMAREMI Brand Identity, White Monochrome Logo Treatment

### Community 15 - "Blue Logo & Palette"
Cohesion: 0.67
Nodes (4): Blue on White Clinical Palette, LABMAREMI Logo (logo2), LABMAREMI Brand Identity, Stylized M Monogram with Node Terminals

## Knowledge Gaps
- **142 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `App Root & Product/Quote UI` to `About Page & Timeline`, `Mock Data & Admin Selectors`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `categories` connect `App Root & Product/Quote UI` to `Mock Data & Admin Selectors`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Root & Product/Quote UI` be split into smaller, more focused modules?**
  _Cohesion score 0.061018437225636525 - nodes in this community are weakly interconnected._
- **Should `shadcn/ui Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.09982174688057041 - nodes in this community are weakly interconnected._
- **Should `Mock Data & Admin Selectors` be split into smaller, more focused modules?**
  _Cohesion score 0.10338680926916222 - nodes in this community are weakly interconnected._
- **Should `NPM Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._