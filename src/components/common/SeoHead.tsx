import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export interface SeoHeadProps {
  title?: string
  description?: string
  canonicalUrl?: string
  ogType?: "website" | "product" | "article"
  ogImage?: string
  noindex?: boolean
}

const DEFAULT_TITLE = "LABMAREMI ECUADOR CIA. LTDA. | Suministros de limpieza e higiene para empresas"
const DEFAULT_DESCRIPTION =
  "LABMAREMI ECUADOR CIA. LTDA. | Distribuidor de productos de limpieza, desinfección, protección e higiene para empresas en Pichincha, Ecuador."
const DOMAIN = "https://labmaremi.com"

function updateOrCreateMeta(selector: string, attrName: string, attrVal: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement("meta")
    element.setAttribute(attrName, attrVal)
    document.head.appendChild(element)
  }
  element.setAttribute("content", content)
}

function updateOrCreateLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement("link")
    element.setAttribute("rel", rel)
    document.head.appendChild(element)
  }
  element.setAttribute("href", href)
}

export function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = "website",
  ogImage = `${DOMAIN}/logo1.webp`,
  noindex = false,
}: SeoHeadProps) {
  const { pathname, search } = useLocation()

  useEffect(() => {
    document.title = title

    // Standard Meta
    updateOrCreateMeta('meta[name="description"]', "name", "description", description)
    updateOrCreateMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow",
    )

    // Canonical link. Falls back to the current route, which is why pathname
    // and search are dependencies below — reading them off `window` alone left
    // the fallback frozen at whatever the URL was when the effect last ran.
    const canonical = canonicalUrl || `${DOMAIN}${pathname}${search}`
    updateOrCreateLink("canonical", canonical)

    // Open Graph
    updateOrCreateMeta('meta[property="og:title"]', "property", "og:title", title)
    updateOrCreateMeta('meta[property="og:description"]', "property", "og:description", description)
    updateOrCreateMeta('meta[property="og:type"]', "property", "og:type", ogType)
    updateOrCreateMeta('meta[property="og:url"]', "property", "og:url", canonical)
    updateOrCreateMeta('meta[property="og:image"]', "property", "og:image", ogImage)
    updateOrCreateMeta('meta[property="og:locale"]', "property", "og:locale", "es_EC")
    updateOrCreateMeta('meta[property="og:site_name"]', "property", "og:site_name", "LABMAREMI ECUADOR CIA. LTDA.")

    // Twitter Card
    updateOrCreateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image")
    updateOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title", title)
    updateOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description", description)
    updateOrCreateMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage)
    // NO CLEANUP ON PURPOSE. These are singleton tags — one <link rel=canonical>,
    // one robots meta — shared by every route, unlike JsonLd.tsx which owns a
    // uniquely-id'd <script> it can safely remove. Tearing them down on unmount
    // would race the incoming route: React can mount the next page's SeoHead
    // before unmounting this one, and the stale cleanup would then delete the
    // canonical the new page had just written.
    //
    // What makes that safe is coverage, not cleanup: every route renders a
    // SeoHead on every branch — including loading, error and not-found — so the
    // tags are always overwritten rather than left behind. Adding a route or a
    // new early return without a SeoHead reopens this, which is how 18 product
    // pages ended up canonical-less in Search Console.
  }, [title, description, canonicalUrl, ogType, ogImage, noindex, pathname, search])

  return null
}
