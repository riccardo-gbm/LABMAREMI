/**
 * WhatsApp click logging — the public write path for the admin dashboard's
 * WhatsApp metrics.
 *
 * Goes through the `log_whatsapp_click` security-definer RPC (migration 0008);
 * anon has no policy on the table itself. Raw fetch, not supabase-js, for the
 * same bundle reason as quoteSubmission.ts.
 *
 * Fire-and-forget by design: tracking must never delay or break the link. The
 * `keepalive` flag lets the request outlive the page when the browser hands
 * off to the WhatsApp app. Production only, so local testing doesn't pollute
 * the numbers.
 */
export type WhatsAppClickSource = "product" | "widget" | "home" | "contact"

export function trackWhatsAppClick(source: WhatsAppClickSource, productId?: string): void {
  if (!import.meta.env.PROD) return

  try {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/log_whatsapp_click`, {
      method: "POST",
      keepalive: true,
      headers: {
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source,
        product_id: productId ?? null,
        page_path: window.location.pathname,
      }),
    }).catch(() => {})
  } catch {
    // Never let analytics interfere with the click itself.
  }
}
