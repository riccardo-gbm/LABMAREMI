const DOMAIN = "https://labmaremi.com"

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "WholesaleStore"],
    "@id": `${DOMAIN}/#organization`,
    name: "LABMAREMI ECUADOR CIA. LTDA.",
    alternateName: "LABMAREMI",
    url: DOMAIN,
    logo: `${DOMAIN}/logo1.webp`,
    image: `${DOMAIN}/bodega.webp`,
    description:
      "Distribuidor B2B de productos de limpieza, desinfección, protección e higiene industrial para empresas en Quito y Pichincha, Ecuador.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Quito Norte / Sector Industrial",
      addressLocality: "Quito",
      addressRegion: "Pichincha",
      addressCountry: "EC",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -0.180653,
      longitude: -78.467838,
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Pichincha",
      },
      {
        "@type": "City",
        name: "Quito",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Transferencia Bancaria, Cheque, Efectivo",
  }
}

export interface ProductSchemaInput {
  name: string
  description: string
  slug: string
  imageUrl?: string
  categoryName?: string
  sku?: string
  presentation?: string
}

export function getProductSchema(input: ProductSchemaInput) {
  const productUrl = `${DOMAIN}/producto/${encodeURIComponent(input.slug)}`
  const image = input.imageUrl || `${DOMAIN}/logo1.webp`

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}/#product`,
    name: input.name,
    description: input.description || `${input.name} - Suministros de limpieza e higiene industrial LABMAREMI.`,
    image: [image],
    sku: input.sku || input.slug,
    category: input.categoryName || "Limpieza e Higiene",
    brand: {
      "@type": "Brand",
      name: "LABMAREMI",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "LABMAREMI ECUADOR CIA. LTDA.",
      },
    },
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${DOMAIN}${item.url}`,
    })),
  }
}
