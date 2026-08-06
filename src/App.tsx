import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { ReactLenis, useLenis } from "lenis/react"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Layout } from "@/components/layout/Layout"
// HomePage stays eager — it is the landing route and lazying it would just add
// a round trip before the LCP paint. Every other public page is split out so
// the entry chunk carries one page's worth of code, not eight.
import HomePage from "@/pages/HomePage"
// Nav-reachable pages live in publicRoutes.ts as prefetchable lazies shared
// with Header's hover/focus warm-up.
import { AboutPage, CatalogPage, ContactPage, QuotePage, routePrefetchers } from "@/lib/publicRoutes"

const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"))

// Admin is lazy-loaded so its data layer — the quote_requests/customers query
// shapes and lead-status maps — ships in a separate chunk instead of the public
// bundle. RLS is the real access boundary; this keeps the authority surface out
// of anonymous visitors' hands too. (react-doctor/artifact-baas-authority-surface)
const AdminRoot = lazy(() => import("@/components/auth/AdminRoot"))
const ProtectedRoute = lazy(() => import("@/components/auth/ProtectedRoute").then((m) => ({ default: m.ProtectedRoute })))
const AdminLayout = lazy(() =>
  import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })),
)
const AdminPage = lazy(() => import("@/pages/AdminPage"))
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"))

/** Resets scroll on every route change — the browser only restores scroll
 * for history navigation, not for in-app Link clicks. */
/** Shown while the lazy admin chunk loads — brief, and behind auth. */
function AdminChunkFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      Cargando…
    </div>
  )
}

/**
 * Lenis owns the scroll position while `<ReactLenis root>` is mounted, and it
 * keeps its own `animatedScroll` independent of the native one. Calling
 * `window.scrollTo` behind its back leaves the two out of sync, so the next
 * wheel event resumes from where Lenis still thinks it is — which reads as the
 * page snapping back or refusing to move. Go through the instance instead;
 * `immediate` keeps the old behaviour of jumping rather than smooth-scrolling
 * to the top on navigation.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  const lenis = useLenis()
  useEffect(() => {
    // Before Lenis has initialised there is nothing to desync — fall back so
    // the very first navigation still lands at the top.
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, lenis])
  return null
}

/** Without an explicit `route`, the Vercel beacons read location.pathname at
 * flush time (first input / page hide), so in an SPA a metric produced on one
 * route gets filed under whichever route the visitor navigated to next. The
 * only dynamic public route is /producto/:slug; everything else is static. */
function useVercelRoute(): string {
  const { pathname } = useLocation()
  if (pathname.startsWith("/producto/")) return "/producto/:slug"
  return pathname
}

function VercelBeacons() {
  const route = useVercelRoute()
  const { pathname } = useLocation()
  return (
    <>
      <Analytics route={route} path={pathname} />
      <SpeedInsights route={route} />
    </>
  )
}

/** Mobile has no hover to prefetch on, so warm the nav-reachable page chunks
 * once the main thread is idle — never during the LCP window, and not at all
 * for visitors who asked to save data. */
function RoutePrefetchWarmup() {
  useEffect(() => {
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return
    const idle =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) => window.setTimeout(cb, 2500))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => {
      for (const prefetch of Object.values(routePrefetchers)) prefetch()
    })
    return () => cancel(id)
  }, [])
  return null
}

export default function App() {
  return (
    <ReactLenis root>
      <BrowserRouter>
        <ScrollToTop />
        <VercelBeacons />
        <RoutePrefetchWarmup />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/producto/:slug" element={<ProductDetailPage />} />
            <Route path="/cotizacion" element={<QuotePage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/nosotros" element={<AboutPage />} />

            {/* Admin: AuthProvider is lazy loaded in AdminRoot so Supabase and auth state
                are fully code-split from the public bundle. */}
            <Route
              element={
                <Suspense fallback={<AdminChunkFallback />}>
                  <AdminRoot />
                </Suspense>
              }
            >
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ReactLenis>
  )
}
