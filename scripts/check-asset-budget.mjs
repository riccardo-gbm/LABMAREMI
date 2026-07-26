/**
 * check-asset-budget.mjs — LABMAREMI performance guard
 *
 * Written BEFORE the asset fix, as the failing "test" for docs/PERF-PLAN.md.
 * This repo has no test runner, so the budget below is the executable
 * assertion: it failed against the 9.6 MB of base64-in-SVG photos that caused
 * LCP 3.94s on mobile, and must keep passing afterwards.
 *
 * Run:  node scripts/check-asset-budget.mjs
 * Exits non-zero on violation, so it can gate CI later.
 */

import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PUBLIC_DIR = path.join(ROOT, "public")
const DIST_ASSETS = path.join(ROOT, "dist", "assets")

/** Per-file ceiling in public/. Hero art renders at 70-120 CSS px. */
const MAX_FILE_KB = 150
/** Everything in public/ combined. */
const MAX_TOTAL_KB = 500

/**
 * Gzipped ceilings for every chunk on the eager critical path — the JS a
 * visitor downloads and parses before the landing route is interactive. The
 * old check measured only the entry chunk with 36 KB of headroom, which is
 * how the eagerly modulepreloaded motion chunk (~48 KB gzip) went unnoticed.
 * Budgets sit ~10% above 2026-07 measured sizes so drift fails loudly.
 */
const CHUNK_BUDGETS = [
  { pattern: /^index-.*\.js$/, label: "entry", maxKb: 90 }, // 83.4 measured
  { pattern: /^react-.*\.js$/, label: "react", maxKb: 25 }, // 17.3 measured
  { pattern: /^motion-.*\.js$/, label: "motion", maxKb: 55 }, // 48.1 measured
]
/** Sum of the chunks above. ~148.8 KB measured 2026-07. */
const MAX_CRITICAL_GZIP_KB = 155

const kb = (bytes) => bytes / 1024
const fmt = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 1 })

const failures = []
const notes = []

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

// ── 1. No oversized file in public/ ─────────────────────────────────────────
const publicFiles = walk(PUBLIC_DIR)
const oversized = publicFiles
  .map((f) => ({ file: path.relative(ROOT, f), bytes: fs.statSync(f).size }))
  .filter((f) => kb(f.bytes) > MAX_FILE_KB)
  .sort((a, b) => b.bytes - a.bytes)

if (oversized.length) {
  failures.push(
    `${oversized.length} file(s) in public/ exceed ${MAX_FILE_KB} KB:\n` +
      oversized.map((f) => `      ${f.file.padEnd(34)} ${fmt(kb(f.bytes)).padStart(9)} KB`).join("\n"),
  )
} else {
  notes.push(`no file in public/ over ${MAX_FILE_KB} KB (${publicFiles.length} files checked)`)
}

// ── 2. Total public/ weight ─────────────────────────────────────────────────
const totalBytes = publicFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0)
if (kb(totalBytes) > MAX_TOTAL_KB) {
  failures.push(`public/ totals ${fmt(kb(totalBytes))} KB, budget is ${MAX_TOTAL_KB} KB`)
} else {
  notes.push(`public/ totals ${fmt(kb(totalBytes))} KB (budget ${MAX_TOTAL_KB} KB)`)
}

// ── 3. No raster smuggled inside an SVG ─────────────────────────────────────
// A base64 payload in an .svg opts the asset out of Vercel image optimization,
// srcset and WebP/AVIF negotiation, and forces main-thread decode. It is also
// near-incompressible: gzip only recovers base64's 4:3 expansion (~75%).
const svgFiles = publicFiles.filter((f) => f.toLowerCase().endsWith(".svg"))
const embedded = svgFiles.filter((f) => fs.readFileSync(f, "utf8").includes("base64"))

if (embedded.length) {
  failures.push(
    `${embedded.length} of ${svgFiles.length} SVG(s) embed base64 raster data:\n` +
      embedded.map((f) => `      ${path.relative(ROOT, f)}`).join("\n"),
  )
} else {
  notes.push(`no base64 payloads in ${svgFiles.length} SVG file(s)`)
}

// ── 4. Eager critical-path JS, gzipped (only if dist/ was built) ────────────
if (fs.existsSync(DIST_ASSETS)) {
  const distFiles = fs.readdirSync(DIST_ASSETS)
  let criticalKb = 0

  for (const { pattern, label, maxKb } of CHUNK_BUDGETS) {
    const file = distFiles.filter((f) => pattern.test(f)).map((f) => path.join(DIST_ASSETS, f))[0]
    if (!file) {
      failures.push(`no dist/assets file matches ${pattern} — chunk layout changed, update CHUNK_BUDGETS`)
      continue
    }
    const gzipKb = kb(zlib.gzipSync(fs.readFileSync(file)).length)
    criticalKb += gzipKb
    if (gzipKb > maxKb) {
      failures.push(
        `${label} chunk ${path.basename(file)} is ${fmt(gzipKb)} KB gzipped, budget is ${maxKb} KB`,
      )
    } else {
      notes.push(`${label} chunk ${fmt(gzipKb)} KB gzipped (budget ${maxKb} KB)`)
    }
  }

  if (criticalKb > MAX_CRITICAL_GZIP_KB) {
    failures.push(
      `eager critical path totals ${fmt(criticalKb)} KB gzipped, budget is ${MAX_CRITICAL_GZIP_KB} KB`,
    )
  } else {
    notes.push(`eager critical path ${fmt(criticalKb)} KB gzipped (budget ${MAX_CRITICAL_GZIP_KB} KB)`)
  }
} else {
  notes.push("dist/ not built — skipped critical-path JS check (run `npm run build` first)")
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log("\nAsset budget — LABMAREMI\n" + "─".repeat(52))
for (const n of notes) console.log(`  ok    ${n}`)
for (const f of failures) console.log(`  FAIL  ${f}`)

if (failures.length) {
  console.log(`\n${failures.length} budget violation(s). See docs/PERF-PLAN.md.\n`)
  process.exit(1)
}
console.log("\nAll asset budgets pass.\n")
