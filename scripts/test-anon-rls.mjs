/**
 * test-anon-rls.mjs — LABMAREMI Phase 2, P6 security proof
 *
 * Runs as an ANON client (the publishable key — exactly what a logged-out
 * visitor's browser uses) and asserts the RLS contract the public quote form
 * depends on:
 *
 *   1. anon CAN submit a quote via the submit_quote_request RPC
 *   2. anon CANNOT read quote_requests back  (empty set, not an error)
 *   3. anon CANNOT read quote_request_items
 *   4. anon CANNOT read customers
 *   5. anon CANNOT insert into quote_requests directly (RPC is the only path)
 *
 * Test 1 leaves one marker row ("__RLS_TEST__ (delete me)") that an admin can
 * remove from the dashboard — anon has no delete.
 *
 * Run:  node scripts/test-anon-rls.mjs
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
if (!url || !anonKey) {
  die("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in .env")
}

// Anon client: no session, publishable key — the logged-out visitor's shoes.
const anon = createClient(url, anonKey, { auth: { persistSession: false } })

console.log(`\nAnon RLS check against ${url}\n`)

// A real product id to attach, read from the public-read products table.
const { data: product, error: productErr } = await anon
  .from("products")
  .select("id")
  .limit(1)
  .maybeSingle()
if (productErr) die(`Could not read a product to test with: ${productErr.message}`)
if (!product) die("No products found — run scripts/import-catalog.mjs first.")

// 1. anon can submit via the RPC.
const { error: rpcErr } = await anon.rpc("submit_quote_request", {
  company_name: "__RLS_TEST__ (delete me)",
  contact_person: "Anon Tester",
  phone: "+593 99 000 0000",
  email: "anon-rls-test@example.com",
  business_type_id: null,
  location: "Quito",
  message: "Automated RLS test row.",
  product_ids: [product.id],
  honeypot: "",
})
check("anon can submit a quote via RPC", !rpcErr, rpcErr ? rpcErr.message : "inserted")

// 2. anon cannot read quote_requests (RLS returns an empty set, no error).
const leads = await anon.from("quote_requests").select("*")
check(
  "anon cannot read quote_requests",
  !leads.error && (leads.data?.length ?? 0) === 0,
  leads.error ? `error: ${leads.error.message}` : `rows visible: ${leads.data?.length ?? 0}`,
)

// 3. anon cannot read quote_request_items.
const items = await anon.from("quote_request_items").select("*")
check(
  "anon cannot read quote_request_items",
  !items.error && (items.data?.length ?? 0) === 0,
  items.error ? `error: ${items.error.message}` : `rows visible: ${items.data?.length ?? 0}`,
)

// 4. anon cannot read customers.
const customers = await anon.from("customers").select("*")
check(
  "anon cannot read customers",
  !customers.error && (customers.data?.length ?? 0) === 0,
  customers.error ? `error: ${customers.error.message}` : `rows visible: ${customers.data?.length ?? 0}`,
)

// 5. anon cannot insert into quote_requests directly — the RPC is the only path.
const direct = await anon
  .from("quote_requests")
  .insert({ company_name: "__DIRECT_INSERT__", contact_person: "should fail" })
check(
  "anon direct insert is blocked (RPC-only write path)",
  Boolean(direct.error),
  direct.error ? `blocked: ${direct.error.message}` : "UNEXPECTEDLY SUCCEEDED",
)

// 6. anon can read public products and categories (for sitemap & bot social previews).
const catRead = await anon.from("categories").select("slug").limit(5)
const prodRead = await anon.from("products").select("slug").eq("is_active", true).limit(5)
check(
  "anon can read active categories and products for sitemap",
  !catRead.error && !prodRead.error && (catRead.data?.length ?? 0) > 0 && (prodRead.data?.length ?? 0) > 0,
  catRead.error || prodRead.error
    ? `error: ${catRead.error?.message || prodRead.error?.message}`
    : `categories: ${catRead.data?.length}, products: ${prodRead.data?.length}`,
)

console.log(`\n${passed} passed, ${failed} failed.\n`)
process.exit(failed === 0 ? 0 : 1)
