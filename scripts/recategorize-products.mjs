/**
 * recategorize-products.mjs — file every product under the category the price
 * list puts it in.
 *
 * Source of authority: "LISTA PRECIOS - LABMAREMI.xlsx" (repo root). Its sheets
 * are market lines, not categories, and inside MATERIALES / RESTAURANTES the
 * section headers in column B carry the real grouping. The 11 live categories
 * were derived from those sections:
 *
 *   FARMA                                   -> salud
 *   IND, ALIM.                              -> limpieza-industrial
 *   INST., OTROS                            -> desinfectantes
 *   LAVANDERIA                              -> limpieza-industrial  (owner's call)
 *   MATERIALES / LIMPIONES-PAÑOS, ESCOBAS,
 *     TRAPEADORES, INSUMOS Y EQUIPOS        -> materiales-limpieza
 *   MATERIALES / PAPEL - TOALLAS            -> papel
 *   MATERIALES / FUNDAS-EMPAQUES "DESECHOS" -> fundas-basura
 *   MATERIALES / FUNDAS-EMPAQUES (rest),
 *     MATERIALES / EMPAQUES                 -> empaques
 *   MATERIALES / EQUIPO DE PROTECCION       -> equipos-proteccion
 *   MATERIALES / PLASTICOS INDUSTRIALES,
 *     RESTAURANTES / PARA LA INDUSTRIA      -> insumos-bano  (slug predates the rename)
 *   RESTAURANTES / ECOLOGICOS, DESECHABLES  -> desechables
 *
 * When a product appears on more than one sheet: FARMA wins, then INST., then
 * ALIM./IND.
 *
 * MOVES below is an explicit, hand-reviewed table rather than a fuzzy match run
 * at import time. A scored matcher generated the first draft, but it produced
 * real false positives ("Escobillón PVC Industrial" scoring against "PROTECCION
 * CORPORAL PVC" on the token PVC), so every row was checked by hand and the
 * verdict frozen here where it can be reviewed in a diff.
 *
 * SAFE TO RE-RUN. Each write is an UPDATE matched on slug, so ids — and any
 * quote_request_items pointing at them — survive, and a slug that no longer
 * exists updates nothing instead of inserting.
 *
 * Run:  node scripts/recategorize-products.mjs
 *       node scripts/recategorize-products.mjs --dry-run    (report, write nothing)
 *
 * Credentials: SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL + ADMIN_PASSWORD.
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BACKUP_DIR = path.join(ROOT, "docs", "backups")
const DRY_RUN = process.argv.includes("--dry-run")

/** product slug -> category slug. Comment names the Excel evidence. */
const MOVES = {
  // ---- FARMA: the hospital line, scattered across two chemical categories ----
  "lidex-alcohol-antiseptico": "salud", // FARMA: ALCOHOL ANTISEPTICO 70% REG SANT 2529
  "lidex-clorhexidina-hidroalcoholica-2": "salud", // FARMA: clorhexidina line (no separate row)
  "lidex-clorhexidina-solucion-acuosa-2": "salud", // FARMA: CLOREHEXIDINA SOLUCION ACUOSA 2%
  "lidex-clorhexidina-jabonosa-2": "salud", // FARMA: CLOREHEXIDINA JABONOSA 2%
  "lidex-clorhexidina-jabonosa-4": "salud", // FARMA: CLOREHEXIDINA JABONOSA 4%
  "lidex-yodopovidona-10": "salud", // FARMA: YODOPOVIDONA 10%
  "lidex-yodopovidona-jabonosa-7-5": "salud", // FARMA: YODOPOVIDONA JABONOSA 7.5%
  "lidex-opa-solucion-de-ortoftalaldehido": "salud", // FARMA: DESINFECTANTE ORTOFTALALDEHIDO
  "lidex-detergente-enzimatico": "salud", // FARMA: DETERGENTE MULTIENZIMÁTICO INSTRUMENTAL
  "suero-fisiologico-0-9-lira": "salud", // FARMA: SOLUCIONES FISIOLOGICO 0.9%

  // ---- hand hygiene ----
  "jabon-liquido-antibacterial": "higiene-personal", // ALIM.: JABON ANTIBACTERIAL DE MANOS NEUTRO
  "fcf-cremix-desengrasante-de-manos-ecologico": "higiene-personal", // IND: FCF CREMIX, desengrasante de manos

  // ---- degreasers and industrial chemistry mis-filed under "empáques" ----
  "blem-d-305-desengrasante-industrial": "limpieza-industrial", // IND: BLEM D-305
  "deterclean-500-desengrasante-industria-alimenticia": "limpieza-industrial", // ALIM.: BLEM DETERCLEAN-500 A
  "detergente-desengrasante-industrial": "limpieza-industrial", // IND: FCF PROSOLVEX BIO
  "zakka-desengrasante-multiuso": "limpieza-industrial", // JUDGEMENT CALL — ZAKKA appears in ALIM. and INST. but only as ácido peracético / cloro
  "blem-sanit-30-acido-peracetico": "limpieza-industrial", // ALIM.: DESINFECTANTE ACIDO PERACETICO ZAKKA
  "cloro-en-pastillas-tricloro-al-90": "limpieza-industrial", // ALIM.: PASTILLAS DE CLORO
  "cloro-granulado-68": "limpieza-industrial", // ALIM.: BLEM HIPOCLORITO DE CALCIO 70%

  // ---- KRIK / institutional chemistry ----
  "krik-limpia-hornos-h20-desengrasante": "desinfectantes", // INST. beats ALIM.: KRIK LIMPIA HORNOS H-20
  "krik-lustra-muebles-liquido": "desinfectantes", // OTROS: KRIK LUSTRA MUEBLES
  "krik-pisos-flotantes": "desinfectantes", // INST.: KRIK PISOS FLOTANTES
  "limpia-vidrios": "desinfectantes", // INST.: KRIK LIMPIAVIDRIOS
  "cera-liquida-para-todo-tipo-de-pisos": "desinfectantes", // INST.: CERA POLWAX / ENCERA DE MADERA
  "lavador-100-eliminador-de-sarro": "desinfectantes", // INST.: LAVADOR 100 desincrustante

  // ---- cleaning cloths are not "papel para aseo personal" ----
  "limpion-industrial-natural": "materiales-limpieza", // MATERIALES/LIMPIONES-PAÑOS: LIMPION INDUSTRIAL NATURAL
  "limpion-panos-reusables-wypall-x-70": "materiales-limpieza", // ...: PAÑOS REUSABLES WYPALL X-70
  "limpion-panos-reusables-wypall-azul-x-75": "materiales-limpieza", // ...: PAÑOS REUSABLES WYPALL X-75
  "limpion-panos-reusables-wypall-x-80": "materiales-limpieza", // ...: PAÑOS REUSABLES WYPALL X-80
  "panos-rollo-duramax": "materiales-limpieza", // ...: PAÑOS REUSABLES DURAMAX

  // ---- equipment and tools filed as chemicals ----
  "carro-de-limpieza": "materiales-limpieza", // MATERIALES/INSUMOS Y EQUIPOS: EQUIPOS PARA LIMPIEZA
  "carro-de-limpieza-50lt-con-doble-cubo": "materiales-limpieza", // idem
  "carro-de-limpieza-conserje": "materiales-limpieza", // idem
  "fibra-industrial-rollo-7mt": "materiales-limpieza", // MATERIALES/LIMPIONES-PAÑOS: FIBRA INDUSTRIAL ROLLO 7MT
  "cepillo-sanitario-con-base": "materiales-limpieza", // MATERIALES/INSUMOS Y EQUIPOS: CEPILLOS INSTITUCIONALES

  // ---- the actual plastics ----
  "gaveta-robusta-kalada": "insumos-bano", // MATERIALES/PLASTICOS INDUSTRIALES: GAVETAS CALADAS
  "gaveta-robusta-cerrada": "insumos-bano", // ...: GAVETAS CERRADAS ROBUSTA
  "gaveta-30-practica": "insumos-bano", // ...: GAVETA PRACTICA 30
  "gaveta-21-robusta-ecologica": "insumos-bano", // ...: GAVETAS CALADAS
  "gaveta-industrial-conica": "insumos-bano", // ...: GAVETAS CONICA Y AGRICOLA
  "gaveta-rural-agricola": "insumos-bano", // ...: GAVETAS CONICA Y AGRICOLA
  "gaveta-economica": "insumos-bano", // ...: GAVETAS (RESTAURANTES/PARA LA INDUSTRIA)
  "tacho-de-reciclaje-con-tapa-y-ruedas": "insumos-bano", // ...: TACHOS PARA RECICLAJE C/RUEDAS
  "tacho-reciclaje-capo-50lt": "insumos-bano", // ...: TACHO VAIVEN 50LT
  "tacho-reciclaje-con-pedal": "insumos-bano", // ...: TACHO C/PEDAL

  // ---- packaging film and bags ----
  "vinipel-film-alimenticio-rollo": "empaques", // MATERIALES/EMPAQUES: FILM ALIMENTICIO ROLLO
  "strech-film": "empaques", // MATERIALES/EMPAQUES: STRECH FILM
  "papel-aluminio": "empaques", // MATERIALES/EMPAQUES: PAPEL ALUMINIO ROLLO
  "papel-encerado-hornear-parafinado": "empaques", // MATERIALES/EMPAQUES: PAPEL ENCERADO
  "cinta-para-embalaje": "empaques", // MATERIALES/EMPAQUES: CINTA PARA EMBALAJE
  "funda-en-rollo-precortada-de-polietileno-alta-densidad": "empaques", // FUNDAS-EMPAQUES: FUNDA EN ROLLO PRECORTADA (not a bin liner)
  "fundas-plasticas-tipo-camiseta": "empaques", // FUNDAS-EMPAQUES: FUNDA PLASTICA TIPO CAMISETA
}

/**
 * Checked against the price list and deliberately NOT moved. Several are
 * false positives the scored matcher produced; keeping them here stops the
 * next person from "fixing" them again.
 */
const KEPT = {
  "fibra-esponja-tipo-almohada": "a sponge, not FUNDA PLASTICA TIPO CAMISETA — matched on the word tipo",
  "cofias-desechables-b-c": "EPP, not CUBIERTOS DESECHABLES — matched on desechable",
  "escobillon-pvc-industrial-50cm": "a broom, not PROTECCION CORPORAL PVC — matched on PVC",
  "jalador-pisos": "a floor squeegee, not the LAVADOR H-30 chemical — matched on lavador",
  "balde-de-limpieza-12lt-con-escurridor": "mop bucket with wringer, belongs with the mopping tools rather than BALDES INDUSTRIALES",
  "recogedor-de-basura-profesional": "no price-list row; sits correctly with the other recogedores",
  "zuecos-antideslizante": "no price-list row; sits correctly under EPP",
  "blanqueador-oxigenado-industrial": "LAVANDERIA — owner chose to keep the laundry line in Químicos Industriales",
  "detergente-liquido": "LAVANDERIA — idem",
  "detergente-en-polvo-institucional": "LAVANDERIA — idem",
  "suavizante-textil": "LAVANDERIA — idem",
  "cloro-liquido-institucional": "INST.: ISO CLORO LIQUIDO — already correct",
  "agua-oxigenada-10v": "FARMA: AGUA OXIGENADA 10V — already correct",
  "lidex-alcohol-gel": "FARMA lists it, but the owner chose to keep hand gel in Químicos de Aseo Personal",
  "ambiental-liquido-para-areas-cerradas": "INST.: AMBIENTAL LIQUIDO VARIOS AROMAS — already correct",
}

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

function die(msg) {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
async function main() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  if (!url) die("VITE_SUPABASE_URL missing from .env")

  let supabase
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    console.log("✓ authenticated with the service role key")
  } else if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    supabase = createClient(url, env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } })
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

  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug, name")
  if (catErr) die(`could not read categories: ${catErr.message}`)
  const catBySlug = new Map(cats.map((c) => [c.slug, c]))

  const { data: rows, error: readErr } = await supabase
    .from("products")
    .select("id, slug, name, category_id")
  if (readErr) die(`could not read products: ${readErr.message}`)
  const bySlug = new Map(rows.filter((r) => r.slug).map((r) => [r.slug, r]))
  const catById = new Map(cats.map((c) => [c.id, c]))
  console.log(`✓ ${rows.length} products, ${cats.length} categories`)

  // --- validate the table before touching anything --------------------------
  const problems = []
  for (const [slug, target] of Object.entries(MOVES)) {
    if (!bySlug.has(slug)) problems.push(`${slug} — no product with this slug`)
    if (!catBySlug.has(target)) problems.push(`${slug} — unknown category "${target}"`)
  }
  for (const slug of Object.keys(KEPT)) {
    if (!bySlug.has(slug)) problems.push(`${slug} (KEPT) — no product with this slug`)
    if (MOVES[slug]) problems.push(`${slug} — listed in both MOVES and KEPT`)
  }
  if (problems.length) {
    console.error("\n✖ mapping validation failed — nothing was written:\n")
    for (const p of problems) console.error(`   ${p}`)
    process.exit(1)
  }

  // --- decide ---------------------------------------------------------------
  const toWrite = []
  const noop = []
  for (const [slug, target] of Object.entries(MOVES)) {
    const row = bySlug.get(slug)
    const from = catById.get(row.category_id)
    if (from?.slug === target) { noop.push(row.name); continue }
    toWrite.push({ ...row, from, to: catBySlug.get(target) })
  }

  const byMove = new Map()
  for (const w of toWrite) {
    const key = `${w.from?.name ?? "(none)"}  ->  ${w.to.name}`
    if (!byMove.has(key)) byMove.set(key, [])
    byMove.get(key).push(w)
  }
  console.log(`\n  move : ${toWrite.length}`)
  console.log(`  already correct : ${noop.length}`)
  console.log(`  reviewed, left alone : ${Object.keys(KEPT).length}`)
  for (const [key, list] of [...byMove].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${key}   (${list.length})`)
    for (const w of list) console.log(`   ${w.name}`)
  }

  // --- projected counts -----------------------------------------------------
  const after = new Map(cats.map((c) => [c.slug, 0]))
  for (const r of rows) {
    const moved = MOVES[r.slug]
    const slug = moved ?? catById.get(r.category_id)?.slug
    if (slug) after.set(slug, after.get(slug) + 1)
  }
  console.log("\n  Per category after this change:")
  for (const [slug, n] of [...after].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(n).padStart(4)}  ${catBySlug.get(slug).name}${n === 0 ? "   ← EMPTY" : ""}`)
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no writes performed.")
    return
  }
  if (!toWrite.length) {
    console.log("\n✓ nothing to do — every product is already filed correctly.")
    return
  }

  // --- back up the previous filing ------------------------------------------
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = path.join(BACKUP_DIR, `product-categories-${stamp}.json`)
  fs.writeFileSync(
    backupPath,
    JSON.stringify(
      rows.map((r) => ({ slug: r.slug, name: r.name, category_id: r.category_id })),
      null,
      2,
    ),
    "utf8",
  )
  console.log(`\n✓ backup of the previous filing: ${path.relative(ROOT, backupPath)}`)

  // --- write ----------------------------------------------------------------
  const failed = []
  let written = 0
  for (const w of toWrite) {
    const { data, error } = await supabase
      .from("products")
      .update({ category_id: w.to.id })
      .eq("slug", w.slug)
      .select("slug")
    if (error) failed.push({ name: w.name, why: error.message })
    else if (!data?.length) failed.push({ name: w.name, why: "matched 0 rows" })
    else written++
  }

  console.log(`\n✓ products recategorized: ${written}/${toWrite.length}`)
  if (failed.length) {
    console.error("\n✖ failed:")
    for (const f of failed) console.error(`   ${f.name}: ${f.why}`)
    process.exit(1)
  }
}

main().catch((e) => die(e?.message ?? String(e)))
