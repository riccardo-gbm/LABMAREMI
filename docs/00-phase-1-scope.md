# Phase 1 Scope — Professional Frontend Demo + Visualizer - LABMAREMI

## 1. Phase Name

Professional Frontend Demo and Business Flow Visualizer for LABMAREMI

## 2. Main Goal

Create a polished, professional, clickable demo of the B2B cleaning-supplies platform before building the real backend.

This phase should prove the product idea visually and structurally. It should look like a real business platform, but it will use mock data instead of a real database.

The goal is not to build the final system yet. The goal is to create a strong visual MVP that can be shown to my dad, potential users, and later portfolio reviewers.

## 3. What Phase 1 Should Prove

By the end of Phase 1, the project should prove:

* The business can have a professional digital presence.
* Customers can understand the company and product categories.
* The platform can display cleaning products clearly.
* A business customer can request a quote through a clean form.
* The admin side can visually show leads, product stats, and quote requests.
* The project has a serious architecture that can later connect to Supabase.

## 4. Core User Story

A business owner or purchasing manager visits the site, understands what the company offers, browses product categories, selects products of interest, and submits a quote request.

On the internal side, the business owner sees a dashboard-style preview of incoming leads and product interest.

This business is a B2B distributor called labmaremi for cleaning products. It is based in Quito, Ecuador and all its operations are within the city and nearby provinces within Ecuador. The cleaning products provided range from chemicals(detergent, degrease, alcohol), also they provide protection equipment like gloves or coats for kitchens, they provide toilet paper and industrial wipes.  

## 5. Tech Stack for Phase 1

Use:

* React
* Vite
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Router
* Spline for the Home Page 3D hero animation
* Mock data in TypeScript files
* GitHub
* Claude Code
* Graphify

Do not use Supabase yet in Phase 1. Supabase will come in Phase 2.

Do not use a real backend in Phase 1. The first goal is a professional frontend demo, product catalog, quote-flow simulation, admin dashboard preview, and visual business flow.

## 6. Main Pages - All the website must be built in spanish

### 1. Home Page

Purpose: Present the business professionally.

Sections:

* Hero section with clear value proposition.
* “Request a Quote” call-to-action.
* Product category preview.
* Why choose us section.
* Business customer types.
* Service area.
* Contact/WhatsApp call-to-action.
* Map with our offfices in google maps widget

## Home Page 3D Animation with Spline

The Home Page should include a professional 3D animation created with Spline to make the first impression more modern, visual, and portfolio-worthy.

The Spline animation should appear in the hero section of the Home Page and should support the business identity of LABMAREMI as a clean, reliable, and professional B2B distributor of cleaning and hygiene supplies.

### Purpose of the Spline Animation

The animation should not be random decoration. It should communicate the idea of cleanliness, organization, distribution, and professional supply service.

Possible visual concepts:

* Floating clean product containers.
* Abstract blue, white, and cyan shapes representing hygiene and freshness.
* Smooth liquid/bubble effects related to cleaning products.
* A clean 3D warehouse/distribution concept.
* Product boxes moving through a simple supply-chain flow.
* Minimal 3D elements around the LABMAREMI brand name.

### Design Requirements

The Spline scene should:

* Match the website color palette: blue, white, and cyan.
* Look clean, minimal, and professional.
* Avoid childish or exaggerated animations.
* Avoid distracting the user from the main call-to-action.
* Load only on the Home Page, not across the entire website.
* Work well on desktop.
* Have a fallback image or static visual for mobile or slow connections.
* Not block the user from reading the hero text.
* Not reduce the professional credibility of the website.

### Hero Section Layout

The Home Page hero should be structured like this:

Left side:

* LABMAREMI value proposition.
* Short explanation of the business.
* Main call-to-action: “Solicitar cotización”.
* Secondary call-to-action: “Ver catálogo”.

Right side:

* Spline 3D animation or fallback visual.

Example Spanish copy for the hero:

“Soluciones profesionales de limpieza e higiene para empresas en Quito y Ecuador.”

Supporting text:

“LABMAREMI distribuye productos de limpieza, desinfección, protección e higiene para restaurantes, oficinas, instituciones, hoteles y negocios que necesitan abastecimiento confiable.”

Buttons:

* “Solicitar cotización”
* “Ver catálogo”

### Technical Implementation

Use Spline as a React component.

Suggested package:

```bash
npm install @splinetool/react-spline
```

Suggested component structure:

```txt
src/
  components/
    hero/
      HeroSection.tsx
      SplineHeroScene.tsx
```

The Spline animation should be isolated in its own component so it can be removed, replaced, lazy-loaded, or optimized later without affecting the rest of the Home Page.

The component should be treated as a visual enhancement, not as required business logic.

### Performance Rules

Because 3D scenes can affect performance, Phase 1 should follow these rules:

* Do not use a heavy Spline scene.
* Do not use multiple Spline animations across the website.
* Use the Spline scene only in the Home Page hero.
* Keep the scene simple and optimized.
* Add a fallback visual for mobile or if the scene fails to load.
* Make sure the page remains usable even if the animation does not load.

### Phase 1 Acceptance Criteria for Spline

The Spline animation is complete when:

* It appears correctly in the Home Page hero section.
* It matches the LABMAREMI visual identity.
* It does not make the website feel slow or overloaded.
* It works without console errors.
* The hero text and call-to-action remain readable.
* The website still looks good if the animation is disabled or replaced by a static image.

### 2. Product Catalog Page

Purpose: Show the cleaning-supplies catalog in a professional way.

Features:

* Product category filters.
* Product cards.
* Search bar.
* Product image placeholder or real product image later.
* Product name.
* Category.
* Short description.
* Presentation/unit.
* “Add to quote” or “Request quote” button.

For Phase 1, products should come from a mock file such as:

`src/data/products.ts`

### 3. Product Detail Modal or Page

Purpose: Make the catalog feel more professional.

Information:

* Product name.
* Category.
* Description.
* Presentation.
* Recommended use.
* Quote button.

This does not need real pricing yet.

### 4. Quote Request Page

Purpose: Simulate the customer quote workflow.

Fields:

* Company name.
* Contact person.
* Phone number.
* Email.
* Business type.
* Location/sector.
* Products of interest.
* Message.

For Phase 1, the form does not need to save to a real database. It should show a polished success message after submission.

### 5. Contact Page

Purpose: Make it easy to contact the business.

Include:

* WhatsApp button.
* Phone number placeholder.
* Email placeholder.
* Service area.
* Contact form or contact CTA.

### 6. About us page

This page needs to have the roadmap of the business, they were founded 5 years ago. They are a family business, include photos of the coworkers and the owners.

### 7. Admin Dashboard Preview

Purpose: Visualize what the future internal system will look like.

This is a visual demo only. It should use mock data.

Sections:

* Total quote requests.
* New leads.
* Most requested categories.
* Recent quote requests.
* Lead status badges.
* Product interest summary.

Example lead statuses:

* New
* Contacted
* Interested
* Customer
* Rejected

### 8. Business Flow Visualizer

Purpose: Explain the platform workflow visually.

Show the flow:

Visitor → Product Catalog → Quote Request → Lead Dashboard → Follow-up → Customer

This can be a section on the home page or a separate page called:

`/platform`

This page is especially useful for portfolio presentation because it explains the business logic behind the project.

## 9. Mock Data Needed

Create mock files:

* `src/data/products.ts`
* `src/data/categories.ts`
* `src/data/leads.ts`
* `src/data/businessTypes.ts`

The mock data should look realistic but should not contain private customer information.

Example product categories:

* Disinfectants
* Degreasers
* Paper products
* Cleaning tools
* Trash bags
* Bathroom supplies
* Industrial cleaning
* Personal hygiene

Example business types:

* Restaurants
* Hotels
* Offices
* Schools
* Clinics
* Cleaning companies
* Local stores

## 10. Professional Quality Requirements

The demo must not look like a school project. It should look like a serious product.

Requirements:

* Responsive design for desktop and mobile.
* Clean typography.
* Consistent spacing.
* Professional color palette with blue, white and cyan. Keep this colors that represent something clean and professional.
* Reusable components.
* Good empty states.
* Good hover states.
* Clear buttons.
* No broken links.
* No random placeholder text like “Lorem ipsum” in final demo.
* No console errors.
* Clean folder structure.
* Strong README.
* Deployed demo link.

## 11. Out of Scope for Phase 1

Do not build these yet:

* Real database.
* Supabase connection.
* Authentication.
* Admin login.
* Real product management.
* Real quote persistence.
* Payments.
* Shopping cart.
* Invoices.
* Inventory tracking.
* Customer portal.
* AI lead scoring.
* Advanced maps or geointelligence.
* Route optimization.

A simple Google Maps office/location embed is allowed in Phase 1. What is out of scope is advanced map functionality such as lead mapping, delivery zones, geospatial analytics, route optimization, or AI-based location intelligence.

These belong to later phases.

## 12. Role of Graphify

Graphify will be used to help Claude Code understand the project structure.

Use Graphify after:

* The docs folder is created.
* The first version of the frontend structure exists.
* Major new features are added.

Graphify should help identify:

* Important files.
* Relationships between docs and components.
* Missing documentation.
* Code structure problems.
* Possible architecture improvements.

Graphify is not the main builder. Claude Code is the builder. Graphify is the project understanding layer.

## 13. Role of Claude Code

Claude Code will be used to:

* Generate the initial project structure.
* Create pages and components.
* Implement mock data.
* Improve UI consistency.
* Refactor messy code.
* Review the codebase.
* Create README documentation.
* Prepare the project for Phase 2.

Claude Code should work in small controlled steps, not one huge autonomous build.

## 14. Phase 1 Acceptance Criteria

Phase 1 is complete when:

* The app runs locally.
* The public website looks professional.
* The product catalog works with mock data.
* The quote form has validation or basic required fields.
* The quote form shows a success state.
* The admin preview dashboard displays mock lead data.
* The business flow visualizer explains the platform.
* The site is responsive.
* The project has a clean README.
* The project is committed to GitHub.
* The code is clean enough to continue into Supabase integration in Phase 2.

## 15. Portfolio Goal

This phase should already be presentable as:

“A professional frontend prototype for a B2B cleaning-supplies platform, designed for a real distribution business. The demo includes a public website, product catalog, quote request flow, admin dashboard preview, and business workflow visualization. Built with React, TypeScript, Tailwind, and shadcn/ui, with a planned Supabase backend for Phase 2.”

## 16. Phase 1 Summary

Phase 1 is not the final product.

Phase 1 is a professional visual demo that proves the platform idea, establishes the design system, creates the frontend architecture, and prepares the project for real backend integration later.
