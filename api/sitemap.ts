import type { IncomingMessage, ServerResponse } from "node:http"

const DOMAIN = "https://labmaremi.com"

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !anonKey) {
      res.statusCode = 500
      res.setHeader("Content-Type", "text/plain")
      res.end("Supabase credentials unconfigured")
      return
    }

    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    }

    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/categories?select=slug,updated_at&order=sort_order.asc`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/products?select=slug,updated_at&is_active=eq.true&order=name.asc`, { headers }),
    ])

    const categories: Array<{ slug: string; updated_at?: string }> = categoriesRes.ok
      ? await categoriesRes.json()
      : []
    const products: Array<{ slug: string; updated_at?: string }> = productsRes.ok
      ? await productsRes.json()
      : []

    const staticRoutes = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/catalogo", priority: "0.9", changefreq: "daily" },
      { url: "/cotizacion", priority: "0.8", changefreq: "monthly" },
      { url: "/contacto", priority: "0.8", changefreq: "monthly" },
      { url: "/nosotros", priority: "0.7", changefreq: "monthly" },
    ]

    const xmlLines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for (const r of staticRoutes) {
      xmlLines.push("  <url>")
      xmlLines.push(`    <loc>${DOMAIN}${r.url}</loc>`)
      xmlLines.push(`    <changefreq>${r.changefreq}</changefreq>`)
      xmlLines.push(`    <priority>${r.priority}</priority>`)
      xmlLines.push("  </url>")
    }

    for (const c of categories) {
      if (!c.slug) continue
      xmlLines.push("  <url>")
      xmlLines.push(`    <loc>${DOMAIN}/catalogo?categoria=${encodeURIComponent(c.slug)}</loc>`)
      xmlLines.push("    <changefreq>weekly</changefreq>")
      xmlLines.push("    <priority>0.85</priority>")
      if (c.updated_at) {
        xmlLines.push(`    <lastmod>${new Date(c.updated_at).toISOString()}</lastmod>`)
      }
      xmlLines.push("  </url>")
    }

    for (const p of products) {
      if (!p.slug) continue
      xmlLines.push("  <url>")
      xmlLines.push(`    <loc>${DOMAIN}/producto/${encodeURIComponent(p.slug)}</loc>`)
      xmlLines.push("    <changefreq>weekly</changefreq>")
      xmlLines.push("    <priority>0.80</priority>")
      if (p.updated_at) {
        xmlLines.push(`    <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>`)
      }
      xmlLines.push("  </url>")
    }

    xmlLines.push("</urlset>")

    const xml = xmlLines.join("\n")

    res.statusCode = 200
    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
    res.end(xml)
  } catch (error) {
    console.error("Sitemap handler error:", error)
    res.statusCode = 500
    res.setHeader("Content-Type", "text/plain")
    res.end("Internal Server Error")
  }
}
