import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AnimatePresence, m } from "framer-motion"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Pagination } from "@/components/ui/pagination"
import { Reveal } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/ui/query-error"
import { CatalogSearch, CategorySidebar } from "@/components/catalog/CatalogFilters"
import { ProductCard } from "@/components/catalog/ProductCard"
import { fetchCatalog, type CatalogCategory, type CatalogProduct } from "@/lib/catalogData"
import { useAsync } from "@/hooks/useAsync"
import { matchesQuery } from "@/lib/catalog"

const CATEGORY_PARAM = "categoria"
const PAGE_PARAM = "pagina"
// Divisible by both grid widths (sm:grid-cols-2, lg:grid-cols-3), so a full
// page never leaves an orphan row.
const PAGE_SIZE = 24

// Stable references for the empty state, so the filter useMemo below only
// recomputes when the data actually changes — not on every render (a fresh
// `[]` each render would invalidate the memo).
const EMPTY_CATEGORIES: CatalogCategory[] = []
const EMPTY_PRODUCTS: CatalogProduct[] = []

// Static — no props — so it's built once, not rebuilt on every render.
const HEADER = (
  <PageHeader
    title="Catálogo de productos"
    description="Explore nuestro catálogo de limpieza, desinfección, protección e higiene. Seleccione una categoría o busque un producto específico."
  />
)

/** Search bar, category column and card grid placeholders, matching the
 *  loaded layout so nothing jumps when the data lands. */
function CatalogSkeleton() {
  return (
    <Section className="pt-8 md:pt-10">
      <Card className="p-4 md:p-5">
        <Skeleton className="h-11 w-full" />
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-32 rounded-full lg:h-10 lg:w-full lg:rounded-lg"
            />
          ))}
        </div>

        <div>
          <Skeleton className="mb-5 h-4 w-44" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="flex h-full w-full flex-col overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="mt-4 h-6 w-3/4" />
                  <Skeleton className="mt-3 h-14 w-full" />
                  <div className="mt-auto pt-5">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Skeleton className="h-9 w-72" />
          </div>
        </div>
      </div>
    </Section>
  )
}

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState("")
  const { data, loading, error, retry } = useAsync(fetchCatalog)
  const resultsRef = useRef<HTMLDivElement>(null)

  const categories = data?.categories ?? EMPTY_CATEGORIES
  const products = data?.products ?? EMPTY_PRODUCTS

  const rawCategory = searchParams.get(CATEGORY_PARAM)
  // Ignore unknown category ids in the URL instead of showing zero results.
  const activeCategory = categories.some((c) => c.id === rawCategory)
    ? rawCategory
    : null

  // Client-side: 138 products is one small fetch, and matchesQuery is
  // accent-insensitive in a way Postgres ilike is not without `unaccent`.
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (!activeCategory || product.categoryId === activeCategory) &&
          matchesQuery(product, query)
      ),
    [products, activeCategory, query]
  )

  // Page is derived from the URL, never mirrored into state. Clamping here
  // rather than rewriting the URL means a junk or out-of-range `?pagina=`
  // still renders sane results, with no setSearchParams → re-render loop.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(searchParams.get(PAGE_PARAM) ?? "1", 10)
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1
  const pageStart = (page - 1) * PAGE_SIZE
  const visible = useMemo(
    () => filtered.slice(pageStart, pageStart + PAGE_SIZE),
    [filtered, pageStart]
  )

  // Quietly prefetch product images for the next page into browser cache
  useEffect(() => {
    if (page < totalPages) {
      const nextPageStart = page * PAGE_SIZE
      const nextPageProducts = filtered.slice(nextPageStart, nextPageStart + PAGE_SIZE)
      for (const product of nextPageProducts) {
        if (product.imageUrl) {
          const img = new Image()
          img.src = product.imageUrl
        }
      }
    }
  }, [filtered, page, totalPages])

  const selectCategory = (categoryId: string | null) => {
    setSearchParams(
      (params) => {
        if (categoryId) {
          params.set(CATEGORY_PARAM, categoryId)
        } else {
          params.delete(CATEGORY_PARAM)
        }
        // A different result set invalidates the page number.
        params.delete(PAGE_PARAM)
        return params
      },
      { replace: true }
    )
  }

  const updateQuery = (value: string) => {
    setQuery(value)
    // Same reason as above — but only touch the URL when there is a page to
    // clear, so typing doesn't push a router update per keystroke.
    if (searchParams.has(PAGE_PARAM)) {
      setSearchParams(
        (params) => {
          params.delete(PAGE_PARAM)
          return params
        },
        { replace: true }
      )
    }
  }

  const goToPage = (next: number) => {
    setSearchParams(
      (params) => {
        // Page 1 is the default — keep it out of the URL.
        if (next <= 1) {
          params.delete(PAGE_PARAM)
        } else {
          params.set(PAGE_PARAM, String(next))
        }
        return params
      },
      { replace: true }
    )
    // Otherwise a click on the control at the bottom leaves the visitor
    // staring at the last row of a brand-new page. Deliberately instant, not
    // smooth: a page change swaps all 24 cards at once, and animating the
    // scroll would run a per-frame scroll against framer-motion's layout
    // projection for the same 48 entering/exiting nodes. Jumping is also what
    // paginated lists conventionally do.
    resultsRef.current?.scrollIntoView({ block: "start" })
  }

  const clearFilters = () => {
    setQuery("")
    selectCategory(null)
  }

  const hasActiveFilters = Boolean(activeCategory || query.trim())

  if (loading) {
    return (
      <>
        {HEADER}
        <CatalogSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        {HEADER}
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
      {HEADER}

      <Section className="pt-8 md:pt-10">
        <Reveal>
          <CatalogSearch value={query} onChange={updateQuery} />
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
          <CategorySidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelect={selectCategory}
          />

          {/* Results — the grid + its AnimatePresence stay mounted so cards can
              exit-animate as the list empties out; the empty state is a sibling,
              not an alternative branch that would tear the boundary down.
              scroll-mt-24 keeps the first row clear of the sticky Header when
              goToPage scrolls this back into view. */}
          <div ref={resultsRef} className="scroll-mt-24">
            <div className="mb-5 flex items-center justify-between gap-4 border-b pb-4">
              <p
                className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <m.span
                    key={`${page}-${filtered.length}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {filtered.length > 0
                      ? `${visible.length} de ${filtered.length} productos`
                      : `0 de ${products.length} productos`}
                  </m.span>
                </AnimatePresence>
              </p>

              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              ) : null}
            </div>

          {/* Three across only from xl. At lg the sidebar leaves ~185px per
              card, under the ~195px the CTA needs before its nowrap label
              starts clipping. */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex"
                >
                  <ProductCard product={product} priority={idx < 6} />
                </m.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              className="mt-10"
            />
          ) : null}

          {filtered.length === 0 ? (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <SearchX className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">
              Producto no encontrado
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Escríbanos y le cotizamos el producto que necesita.
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Limpiar búsqueda y filtros
              </Button>
            ) : null}
          </m.div>
          ) : null}
          </div>
        </div>
      </Section>
    </>
  )
}
