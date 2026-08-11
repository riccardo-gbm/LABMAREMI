import { useEffect } from "react"

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

    // Canonical link
    const canonical = canonicalUrl || `${DOMAIN}${window.location.pathname}${window.location.search}`
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
  }, [title, description, canonicalUrl, ogType, ogImage, noindex])

  return null
}
