import {
  BedDouble,
  Boxes,
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
  "materiales-limpieza": Brush,
  papel: ScrollText,
  "equipos-proteccion": ShieldCheck,
  "fundas-basura": Trash2,
  empaques: Package,
  "limpieza-industrial": Factory,
  "higiene-personal": HandHeart,
  desinfectantes: Droplets,
  desechables: UtensilsCrossed,
  // Slug predates the rename to "Plásticos Industriales" — the category is
  // keyed on the slug, so renaming it in Supabase did not change this key.
  "insumos-bano": Boxes,
  salud: Stethoscope,
}

/**
 * Business-type icons keyed by display name — Supabase `business_types` has
 * no slug column, only id + name. Names match the canonical seven segments
 * seeded by scripts/import-catalog.mjs.
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

export function getBusinessTypeIconByName(name: string | null): LucideIcon {
  if (!name) return Building2
  return businessTypeIconsByName[name] ?? Building2
}
