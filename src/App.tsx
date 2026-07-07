import { useEffect } from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import { Layout } from "@/components/layout/Layout"
import HomePage from "@/pages/HomePage"
import CatalogPage from "@/pages/CatalogPage"
import ProductDetailPage from "@/pages/ProductDetailPage"
import QuotePage from "@/pages/QuotePage"
import ContactPage from "@/pages/ContactPage"
import AboutPage from "@/pages/AboutPage"
import AdminPage from "@/pages/AdminPage"
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
