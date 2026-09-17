import { VALID_PRODUCT_SLUGS } from "./generated/product-slugs"

const BOT_USER_AGENT_REGEX =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot/i

const DOMAIN = "https://labmaremi.com"

/**
 * Slugs known to exist at build time (scripts/generate-slug-manifest.mjs).
 *
 * Only ever used to short-circuit the *positive* case. A slug that is absent
 * falls through to a Supabase lookup, so a manifest that has gone stale costs
 * one query and never wrongly 404s a real product.
 */
const KNOWN_PRODUCT_SLUGS = new Set(VALID_PRODUCT_SLUGS)

/** Matches the client-side guard in src/lib/catalogData.ts. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function productSlugFrom(pathname: string): string {
  return pathname.replace(/^\/producto\//, "").split("/")[0].trim()
}

/**
 * Last-word check against the database for a slug the manifest did not know.
 *
 * Returns true on any failure. A Supabase outage must not turn the whole
 * catalog into 404s — the SPA already renders its own error state, and a 200
 * there is the safer wrong answer than a 404 Google would act on.
 */
async function productExists(slug: string): Promise<boolean> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !anonKey) return true

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=slug&is_active=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } },
    )
    if (!res.ok) return true
    const rows = await res.json()
    return Array.isArray(rows) && rows.length > 0
  } catch (err) {
    console.error("Middleware slug check error:", err)
    return true
  }
}

/**
 * Serve the real SPA shell, but with a 404 status.
 *
 * Deliberately NOT the stripped prerender stub further down this file: that
 * stub is for social scrapers, and serving it to a search crawler while users
 * get the React app would be cloaking. Here the bytes are identical to what a
 * visitor receives — React still renders "Producto no encontrado" — and only
 * the status line differs, which is the part that was wrong.
 */
async function notFoundShell(request: Request): Promise<Response> {
  const headers: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex",
  }
  try {
    const shell = await fetch(new URL("/", request.url))
    if (shell.ok) {
      return new Response(await shell.text(), { status: 404, headers })
    }
  } catch (err) {
    console.error("Middleware shell fetch error:", err)
  }
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8"/><title>404 — Página no encontrada | LABMAREMI</title><meta name="robots" content="noindex, nofollow"/></head><body><h1>404 — Página no encontrada</h1></body></html>`,
    { status: 404, headers },
  )
}

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

  // Everyone who is not a social scraper — real visitors and search crawlers
  // alike — gets the plain SPA, with one correction: a product URL that does
  // not resolve must answer 404 rather than 200. Without this, Vercel's
  // /(.*) -> /index.html rewrite makes every invented slug a soft 404.
  if (!BOT_USER_AGENT_REGEX.test(userAgent)) {
    const pathname = new URL(request.url).pathname
    if (!pathname.startsWith("/producto/")) return

    const slug = productSlugFrom(pathname)
    if (KNOWN_PRODUCT_SLUGS.has(slug)) return // hot path: no network call
    if (slug && SLUG_PATTERN.test(slug) && (await productExists(slug))) return

    return notFoundShell(request)
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
