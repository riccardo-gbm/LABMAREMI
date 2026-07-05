import { categories } from "@/data/categories"
import { products } from "@/data/products"
import type { Category, Product } from "@/types"

/**
 * Explicit three-letter spec codes per category. `id.slice(0, 3)` collides
 * (desinfectantes / desengrasantes → "DES"), so codes are assigned by hand.
 * EPP is the standard Spanish acronym for personal protective equipment.
 */
const categoryCodes: Record<string, string> = {
  desinfectantes: "DSF",
  desengrasantes: "DGR",
  papel: "PAP",
  "herramientas-limpieza": "HER",
  "fundas-basura": "FND",
  "insumos-bano": "BAN",
  "limpieza-industrial": "IND",
  "higiene-personal": "HIG",
  "equipos-proteccion": "EPP",
}

export function getCategoryCode(categoryId: string): string {
  return categoryCodes[categoryId] ?? categoryId.slice(0, 3).toUpperCase()
}

/**
 * Stable datasheet-style code for a product (e.g. "DSF-03"), derived from
 * its category code and position within the category. Display-only — ids
 * remain the canonical keys.
 */
export function getProductCode(product: Product): string {
  const siblings = products.filter((p) => p.categoryId === product.categoryId)
  const index = siblings.findIndex((p) => p.id === product.id)
  const position = String(index + 1).padStart(2, "0")
  return `${getCategoryCode(product.categoryId)}-${position}`
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id)
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, limit)
}

/**
 * Lowercases and strips diacritics so client-side search is accent-insensitive
 * ("desinfeccion" matches "desinfección").
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

export function matchesQuery(product: Product, query: string): boolean {
  const normalizedQuery = normalizeText(query.trim())
  if (!normalizedQuery) return true
  const haystack = normalizeText(`${product.name} ${product.description}`)
  return normalizedQuery
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}
