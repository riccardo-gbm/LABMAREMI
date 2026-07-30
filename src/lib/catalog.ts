/**
 * Pure catalog helpers — no data source.
 *
 * Product/category lookups used to live here over the mock arrays; they now
 * come from src/lib/catalogData.ts (Supabase). What remains is the display
 * taxonomy and the search predicate, both of which are pure functions of
 * their arguments.
 */

/**
 * Explicit three-letter spec codes per category. `slug.slice(0, 3)` collides
 * (desinfectantes / desengrasantes → "DES"), so codes are assigned by hand.
 * EPP is the standard Spanish acronym for personal protective equipment.
 *
 * Keyed by the DB `categories.slug`.
 */
const categoryCodes: Record<string, string> = {
  desinfectantes: "DSF",
  desengrasantes: "DGR",
  papel: "PAP",
  "materiales-limpieza": "HER",
  "fundas-basura": "FND",
  "insumos-bano": "BAN",
  "limpieza-industrial": "IND",
  "higiene-personal": "HIG",
  "equipos-proteccion": "EPP",
}

export function getCategoryCode(categorySlug: string): string {
  return categoryCodes[categorySlug] ?? categorySlug.slice(0, 3).toUpperCase()
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

interface Searchable {
  name: string
  description: string
}

export function matchesQuery(product: Searchable, query: string): boolean {
  const normalizedQuery = normalizeText(query.trim())
  if (!normalizedQuery) return true
  const haystack = normalizeText(`${product.name} ${product.description}`)
  return normalizedQuery
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}
