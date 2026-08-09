import { getCategoryCode } from "@/lib/catalog"

/**
 * Live catalog data layer — the public-page counterpart to adminDashboard.ts.
 *
 * NOTE on ids: `CatalogCategory.id` is the DB **slug**, not the uuid. The icon
 * map (lib/icons.ts), the spec codes (lib/catalog.ts) and the `?categoria=`
 * URL param are all keyed by that string, so mapping slug → id keeps every
 * one of them working unchanged. The uuid is kept as `uuid` for joins.
 */

export interface CatalogCategory {
  /** DB slug — e.g. "desinfectantes". Keys icons, codes, and the URL param. */
  id: string
  uuid: string
  name: string
  description: string
  imageUrl?: string
  imageAlt?: string
}

export interface CatalogProduct {
  /** DB uuid — the canonical key, what quote_request_items will reference. */
  id: string
  /** URL key and image filename — e.g. "lidex-alcohol-gel". */
  slug: string
  name: string
  /** Category slug, to match CatalogCategory.id. */
  categoryId: string
  categoryName: string
  description: string
  presentation: string
  recommendedUse: string
  imageUrl?: string
  /** Datasheet code, e.g. "DSF-03". Position is assigned at fetch time. */
  code: string
}

export interface CatalogBusinessType {
  id: string
  name: string
  description: string
}

interface RawProductRow {
  id: string
  slug: string | null
  name: string
  description: string
  presentation: string
  recommended_use: string
  image_url: string | null
  categories: { slug: string; name: string } | null
}

/**
 * Assigns each product its datasheet code from its position within its own
 * category (products arrive ordered by name, so codes are stable between
 * loads). Done once here rather than per-render, which is what the old
 * mock-backed getProductCode did by rescanning the full product array.
 */
function toProducts(rows: RawProductRow[]): CatalogProduct[] {
  const positions = new Map<string, number>()
  return rows.map((row) => {
    const categoryId = row.categories?.slug ?? ""
    const position = (positions.get(categoryId) ?? 0) + 1
    positions.set(categoryId, position)
    return {
      id: row.id,
      slug: row.slug ?? row.id,
      name: row.name,
      categoryId,
      categoryName: row.categories?.name ?? "",
      description: row.description,
      presentation: row.presentation,
      recommendedUse: row.recommended_use,
      imageUrl: row.image_url ?? undefined,
      code: `${getCategoryCode(categoryId)}-${String(position).padStart(2, "0")}`,
    }
  })
}

export interface Catalog {
  categories: CatalogCategory[]
  products: CatalogProduct[]
}

const getHeaders = () => ({
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
})

interface RawCategoryRow {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  image_alt: string | null
}

function toCategories(rows: RawCategoryRow[]): CatalogCategory[] {
  return rows.map((row) => ({
    id: row.slug,
    uuid: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? `/cat-${row.slug}.webp`,
    imageAlt: row.image_alt ?? row.name,
  }))
}

/**
 * Categories only (in sort_order). The home page needs nothing else — fetching
 * the full catalog there put ~138 product rows plus a locale sort on the
 * landing route's critical path only to be thrown away.
 */
export async function fetchCategories(): Promise<CatalogCategory[]> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL

  const res = await fetch(
    `${baseUrl}/rest/v1/categories?select=id,slug,name,description,image_url,image_alt&order=sort_order.asc`,
    { headers: getHeaders() },
  )
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)

  return toCategories(await res.json())
}

let catalogCache: { data: Catalog; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Categories (in sort_order) plus every active product (by name). Serves from in-memory cache when fresh. */
export async function fetchCatalog(forceRefresh = false): Promise<Catalog> {
  if (!forceRefresh && catalogCache && Date.now() - catalogCache.timestamp < CACHE_TTL_MS) {
    return catalogCache.data
  }

  const headers = getHeaders()
  const baseUrl = import.meta.env.VITE_SUPABASE_URL

  const [categoriesRes, productsRes] = await Promise.all([
    fetch(`${baseUrl}/rest/v1/categories?select=id,slug,name,description,image_url,image_alt&order=sort_order.asc`, { headers }),
    fetch(`${baseUrl}/rest/v1/products?select=id,slug,name,description,presentation,recommended_use,image_url,categories(slug,name)&is_active=eq.true&order=name.asc`, { headers })
  ])

  if (!categoriesRes.ok) throw new Error(`HTTP error ${categoriesRes.status}`)
  if (!productsRes.ok) throw new Error(`HTTP error ${productsRes.status}`)

  const [categoriesData, productsData] = await Promise.all([
    categoriesRes.json(),
    productsRes.json()
  ])

  const categories = toCategories(categoriesData as RawCategoryRow[])

  // Codes are per-category positions, so they must be computed over the whole
  // catalog ordered by category — not the flat name order the query returns.
  const bySortOrder = new Map(categories.map((c, i) => [c.id, i]))
  const rows = productsData as RawProductRow[]
  const ordered = [...rows].sort((a, b) => {
    const ai = bySortOrder.get(a.categories?.slug ?? "") ?? Number.MAX_SAFE_INTEGER
    const bi = bySortOrder.get(b.categories?.slug ?? "") ?? Number.MAX_SAFE_INTEGER
    return ai - bi || a.name.localeCompare(b.name, "es")
  })

  const catalog = { categories, products: toProducts(ordered) }
  catalogCache = { data: catalog, timestamp: Date.now() }
  return catalog
}

export interface ProductDetail {
  product: CatalogProduct
  related: CatalogProduct[]
}

/**
 * Exactly what scripts/slugify.mjs can emit: lowercase alphanumerics in
 * hyphen-joined runs, never leading, trailing or doubled (the generator
 * collapses every other character run to a single "-" and trims the ends).
 *
 * Defense in depth only — the query below is already parameter-encoded. This
 * exists so a hostile /producto/:slug never reaches the network at all.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * One product by slug, plus its category siblings — needed both for the
 * "productos relacionados" row and to derive the product's own spec code.
 *
 * Serves instantly (<1ms) when catalogCache is fresh, or performs a single
 * parallel fetch (~390ms) populating catalogCache site-wide on cold load.
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  if (!SLUG_PATTERN.test(slug)) return null

  const catalog = await fetchCatalog()
  const product = catalog.products.find((p) => p.slug === slug)
  if (!product) return null

  const related = catalog.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3)

  return { product, related }
}

/** Pre-warms catalog data into memory on hover/focus over product links. */
export function prefetchProductDetail(slug: string): void {
  if (SLUG_PATTERN.test(slug)) {
    fetchCatalog().catch(() => {})
  }
}

export async function fetchBusinessTypes(): Promise<CatalogBusinessType[]> {
  const headers = getHeaders()
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  
  const res = await fetch(`${baseUrl}/rest/v1/business_types?select=id,name,description&order=name.asc`, { headers })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  
  const data = await res.json()
  return data ?? []
}
