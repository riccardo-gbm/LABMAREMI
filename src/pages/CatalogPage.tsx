import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Search, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Reveal } from "@/components/ui/reveal"
import { Section } from "@/components/ui/section"
import { ProductCard } from "@/components/catalog/ProductCard"
import { categories } from "@/data/categories"
import { products } from "@/data/products"
import { getCategoryCode, matchesQuery } from "@/lib/catalog"
import { cn } from "@/lib/utils"

const CATEGORY_PARAM = "categoria"

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState("")

  const rawCategory = searchParams.get(CATEGORY_PARAM)
  // Ignore unknown category ids in the URL instead of showing zero results.
  const activeCategory = categories.some((c) => c.id === rawCategory)
    ? rawCategory
    : null

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (!activeCategory || product.categoryId === activeCategory) &&
          matchesQuery(product, query)
      ),
    [activeCategory, query]
  )

  const selectCategory = (categoryId: string | null) => {
    setSearchParams(
      (params) => {
        if (categoryId) {
          params.set(CATEGORY_PARAM, categoryId)
        } else {
          params.delete(CATEGORY_PARAM)
        }
        return params
      },
      { replace: true }
    )
  }

  const clearFilters = () => {
    setQuery("")
    selectCategory(null)
  }

  const hasActiveFilters = Boolean(activeCategory || query.trim())

  return (
    <>
      <PageHeader
        title="Catálogo de productos"
        description="Explore nuestro catálogo de limpieza, desinfección, protección e higiene. Seleccione una categoría o busque un producto específico."
      />

      <Section className="pt-8 md:pt-10">
        <Reveal>
        <Card className="space-y-5 p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_1fr_auto] lg:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o descripción…"
                aria-label="Buscar productos"
                className="h-11 pl-9"
              />
            </div>

            <p
              className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
              aria-live="polite"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={filtered.length}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="inline-block"
                >
                  {filtered.length} de {products.length} productos
                </motion.span>
              </AnimatePresence>
            </p>

            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null}
          </div>

          <LayoutGroup>
          <div
            className="flex flex-wrap gap-2 border-t pt-4"
            role="group"
            aria-label="Filtrar por categoría"
          >
            <button
              type="button"
              onClick={() => selectCategory(null)}
              aria-pressed={!activeCategory}
              className={cn(
                "relative overflow-hidden rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !activeCategory
                  ? "border-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:border-ring/60 hover:text-foreground"
              )}
            >
              {!activeCategory ? (
                <motion.span
                  layoutId="catalog-filter-active"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative z-10">Todas</span>
            </button>
            {categories.map((category) => {
              const isActive = category.id === activeCategory
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(isActive ? null : category.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-primary text-primary-foreground"
                      : "border-input bg-background text-muted-foreground hover:border-ring/60 hover:text-foreground"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="catalog-filter-active"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-10">{category.name}</span>
                  <span
                    className={cn(
                      "relative z-10 font-mono text-[10px] tracking-widest",
                      isActive
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground/70"
                    )}
                  >
                    {getCategoryCode(category.id)}
                  </span>
                </button>
              )
            })}
          </div>
          </LayoutGroup>
        </Card>
        </Reveal>

        {/* Results */}
        {filtered.length > 0 ? (
          <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <SearchX className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">
              No encontramos productos con esos criterios
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Pruebe con otra palabra o revise la categoría seleccionada. Si no
              encuentra lo que necesita, escríbanos y le ayudamos a ubicarlo.
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" className="mt-6" onClick={clearFilters}>
                Limpiar búsqueda y filtros
              </Button>
            ) : null}
          </motion.div>
        )}
      </Section>
    </>
  )
}
