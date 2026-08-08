const BOT_USER_AGENT_REGEX =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i

const DOMAIN = "https://labmaremi.com"

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export const config = {
  matcher: ["/producto/:path*", "/catalogo"],
}

export default async function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") || ""
  if (!BOT_USER_AGENT_REGEX.test(userAgent)) {
    return
  }

  const url = new URL(request.url)
  const pathname = url.pathname

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !anonKey) {
    return
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  }

  // Handle /producto/:slug for bots
  if (pathname.startsWith("/producto/")) {
    const slug = pathname.replace(/^\/producto\//, "").split("/")[0].trim()

    if (!slug) {
      return new Response(
        `<!doctype html><html lang="es"><head><title>404 - Producto no encontrado | LABMAREMI</title><meta name="robots" content="noindex, nofollow"/></head><body><h1>404 - Producto no encontrado</h1></body></html>`,
        {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      )
    }

    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?select=id,name,description,presentation,recommended_use,image_url,is_active,categories(slug,name)&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        { headers },
      )

      if (!res.ok) {
        return new Response(
          `<!doctype html><html lang="es"><head><title>Error al cargar producto | LABMAREMI</title></head><body><h1>Error al cargar producto</h1></body></html>`,
          { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
        )
      }

      const rows = await res.json()
      const product = Array.isArray(rows) && rows.length > 0 ? rows[0] : null

      // Soft 404 prevention: return true HTTP 404 for invalid/inactive product slugs
      if (!product || product.is_active === false) {
        return new Response(
          `<!doctype html><html lang="es"><head><title>404 - Producto no encontrado | LABMAREMI</title><meta name="robots" content="noindex, nofollow"/></head><body><h1>404 - Producto no encontrado</h1><p>El producto solicitado no existe o no se encuentra disponible.</p></body></html>`,
          {
            status: 404,
            headers: { "content-type": "text/html; charset=utf-8" },
          },
        )
      }

      const rawTitle = `${product.name} — LABMAREMI ECUADOR`
      const rawDesc =
        product.description ||
        `Distribuidor de ${product.name} en Quito y Pichincha, Ecuador. Presentación: ${product.presentation || "Consultar"}.`
      const title = escapeHtml(rawTitle)
      const description = escapeHtml(rawDesc)
      const canonicalUrl = `${DOMAIN}/producto/${encodeURIComponent(slug)}`
      const imageUrl = escapeHtml(
        product.image_url || `${DOMAIN}/logo1.webp`,
      )
      const categoryName = escapeHtml(product.categories?.name || "Limpieza e Higiene")

      const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="LABMAREMI ECUADOR CIA. LTDA." />
  <meta property="og:locale" content="es_EC" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="product:category" content="${categoryName}" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${title}" />
</body>
</html>`

      return new Response(html, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      })
    } catch (err) {
      console.error("Middleware product error:", err)
      return
    }
  }

  // Handle /catalogo for bots (with category filter support)
  if (pathname === "/catalogo") {
    const categorySlug = url.searchParams.get("categoria")
    if (categorySlug) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/categories?select=slug,name,description,image_url&slug=eq.${encodeURIComponent(categorySlug)}&limit=1`,
          { headers },
        )
        if (res.ok) {
          const rows = await res.json()
          const cat = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
          if (cat) {
            const rawTitle = `${cat.name} e Higiene Industrial en Quito — LABMAREMI`
            const rawDesc = cat.description || `Catálogo de ${cat.name} para empresas en Quito y Pichincha, Ecuador.`
            const title = escapeHtml(rawTitle)
            const description = escapeHtml(rawDesc)
            const canonicalUrl = `${DOMAIN}/catalogo?categoria=${encodeURIComponent(categorySlug)}`
            const imageUrl = escapeHtml(cat.image_url || `${DOMAIN}/logo1.webp`)

            const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="LABMAREMI ECUADOR CIA. LTDA." />
  <meta property="og:locale" content="es_EC" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
</body>
</html>`

            return new Response(html, {
              status: 200,
              headers: {
                "content-type": "text/html; charset=utf-8",
                "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
              },
            })
          }
        }
      } catch (err) {
        console.error("Middleware category error:", err)
      }
    }
  }
}
