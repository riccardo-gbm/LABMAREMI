import {
  Bath,
  BedDouble,
  Brush,
  Building2,
  Droplets,
  Factory,
  GraduationCap,
  HandHeart,
  type LucideIcon,
  Package,
  ShieldCheck,
  Sparkles,
  SprayCan,
  ScrollText,
  Stethoscope,
  Store,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"

/**
 * Single source of truth for the category/business-type icon taxonomy.
 * Used on Home, Catalog, and Product Detail so a category always keeps
 * the same visual mark across the site.
 */
const categoryIcons: Record<string, LucideIcon> = {
  desinfectantes: Droplets,
  desengrasantes: SprayCan,
  papel: ScrollText,
  "herramientas-limpieza": Brush,
  "fundas-basura": Trash2,
  "insumos-bano": Bath,
  "limpieza-industrial": Factory,
  "higiene-personal": HandHeart,
  "equipos-proteccion": ShieldCheck,
}

const businessTypeIcons: Record<string, LucideIcon> = {
  restaurantes: UtensilsCrossed,
  hoteles: BedDouble,
  oficinas: Building2,
  "instituciones-educativas": GraduationCap,
  clinicas: Stethoscope,
  "empresas-limpieza": Sparkles,
  "tiendas-locales": Store,
}

/**
 * Business-type icons keyed by display name — for live data (Supabase
 * `business_types` has no slug column, only id + name). Names match the
 * canonical seven segments in src/data/businessTypes.ts.
 */
const businessTypeIconsByName: Record<string, LucideIcon> = {
  Restaurantes: UtensilsCrossed,
  Hoteles: BedDouble,
  Oficinas: Building2,
  "Instituciones Educativas": GraduationCap,
  Clínicas: Stethoscope,
  "Empresas de Limpieza": Sparkles,
  "Tiendas Locales": Store,
}

export function getCategoryIcon(categoryId: string): LucideIcon {
  return categoryIcons[categoryId] ?? Package
}

export function getBusinessTypeIcon(businessTypeId: string): LucideIcon {
  return businessTypeIcons[businessTypeId] ?? Building2
}

export function getBusinessTypeIconByName(name: string | null): LucideIcon {
  if (!name) return Building2
  return businessTypeIconsByName[name] ?? Building2
}
