# Graph Report - .  (2026-07-05)

## Corpus Check
- Corpus is ~15,935 words - fits in a single context window. You may not need a graph.

## Summary
- 289 nodes · 586 edges · 21 communities (16 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.92)
- Token cost: 30,000 input · 4,945 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Catalog & Hero Pages|Catalog & Hero Pages]]
- [[_COMMUNITY_Quote Flow & UI Primitives|Quote Flow & UI Primitives]]
- [[_COMMUNITY_App Shell & About|App Shell & About]]
- [[_COMMUNITY_Admin Dashboard & Mock Data|Admin Dashboard & Mock Data]]
- [[_COMMUNITY_NPM Dependencies (package.json)|NPM Dependencies (package.json)]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_README & Font Loading|README & Font Loading]]
- [[_COMMUNITY_shadcnui Config|shadcn/ui Config]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_CLAUDE.md Project Rules|CLAUDE.md Project Rules]]
- [[_COMMUNITY_Phase 1 Spec Pages & Mock Data|Phase 1 Spec: Pages & Mock Data]]
- [[_COMMUNITY_Header & Footer Layout|Header & Footer Layout]]
- [[_COMMUNITY_Root TS Project References|Root TS Project References]]
- [[_COMMUNITY_Phase 1 Spec Hero & Spline Plan|Phase 1 Spec: Hero & Spline Plan]]
- [[_COMMUNITY_Hero Floating Canvas|Hero Floating Canvas]]
- [[_COMMUNITY_Phase 1 Spec Tooling Roles|Phase 1 Spec: Tooling Roles]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Phase 1 Spec About Us Page|Phase 1 Spec: About Us Page]]
- [[_COMMUNITY_Phase 1 Spec Contact Page|Phase 1 Spec: Contact Page]]
- [[_COMMUNITY_Phase 1 Spec Business Description|Phase 1 Spec: Business Description]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 46 edges
2. `compilerOptions` - 20 edges
3. `buttonVariants` - 14 edges
4. `compilerOptions` - 13 edges
5. `Section()` - 11 edges
6. `getCategoryIcon()` - 11 edges
7. `AdminPage()` - 11 edges
8. `Eyebrow()` - 10 edges
9. `getCategoryCode()` - 10 edges
10. `getProductById()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Project Instructions` --references--> `Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `CLAUDE.md Project Instructions` --references--> `Phase 1 Tech Stack (React, Vite, TS, Tailwind, shadcn/ui, React Router, Spline, GitHub, Claude Code, Graphify)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `CLAUDE.md Project Instructions` --references--> `Supabase (deferred to Phase 2 backend)`  [EXTRACTED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `Visual Identity Guidelines (blue/white/cyan, clean & clinical, not generic-SaaS-gradient)` --references--> `Professional Quality Requirements (responsive, clean palette, no Lorem Ipsum, no console errors)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `Meta Description (Distribuidor B2B de productos de limpieza, Quito, Ecuador)` --references--> `LABMAREMI Cía. Ltda. (B2B Cleaning Supplies Distributor, Quito)`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 1 Documentation Set** — claude_projectinstructions, readme_readme, docs_00_phase_1_scope_phase1scope [EXTRACTED 1.00]
- **Phase 1 Main Pages** — docs_00_phase_1_scope_homepage, docs_00_phase_1_scope_productcatalogpage, docs_00_phase_1_scope_productdetail, docs_00_phase_1_scope_quoterequestpage, docs_00_phase_1_scope_contactpage, docs_00_phase_1_scope_aboutuspage, docs_00_phase_1_scope_admindashboard, docs_00_phase_1_scope_businessflowvisualizer [EXTRACTED 1.00]
- **Phase 1 Visual and Technical Foundation** — docs_00_phase_1_scope_techstack, docs_00_phase_1_scope_spline, docs_00_phase_1_scope_qualityreqs [INFERRED 0.85]
- **Google Fonts typography pipeline (preconnect -> stylesheet -> Manrope + IBM Plex Mono, documented in README tech stack)** — index_google_fonts_preconnect, index_google_fonts_stylesheet_link, index_font_manrope, index_font_ibm_plex_mono, readme_tech_stack [EXTRACTED 1.00]

## Communities (21 total, 5 thin omitted)

### Community 0 - "Catalog & Hero Pages"
Cohesion: 0.15
Nodes (27): ProductCard(), HeroSection(), trustPoints, ProductPicker(), ProductPickerProps, Badge(), BadgeProps, badgeVariants (+19 more)

### Community 1 - "Quote Flow & UI Primitives"
Cohesion: 0.13
Nodes (24): QuoteSuccess(), QuoteSuccessProps, Button(), ButtonProps, Card(), CardContent(), CardDescription(), CardFooter() (+16 more)

### Community 2 - "App Shell & About"
Cohesion: 0.11
Nodes (17): Timeline(), TimelineEntry, TimelineProps, Avatar(), AvatarProps, getInitials(), sizeClasses, PageHeader() (+9 more)

### Community 3 - "Admin Dashboard & Mock Data"
Cohesion: 0.14
Nodes (23): StatusBadge(), StatusBadgeProps, statusStyles, ProductCardProps, businessTypes, leads, CategoryCount, getProductInterestRanking() (+15 more)

### Community 4 - "NPM Dependencies (package.json)"
Cohesion: 0.07
Nodes (27): dependencies, class-variance-authority, clsx, framer-motion, lucide-react, react, react-dom, react-router-dom (+19 more)

### Community 5 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 6 - "README & Font Loading"
Cohesion: 0.14
Nodes (20): Phase 1 Scope Document (docs/00-phase-1-scope.md), IBM Plex Mono Font (weights 400-500), Manrope Font (weights 400-800), Google Fonts Preconnect Links, Google Fonts Stylesheet Link (Manrope 400-800 + IBM Plex Mono 400-500), index.html (App HTML Entry), Module Script Entry (/src/main.tsx), Meta Description (Distribuidor B2B de productos de limpieza, Quito, Ecuador) (+12 more)

### Community 7 - "shadcn/ui Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "TypeScript Node Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+6 more)

### Community 9 - "CLAUDE.md Project Rules"
Cohesion: 0.24
Nodes (12): Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link), CLAUDE.md Project Instructions, Shared UI Primitives in src/components/ui (Button, Card, Section, Badge, PageHeader), Visual Identity Guidelines (blue/white/cyan, clean & clinical, not generic-SaaS-gradient), Working Style: one milestone at a time, report and stop, don't chain unprompted, Phase 1 Acceptance Criteria, Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.), Phase 1 Scope Document (+4 more)

### Community 10 - "Phase 1 Spec: Pages & Mock Data"
Cohesion: 0.22
Nodes (9): Admin Dashboard Preview, Business Flow Visualizer (/platform), src/data/businessTypes.ts (mock business-type data), src/data/categories.ts (mock category data), src/data/leads.ts (mock lead data), Product Catalog Page, Product Detail Modal/Page, src/data/products.ts (mock product data) (+1 more)

### Community 11 - "Header & Footer Layout"
Cohesion: 0.28
Nodes (6): demoLinks, Footer(), publicLinks, Header(), navItems, Layout()

### Community 12 - "Root TS Project References"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 13 - "Phase 1 Spec: Hero & Spline Plan"
Cohesion: 0.67
Nodes (4): HeroSection.tsx (planned Home hero component), Home Page, Spline 3D Hero Animation (rationale: communicate cleanliness/professionalism, isolated & lazy-loadable, non-blocking), SplineHeroScene.tsx (planned isolated component)

### Community 14 - "Hero Floating Canvas"
Cohesion: 0.67
Nodes (3): HeroFloatingCanvas(), images, random()

## Knowledge Gaps
- **118 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Quote Flow & UI Primitives` to `Catalog & Hero Pages`, `Header & Footer Layout`, `App Shell & About`, `Admin Dashboard & Mock Data`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Section()` connect `App Shell & About` to `Catalog & Hero Pages`, `Quote Flow & UI Primitives`, `Admin Dashboard & Mock Data`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Eyebrow()` connect `Quote Flow & UI Primitives` to `Catalog & Hero Pages`, `App Shell & About`, `Admin Dashboard & Mock Data`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _121 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Quote Flow & UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.12605042016806722 - nodes in this community are weakly interconnected._
- **Should `App Shell & About` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `Admin Dashboard & Mock Data` be split into smaller, more focused modules?**
  _Cohesion score 0.14039408866995073 - nodes in this community are weakly interconnected._