/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
/**
 * quote-notification — emails the admins when a lead lands.
 *
 * Deno, not Node. `npm run build` does not type-check this file — tsconfig.app.json
 * only includes `src` — so the gate for it is `supabase functions deploy`.
 *
 * Invoked by the `quote_requests_notify` trigger from migration 0007, via pg_net,
 * after the submitting transaction commits. Not called from the browser: the
 * public bundle never sees this URL and holds no credential for it.
 *
 * Raw fetch against PostgREST rather than supabase-js, matching the convention in
 * src/lib/catalogData.ts and src/lib/quoteSubmission.ts — the query is one GET
 * and one PATCH, which is not worth a dependency.
 *
 * Deployed with verify_jwt = false (supabase/config.toml): the caller is a
 * Postgres trigger, not a session, so the platform's JWT gate has nothing to
 * check. Authentication is the x-webhook-secret header, compared below.
 *
 * Env (set with `supabase secrets set`, see docs/RUNBOOK.md §3):
 *   QUOTE_NOTIFICATION_SECRET      must equal private.notification_config.shared_secret
 *   RESEND_API_KEY                 Resend API key for the verified sending domain
 *   QUOTE_NOTIFICATION_FROM        e.g. "LABMAREMI Cotizaciones <cotizaciones@labmaremi.com>"
 *   QUOTE_NOTIFICATION_RECIPIENTS  comma-separated — add admins here, no redeploy needed
 *   QUOTE_ADMIN_URL                optional, deep link to the admin dashboard
 *   SUPABASE_URL                   auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY      auto-injected
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails"
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LeadRow {
  id: string
  company_name: string
  contact_person: string
  phone: string
  email: string
  location: string
  message: string
  created_at: string
  notified_at: string | null
  business_types: { name: string } | null
  quote_request_items: {
    products: { name: string; presentation: string } | null
  }[]
}

/**
 * Same nested-embed shape as LEAD_SELECT in src/lib/adminDashboard.ts, plus the
 * contact fields the dashboard list doesn't need but an email does.
 */
const LEAD_SELECT = [
  "id,company_name,contact_person,phone,email,location,message,created_at,notified_at",
  "business_types(name)",
  "quote_request_items(products(name,presentation))",
].join(",")

/**
 * Constant-time over the secret's contents, so a near-miss can't be walked
 * character by character. Length is compared first and does leak — acceptable for
 * a secret we generate at full length ourselves.
 */
function secretMatches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < given.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

/** Lead-supplied text goes straight into the HTML body — escape all of it. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-EC", {
  timeZone: "America/Guayaquil",
  dateStyle: "full",
  timeStyle: "short",
})

/** Quito time — the reader is in Ecuador, `created_at` is UTC. */
function formatTimestamp(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso))
}

function renderText(lead: LeadRow, products: string[], adminUrl: string): string {
  const lines = [
    "Nueva solicitud de cotización",
    "",
    `Empresa:        ${lead.company_name}`,
    `Contacto:       ${lead.contact_person}`,
    lead.phone ? `Teléfono:       ${lead.phone}` : null,
    lead.email ? `Correo:         ${lead.email}` : null,
    lead.business_types?.name ? `Tipo de negocio: ${lead.business_types.name}` : null,
    lead.location ? `Ubicación:      ${lead.location}` : null,
    `Recibida:       ${formatTimestamp(lead.created_at)}`,
    "",
  ]

  if (products.length > 0) {
    lines.push(`Productos solicitados (${products.length}):`)
    for (const p of products) lines.push(`  - ${p}`)
    lines.push("")
  }

  if (lead.message.trim()) {
    lines.push("Mensaje:", lead.message.trim(), "")
  }

  if (adminUrl) lines.push(`Ver en el panel: ${adminUrl}`)

  return lines.filter((l) => l !== null).join("\n")
}

function renderHtml(lead: LeadRow, products: string[], adminUrl: string): string {
  const row = (label: string, value: string, href?: string) => {
    if (!value.trim()) return ""
    const cell = href
      ? `<a href="${esc(href)}" style="color:#0f766e;text-decoration:none;">${esc(value)}</a>`
      : esc(value)
    return `<tr>
      <td style="padding:6px 16px 6px 0;color:#64748b;font-size:14px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${cell}</td>
    </tr>`
  }

  const productList = products.length
    ? `<h2 style="margin:28px 0 10px;font-size:15px;color:#0f172a;">Productos solicitados (${products.length})</h2>
       <ul style="margin:0;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.7;">
         ${products.map((p) => `<li>${esc(p)}</li>`).join("")}
       </ul>`
    : `<p style="margin:28px 0 0;color:#64748b;font-size:14px;">Sin productos seleccionados — consulte el mensaje.</p>`

  const messageBlock = lead.message.trim()
    ? `<h2 style="margin:28px 0 10px;font-size:15px;color:#0f172a;">Mensaje</h2>
       <p style="margin:0;padding:14px 16px;background:#f8fafc;border-left:3px solid #0f766e;border-radius:4px;color:#0f172a;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(lead.message.trim())}</p>`
    : ""

  const adminButton = adminUrl
    ? `<p style="margin:32px 0 0;">
         <a href="${esc(adminUrl)}" style="display:inline-block;padding:11px 22px;background:#0f766e;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">Abrir el panel</a>
       </p>`
    : ""

  return `<div style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px;background:#ffffff;border-radius:10px;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0f766e;font-weight:700;">LABMAREMI</p>
    <h1 style="margin:0 0 24px;font-size:21px;color:#0f172a;">Nueva solicitud de cotización</h1>
    <table style="border-collapse:collapse;width:100%;">
      ${row("Empresa", lead.company_name)}
      ${row("Contacto", lead.contact_person)}
      ${row("Teléfono", lead.phone, lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : undefined)}
      ${row("Correo", lead.email, lead.email ? `mailto:${lead.email}` : undefined)}
      ${row("Tipo de negocio", lead.business_types?.name ?? "")}
      ${row("Ubicación", lead.location)}
      ${row("Recibida", formatTimestamp(lead.created_at))}
    </table>
    ${productList}
    ${messageBlock}
    ${adminButton}
    <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
      Responder a este correo escribe directamente al cliente.
    </p>
  </div>
</div>`
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405)

  const secret = Deno.env.get("QUOTE_NOTIFICATION_SECRET") ?? ""
  const given = req.headers.get("x-webhook-secret") ?? ""
  // An unset secret must not mean "everyone is authorised".
  if (!secret || !secretMatches(given, secret)) {
    return json({ error: "unauthorized" }, 401)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")
  const from = Deno.env.get("QUOTE_NOTIFICATION_FROM")
  const recipients = (Deno.env.get("QUOTE_NOTIFICATION_RECIPIENTS") ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)
  const adminUrl = Deno.env.get("QUOTE_ADMIN_URL") ?? ""

  const missing = [
    !supabaseUrl && "SUPABASE_URL",
    !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
    !resendKey && "RESEND_API_KEY",
    !from && "QUOTE_NOTIFICATION_FROM",
    !recipients.length && "QUOTE_NOTIFICATION_RECIPIENTS",
  ].filter(Boolean)
  if (missing.length) {
    console.error(`missing env: ${missing.join(", ")}`)
    return json({ error: `missing env: ${missing.join(", ")}` }, 500)
  }

  let body: { quote_request_id?: string; force?: boolean }
  try {
    body = await req.json()
  } catch {
    return json({ error: "invalid JSON body" }, 400)
  }

  // Validate the shape before any network call, the same way /producto/:slug
  // pre-validates its slug in catalogData.ts.
  const id = body.quote_request_id ?? ""
  if (!UUID_RE.test(id)) return json({ error: "quote_request_id must be a uuid" }, 400)

  const rest = `${supabaseUrl}/rest/v1/quote_requests`
  const authHeaders = { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}` }

  // Through URLSearchParams, like catalogData.ts — values can't graft extra
  // PostgREST operators onto the query even if something upstream goes wrong.
  const leadQuery = new URLSearchParams({ id: `eq.${id}`, select: LEAD_SELECT })
  const leadRes = await fetch(`${rest}?${leadQuery}`, { headers: authHeaders })
  if (!leadRes.ok) {
    const detail = await leadRes.text()
    console.error(`lead lookup failed (${leadRes.status}): ${detail}`)
    return json({ error: "lead lookup failed", status: leadRes.status }, 500)
  }

  const rows = (await leadRes.json()) as LeadRow[]
  const lead = rows[0]
  if (!lead) return json({ error: "lead not found", quote_request_id: id }, 404)

  // Idempotency. pg_net can retry, and the operator can re-run this by hand;
  // neither should mail the same lead twice. `force: true` overrides.
  if (lead.notified_at && !body.force) {
    return json({ skipped: "already notified", notified_at: lead.notified_at }, 200)
  }

  const products = (lead.quote_request_items ?? [])
    .map((item) => item.products)
    .filter((p): p is { name: string; presentation: string } => p !== null)
    .map((p) => (p.presentation.trim() ? `${p.name} — ${p.presentation}` : p.name))

  const subject = products.length
    ? `Nueva cotización: ${lead.company_name} (${products.length} producto${products.length === 1 ? "" : "s"})`
    : `Nueva cotización: ${lead.company_name}`

  const payload: Record<string, unknown> = {
    from,
    to: recipients,
    subject,
    html: renderHtml(lead, products, adminUrl),
    text: renderText(lead, products, adminUrl),
  }
  // So that hitting Reply in Outlook or Gmail answers the customer, not Resend.
  if (EMAIL_RE.test(lead.email)) payload.reply_to = lead.email

  const sendRes = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!sendRes.ok) {
    const sendBody = await sendRes.text()
    // Surface the upstream reason rather than a bare 500 — this text is what
    // lands in the Edge logs and in net._http_response, and it is the difference
    // between "domain not verified" and an hour of guessing.
    console.error(`resend rejected (${sendRes.status}): ${sendBody}`)
    return json({ error: "resend rejected", status: sendRes.status, detail: sendBody }, 500)
  }

  const stampRes = await fetch(`${rest}?${new URLSearchParams({ id: `eq.${id}` })}`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ notified_at: new Date().toISOString() }),
  })
  if (!stampRes.ok) {
    // The mail is already out, so this is not a failure of the notification —
    // but an unstamped lead will be re-sent on the next retry, so say so loudly.
    console.error(`notified_at stamp failed (${stampRes.status}): ${await stampRes.text()}`)
  }

  console.log(`notified ${recipients.length} recipient(s) for lead ${id}`)
  return json({ sent: true, recipients: recipients.length, stamped: stampRes.ok }, 200)
})
