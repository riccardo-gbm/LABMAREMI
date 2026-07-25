import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import { AuthProvider } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
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
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/producto/:slug" element={<ProductDetailPage />} />
            <Route path="/cotizacion" element={<QuotePage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/platform" element={<PlatformPage />} />

            {/* Admin: public login, everything else behind the auth guard.
                Lazy chunk, so a Suspense boundary covers the load. */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminChunkFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <Suspense fallback={<AdminChunkFallback />}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
