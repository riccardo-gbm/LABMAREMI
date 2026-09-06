import { useEffect, useMemo, useState, type RefObject } from "react"
import { useSearchParams } from "react-router-dom"
import { matchesQuery } from "@/lib/catalog"
import type { CatalogCategory, CatalogProduct } from "@/lib/catalogData"

export const CATEGORY_PARAM = "categoria"
export const PAGE_PARAM = "pagina"
// Divisible by both grid widths (sm:grid-cols-2, lg:grid-cols-3), so a full
// page never leaves an orphan row.
export const PAGE_SIZE = 24

interface UseCatalogFiltersOptions {
  products: CatalogProduct[]
  categories: CatalogCategory[]
  resultsRef?: RefObject<HTMLElement | null>
}

export function useCatalogFilters({
  products,
  categories,
  resultsRef,
}: UseCatalogFiltersOptions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState("")

  const rawCategories = searchParams.get(CATEGORY_PARAM)
  const activeCategories = useMemo(() => {
    if (!rawCategories) return []
    const slugs = new Set(rawCategories.split(",").map((s) => s.trim()).filter(Boolean))
    const result: string[] = []
    for (const c of categories) {
      if (slugs.has(c.id)) result.push(c.id)
    }
    return result
  }, [rawCategories, categories])

  const activeCategorySet = useMemo(() => new Set(activeCategories), [activeCategories])

  // Count products per category matching current search query
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      if (matchesQuery(p, query)) {
        counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1
      }
    }
    return counts
  }, [products, query])

  // Client-side: 138 products is one small fetch, and matchesQuery is
  // accent-insensitive in a way Postgres ilike is not without `unaccent`.
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (activeCategorySet.size === 0 || activeCategorySet.has(product.categoryId)) &&
          matchesQuery(product, query)
      ),
    [products, activeCategorySet, query]
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

  const toggleCategory = (categoryId: string) => {
    setSearchParams(
      (params) => {
        const raw = params.get(CATEGORY_PARAM)
        const current = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []
        let next: string[]
        if (current.includes(categoryId)) {
          next = current.filter((id) => id !== categoryId)
        } else {
          next = [...current, categoryId]
        }

        if (next.length > 0) {
          params.set(CATEGORY_PARAM, next.join(","))
        } else {
          params.delete(CATEGORY_PARAM)
        }
        params.delete(PAGE_PARAM)
        return params
      },
      { replace: true }
    )
  }

  const selectSingleCategory = (categoryId: string) => {
    setSearchParams(
      (params) => {
        const raw = params.get(CATEGORY_PARAM)
        const current = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : []
        if (current.length === 1 && current[0] === categoryId) {
          params.delete(CATEGORY_PARAM)
        } else {
          params.set(CATEGORY_PARAM, categoryId)
        }
        params.delete(PAGE_PARAM)
        return params
      },
      { replace: true }
    )
  }

  const clearCategories = () => {
    setSearchParams(
      (params) => {
        params.delete(CATEGORY_PARAM)
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
    resultsRef?.current?.scrollIntoView({ block: "start" })
  }

  const clearFilters = () => {
    setQuery("")
    clearCategories()
  }

  const hasActiveFilters = Boolean(activeCategories.length > 0 || query.trim())

  return {
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
  }
}
