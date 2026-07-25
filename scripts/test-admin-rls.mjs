/**
 * test-admin-rls.mjs — LABMAREMI Phase 2 security proof for migration 0006
 *
 * Companion to test-anon-rls.mjs. That one proves a logged-OUT visitor can't
 * reach the data; this one proves a logged-IN stranger can't either — the hole
 * 0006 closes.
 *
 * It asserts:
 *   1. the real admin passes is_admin() and can read leads
 *   2. a freshly created ordinary account fails is_admin()
 *   3. that account reads ZERO leads, ZERO quote items, ZERO customers
 *   4. that account cannot write the catalog (insert a product)
 *
 * Test 2-4 need a throwaway account. The script creates one with the service
 * role key and DELETES it again at the end — it only ever touches the user id
 * it just created. Nothing else in the project is modified.
 *
 * Requires in .env:  VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY,
 *                    SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Run:  node scripts/test-admin-rls.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

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
const anonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !anonKey) die("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env")

console.log(`\nAdmin RLS check against ${url}\n`)

// ---------------------------------------------------------------------------
// 1. The real admin still works. A fix that locks the owner out is not a fix.
// ---------------------------------------------------------------------------
if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
  const admin = createClient(url, anonKey, { auth: { persistSession: false } })
  const { error: signInErr } = await admin.auth.signInWithPassword({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  })
  if (signInErr) {
    check("admin can sign in", false, signInErr.message)
  } else {
    const { data: isAdmin, error: rpcErr } = await admin.rpc("is_admin")
    check("admin passes is_admin()", !rpcErr && isAdmin === true, rpcErr ? rpcErr.message : `is_admin=${isAdmin}`)

    const leads = await admin.from("quote_requests").select("id")
    check(
      "admin can read quote_requests",
      !leads.error,
      leads.error ? leads.error.message : `rows visible: ${leads.data?.length ?? 0}`,
    )
    await admin.auth.signOut()
  }
} else {
  console.log("… skipped admin checks (set ADMIN_EMAIL / ADMIN_PASSWORD in .env to run them)\n")
}

// ---------------------------------------------------------------------------
// 2-4. A signed-in stranger. Before 0006 this account had full admin rights.
// ---------------------------------------------------------------------------
if (!serviceKey) {
  console.log("… skipped stranger checks (set SUPABASE_SERVICE_ROLE_KEY in .env to run them)")
} else {
  const service = createClient(url, serviceKey, { auth: { persistSession: false } })
  const email = `rls-stranger-${Date.now()}@example.com`
  const password = `Str4nger!${Date.now()}`

  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the mailbox round-trip; same rights either way
  })
  if (createErr || !created?.user) die(`Could not create the throwaway account: ${createErr?.message}`)
  const strangerId = created.user.id

  try {
    const stranger = createClient(url, anonKey, { auth: { persistSession: false } })
    const { error: signInErr } = await stranger.auth.signInWithPassword({ email, password })
    if (signInErr) die(`Throwaway account could not sign in: ${signInErr.message}`)

    const { data: isAdmin } = await stranger.rpc("is_admin")
    check("signed-in stranger fails is_admin()", isAdmin !== true, `is_admin=${isAdmin}`)

    for (const table of ["quote_requests", "quote_request_items", "customers"]) {
      const res = await stranger.from(table).select("*")
      check(
        `signed-in stranger cannot read ${table}`,
        !res.error && (res.data?.length ?? 0) === 0,
        res.error ? `error: ${res.error.message}` : `rows visible: ${res.data?.length ?? 0}`,
      )
    }

    const { data: category } = await stranger.from("categories").select("id").limit(1).maybeSingle()
    const write = await stranger
      .from("products")
      .insert({ name: `__RLS_STRANGER__ ${Date.now()}`, category_id: category?.id ?? null })
    check(
      "signed-in stranger cannot write the catalog",
      Boolean(write.error),
      write.error ? `blocked: ${write.error.message}` : "UNEXPECTEDLY SUCCEEDED",
    )

    await stranger.auth.signOut()
  } finally {
    // Always clean up, even if an assertion above threw.
    const { error: delErr } = await service.auth.admin.deleteUser(strangerId)
    console.log(delErr ? `\n! Could not delete throwaway user ${strangerId}: ${delErr.message}` : `\nThrowaway account removed.`)
  }
}

console.log(`\n${passed} passed, ${failed} failed.\n`)
process.exit(failed === 0 ? 0 : 1)
