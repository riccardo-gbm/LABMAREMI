/**
 * import-descriptions.mjs — long-form catalog copy
 *
 * Loads the "Descripción del Producto" / "Modo de Uso" copy from
 * description.txt (repo root) into products.description and
 * products.recommended_use.
 *
 * SAFE TO RE-RUN. Every write is an UPDATE matched on products.slug, so ids —
 * and any quote_request_items pointing at them — stay intact. Nothing is ever
 * inserted: a slug with no row simply updates nothing and gets reported.
 *
 * Matching is by SLUG, not name. Three products were renamed in Supabase after
 * the original import ("Jalador para Superficies" → "… - Cristales", and two
 * more), so slugify(heading) → products.slug is the only key that still lines
 * every entry up.
 *
 * Products that already carry hand-written long-form copy are LEFT ALONE — see
 * LONGFORM_MIN below. This script only fills in the one-line placeholders that
 * came from the original CSV seed.
 *
 * Run:  node scripts/import-descriptions.mjs
 *       node scripts/import-descriptions.mjs --dry-run    (report, write nothing)
 *
 * Credentials (from .env, which is gitignored). Writes need the `authenticated`
 * or service role — the publishable/anon key is read-only on products per the
 * P1 RLS policies. Use EITHER:
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
const SOURCE_PATH = path.join(ROOT, "description.txt")
const BACKUP_DIR = path.join(ROOT, "docs", "backups")
const DRY_RUN = process.argv.includes("--dry-run")

/**
 * Products deliberately excluded. "Jalador para Superficies" was split into
 * three DB rows (Cristales / Mesas / Pisos) that were written by hand and are
 * better than the single generic entry left in description.txt.
 */
const IGNORE_SLUGS = new Set(["jalador-para-superficies"])

/**
 * A product is "already written" if either field is longer than this. The
 * threshold sits in a wide gap in the real data: the longest CSV placeholder is
 * 100 chars, the shortest hand-written long-form field is 214.
 */
const LONGFORM_MIN = 180

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
// description.txt  (### N. Name / **Descripción del Producto**: / **Modo de Uso**:)
// ---------------------------------------------------------------------------
const DESCRIPTION_RE =
  /\*\*Descripción del Producto\*\*:\s*([\s\S]*?)\r?\n\*\*Modo de Uso\*\*:/
const USE_RE = /\*\*Modo de Uso\*\*:\s*([\s\S]*)$/

/** Normalise line endings and drop markdown emphasis (*Nota*, *squeegee*). */
function clean(text) {
  return text.replace(/\r\n/g, "\n").replace(/\*/g, "").trim()
}

/**
 * 114 of the 138 entries are numbered step lists, 24 are single prose
 * paragraphs. Steps get a blank line between them, matching how the rows that
 * were already filled in by hand are stored.
 */
function formatUse(raw) {
  const text = clean(raw).replace(/\n---\s*$/, "").trim()
  if (!/^1\.\s/.test(text)) return text
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n\n")
}

function parseSource(text) {
  const entries = []
  const problems = []

  const blocks = text.split(/^### /m).slice(1)
  for (const block of blocks) {
    const heading = block.split(/\r?\n/)[0].replace(/^\d+\.\s*/, "").trim()
    const where = heading || "(blank heading)"

    const descMatch = block.match(DESCRIPTION_RE)
    const useMatch = block.match(USE_RE)
    if (!descMatch) {
      problems.push({ where, why: "no **Descripción del Producto** block" })
      continue
    }
    if (!useMatch) {
      problems.push({ where, why: "no **Modo de Uso** block" })
      continue
    }

    const slug = slugify(heading)
    if (!slug) {
      problems.push({ where, why: "heading produces an empty slug" })
      continue
    }

    const description = clean(descMatch[1])
    const recommended_use = formatUse(useMatch[1])
    if (!description) {
      problems.push({ where, why: "empty description" })
      continue
    }
    if (!recommended_use) {
      problems.push({ where, why: "empty modo de uso" })
      continue
    }
    // A wrapped step would silently lose its blank-line separator, so make the
    // numbering account for every line before we agree to write it.
    if (/^1\.\s/.test(recommended_use)) {
      const lines = recommended_use.split("\n\n")
      const numbered = lines.filter((l) => /^\d+\.\s/.test(l)).length
      if (numbered !== lines.length) {
        problems.push({
          where,
          why: `numbered list has ${lines.length} lines but only ${numbered} are steps (a step wraps across lines)`,
        })
        continue
      }
    }

    entries.push({ heading, slug, description, recommended_use })
  }

  const seen = new Map()
  for (const e of entries) {
    if (seen.has(e.slug)) {
      problems.push({
        where: e.heading,
        why: `slug "${e.slug}" collides with "${seen.get(e.slug)}"`,
      })
    }
    seen.set(e.slug, e.heading)
  }

  return { entries, problems }
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

  // --- read + validate the source before touching the database --------------
  if (!fs.existsSync(SOURCE_PATH)) die(`Source not found: ${SOURCE_PATH}`)
  const { entries, problems } = parseSource(fs.readFileSync(SOURCE_PATH, "utf8"))

  if (problems.length) {
    console.error("\n✖ description.txt validation failed — nothing was written:\n")
    for (const p of problems) console.error(`   ${p.where} — ${p.why}`)
    process.exit(1)
  }
  if (!entries.length) die("description.txt parsed to zero entries.")

  const steps = entries.filter((e) => e.recommended_use.includes("\n\n")).length
  console.log(
    `✓ description.txt valid: ${entries.length} entries ` +
      `(${steps} numbered step lists, ${entries.length - steps} prose)`,
  )

  // --- authenticate ---------------------------------------------------------
  // Unlike import-catalog.mjs, a dry run still needs credentials: the whole
  // point of the report is comparing the file against what is live right now.
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

  // --- read the live rows ---------------------------------------------------
  const { data: rows, error: readErr } = await supabase
    .from("products")
    .select("id, slug, name, description, recommended_use")
  if (readErr) die(`could not read products: ${readErr.message}`)
  const bySlug = new Map(rows.filter((r) => r.slug).map((r) => [r.slug, r]))
  console.log(`✓ products table holds ${rows.length} rows`)

  // --- decide, per entry ----------------------------------------------------
  const toWrite = []
  const skipped = []
  for (const e of entries) {
    const row = bySlug.get(e.slug)
    if (!row) {
      skipped.push({ ...e, name: "—", why: "no product with this slug" })
      continue
    }
    if (IGNORE_SLUGS.has(e.slug)) {
      skipped.push({ ...e, name: row.name, why: "excluded by IGNORE_SLUGS" })
      continue
    }
    const dLen = (row.description || "").length
    const uLen = (row.recommended_use || "").length
    if (dLen > LONGFORM_MIN || uLen > LONGFORM_MIN) {
      skipped.push({
        ...e,
        name: row.name,
        why: `already written (description ${dLen}, uso ${uLen})`,
      })
      continue
    }
    toWrite.push({ ...e, id: row.id, name: row.name, before: row })
  }

  const untouched = rows.filter((r) => !entries.some((e) => e.slug === r.slug))

  console.log(`\n  update : ${toWrite.length}`)
  console.log(`  skip   : ${skipped.length}`)
  console.log(`  no entry in description.txt: ${untouched.length}`)

  console.log("\n  Skipping:")
  for (const s of skipped) console.log(`   ${s.name} — ${s.why}`)
  console.log("\n  No entry in description.txt (left as-is):")
  for (const r of untouched) console.log(`   ${r.name}`)

  console.log("\n  Updating:")
  for (const w of toWrite) {
    console.log(
      `   ${w.name} — description ${w.before.description.length}→${w.description.length}, ` +
        `uso ${w.before.recommended_use.length}→${w.recommended_use.length}`,
    )
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no writes performed.")
    return
  }
  if (!toWrite.length) {
    console.log("\n✓ nothing to do — every product is already written.")
    return
  }

  // --- back up what we are about to overwrite -------------------------------
  // products has no updated_at and there are no down migrations, so this file
  // is the only undo. Written before the first write, on purpose.
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = path.join(BACKUP_DIR, `products-copy-${stamp}.json`)
  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      toWrite.map((w) => ({
        slug: w.slug,
        name: w.name,
        description: w.before.description,
        recommended_use: w.before.recommended_use,
      })),
      null,
      2,
    ),
    "utf8",
  )
  console.log(`\n✓ backup of the previous copy: ${path.relative(ROOT, backupPath)}`)

  // --- write ----------------------------------------------------------------
  // One UPDATE per product: matching on slug means this can never insert, and
  // a per-row result tells us exactly which product failed.
  const failed = []
  let written = 0
  for (const w of toWrite) {
    const { data, error } = await supabase
      .from("products")
      .update({ description: w.description, recommended_use: w.recommended_use })
      .eq("slug", w.slug)
      .select("slug")
    if (error) {
      failed.push({ name: w.name, why: error.message })
    } else if (!data?.length) {
      failed.push({ name: w.name, why: "matched 0 rows" })
    } else {
      written++
    }
  }

  console.log(`\n✓ products updated: ${written}/${toWrite.length}`)

  if (failed.length) {
    console.error("\n✖ failed:")
    for (const f of failed) console.error(`   ${f.name}: ${f.why}`)
    process.exit(1)
  }
}

main().catch((e) => die(e?.message ?? String(e)))
