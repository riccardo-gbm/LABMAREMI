import { leads } from "@/data/leads"
import type { Category, Lead, LeadStatus, Product } from "@/types"
import { getCategoryById, getProductById } from "@/lib/catalog"

/**
 * Pure derivations over the mock lead data for the admin dashboard preview.
 * Everything is computed from `src/data/leads.ts` at render time so the
 * dashboard stays truthful if the mock data changes.
 */

export const LEAD_STATUSES: LeadStatus[] = [
  "Nuevo",
  "Contactado",
  "Interesado",
  "Cliente",
  "Rechazado",
]

export function getTotalRequests(): number {
  return leads.length
}

export function getStatusCounts(): Record<LeadStatus, number> {
  const counts = Object.fromEntries(
    LEAD_STATUSES.map((status) => [status, 0])
  ) as Record<LeadStatus, number>
  for (const lead of leads) {
    counts[lead.status] += 1
  }
  return counts
}

export interface CategoryCount {
  category: Category
  count: number
}

export function getTopCategories(limit = 5): CategoryCount[] {
  const counts = new Map<string, number>()
  for (const lead of leads) {
    for (const productId of lead.productsOfInterest) {
      const product = getProductById(productId)
      if (!product) continue
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([categoryId, count]) => ({
      category: getCategoryById(categoryId),
      count,
    }))
    .filter((entry): entry is CategoryCount => entry.category !== undefined)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export interface ProductCount {
  product: Product
  count: number
}

export function getProductInterestRanking(limit = 8): ProductCount[] {
  const counts = new Map<string, number>()
  for (const lead of leads) {
    for (const productId of lead.productsOfInterest) {
      counts.set(productId, (counts.get(productId) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([productId, count]) => ({
      product: getProductById(productId),
      count,
    }))
    .filter((entry): entry is ProductCount => entry.product !== undefined)
    .sort(
      (a, b) => b.count - a.count || a.product.name.localeCompare(b.product.name)
    )
    .slice(0, limit)
}

export function getRecentLeads(limit = 8): Lead[] {
  return [...leads]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
}
