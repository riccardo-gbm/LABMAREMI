import { useRef } from "react"

import { PageHeader } from "@/components/ui/page-header"
import { Pagination } from "@/components/ui/pagination"
import { Reveal } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { QueryError } from "@/components/ui/query-error"
import { CatalogSearch, CategorySidebar } from "@/components/catalog/CatalogFilters"
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton"
import { CatalogResultsBar } from "@/components/catalog/CatalogResultsBar"
import { CatalogProductGrid } from "@/components/catalog/CatalogProductGrid"
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState"
import { fetchCatalog, type CatalogCategory, type CatalogProduct } from "@/lib/catalogData"
import { useAsync } from "@/hooks/useAsync"
import { useCatalogFilters } from "@/hooks/useCatalogFilters"
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

function getCatalogSeo(singleCategory?: CatalogCategory | null): CatalogSeoData {
  const title = singleCategory
    ? `${singleCategory.name} e Higiene Industrial en Quito | LABMAREMI`
    : "Catálogo de Productos de Limpieza e Higiene Industrial | LABMAREMI"

  const description = singleCategory
    ? singleCategory.description ||
      `Distribuidor de ${singleCategory.name} para empresas en Quito y Pichincha. Cotización directa y entregas inmediatas.`
    : "Explore nuestro catálogo completo de productos de limpieza, desinfección, protección e higiene industrial para empresas en Quito, Ecuador."

  const canonicalUrl = singleCategory
    ? `https://labmaremi.com/catalogo?categoria=${encodeURIComponent(singleCategory.id)}`
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

  const seo = getCatalogSeo(singleCategory)
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
        <Reveal>
          <CatalogSearch value={query} onChange={updateQuery} />
        </Reveal>

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
