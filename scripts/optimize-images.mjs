/**
 * optimize-images.mjs — LABMAREMI performance fix (docs/PERF-PLAN.md, P0-a)
 *
 * Converts the base64-in-SVG assets in public/ to real WebP rasters sized to
 * their actual display size.
 *
 * ── Why these files needed a script and not just a re-export ────────────────
 * Each "SVG" is a vector-export wrapper around TWO embedded PNGs:
 *
 *   <mask id="…">  <g filter="…luminance…"> <image/> </g> </mask>   ← alpha
 *   <g mask="url(#…)">                      <image/>       </g>     ← colour
 *
 * Transparency was split out into a separate greyscale luminance mask. Reading
 * only the colour image loses the cut-out and yields a photo on a black or
 * white box, so the two payloads have to be recombined: colour RGB + alpha
 * taken from the mask's luminance. That's what buildAlpha() does below.
 *
 * SAFE TO RE-RUN. Reads from design-assets/originals/ once it exists (created
 * on the first run by archiving public/*.svg), so re-running never re-processes
 * already-optimized output and never loses the source art.
 *
 * Run:  node scripts/optimize-images.mjs --inspect     (report only, no writes)
 *       node scripts/optimize-images.mjs --dry-run     (report planned sizes)
 *       node scripts/optimize-images.mjs               (write WebP + archive)
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PUBLIC_DIR = path.join(ROOT, "public")
const ARCHIVE_DIR = path.join(ROOT, "design-assets", "originals")

const args = process.argv.slice(2)
const INSPECT = args.includes("--inspect")
const DRY_RUN = args.includes("--dry-run") || INSPECT

/**
 * Target width in CSS pixels x2 for retina.
 * Hero clouds render at 70-120 px (see HeroFloatingCanvas images[]), the header
 * logo at 60 px (h-15 w-15). 240 / 128 covers 2x DPR with headroom.
 */
const TARGETS = {
  logo1: 192, // Header h-15 (60px) and Footer h-20 (80px) → 192 covers 2x DPR
  default: 240, // hero clouds, 70-120px slots
}

/** logo2 exists only to source the favicon — no .webp variant is referenced. */
const FAVICON_ONLY = new Set(["logo2"])

const kb = (n) => (n / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })

/** Pull every base64 payload out of an SVG, in document order. */
function extractPayloads(svg) {
  const re = /(?:xlink:)?href="data:image\/([a-zA-Z+]+);base64,([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(svg)) !== null) {
    out.push({ format: m[1], buffer: Buffer.from(m[2], "base64") })
  }
  return out
}

/**
 * Recombine colour + luminance mask into a single RGBA image at `targetWidth`.
 * The mask is greyscale: white = opaque, black = transparent.
 *
 * Downscale BOTH layers first, then join. Joining at the source resolution
 * (7071x7071 for the logos) allocates a ~50 MB raw alpha buffer and leaves the
 * encoder with resampled alpha noise — it produced an 87.7 KB logo where
 * resize-first produces 0.9 KB for the same visual result.
 */
async function buildAlpha(colour, mask, targetWidth) {
  // Both layers must be RAW and identically sized for joinChannel to attach the
  // mask as alpha. Going through an encoded intermediate (PNG buffer +
  // ensureAlpha/removeAlpha) silently produced fully-opaque output — every
  // logo rendered on a black box.
  const c = await sharp(colour)
    .resize(targetWidth, targetWidth, { fit: "inside", withoutEnlargement: true, kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = c.info

  const a = await sharp(mask)
    .resize(width, height, { fit: "fill", kernel: "lanczos3" })
    .greyscale()
    .raw()
    .toBuffer()

  return sharp(c.data, { raw: { width, height, channels: 3 } }).joinChannel(a, {
    raw: { width, height, channels: 1 },
  })
}

async function main() {
  // First run archives the originals; later runs read from the archive so the
  // source art survives and the conversion stays idempotent.
  const archiveExists = fs.existsSync(ARCHIVE_DIR)
  const sourceDir = archiveExists ? ARCHIVE_DIR : PUBLIC_DIR

  const sources = fs
    .readdirSync(sourceDir)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .sort()

  if (!sources.length) {
    console.log(`No .svg files found in ${path.relative(ROOT, sourceDir)}. Nothing to do.`)
    return
  }

  console.log(`\nSource: ${path.relative(ROOT, sourceDir)}  (${sources.length} files)`)
  console.log("─".repeat(78))

  let beforeTotal = 0
  let afterTotal = 0
  const results = []

  for (const name of sources) {
    const src = path.join(sourceDir, name)
    const svg = fs.readFileSync(src, "utf8")
    const before = fs.statSync(src).size
    beforeTotal += before

    const payloads = extractPayloads(svg)
    if (payloads.length === 0) {
      console.log(`  skip  ${name} — no embedded raster (already a real vector)`)
      continue
    }

    const stem = path.basename(name, ".svg")

    // Archive BEFORE any skip. An earlier version continued past this point for
    // favicon-only sources, so logo2.svg was never copied to the archive and
    // then got deleted from public/ at the end of the run — the source art only
    // survived because git still had it.
    if (!DRY_RUN) {
      fs.mkdirSync(ARCHIVE_DIR, { recursive: true })
      const archived = path.join(ARCHIVE_DIR, name)
      if (!fs.existsSync(archived)) fs.copyFileSync(src, archived)
    }

    if (FAVICON_ONLY.has(stem)) continue // handled by the favicon block below
    const targetWidth = TARGETS[stem] ?? TARGETS.default

    // Document order: the mask sits inside <mask>, which the exporter emits
    // before the colour <image> it applies to. Fall back to single-payload
    // handling if a file doesn't follow the pattern.
    let pipeline
    if (payloads.length >= 2) {
      const [mask, colour] = payloads
      pipeline = await buildAlpha(colour.buffer, mask.buffer, targetWidth)
    } else {
      pipeline = sharp(payloads[0].buffer).resize(targetWidth, targetWidth, {
        fit: "inside",
        withoutEnlargement: true,
        kernel: "lanczos3",
      })
    }

    const meta = await sharp(payloads[payloads.length - 1].buffer).metadata()

    const webp = await pipeline.webp({ quality: 82, effort: 6, alphaQuality: 90 }).toBuffer()

    afterTotal += webp.length
    results.push({ name, stem, before, after: webp.length, source: `${meta.width}x${meta.height}`, targetWidth })

    if (!DRY_RUN) {
      fs.writeFileSync(path.join(PUBLIC_DIR, `${stem}.webp`), webp)
    }
  }

  for (const r of results) {
    const pct = ((1 - r.after / r.before) * 100).toFixed(1)
    console.log(
      `  ${r.stem.padEnd(9)} ${r.source.padStart(11)} → ${String(r.targetWidth).padStart(4)}px  ` +
        `${kb(r.before).padStart(9)} KB → ${kb(r.after).padStart(7)} KB  (-${pct}%)`,
    )
  }

  // Favicon set from the wordmark — logo2.svg was a 694 KB 1800x1800 file
  // serving a 16-32px slot (index.html).
  if (!DRY_RUN) {
    const faviconSrc = path.join(sourceDir, "logo2.svg")
    if (fs.existsSync(faviconSrc)) {
      const payloads = extractPayloads(fs.readFileSync(faviconSrc, "utf8"))
      const build = async (size) =>
        payloads.length >= 2
          ? await buildAlpha(payloads[1].buffer, payloads[0].buffer, size)
          : sharp(payloads[0].buffer).resize(size, size, { fit: "inside" })

      const png = await (await build(180)).png({ compressionLevel: 9 }).toBuffer()
      fs.writeFileSync(path.join(PUBLIC_DIR, "apple-touch-icon.png"), png)

      const fav = await (await build(32)).png({ compressionLevel: 9 }).toBuffer()
      fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32.png"), fav)

      console.log(
        `  favicon   →  32px  ${kb(fav.length).padStart(7)} KB   ` +
          `apple-touch → 180px  ${kb(png.length)} KB`,
      )
      afterTotal += png.length + fav.length
    }

    // Remove the originals from public/ — they are archived and no longer
    // referenced. Leaving them means Vercel still ships 9.6 MB.
    for (const name of sources) {
      const inPublic = path.join(PUBLIC_DIR, name)
      if (fs.existsSync(inPublic)) fs.unlinkSync(inPublic)
    }
  }

  console.log("─".repeat(78))
  console.log(
    `  TOTAL     ${kb(beforeTotal).padStart(26)} KB → ${kb(afterTotal).padStart(7)} KB  ` +
      `(-${((1 - afterTotal / beforeTotal) * 100).toFixed(1)}%)`,
  )
  if (DRY_RUN) console.log("\n  (dry run — nothing written)")
  else console.log(`\n  Originals archived to ${path.relative(ROOT, ARCHIVE_DIR)}`)
  console.log()
}

main().catch((err) => {
  console.error(`\noptimize-images failed: ${err.message}\n`)
  process.exit(1)
})
