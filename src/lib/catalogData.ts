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

/** Categories (in sort_order) plus every active product (by name). */
export async function fetchCatalog(): Promise<Catalog> {
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

  const categories: CatalogCategory[] = categoriesData.map((row: any) => ({
    id: row.slug,
    uuid: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
  }))

  // Codes are per-category positions, so they must be computed over the whole
  // catalog ordered by category — not the flat name order the query returns.
  const bySortOrder = new Map(categories.map((c, i) => [c.id, i]))
  const rows = productsData as RawProductRow[]
  const ordered = [...rows].sort((a, b) => {
    const ai = bySortOrder.get(a.categories?.slug ?? "") ?? Number.MAX_SAFE_INTEGER
    const bi = bySortOrder.get(b.categories?.slug ?? "") ?? Number.MAX_SAFE_INTEGER
    return ai - bi || a.name.localeCompare(b.name, "es")
  })

  return { categories, products: toProducts(ordered) }
}

export interface ProductDetail {
  product: CatalogProduct
  related: CatalogProduct[]
}

/**
 * One product by slug, plus its category siblings — needed both for the
 * "productos relacionados" row and to derive the product's own spec code.
 *
 * Returns null when the slug genuinely doesn't exist. A network/RLS failure
 * throws instead, so the caller can tell "no encontrado" from "no cargó".
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const headers = getHeaders()
  const baseUrl = import.meta.env.VITE_SUPABASE_URL

  const res = await fetch(`${baseUrl}/rest/v1/products?select=category_id&slug=eq.${slug}&is_active=eq.true&limit=1`, { headers })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  
  const data = await res.json()
  if (!data || data.length === 0) return null
  
  const categoryId = data[0].category_id

  const siblingsRes = await fetch(`${baseUrl}/rest/v1/products?select=id,slug,name,description,presentation,recommended_use,image_url,categories(slug,name)&category_id=eq.${categoryId}&is_active=eq.true&order=name.asc`, { headers })
  if (!siblingsRes.ok) throw new Error(`HTTP error ${siblingsRes.status}`)
  
  const siblingsData = await siblingsRes.json()

  const all = toProducts(siblingsData as RawProductRow[])
  const product = all.find((p) => p.slug === slug)
  if (!product) return null

  return { product, related: all.filter((p) => p.id !== product.id).slice(0, 3) }
}

export async function fetchBusinessTypes(): Promise<CatalogBusinessType[]> {
  const headers = getHeaders()
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  
  const res = await fetch(`${baseUrl}/rest/v1/business_types?select=id,name,description&order=name.asc`, { headers })
  if (!res.ok) throw new Error(`HTTP error ${res.status}`)
  
  const data = await res.json()
  return data ?? []
}
