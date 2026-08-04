/**
 * test-quote-notification.mjs — LABMAREMI Phase 2, P7 verification
 *
 * Proves the quote-notification Edge Function (migration 0007) is deployed,
 * correctly gated, and actually delivering:
 *
 *   1. wrong shared secret            → 401  (the trigger's secret is the only key)
 *   2. no secret at all               → 401  (verify_jwt=false doesn't mean open)
 *   3. correct secret, bad uuid       → 400  (input validated before any DB call)
 *   4. correct secret, unknown uuid   → 404
 *   5. newest real lead, force:true   → 200 sent — SENDS A REAL EMAIL
 *   6. same lead again, no force      → 200 skipped (idempotent)
 *   7. notified_at is stamped in the database
 *
 * Step 5 mails every address in QUOTE_NOTIFICATION_RECIPIENTS. Pass --dry-run to
 * stop after step 4 and check the wiring without bothering anyone.
 *
 * Needs in .env:  VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                 QUOTE_NOTIFICATION_SECRET (the same value stored in
 *                 private.notification_config.shared_secret)
 *
 * Run:  node scripts/test-quote-notification.mjs [--dry-run]
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DRY_RUN = process.argv.includes("--dry-run")

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
  console.error(`✗ ${msg}`)
  process.exit(1)
}

let passed = 0
let failed = 0
function check(name, ok, detail = "") {
  if (ok) {
    passed++
    console.log(`✓ PASS  ${name}${detail ? ` — ${detail}` : ""}`)
  } else {
    failed++
    console.log(`✗ FAIL  ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const secret = env.QUOTE_NOTIFICATION_SECRET

if (!url) die("VITE_SUPABASE_URL missing from .env")
if (!serviceKey) die("SUPABASE_SERVICE_ROLE_KEY missing from .env — needed to read leads and verify notified_at.")
if (!secret) die("QUOTE_NOTIFICATION_SECRET missing from .env — must match private.notification_config.shared_secret.")

const FN_URL = `${url}/functions/v1/quote-notification`
const REST = `${url}/rest/v1/quote_requests`
const restHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

/** Returns { status, body } — body parsed as JSON when possible, else raw text. */
async function invoke(headers, payload) {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status, body }
}

const NIL_UUID = "00000000-0000-0000-0000-000000000000"

console.log(`\nFunction: ${FN_URL}${DRY_RUN ? "  (dry run — no email will be sent)" : ""}\n`)

// 1. A wrong secret is rejected.
const wrong = await invoke({ "x-webhook-secret": "definitely-not-the-secret" }, {
  quote_request_id: NIL_UUID,
})
check("wrong shared secret is rejected", wrong.status === 401, `HTTP ${wrong.status}`)

// 2. No secret at all is rejected. verify_jwt=false removes the platform gate,
//    so this assertion is the one standing between the function and the internet.
const none = await invoke({}, { quote_request_id: NIL_UUID })
check("missing shared secret is rejected", none.status === 401, `HTTP ${none.status}`)

const auth = { "x-webhook-secret": secret }

// 3. Input is validated before anything touches the database.
const badId = await invoke(auth, { quote_request_id: "not-a-uuid" })
check("malformed quote_request_id is rejected", badId.status === 400, `HTTP ${badId.status}`)

// 4. A well-formed id that doesn't exist is a clean 404, not a crash.
const missing = await invoke(auth, { quote_request_id: NIL_UUID })
check("unknown quote_request_id returns 404", missing.status === 404, `HTTP ${missing.status}`)

if (wrong.status === 404 && none.status === 404) {
  console.log(
    "\n! Every call 404s — the function is probably not deployed.\n" +
      "  Run: npx supabase functions deploy quote-notification\n",
  )
}

if (DRY_RUN) {
  console.log("\nDry run: stopping before the send. Steps 5-7 skipped.")
  console.log(`\n${passed} passed, ${failed} failed.\n`)
  process.exit(failed === 0 ? 0 : 1)
}

// 5. Send for real, against the newest genuine lead.
const listQuery = new URLSearchParams({
  select: "id,company_name,created_at",
  company_name: "not.like.__RLS_TEST__*", // the trigger skips these, so they prove nothing
  order: "created_at.desc",
  limit: "1",
})
const listRes = await fetch(`${REST}?${listQuery}`, { headers: restHeaders })
if (!listRes.ok) die(`Could not read quote_requests (HTTP ${listRes.status}): ${await listRes.text()}`)
const [lead] = await listRes.json()

if (!lead) {
  console.log(
    "\n! No lead to test with. Submit one through /cotizar first, then re-run.\n",
  )
  console.log(`\n${passed} passed, ${failed} failed.\n`)
  process.exit(failed === 0 ? 0 : 1)
}

console.log(`\n  Using lead: ${lead.company_name} (${lead.id})\n`)

const sent = await invoke(auth, { quote_request_id: lead.id, force: true })
check(
  "real lead is emailed",
  sent.status === 200 && sent.body?.sent === true,
  sent.status === 200
    ? `${sent.body?.recipients} recipient(s), stamped: ${sent.body?.stamped}`
    : `HTTP ${sent.status} — ${JSON.stringify(sent.body)}`,
)

// 6. Without force, the same lead is skipped — pg_net retries and manual re-runs
//    must not mail the same lead twice.
const repeat = await invoke(auth, { quote_request_id: lead.id })
check(
  "second call is skipped (idempotent)",
  repeat.status === 200 && typeof repeat.body?.skipped === "string",
  repeat.status === 200 ? String(repeat.body?.skipped) : `HTTP ${repeat.status}`,
)

// 7. The delivery record is what makes a silent failure visible later.
const stampQuery = new URLSearchParams({ id: `eq.${lead.id}`, select: "notified_at" })
const stampRes = await fetch(`${REST}?${stampQuery}`, { headers: restHeaders })
const [stamped] = stampRes.ok ? await stampRes.json() : [null]
check(
  "notified_at is stamped in the database",
  Boolean(stamped?.notified_at),
  stamped?.notified_at ?? "still null",
)

console.log(`\n${passed} passed, ${failed} failed.`)
console.log("Now check both admin inboxes — including the Hotmail junk folder.\n")
process.exit(failed === 0 ? 0 : 1)
