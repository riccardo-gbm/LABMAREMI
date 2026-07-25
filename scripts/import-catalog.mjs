/**
 * import-catalog.mjs — LABMAREMI Phase 2, P4
 *
 * Seeds `categories` + `business_types`, then imports docs/labmaremi_catalog.csv
 * into `products`.
 *
 * SAFE TO RE-RUN. Every write is an upsert on a natural key (category name,
 * business type name, product name), backed by the unique indexes in
 * migration 0002. Nothing is truncated; re-running updates rows in place and
 * leaves ids — and therefore any quote_request_items pointing at them — intact.
 *
 * Run:  node scripts/import-catalog.mjs
 *       node scripts/import-catalog.mjs --dry-run    (validate, write nothing)
 *
 * Credentials (from .env, which is gitignored). Writes need the `authenticated`
 * or service role — the publishable/anon key is read-only on these tables per
 * the P1 RLS policies. Use EITHER:
 *   SUPABASE_SERVICE_ROLE_KEY=...            (bypasses RLS; never VITE_-prefixed,
 *                                             so Vite never ships it to the browser)
 * or:
 *   ADMIN_EMAIL=...  ADMIN_PASSWORD=...      (signs in as a P2 admin; obeys RLS)
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { slugify } from "./slugify.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CSV_PATH = path.join(ROOT, "docs", "labmaremi_catalog.csv")
const DRY_RUN = process.argv.includes("--dry-run")

const UNSPLASH = (id) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=900&auto=format&fit=crop`

/**
 * Canonical category list — name, slug, and the public-facing copy Home renders.
 * This IS the source of truth now: it used to live in src/data/categories.ts,
 * which P5 deleted once these columns existed. Array order becomes sort_order.
 */
const CATEGORY_SEED = [
  {
    slug: "desinfectantes",
    name: "Desinfectantes",
    description:
      "Alcoholes, cloro y desinfectantes multiuso para eliminar gérmenes y bacterias en cocinas, baños y áreas comunes.",
    image_url: UNSPLASH("1584744982491-665216d95f8b"),
    image_alt: "Insumos de desinfección y bioseguridad para empresas",
  },
  {
    slug: "desengrasantes",
    name: "Desengrasantes",
    description:
      "Productos de alto poder para remover grasa acumulada en cocinas industriales, campanas y superficies de trabajo.",
    image_url: UNSPLASH("1528740561666-dc2479dc08ab"),
    image_alt: "Botellas de limpieza para cocina y superficies",
  },
  {
    slug: "papel",
    name: "Papel",
    description:
      "Papel higiénico, toallas y servilletas institucionales para un abastecimiento constante en baños y áreas de servicio.",
    image_url: UNSPLASH("1585421514284-efb74c2b69ba"),
    image_alt: "Toallas de papel y limpieza institucional",
  },
  {
    slug: "herramientas-limpieza",
    name: "Herramientas de Limpieza",
    description:
      "Trapeadores, escobas, paños y accesorios pensados para el uso diario e intensivo en instalaciones comerciales.",
    image_url: UNSPLASH("1581578731548-c64695cc6952"),
    image_alt: "Personal de limpieza usando herramientas profesionales",
  },
  {
    slug: "fundas-basura",
    name: "Fundas de Basura",
    description:
      "Fundas industriales en distintas capacidades y resistencias para el manejo de desechos comunes y especiales.",
    image_url: UNSPLASH("1550963295-019d8a8a61c5"),
    image_alt: "Insumos de limpieza y manejo de residuos",
  },
  {
    slug: "insumos-bano",
    name: "Insumos para Baño",
    description:
      "Jabones, ambientadores y desinfectantes específicos para mantener los baños de su negocio impecables.",
    image_url: UNSPLASH("1583907659441-addbe699e921"),
    image_alt: "Productos de higiene para baños institucionales",
  },
  {
    slug: "limpieza-industrial",
    name: "Limpieza Industrial",
    description:
      "Soluciones de mayor concentración para pisos, maquinaria y superficies en entornos industriales y de alto tránsito.",
    image_url: UNSPLASH("1563453392212-326f5e854473"),
    image_alt: "Limpieza profesional de superficies industriales",
  },
  {
    slug: "higiene-personal",
    name: "Higiene Personal",
    description:
      "Jabones, geles y toallas húmedas para el cuidado e higiene del personal en cualquier tipo de negocio.",
    image_url: UNSPLASH("1585421514738-01798e348b17"),
    image_alt: "Guantes e insumos de higiene personal",
  },
  {
    slug: "equipos-proteccion",
    name: "Equipos de Protección",
    description:
      "Guantes, mascarillas y prendas de protección para el personal de cocina, limpieza y atención al público.",
    image_url: UNSPLASH("1584820927498-cfe5211fd8bf"),
    image_alt: "Equipo de protección para personal operativo",
  },
]

/** Canonical business segments — formerly src/data/businessTypes.ts. */
const BUSINESS_TYPE_SEED = [
  {
    name: "Restaurantes",
    description:
      "Cocinas y comedores que requieren desengrasantes, desinfectantes y control higiénico constante.",
  },
  {
    name: "Hoteles",
    description:
      "Establecimientos de hospedaje con necesidades de insumos para habitaciones, baños y áreas comunes.",
  },
  {
    name: "Oficinas",
    description:
      "Espacios corporativos que buscan un abastecimiento confiable de limpieza e higiene para su personal.",
  },
  {
    name: "Instituciones Educativas",
    description:
      "Escuelas y colegios que necesitan insumos seguros para el aseo diario de aulas y baños.",
  },
  {
    name: "Clínicas",
    description:
      "Centros de salud con altos estándares de desinfección y bioseguridad para pacientes y personal.",
  },
  {
    name: "Empresas de Limpieza",
    description:
      "Compañías de servicios de limpieza que requieren abastecimiento al por mayor para sus operaciones.",
  },
  {
    name: "Tiendas Locales",
    description:
      "Comercios y minimercados que buscan mantener sus locales limpios y presentables para sus clientes.",
  },
]

// ---------------------------------------------------------------------------
// env
// ---------------------------------------------------------------------------
function loadEnv() {
  const file = path.join(ROOT, ".env")
  if (!fs.existsSync(file)) die("No .env found at project root.")
  const env = {}
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue
    const i = line.indexOf("=")
    if (i === -1) continue
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { ...env, ...process.env }
}

// ---------------------------------------------------------------------------
// CSV (RFC 4180: quoted fields, embedded commas/newlines, "" escapes)
// ---------------------------------------------------------------------------
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  const rows = []
  let field = ""
  let row = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ",") { row.push(field); field = "" }
    else if (c === "\r") { /* ignore */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = "" }
    else field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

function die(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  if (!url) die("VITE_SUPABASE_URL missing from .env")

  // --- read + validate the CSV before touching the database -----------------
  if (!fs.existsSync(CSV_PATH)) die(`CSV not found: ${CSV_PATH}`)
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"))
  const header = rows[0].map((h) => h.trim())
  const EXPECTED = ["name", "category", "description", "presentation", "recommended_use"]
  if (header.join(",") !== EXPECTED.join(",")) {
    die(`Unexpected CSV header.\n  expected: ${EXPECTED.join(", ")}\n  got:      ${header.join(", ")}`)
  }

  const products = []
  const problems = []
  const seenNames = new Set()
  const seenSlugs = new Map()
  const validCategories = new Set(CATEGORY_SEED.map((c) => c.name))

  rows.slice(1).forEach((r, idx) => {
    const line = idx + 2 // 1-based, +1 for the header
    const [name, category, description, presentation, recommended_use] =
      r.map((v) => v.trim())
    if (!name) return problems.push({ line, name: "(blank)", why: "empty name" })
    if (seenNames.has(name)) {
      return problems.push({ line, name, why: "duplicate product name in CSV" })
    }
    if (!validCategories.has(category)) {
      return problems.push({ line, name, why: `unknown category "${category}"` })
    }
    // slug is unique in the DB and doubles as the image filename, so a
    // collision has to be caught here rather than half-way through the import.
    const slug = slugify(name)
    if (!slug) return problems.push({ line, name, why: "name produces an empty slug" })
    if (seenSlugs.has(slug)) {
      return problems.push({
        line,
        name,
        why: `slug "${slug}" collides with "${seenSlugs.get(slug)}"`,
      })
    }
    seenSlugs.set(slug, name)
    seenNames.add(name)
    products.push({ name, category, description, presentation, recommended_use })
  })

  if (problems.length) {
    console.error("\n✖ CSV validation failed — nothing was written:\n")
    for (const p of problems) console.error(`   line ${p.line}: ${p.name} — ${p.why}`)
    process.exit(1)
  }
  console.log(`✓ CSV valid: ${products.length} products, ${new Set(products.map((p) => p.category)).size} categories referenced`)

  if (DRY_RUN) {
    console.log("\n--dry-run: no writes performed.")
    printPerCategory(products)
    return
  }

  // --- authenticate ---------------------------------------------------------
  let supabase
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
    console.log("✓ authenticated with the service role key")
  } else if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    supabase = createClient(url, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    })
    const { error } = await supabase.auth.signInWithPassword({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    })
    if (error) die(`Admin sign-in failed: ${error.message}`)
    console.log(`✓ signed in as ${env.ADMIN_EMAIL}`)
  } else {
    die(
      "No write credentials. Add SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL +\n" +
        "  ADMIN_PASSWORD, to .env. The publishable key is read-only here by design.",
    )
  }

  // --- seed categories ------------------------------------------------------
  const { error: catErr } = await supabase.from("categories").upsert(
    CATEGORY_SEED.map((c, i) => ({ ...c, sort_order: i })),
    { onConflict: "slug" },
  )
  if (catErr) die(`categories upsert failed: ${catErr.message}`)
  console.log(`✓ categories seeded (${CATEGORY_SEED.length})`)

  // --- seed business_types --------------------------------------------------
  const { error: btErr } = await supabase
    .from("business_types")
    .upsert(BUSINESS_TYPE_SEED, { onConflict: "name" })
  if (btErr) die(`business_types upsert failed: ${btErr.message}`)
  console.log(`✓ business_types seeded (${BUSINESS_TYPE_SEED.length})`)

  // --- resolve category ids -------------------------------------------------
  const { data: catRows, error: readErr } = await supabase
    .from("categories")
    .select("id, name")
  if (readErr) die(`could not read back categories: ${readErr.message}`)
  const idByName = new Map(catRows.map((c) => [c.name, c.id]))

  const missing = [...new Set(products.map((p) => p.category))].filter(
    (n) => !idByName.has(n),
  )
  if (missing.length) die(`categories missing after seed: ${missing.join(", ")}`)

  // --- upsert products in batches ------------------------------------------
  const payload = products.map((p) => ({
    name: p.name,
    slug: slugify(p.name),
    category_id: idByName.get(p.category),
    description: p.description,
    presentation: p.presentation,
    recommended_use: p.recommended_use,
    is_active: true,
    // image_url intentionally omitted — left null, populated by the image step.
  }))

  const BATCH = 50
  const failed = []
  let written = 0
  for (let i = 0; i < payload.length; i += BATCH) {
    const chunk = payload.slice(i, i + BATCH)
    const { error } = await supabase
      .from("products")
      .upsert(chunk, { onConflict: "name" })
    if (error) {
      failed.push({ range: `${i + 1}–${i + chunk.length}`, why: error.message })
    } else {
      written += chunk.length
    }
  }

  // --- report ---------------------------------------------------------------
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  console.log(`\n✓ products upserted: ${written}/${payload.length}`)
  console.log(`  products table now holds: ${count} rows`)
  printPerCategory(products)

  if (failed.length) {
    console.error("\n✖ failed batches:")
    for (const f of failed) console.error(`   rows ${f.range}: ${f.why}`)
    process.exit(1)
  }
}

function printPerCategory(products) {
  const counts = new Map()
  for (const p of products) counts.set(p.category, (counts.get(p.category) || 0) + 1)
  console.log("\n  Per category:")
  for (const c of CATEGORY_SEED) {
    const n = counts.get(c.name) || 0
    console.log(`   ${String(n).padStart(4)}  ${c.name}${n === 0 ? "   ← EMPTY" : ""}`)
  }
}

main().catch((e) => die(e?.message ?? String(e)))
