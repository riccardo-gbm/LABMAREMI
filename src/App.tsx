import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import { AuthProvider } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Layout } from "@/components/layout/Layout"
import HomePage from "@/pages/HomePage"
import CatalogPage from "@/pages/CatalogPage"
import ProductDetailPage from "@/pages/ProductDetailPage"
import QuotePage from "@/pages/QuotePage"
import ContactPage from "@/pages/ContactPage"
import AboutPage from "@/pages/AboutPage"
import AdminPage from "@/pages/AdminPage"
import AdminLoginPage from "@/pages/AdminLoginPage"
import PlatformPage from "@/pages/PlatformPage"
import NotFoundPage from "@/pages/NotFoundPage"

/** Resets scroll on every route change — the browser only restores scroll
 * for history navigation, not for in-app Link clicks. */
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
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/cotizacion" element={<QuotePage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/platform" element={<PlatformPage />} />

            {/* Admin: public login, everything else behind the auth guard */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
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
