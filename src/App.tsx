import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Layout } from "@/components/layout/Layout"
import HomePage from "@/pages/HomePage"
import CatalogPage from "@/pages/CatalogPage"
import ProductDetailPage from "@/pages/ProductDetailPage"
import QuotePage from "@/pages/QuotePage"
import ContactPage from "@/pages/ContactPage"
import AboutPage from "@/pages/AboutPage"
import PlatformPage from "@/pages/PlatformPage"
import NotFoundPage from "@/pages/NotFoundPage"

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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Analytics />
      <SpeedInsights />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:slug" element={<ProductDetailPage />} />
          <Route path="/cotizacion" element={<QuotePage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/platform" element={<PlatformPage />} />

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
  )
}
