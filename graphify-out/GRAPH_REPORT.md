# Graph Report - .  (2026-07-05)

## Corpus Check
- Corpus is ~4,387 words - fits in a single context window. You may not need a graph.

## Summary
- 183 nodes · 233 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.9)
- Token cost: 58,915 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Shared UI Primitives & Nav|Shared UI Primitives & Nav]]
- [[_COMMUNITY_App TypeScript Config|App TypeScript Config]]
- [[_COMMUNITY_Router & Page Stubs|Router & Page Stubs]]
- [[_COMMUNITY_Package Manifest (Dev Deps & Scripts)|Package Manifest (Dev Deps & Scripts)]]
- [[_COMMUNITY_shadcnui Config|shadcn/ui Config]]
- [[_COMMUNITY_Phase 1 Documentation & Scope|Phase 1 Documentation & Scope]]
- [[_COMMUNITY_Node TypeScript Config|Node TypeScript Config]]
- [[_COMMUNITY_Product & Lead Data Concepts|Product & Lead Data Concepts]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Layout Components (HeaderFooterLayout)|Layout Components (Header/Footer/Layout)]]
- [[_COMMUNITY_Root TypeScript Config|Root TypeScript Config]]
- [[_COMMUNITY_Home Hero & Spline Concept|Home Hero & Spline Concept]]
- [[_COMMUNITY_App Entry & Brand|App Entry & Brand]]
- [[_COMMUNITY_Graphify & Claude Code Roles|Graphify & Claude Code Roles]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_About Us Page Concept|About Us Page Concept]]
- [[_COMMUNITY_Contact Page Concept|Contact Page Concept]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `cn()` - 18 edges
3. `compilerOptions` - 13 edges
4. `PageHeader()` - 11 edges
5. `CLAUDE.md Project Instructions` - 9 edges
6. `tailwind` - 6 edges
7. `aliases` - 6 edges
8. `Phase 1 Scope Document` - 6 edges
9. `scripts` - 4 edges
10. `buttonVariants` - 4 edges

## Surprising Connections (you probably didn't know these)
- `CLAUDE.md Project Instructions` --references--> `Phase 1 Tech Stack (React, Vite, TS, Tailwind, shadcn/ui, React Router, Spline, GitHub, Claude Code, Graphify)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `CLAUDE.md Project Instructions` --references--> `Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.)`  [INFERRED]
  CLAUDE.md → docs/00-phase-1-scope.md
- `Milestone M8 (full documentation pending: pages, architecture, deployment)` --conceptually_related_to--> `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)`  [AMBIGUOUS]
  README.md → CLAUDE.md
- `README Stack Summary (React, Vite, TS, Tailwind v4, shadcn/ui, React Router)` --references--> `Phase 1 Tech Stack (React, Vite, TS, Tailwind, shadcn/ui, React Router, Spline, GitHub, Claude Code, Graphify)`  [INFERRED]
  README.md → docs/00-phase-1-scope.md
- `CLAUDE.md Project Instructions` --references--> `Supabase (deferred to Phase 2 backend)`  [EXTRACTED]
  CLAUDE.md → docs/00-phase-1-scope.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 1 Main Pages** — docs_00_phase_1_scope_homepage, docs_00_phase_1_scope_productcatalogpage, docs_00_phase_1_scope_productdetail, docs_00_phase_1_scope_quoterequestpage, docs_00_phase_1_scope_contactpage, docs_00_phase_1_scope_aboutuspage, docs_00_phase_1_scope_admindashboard, docs_00_phase_1_scope_businessflowvisualizer [EXTRACTED 1.00]
- **Phase 1 Documentation Set** — claude_projectinstructions, readme_readme, docs_00_phase_1_scope_phase1scope [EXTRACTED 1.00]
- **Phase 1 Visual and Technical Foundation** — docs_00_phase_1_scope_techstack, docs_00_phase_1_scope_spline, docs_00_phase_1_scope_qualityreqs [INFERRED 0.85]

## Communities (18 total, 4 thin omitted)

### Community 0 - "Shared UI Primitives & Nav"
Cohesion: 0.16
Nodes (17): navItems, Badge(), BadgeProps, badgeVariants, Button(), ButtonProps, buttonVariants, Card() (+9 more)

### Community 1 - "App TypeScript Config"
Cohesion: 0.09
Nodes (22): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+14 more)

### Community 2 - "Router & Page Stubs"
Cohesion: 0.19
Nodes (10): PageHeader(), PageHeaderProps, AboutPage(), AdminPage(), CatalogPage(), ContactPage(), HomePage(), PlatformPage() (+2 more)

### Community 3 - "Package Manifest (Dev Deps & Scripts)"
Cohesion: 0.11
Nodes (18): devDependencies, tailwindcss, @tailwindcss/vite, tw-animate-css, @types/node, @types/react, @types/react-dom, typescript (+10 more)

### Community 4 - "shadcn/ui Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 5 - "Phase 1 Documentation & Scope"
Cohesion: 0.19
Nodes (15): Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link), CLAUDE.md Project Instructions, Shared UI Primitives in src/components/ui (Button, Card, Section, Badge, PageHeader), Visual Identity Guidelines (blue/white/cyan, clean & clinical, not generic-SaaS-gradient), Working Style: one milestone at a time, report and stop, don't chain unprompted, Phase 1 Acceptance Criteria, Out of Scope for Phase 1 (DB, Supabase, auth, payments, cart, etc.), Phase 1 Scope Document (+7 more)

### Community 6 - "Node TypeScript Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection, moduleResolution, noEmit, skipLibCheck (+6 more)

### Community 7 - "Product & Lead Data Concepts"
Cohesion: 0.22
Nodes (9): Admin Dashboard Preview, Business Flow Visualizer (/platform), src/data/businessTypes.ts (mock business-type data), src/data/categories.ts (mock category data), src/data/leads.ts (mock lead data), Product Catalog Page, Product Detail Modal/Page, src/data/products.ts (mock product data) (+1 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.25
Nodes (8): dependencies, class-variance-authority, clsx, lucide-react, react, react-dom, react-router-dom, tailwind-merge

### Community 9 - "Layout Components (Header/Footer/Layout)"
Cohesion: 0.33
Nodes (5): demoLinks, Footer(), publicLinks, Header(), Layout()

### Community 10 - "Root TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, files, @/*, references

### Community 11 - "Home Hero & Spline Concept"
Cohesion: 0.67
Nodes (4): HeroSection.tsx (planned Home hero component), Home Page, Spline 3D Hero Animation (rationale: communicate cleanliness/professionalism, isolated & lazy-loadable, non-blocking), SplineHeroScene.tsx (planned isolated component)

### Community 12 - "App Entry & Brand"
Cohesion: 0.50
Nodes (4): LABMAREMI (B2B Cleaning-Supplies Distributor, Quito, Ecuador), index.html Entry Document, #root Mount Element, src/main.tsx (app entry script, referenced but not read)

## Ambiguous Edges - Review These
- `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)` → `Milestone M8 (full documentation pending: pages, architecture, deployment)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **96 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Definition of Done (runs locally, responsive, all main pages implemented, clean README, deployed link)` and `Milestone M8 (full documentation pending: pages, architecture, deployment)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `Shared UI Primitives & Nav` to `Layout Components (Header/Footer/Layout)`, `Router & Page Stubs`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Package Manifest (Dev Deps & Scripts)` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `shadcn/ui Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Node TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._