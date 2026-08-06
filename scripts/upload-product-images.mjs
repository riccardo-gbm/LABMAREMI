/**
 * upload-product-images.mjs — LABMAREMI Phase 2, P4 (images)
 *
 * Uploads a local folder of product photos to the `product-images` Storage
 * bucket and writes each product's `image_url`.
 *
 * SAFE TO RE-RUN. Uploads use upsert (same path is overwritten, not duplicated)
 * and image_url is set by product id.
 *
 * ── File naming convention ──────────────────────────────────────────────────
 * Name each file after the PRODUCT NAME, slugified:
 *   lowercase, accents stripped, spaces → "-", punctuation dropped.
 *
 *   "Guantes de Nitrilo Azul"        → guantes-de-nitrilo-azul.jpg
 *   "Papel Higiénico Jumbo 250m"     → papel-higienico-jumbo-250m.jpg
 *   "Fundas Plásticas Tipo Camiseta" → fundas-plasticas-tipo-camiseta.png
 *
 * Extensions .jpg / .jpeg / .png / .webp / .avif are all accepted.
 * Run with --list first — it prints the exact filename expected for every
 * product, so you can name the files without guessing.
 *
 * Run:
 *   node scripts/upload-product-images.mjs --list
 *   node scripts/upload-product-images.mjs ./product-photos --dry-run
 *   node scripts/upload-product-images.mjs ./product-photos
 *
 * Credentials: same as import-catalog.mjs (.env, gitignored) —
 * SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL + ADMIN_PASSWORD.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import { slugify } from "./slugify.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BUCKET = "product-images"
const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"]

const args = process.argv.slice(2)
const LIST_ONLY = args.includes("--list")
const DRY_RUN = args.includes("--dry-run")
const folderArg = args.find((a) => !a.startsWith("--"))

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

function die(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

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

async function connect(env) {
  const url = env.VITE_SUPABASE_URL
  if (!url) die("VITE_SUPABASE_URL missing from .env")
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  }
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const sb = createClient(url, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    })
    const { error } = await sb.auth.signInWithPassword({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    })
    if (error) die(`Admin sign-in failed: ${error.message}`)
    return sb
  }
  die("No write credentials. Add SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL + ADMIN_PASSWORD, to .env.")
}

async function main() {
  const env = loadEnv()
  const supabase = await connect(env)

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url")
    .order("name")
  if (error) die(`could not read products: ${error.message}`)
  if (!products.length) die("products table is empty — run import-catalog.mjs first.")

  if (LIST_ONLY) {
    console.log(`\nExpected filename for each of the ${products.length} products`)
    console.log("(any of .jpg .jpeg .png .webp .avif):\n")
    for (const p of products) {
      const mark = p.image_url ? "✓" : " "
      console.log(` ${mark} ${slugify(p.name).padEnd(52)}  ${p.name}`)
    }
    console.log("\n✓ = already has an image_url")
    return
  }

  if (!folderArg) die("Pass the image folder, e.g. node scripts/upload-product-images.mjs ./product-photos")
  const folder = path.resolve(ROOT, folderArg)
  if (!fs.existsSync(folder)) die(`Folder not found: ${folder}`)

  // Index local files by slug.
  const filesBySlug = new Map()
  for (const f of fs.readdirSync(folder)) {
    const ext = path.extname(f).toLowerCase()
    if (!EXTS.includes(ext)) continue
    filesBySlug.set(slugify(path.basename(f, ext)), { file: f, ext })
  }

  const matched = []
  const noPhoto = []
  for (const p of products) {
    const hit = filesBySlug.get(slugify(p.name))
    if (hit) matched.push({ product: p, ...hit })
    else noPhoto.push(p)
  }
  const usedSlugs = new Set(matched.map((m) => slugify(m.product.name)))
  const orphanFiles = [...filesBySlug.entries()]
    .filter(([slug]) => !usedSlugs.has(slug))
    .map(([, v]) => v.file)

  console.log(`\nFolder: ${folder}`)
  console.log(`  image files found: ${filesBySlug.size}`)
  console.log(`  matched to a product: ${matched.length}`)
  console.log(`  products with no photo (image_url stays null): ${noPhoto.length}`)
  if (orphanFiles.length) {
    console.log(`\n⚠ ${orphanFiles.length} file(s) match no product — check the name:`)
    for (const f of orphanFiles) console.log(`   ${f}`)
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: nothing uploaded.")
    return
  }
  if (!matched.length) return

  const publicBase = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`
  let ok = 0
  const failures = []

  for (const m of matched) {
    const objectPath = `${slugify(m.product.name)}${m.ext}`
    const body = fs.readFileSync(path.join(folder, m.file))
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, body, {
        contentType: MIME[m.ext],
        upsert: true,
        cacheControl: "31536000, public",
      })
    if (upErr) {
      failures.push({ name: m.product.name, why: `upload: ${upErr.message}` })
      continue
    }
    const { error: dbErr } = await supabase
      .from("products")
      .update({ image_url: publicBase + objectPath })
      .eq("id", m.product.id)
    if (dbErr) {
      failures.push({ name: m.product.name, why: `image_url: ${dbErr.message}` })
      continue
    }
    ok++
  }

  console.log(`\n✓ uploaded + linked: ${ok}/${matched.length}`)
  if (failures.length) {
    console.error("\n✖ failures:")
    for (const f of failures) console.error(`   ${f.name} — ${f.why}`)
    process.exit(1)
  }
}

main().catch((e) => die(e?.message ?? String(e)))
