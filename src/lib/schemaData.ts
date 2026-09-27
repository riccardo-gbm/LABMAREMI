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

// NO PRODUCT SCHEMA. Google's product snippets require one of `offers`,
// `review` or `aggregateRating`, and this quote-only B2B catalog publishes
// none: prices are negotiated per client and there are no reviews. A Product
// with an Offer lacking `price` was rejected, and so was a Product with no
// Offer at all (Search Console, Sept 2026: every product page flagged under
// "Fragmentos de productos" and "Fichas de comerciantes"). No markup beats
// invalid markup; product pages carry BreadcrumbList only. Revisit if public
// prices or reviews are ever added.

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
