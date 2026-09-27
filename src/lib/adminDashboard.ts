import { supabase } from "@/lib/supabase"
import type { QuoteStatus } from "@/types/database"
import type { WhatsAppClickSource } from "@/lib/whatsappTracking"

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
    // Belt to test-anon-rls.mjs's own cleanup: its marker leads never reach
    // the dashboard even if a run dies before deleting them.
    .not("company_name", "like", "__RLS_TEST__%")
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

// ---------------------------------------------------------------------------
// WhatsApp clicks (migration 0008)
// ---------------------------------------------------------------------------

export const CLICK_SOURCE_LABEL: Record<WhatsAppClickSource, string> = {
  product: "Ficha de producto",
  widget: "Botón flotante",
  home: "Página de inicio",
  contact: "Página de contacto",
}

export interface WhatsAppClick {
  createdAt: string
  source: WhatsAppClickSource
  productName: string | null
  productSlug: string | null
  categoryName: string | null
  categorySlug: string | null
}

interface RawClickRow {
  created_at: string
  source: WhatsAppClickSource
  products: { name: string; slug: string } | null
  categories: { name: string; slug: string } | null
}

export async function fetchWhatsAppClicks(sinceISO: string): Promise<WhatsAppClick[]> {
  const { data, error } = await supabase
    .from("whatsapp_clicks")
    .select("created_at, source, products ( name, slug ), categories ( name, slug )")
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as unknown as RawClickRow[]
  return rows.map((row) => ({
    createdAt: row.created_at,
    source: row.source,
    productName: row.products?.name ?? null,
    productSlug: row.products?.slug ?? null,
    categoryName: row.categories?.name ?? null,
    categorySlug: row.categories?.slug ?? null,
  }))
}

/**
 * The business runs on Quito time, so weekday/hour buckets use it regardless
 * of where the admin opens the dashboard from.
 */
const QUITO_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Guayaquil",
  weekday: "short",
  hour: "numeric",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
}

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const

function quitoParts(iso: string) {
  const parts = Object.fromEntries(
    QUITO_PARTS.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  )
  return {
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
    hour: Number(parts.hour) % 24,
    day: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

export interface ClickRankEntry {
  key: string
  name: string
  count: number
}

function rankBy(
  clicks: WhatsAppClick[],
  pick: (c: WhatsAppClick) => { key: string; name: string } | null,
  limit: number,
): ClickRankEntry[] {
  const byKey = new Map<string, ClickRankEntry>()
  for (const click of clicks) {
    const picked = pick(click)
    if (!picked) continue
    const existing = byKey.get(picked.key)
    if (existing) existing.count += 1
    else byKey.set(picked.key, { ...picked, count: 1 })
  }
  return [...byKey.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function deriveClickProductRanking(clicks: WhatsAppClick[], limit = 10) {
  return rankBy(
    clicks,
    (c) => (c.productSlug && c.productName ? { key: c.productSlug, name: c.productName } : null),
    limit,
  )
}

export function deriveClickCategoryRanking(clicks: WhatsAppClick[], limit = 8) {
  return rankBy(
    clicks,
    (c) => (c.categorySlug && c.categoryName ? { key: c.categorySlug, name: c.categoryName } : null),
    limit,
  )
}

export function deriveClicksBySource(
  clicks: WhatsAppClick[],
): Record<WhatsAppClickSource, number> {
  const counts: Record<WhatsAppClickSource, number> = {
    product: 0, widget: 0, home: 0, contact: 0,
  }
  for (const click of clicks) counts[click.source] += 1
  return counts
}

export interface ClickTimeBuckets {
  byWeekday: number[] // 7, Monday first
  byHour: number[] // 24
  activeDays: number
}

export function deriveClickTimeBuckets(clicks: WhatsAppClick[]): ClickTimeBuckets {
  const byWeekday = Array<number>(7).fill(0)
  const byHour = Array<number>(24).fill(0)
  const days = new Set<string>()
  for (const click of clicks) {
    const { weekday, hour, day } = quitoParts(click.createdAt)
    byWeekday[weekday] += 1
    byHour[hour] += 1
    days.add(day)
  }
  return { byWeekday, byHour, activeDays: days.size }
}
