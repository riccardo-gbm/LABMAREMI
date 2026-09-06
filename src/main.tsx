import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "@/App"
import { ProductDetailPage } from "@/lib/publicRoutes"
import { prefetchProductDetail } from "@/lib/catalogData"
import "./index.css"

// When direct-landing on /producto/:slug, pre-warm the route chunk, catalog
// data query, and product image in parallel at t=0 before React mounts,
// collapsing the sequential waterfall and reducing LCP to under 1.8s.
const path = window.location.pathname
if (path.startsWith("/producto/")) {
  ProductDetailPage.prefetch()
  const slug = path.replace(/^\/producto\//, "").split(/[?#]/)[0]
  if (slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    prefetchProductDetail(slug)
    const img = new Image()
    img.src = `https://alyjdwsblnedadlfplgw.supabase.co/storage/v1/object/public/product-images/${slug}.webp`
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
