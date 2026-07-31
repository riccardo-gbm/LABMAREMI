/**
 * export-catalog-csv.mjs — snapshot the live catalog back into the seed CSV
 *
 * Reads `products` (+ their category names) from Supabase and rewrites
 * docs/labmaremi_catalog.csv in the exact shape import-catalog.mjs expects.
 *
 * WHY THIS EXISTS. docs/labmaremi_catalog.csv is the input to
 * import-catalog.mjs, but the database has moved on since the original import:
 * products were renamed, categories were renamed and re-scoped, and the
 * long-form copy now comes from description.txt via import-descriptions.mjs.
 * A CSV left at the old snapshot turns import-catalog.mjs into a landmine —
 * re-running it would insert duplicate rows for the renamed products and
 * restore the one-line placeholder descriptions. Run this after any change
 * made directly in Supabase so the seed file and the database still agree.
 *
 * READ-ONLY against the database. The only thing it writes is the CSV.
 *
 * Run:  node scripts/export-catalog-csv.mjs
 *       node scripts/export-catalog-csv.mjs --dry-run    (report, write nothing)
 *
 * Credentials: the publishable key is enough (products and categories are
 * publicly readable), but SUPABASE_SERVICE_ROLE_KEY is used when present so
 * inactive products are included too.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CSV_PATH = path.join(ROOT, "docs", "labmaremi_catalog.csv")
const DRY_RUN = process.argv.includes("--dry-run")

const COLUMNS = ["name", "category", "description", "presentation", "recommended_use"]

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
// CSV
// ---------------------------------------------------------------------------
/**
 * Quote every field, doubling embedded quotes (RFC 4180).
 *
 * Field bytes are otherwise preserved verbatim, line breaks included. The copy
 * loaded by import-descriptions.mjs separates its steps with \n, while a few
 * older rows pasted in by hand still use \r\n; import-catalog.mjs copies bytes
 * straight through inside a quoted field, so leaving both alone is what keeps
 * this file a byte-exact mirror of the table. Rows themselves end with CRLF.
 */
function quote(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function toCsv(rows) {
  const lines = [COLUMNS.map(quote).join(",")]
  for (const r of rows) lines.push(COLUMNS.map((c) => quote(r[c])).join(","))
  return `﻿${lines.join("\r\n")}\r\n`
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
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!key) {
    die("No key in .env — need SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY.")
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { data, error } = await supabase
    .from("products")
    .select("name, description, presentation, recommended_use, categories(name)")
    .order("name", { ascending: true })
  if (error) die(`could not read products: ${error.message}`)
  if (!data.length) die("products table is empty — refusing to write an empty CSV.")

  const orphans = data.filter((p) => !p.categories?.name)
  if (orphans.length) {
    die(
      `${orphans.length} product(s) have no category, which import-catalog.mjs ` +
        `would reject:\n   ${orphans.map((p) => p.name).join("\n   ")}`,
    )
  }

  const rows = data.map((p) => ({
    name: p.name,
    category: p.categories.name,
    description: p.description,
    presentation: p.presentation,
    recommended_use: p.recommended_use,
  }))

  const csv = toCsv(rows)
  const categories = new Map()
  for (const r of rows) categories.set(r.category, (categories.get(r.category) || 0) + 1)

  // Byte size, not a line count: fields carry embedded newlines, so counting
  // lines would badly overstate how many rows the previous file held.
  const previous = fs.existsSync(CSV_PATH) ? fs.statSync(CSV_PATH).size : 0

  console.log(`✓ read ${rows.length} products in ${categories.size} categories`)
  console.log("\n  Per category:")
  for (const [name, n] of [...categories].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(n).padStart(4)}  ${name}`)
  }
  console.log(
    `\n  ${path.relative(ROOT, CSV_PATH)}: ${previous} → ${csv.length} bytes, ${rows.length} rows`,
  )

  if (DRY_RUN) {
    console.log("\n--dry-run: no file written.")
    return
  }

  fs.writeFileSync(CSV_PATH, csv, "utf8")
  console.log(`\n✓ wrote ${path.relative(ROOT, CSV_PATH)}`)
  console.log("  Category names must still match CATEGORY_SEED in import-catalog.mjs.")
}

main().catch((e) => die(e?.message ?? String(e)))
