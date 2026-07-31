/**
 * normalize-product-photos.mjs — catalog product photos, PNG → WebP
 *
 * Canva cannot export WebP, so product photos arrive as 1200×1200 PNGs at
 * roughly 300 KB each. Across 138 products that is ~40 MB of catalog imagery.
 * This converts them to WebP (same pixels, ~80-90% smaller) before they go up
 * to Storage via upload-product-images.mjs.
 *
 * ── Why a separate output folder ────────────────────────────────────────────
 * upload-product-images.mjs indexes the folder into a Map keyed by
 * slugify(filename). If foo.png and foo.webp sat side by side they would
 * collide on the same key and whichever readdir() returned last would silently
 * win. So the originals are never touched and never mixed: converted files go
 * to a sibling folder, and that folder is what gets uploaded.
 *
 * Filenames are preserved as-is (only the extension changes) — the upload
 * script re-slugifies whatever it finds, so human-readable Canva names like
 * "Guantes de Nitrilo Azul.png" keep working.
 *
 * SAFE TO RE-RUN. A photo is reconverted only when the source is newer than
 * the existing output, so re-running after adding 10 more files converts only
 * those 10. Pass --force to redo everything.
 *
 * Run:
 *   node scripts/normalize-product-photos.mjs --dry-run
 *   node scripts/normalize-product-photos.mjs
 *   node scripts/normalize-product-photos.mjs ./some/folder --out ./other --quality 85
 *
 * Then upload the OUTPUT folder:
 *   node scripts/upload-product-images.mjs ./design-assets/product-photos-webp --dry-run
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { slugify } from "./slugify.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DEFAULT_IN = "./design-assets/product-photos"
const SOURCE_EXTS = [".png", ".jpg", ".jpeg"]
const EDGE = 1200
const DEFAULT_QUALITY = 82

const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run")
const FORCE = args.includes("--force")

function flagValue(name, fallback) {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  const v = args[i + 1]
  if (!v || v.startsWith("--")) die(`${name} needs a value`)
  return v
}

function die(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`
}

const positional = args.filter((a, i) => {
  if (a.startsWith("--")) return false
  // skip values consumed by --out / --quality
  const prev = args[i - 1]
  return prev !== "--out" && prev !== "--quality"
})

const inDir = path.resolve(ROOT, positional[0] ?? DEFAULT_IN)
const outDir = path.resolve(ROOT, flagValue("--out", `${inDir}-webp`))
const quality = Number(flagValue("--quality", DEFAULT_QUALITY))
if (!Number.isInteger(quality) || quality < 1 || quality > 100) {
  die(`--quality must be an integer 1-100 (got "${quality}")`)
}
if (outDir === inDir) die("--out must differ from the source folder (see the header comment)")

async function main() {
  if (!fs.existsSync(inDir)) die(`Source folder not found: ${inDir}`)

  const sources = fs
    .readdirSync(inDir)
    .filter((f) => SOURCE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort()

  if (!sources.length) die(`No ${SOURCE_EXTS.join(" / ")} files in ${inDir}`)

  // Two source files whose names slugify identically would collide during
  // upload, where the loser is dropped without a word. Catch it here instead.
  const bySlug = new Map()
  for (const f of sources) {
    const slug = slugify(path.basename(f, path.extname(f)))
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(f)
  }
  const collisions = [...bySlug.entries()].filter(([, files]) => files.length > 1)

  console.log(`\nSource: ${inDir}`)
  console.log(`Output: ${outDir}`)
  console.log(`  ${sources.length} image file(s) found, quality ${quality}\n`)

  if (collisions.length) {
    console.error("✖ These files resolve to the same product slug — rename them:")
    for (const [slug, files] of collisions) {
      console.error(`   ${slug}`)
      for (const f of files) console.error(`     ← ${f}`)
    }
    die("Refusing to convert while names collide.")
  }

  if (!DRY_RUN) fs.mkdirSync(outDir, { recursive: true })

  let converted = 0
  let skipped = 0
  let bytesIn = 0
  let bytesOut = 0
  const resized = []
  const failures = []

  for (const file of sources) {
    const srcPath = path.join(inDir, file)
    const outPath = path.join(outDir, `${path.basename(file, path.extname(file))}.webp`)

    const srcStat = fs.statSync(srcPath)
    if (!FORCE && fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= srcStat.mtimeMs) {
      skipped++
      continue
    }

    try {
      const meta = await sharp(srcPath).metadata()
      const isTarget = meta.width === EDGE && meta.height === EDGE
      if (!isTarget) {
        const how = meta.width === meta.height ? "rescaled" : "padded to square"
        resized.push(`${file} (${meta.width}×${meta.height}) — ${how}`)
      }

      let pipeline = sharp(srcPath)
      if (!isTarget) {
        // Pad rather than crop: a non-square source keeps the whole product,
        // and both catalog surfaces (4/3 card, 1/1 detail) object-cover a
        // square safely.
        pipeline = pipeline.resize(EDGE, EDGE, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
      }

      if (DRY_RUN) {
        bytesIn += srcStat.size
        converted++
        continue
      }

      const info = await pipeline.webp({ quality }).toFile(outPath)
      bytesIn += srcStat.size
      bytesOut += info.size
      converted++
      console.log(
        `  ✓ ${file.padEnd(52)} ${kb(srcStat.size).padStart(8)} → ${kb(info.size).padStart(8)}`
      )
    } catch (e) {
      failures.push({ file, why: e?.message ?? String(e) })
    }
  }

  if (resized.length) {
    console.log(`\n⚠ ${resized.length} file(s) were not ${EDGE}×${EDGE}:`)
    for (const r of resized) console.log(`   ${r}`)
  }

  if (DRY_RUN) {
    console.log(`\n--dry-run: ${converted} file(s) would be converted, ${skipped} already current.`)
    console.log("Nothing written.")
    return
  }

  console.log(`\n✓ converted: ${converted}   skipped (already current): ${skipped}`)
  if (converted) {
    const saved = bytesIn - bytesOut
    const pct = bytesIn ? Math.round((saved / bytesIn) * 100) : 0
    console.log(`  ${kb(bytesIn)} → ${kb(bytesOut)}  (saved ${kb(saved)}, ${pct}%)`)
  }

  if (failures.length) {
    console.error("\n✖ failures:")
    for (const f of failures) console.error(`   ${f.file} — ${f.why}`)
    process.exit(1)
  }

  const rel = path.relative(ROOT, outDir).split(path.sep).join("/")
  const hint = rel && !rel.startsWith("..") ? `./${rel}` : outDir
  console.log(`\nNext:\n  node scripts/upload-product-images.mjs ${hint} --dry-run\n`)
}

main().catch((e) => die(e?.message ?? String(e)))
