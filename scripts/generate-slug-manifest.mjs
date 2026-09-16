/**
 * generate-slug-manifest.mjs — snapshot active product slugs for the edge middleware
 *
 * Writes generated/product-slugs.ts, a plain string array that middleware.ts
 * imports to answer "is this a real product?" without a network call.
 *
 * WHY THIS EXISTS. Vercel serves this SPA by rewriting /(.*) to /index.html, so
 * every path returns HTTP 200 — including /producto/<slug-que-no-existe>. Google
 * crawls those, sees 200 plus "Producto no encontrado", and files them as Soft
 * 404. middleware.ts fixes that by returning a real 404, but it needs to know
 * which slugs are real, and querying Supabase on every product page view would
 * add edge latency to the one route the 2026-09-06 LCP work was aimed at.
 *
 * This manifest makes the common case free: a slug in the list passes straight
 * through with zero network calls. A slug NOT in the list costs one Supabase
 * lookup before the 404 is returned, which is the rare path (crawlers, typos,
 * and products added to Supabase since the last deploy).
 *
 * STALENESS IS SAFE BY DESIGN. The database is still the final authority — the
 * manifest only ever short-circuits the *positive* case. A product added to
 * Supabase after this ran is simply absent from the list, so it pays for one
 * confirmation query and is then served normally. It is never wrongly 404'd.
 * That is why a failure here degrades to an empty list instead of exiting
 * non-zero: an empty manifest is slower, never incorrect.
 *
 * READ-ONLY against the database. The only thing it writes is the .ts manifest.
 *
 * Run:  node scripts/generate-slug-manifest.mjs
 *       (also runs automatically as part of `npm run build`)
 *
 * Credentials: the publishable key is enough — products are publicly readable.
 * On Vercel these arrive as real environment variables; locally they come from
 * .env, which is optional here.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = path.join(ROOT, "generated")
const OUT_PATH = path.join(OUT_DIR, "product-slugs.ts")

// ---------------------------------------------------------------------------
// env — .env is optional; Vercel supplies these as real env vars
// ---------------------------------------------------------------------------
function loadEnv() {
  const file = path.join(ROOT, ".env")
  const env = {}
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line.trim() || line.trimStart().startsWith("#")) continue
      const i = line.indexOf("=")
      if (i === -1) continue
      env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
  }
  return { ...env, ...process.env }
}

function write(slugs) {
  const body = slugs.length
    ? `\n${slugs.map((s) => `  ${JSON.stringify(s)},`).join("\n")}\n`
    : ""
  const contents = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/generate-slug-manifest.mjs, which runs during \`npm run build\`.
// Regenerate after adding products in Supabase:  node scripts/generate-slug-manifest.mjs
//
// A slug missing from this list is not an error: middleware.ts falls back to a
// Supabase lookup before returning 404, so the database always has the last word.

export const VALID_PRODUCT_SLUGS: readonly string[] = [${body}]
`
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_PATH, contents, "utf8")
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    console.warn(
      "⚠ generate-slug-manifest: Supabase credentials unavailable — writing an empty manifest.\n" +
        "  The build continues; middleware.ts will confirm every slug against the database.",
    )
    write([])
    return
  }

  let slugs = []
  try {
    const res = await fetch(
      `${url}/rest/v1/products?select=slug&is_active=eq.true&order=slug.asc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    )
    if (!res.ok) throw new Error(`PostgREST responded ${res.status} ${res.statusText}`)
    const rows = await res.json()
    slugs = [...new Set(rows.map((r) => r.slug).filter(Boolean))]
  } catch (err) {
    console.warn(
      `⚠ generate-slug-manifest: could not read products (${err.message}) — writing an empty manifest.\n` +
        "  The build continues; middleware.ts will confirm every slug against the database.",
    )
    write([])
    return
  }

  write(slugs)
  console.log(`✓ generate-slug-manifest: wrote ${slugs.length} slugs to generated/product-slugs.ts`)
}

main()
