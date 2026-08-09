import { lazyWithPrefetch } from "@/lib/lazyWithPrefetch"

/**
 * Nav-reachable pages are prefetchable: with the layout's AnimatePresence
 * mode="wait", a cold chunk otherwise downloads only *after* the 240ms exit
 * animation, so warming it on hover/focus/idle makes navigation paint
 * immediately. Lives outside App.tsx so Header can import the prefetcher map
 * without a circular import.
 */
export const CatalogPage = lazyWithPrefetch(() => import("@/pages/CatalogPage"))
export const QuotePage = lazyWithPrefetch(() => import("@/pages/QuotePage"))
export const ContactPage = lazyWithPrefetch(() => import("@/pages/ContactPage"))
export const AboutPage = lazyWithPrefetch(() => import("@/pages/AboutPage"))
export const ProductDetailPage = lazyWithPrefetch(() => import("@/pages/ProductDetailPage"))

export const routePrefetchers: Record<string, () => void> = {
  "/catalogo": CatalogPage.prefetch,
  "/cotizacion": QuotePage.prefetch,
  "/contacto": ContactPage.prefetch,
  "/nosotros": AboutPage.prefetch,
}
