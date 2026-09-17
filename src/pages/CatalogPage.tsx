import { useRef } from "react"
import { useSearchParams } from "react-router-dom"

import { PageHeader } from "@/components/ui/page-header"
import { Pagination } from "@/components/ui/pagination"
import { Section } from "@/components/ui/section"
import { QueryError } from "@/components/ui/query-error"
import { CatalogSearch, CategorySidebar } from "@/components/catalog/CatalogFilters"
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton"
import { CatalogResultsBar } from "@/components/catalog/CatalogResultsBar"
import { CatalogProductGrid } from "@/components/catalog/CatalogProductGrid"
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState"
import { fetchCatalog, type CatalogCategory, type CatalogProduct } from "@/lib/catalogData"
import { useAsync } from "@/hooks/useAsync"
import { useCatalogFilters, CATEGORY_PARAM } from "@/hooks/useCatalogFilters"
import { SeoHead } from "@/components/common/SeoHead"
import { JsonLd } from "@/components/common/JsonLd"
import { getBreadcrumbSchema } from "@/lib/schemaData"

// Stable references for the empty state, so the filter useMemo below only
// recomputes when the data actually changes — not on every render (a fresh
// `[]` each render would invalidate the memo).
const EMPTY_CATEGORIES: CatalogCategory[] = []
const EMPTY_PRODUCTS: CatalogProduct[] = []

interface CatalogSeoData {
  title: string
  description: string
  canonicalUrl: string
  breadcrumbs: Array<{ name: string; url: string }>
  headerTitle: string
  headerDesc: string
}

/**
 * @param singleCategory  the resolved category, or null while the catalog is
 *   still loading, on error, or when the filter isn't exactly one category.
 * @param rawCategorySlug the untouched `?categoria=` value, used for the
 *   canonical only.
 *
 * WHY THE RAW SLUG IS NEEDED. `singleCategory` is resolved by intersecting the
 * URL param against the loaded category list, so it is null until Supabase
 * answers — even for a perfectly valid slug. Deriving the canonical from it
 * alone made `/catalogo?categoria=desinfectantes` announce
 * `canonical=/catalogo` during loading, and permanently on the error branch.
 * All 11 category URLs are in the sitemap at priority 0.85, so that told Google
 * the pages we submit are duplicates of one another.
 *
 * An unknown slug is the cheaper mistake to make here: those URLs aren't in the
 * sitemap, and once the fetch lands the resolved path corrects them back to
 * `/catalogo`.
 */
function getCatalogSeo(
  singleCategory?: CatalogCategory | null,
  rawCategorySlug?: string | null,
): CatalogSeoData {
  const title = singleCategory
    ? `${singleCategory.name} e Higiene Industrial en Quito | LABMAREMI`
    : "Catálogo de Productos de Limpieza e Higiene Industrial | LABMAREMI"

  const description = singleCategory
    ? singleCategory.description ||
      `Distribuidor de ${singleCategory.name} para empresas en Quito y Pichincha. Cotización directa y entregas inmediatas.`
    : "Explore nuestro catálogo completo de productos de limpieza, desinfección, protección e higiene industrial para empresas en Quito, Ecuador."

  const canonicalSlug = singleCategory?.id ?? rawCategorySlug ?? null
  const canonicalUrl = canonicalSlug
    ? `https://labmaremi.com/catalogo?categoria=${encodeURIComponent(canonicalSlug)}`
    : "https://labmaremi.com/catalogo"

  const breadcrumbs = [
    { name: "Inicio", url: "/" },
    { name: "Catálogo", url: "/catalogo" },
    ...(singleCategory ? [{ name: singleCategory.name, url: `/catalogo?categoria=${singleCategory.id}` }] : []),
  ]

  const headerTitle = singleCategory ? singleCategory.name : "Catálogo de productos"
  const headerDesc = singleCategory
    ? (singleCategory.description || `Explore nuestra línea de ${singleCategory.name} al por mayor para empresas en Quito y Pichincha.`)
    : "Explore nuestro catálogo completo de limpieza, desinfección, protección e higiene industrial. Entregas en Quito y provincias cercanas."

  return { title, description, canonicalUrl, breadcrumbs, headerTitle, headerDesc }
}

export default function CatalogPage() {
  const { data, loading, error, retry } = useAsync(fetchCatalog)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()

  const categories = data?.categories ?? EMPTY_CATEGORIES
  const products = data?.products ?? EMPTY_PRODUCTS

  const {
    query,
    updateQuery,
    activeCategories,
    toggleCategory,
    selectSingleCategory,
    clearCategories,
    clearFilters,
    hasActiveFilters,
    categoryCounts,
    filtered,
    visible,
    page,
    totalPages,
    goToPage,
  } = useCatalogFilters({
    products,
    categories,
    resultsRef,
  })

  const singleCategory =
    activeCategories.length === 1 ? categories.find((c) => c.id === activeCategories[0]) : null

  // Only a lone slug earns its own canonical; a multi-select like `?categoria=a,b`
  // is a filter view, not a page, and belongs to /catalogo.
  const rawCategoryParam = searchParams.get(CATEGORY_PARAM)
  const rawSingleCategory =
    rawCategoryParam && !rawCategoryParam.includes(",") ? rawCategoryParam : null

  const seo = getCatalogSeo(singleCategory, rawSingleCategory)
  const headerComponent = <PageHeader title={seo.headerTitle} description={seo.headerDesc} />

  if (loading) {
    return (
      <>
        <SeoHead title={seo.title} description={seo.description} canonicalUrl={seo.canonicalUrl} />
        {headerComponent}
        <CatalogSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <SeoHead title={seo.title} description={seo.description} canonicalUrl={seo.canonicalUrl} />
        {headerComponent}
        <Section className="pt-8 md:pt-10">
          <QueryError
            onRetry={retry}
            title="No se pudo cargar el catálogo."
            description="Verifique su conexión e intente nuevamente."
          />
        </Section>
      </>
    )
  }

  return (
    <>
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonicalUrl={seo.canonicalUrl}
        ogImage={singleCategory?.imageUrl ? `https://labmaremi.com${singleCategory.imageUrl}` : undefined}
      />
      <JsonLd data={getBreadcrumbSchema(seo.breadcrumbs)} id="catalog-breadcrumb-schema" />
      {headerComponent}

      <Section className="pt-8 md:pt-10">
        <CatalogSearch value={query} onChange={updateQuery} />

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
          <CategorySidebar
            categories={categories}
            activeCategories={activeCategories}
            onSelectCategory={selectSingleCategory}
            onClearCategories={clearCategories}
          />

          {/* Results — the grid + its AnimatePresence stay mounted so cards can
              exit-animate as the list empties out; the empty state is a sibling,
              not an alternative branch that would tear the boundary down.
              scroll-mt-24 keeps the first row clear of the sticky Header when
              goToPage scrolls this back into view. */}
          <div ref={resultsRef} className="scroll-mt-24">
            <CatalogResultsBar
              categories={categories}
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={clearCategories}
              categoryCounts={categoryCounts}
              filteredCount={filtered.length}
              totalCount={products.length}
              visibleCount={visible.length}
              page={page}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />

            <CatalogProductGrid products={visible} />

            {filtered.length > 0 ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={goToPage}
                className="mt-10"
              />
            ) : null}

            {filtered.length === 0 ? (
              <CatalogEmptyState
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            ) : null}
          </div>
        </div>
      </Section>
    </>
  )
}
