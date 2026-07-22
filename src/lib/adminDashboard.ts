import { supabase } from "@/lib/supabase"
import type { QuoteStatus } from "@/types/database"

/**
 * Live admin-dashboard data layer. Fetches quote requests (with their business
 * type and requested products) from Supabase and derives the dashboard's
 * counts and rankings — the same pure-derivation model the Phase 1 mock
 * dashboard used, now over real rows.
 */

export const QUOTE_STATUSES = [
  "nuevo",
  "contactado",
  "interesado",
  "cliente",
  "rechazado",
] as const

/** DB enum is lowercase; the UI shows capitalized Spanish labels. */
export const STATUS_LABEL: Record<QuoteStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  interesado: "Interesado",
  cliente: "Cliente",
  rechazado: "Rechazado",
}

export interface DashboardLeadProduct {
  id: string
  name: string
  categorySlug: string | null
  categoryName: string | null
}

export interface DashboardLead {
  id: string
  companyName: string
  contactPerson: string
  businessTypeName: string | null
  location: string
  createdAt: string
  status: QuoteStatus
  products: DashboardLeadProduct[]
}

/**
 * Shape of the nested select below. Hand-typed because the hand-written
 * Database type carries no relationship metadata for supabase-js to infer
 * embedded selects from.
 */
interface RawLeadRow {
  id: string
  company_name: string
  contact_person: string
  location: string
  status: QuoteStatus
  created_at: string
  business_types: { name: string } | null
  quote_request_items: {
    product_id: string
    products: {
      id: string
      name: string
      categories: { name: string; slug: string } | null
    } | null
  }[]
}

const LEAD_SELECT = `
  id, company_name, contact_person, location, status, created_at,
  business_types ( name ),
  quote_request_items ( product_id, products ( id, name, categories ( name, slug ) ) )
` as const

export async function fetchLeads(): Promise<DashboardLead[]> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as unknown as RawLeadRow[]
  return rows.map((row) => ({
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    businessTypeName: row.business_types?.name ?? null,
    location: row.location,
    createdAt: row.created_at,
    status: row.status,
    products: (row.quote_request_items ?? [])
      .map((item) =>
        item.products
          ? {
              id: item.products.id,
              name: item.products.name,
              categorySlug: item.products.categories?.slug ?? null,
              categoryName: item.products.categories?.name ?? null,
            }
          : null,
      )
      .filter((p): p is DashboardLeadProduct => p !== null),
  }))
}

export async function updateLeadStatus(
  id: string,
  status: QuoteStatus,
): Promise<void> {
  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", id)

  if (error) throw error
}

// ---------------------------------------------------------------------------
// Pure derivations over the fetched leads
// ---------------------------------------------------------------------------

export function deriveStatusCounts(
  leads: DashboardLead[],
): Record<QuoteStatus, number> {
  const counts = Object.fromEntries(
    QUOTE_STATUSES.map((status) => [status, 0]),
  ) as Record<QuoteStatus, number>
  for (const lead of leads) {
    counts[lead.status] += 1
  }
  return counts
}

export interface ProductRankEntry {
  id: string
  name: string
  categorySlug: string | null
  count: number
}

export function deriveProductRanking(
  leads: DashboardLead[],
  limit = 8,
): ProductRankEntry[] {
  const byId = new Map<string, ProductRankEntry>()
  for (const lead of leads) {
    for (const product of lead.products) {
      const existing = byId.get(product.id)
      if (existing) {
        existing.count += 1
      } else {
        byId.set(product.id, {
          id: product.id,
          name: product.name,
          categorySlug: product.categorySlug,
          count: 1,
        })
      }
    }
  }
  return [...byId.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export interface CategoryRankEntry {
  slug: string | null
  name: string
  count: number
}

export function deriveTopCategories(
  leads: DashboardLead[],
  limit = 5,
): CategoryRankEntry[] {
  const bySlug = new Map<string, CategoryRankEntry>()
  for (const lead of leads) {
    for (const product of lead.products) {
      // A product without a category slug can't be ranked into a category.
      if (!product.categorySlug) continue
      const existing = bySlug.get(product.categorySlug)
      if (existing) {
        existing.count += 1
      } else {
        bySlug.set(product.categorySlug, {
          slug: product.categorySlug,
          name: product.categoryName ?? product.categorySlug,
          count: 1,
        })
      }
    }
  }
  return [...bySlug.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function recentLeads(
  leads: DashboardLead[],
  limit = 8,
): DashboardLead[] {
  // `leads` already arrives newest-first from the query; slice defensively.
  return leads.slice(0, limit)
}
