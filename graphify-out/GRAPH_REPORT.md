# Graph Report - .  (2026-07-05)

## Corpus Check
- Corpus is ~15,001 words - fits in a single context window. You may not need a graph.

## Summary
- 280 nodes · 575 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.91)
- Token cost: 28,000 input · 5,241 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Home Page & Hero|Home Page & Hero]]
- [[_COMMUNITY_Catalog & Quote UI Components|Catalog & Quote UI Components]]
- [[_COMMUNITY_NPM Dependencies (package.json)|NPM Dependencies (package.json)]]
- [[_COMMUNITY_Admin Dashboard & Mock Data|Admin Dashboard & Mock Data]]
- [[_COMMUNITY_TypeScript App Config|TypeScript App Config]]
- [[_COMMUNITY_shadcnui Config|shadcn/ui Config]]
- [[_COMMUNITY_CLAUDE.md Project Rules|CLAUDE.md Project Rules]]
- [[_COMMUNITY_TypeScript Node Config|TypeScript Node Config]]
- [[_COMMUNITY_About Page & AvatarTimeline|About Page & Avatar/Timeline]]
- [[_COMMUNITY_App Shell & Layout|App Shell & Layout]]
- [[_COMMUNITY_index.html & Font Loading|index.html & Font Loading]]
- [[_COMMUNITY_Phase 1 Spec Pages & Mock Data|Phase 1 Spec: Pages & Mock Data]]
- [[_COMMUNITY_Root TS Project References|Root TS Project References]]
- [[_COMMUNITY_Phase 1 Spec Home Hero & Spline Plan|Phase 1 Spec: Home Hero & Spline Plan]]
- [[_COMMUNITY_Phase 1 Spec ClaudeGraphify Roles|Phase 1 Spec: Claude/Graphify Roles]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Phase 1 Spec About Us Page|Phase 1 Spec: About Us Page]]
- [[_COMMUNITY_Phase 1 Spec Contact Page|Phase 1 Spec: Contact Page]]
- [[_COMMUNITY_Phase 1 Spec Business Description|Phase 1 Spec: Business Description]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 46 edges
2. `compilerOptions` - 20 edges
3. `buttonVariants` - 14 edges
4. `compilerOptions` - 13 edges
5. `Eyebrow()` - 11 edges
6. `Section()` - 11 edges
7. `getCategoryIcon()` - 11 edges
8. `AdminPage()` - 11 edges
9. `getCategoryCode()` - 10 edges
10. `getProductById()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Project Instructions` --references--> `Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `CLAUDE.md Project Instructions` --references--> `Phase 1 Tech Stack (React, Vite, TS, Tailwind, shadcn/ui, React Router, Spline, GitHub, Claude Code, Graphify)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `Milestone M8 (full documentation pending: pages, architecture, deployment)` --conceptually_related_to--> `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)`  [AMBIGUOUS]
  README.md → CLAUDE.md
- `CLAUDE.md Project Instructions` --references--> `Supabase (deferred to Phase 2 backend)`  [EXTRACTED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `Visual Identity Guidelines (blue/white/cyan, clean & clinical, not generic-SaaS-gradient)` --references--> `Professional Quality Requirements (responsive, clean palette, no Lorem Ipsum, no console errors)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 1 Documentation Set** — claude_projectinstructions, readme_readme, docs_00_phase_1_scope_phase1scope [EXTRACTED 1.00]
- **Phase 1 Main Pages** — docs_00_phase_1_scope_homepage, docs_00_phase_1_scope_productcatalogpage, docs_00_phase_1_scope_productdetail, docs_00_phase_1_scope_quoterequestpage, docs_00_phase_1_scope_contactpage, docs_00_phase_1_scope_aboutuspage, docs_00_phase_1_scope_admindashboard, docs_00_phase_1_scope_businessflowvisualizer [EXTRACTED 1.00]
- **Phase 1 Visual and Technical Foundation** — docs_00_phase_1_scope_techstack, docs_00_phase_1_scope_spline, docs_00_phase_1_scope_qualityreqs [INFERRED 0.85]
- **Google Fonts Preconnect + Stylesheet Loading Pattern** — index_google_fonts_preconnect, index_google_fonts_stylesheet_link, index_font_space_grotesk, index_font_ibm_plex_sans, index_font_ibm_plex_mono [EXTRACTED 1.00]

## Communities (20 total, 5 thin omitted)

### Community 0 - "Home Page & Hero"
Cohesion: 0.09
Nodes (38): HeroSection(), trustPoints, HeroVisual(), navItems, QuoteSuccess(), QuoteSuccessProps, Badge(), BadgeProps (+30 more)

### Community 1 - "Catalog & Quote UI Components"
Cohesion: 0.17
Nodes (23): ProductCard(), ProductCardProps, ProductPicker(), ProductPickerProps, Input(), InputProps, categories, products (+15 more)

### Community 2 - "NPM Dependencies (package.json)"
Cohesion: 0.07
Nodes (26): dependencies, class-variance-authority, clsx, lucide-react, react, react-dom, react-router-dom, tailwind-merge (+18 more)

### Community 3 - "Admin Dashboard & Mock Data"
Cohesion: 0.15
Nodes (21): StatusBadge(), StatusBadgeProps, statusStyles, businessTypes, leads, CategoryCount, getProductInterestRanking(), getRecentLeads() (+13 more)

### Community 4 - "TypeScript App Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 5 - "shadcn/ui Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 6 - "CLAUDE.md Project Rules"
Cohesion: 0.19
Nodes (15): Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link), CLAUDE.md Project Instructions, Shared UI Primitives in src/components/ui (Button, Card, Section, Badge, PageHeader), Visual Identity Guidelines (blue/white/cyan, clean & clinical, not generic-SaaS-gradient), Working Style: one milestone at a time, report and stop, don't chain unprompted, Phase 1 Acceptance Criteria, Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.), Phase 1 Scope Document (+7 more)

### Community 7 - "TypeScript Node Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+6 more)

### Community 8 - "About Page & Avatar/Timeline"
Cohesion: 0.19
Nodes (10): Timeline(), TimelineEntry, TimelineProps, Avatar(), AvatarProps, getInitials(), sizeClasses, owners (+2 more)

### Community 9 - "App Shell & Layout"
Cohesion: 0.21
Nodes (6): demoLinks, Footer(), publicLinks, Header(), Layout(), NotFoundPage()

### Community 10 - "index.html & Font Loading"
Cohesion: 0.22
Nodes (10): Font: IBM Plex Mono (400;500), Font: IBM Plex Sans (400;500;600), Font: Space Grotesk (400;500;600;700), Google Fonts Preconnect Links, Google Fonts Stylesheet Link, index.html (App HTML Entry), Module Script Tag: /src/main.tsx, Meta Description (LABMAREMI B2B distributor summary) (+2 more)

### Community 11 - "Phase 1 Spec: Pages & Mock Data"
Cohesion: 0.22
Nodes (9): Admin Dashboard Preview, Business Flow Visualizer (/platform), src/data/businessTypes.ts (mock business-type data), src/data/categories.ts (mock category data), src/data/leads.ts (mock lead data), Product Catalog Page, Product Detail Modal/Page, src/data/products.ts (mock product data) (+1 more)

### Community 12 - "Root TS Project References"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 13 - "Phase 1 Spec: Home Hero & Spline Plan"
Cohesion: 0.67
Nodes (4): HeroSection.tsx (planned Home hero component), Home Page, Spline 3D Hero Animation (rationale: communicate cleanliness/professionalism, isolated & lazy-loadable, non-blocking), SplineHeroScene.tsx (planned isolated component)

## Ambiguous Edges - Review These
- `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)` → `Milestone M8 (full documentation pending: pages, architecture, deployment)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **119 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)` and `Milestone M8 (full documentation pending: pages, architecture, deployment)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `Home Page & Hero` to `About Page & Avatar/Timeline`, `Catalog & Quote UI Components`, `Admin Dashboard & Mock Data`, `App Shell & Layout`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `Eyebrow()` connect `Home Page & Hero` to `About Page & Avatar/Timeline`, `Catalog & Quote UI Components`, `Admin Dashboard & Mock Data`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Section()` connect `Home Page & Hero` to `About Page & Avatar/Timeline`, `Catalog & Quote UI Components`, `Admin Dashboard & Mock Data`, `App Shell & Layout`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home Page & Hero` be split into smaller, more focused modules?**
  _Cohesion score 0.09497882637628555 - nodes in this community are weakly interconnected._
- **Should `NPM Dependencies (package.json)` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._