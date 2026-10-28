/**
 * Google Analytics 4 (gtag.js), measurement ID G-ZYFWBEBJD3.
 *
 * Started from the app rather than pasted into index.html as Google suggests:
 * the CSP in vercel.json allows no inline script beyond one hashed handler,
 * and this way the tag stays off everywhere but the live site. Local dev and
 * Vercel preview deployments would otherwise mix test visits into the numbers.
 *
 * Route changes need no hook: GA4's enhanced measurement counts the router's
 * history changes as page views by itself.
 */
const MEASUREMENT_ID = "G-ZYFWBEBJD3"
const LIVE_HOST = /^(www\.)?labmaremi\.com$/

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function initGoogleAnalytics(): void {
  if (!import.meta.env.PROD || !LIVE_HOST.test(window.location.hostname)) return

  window.dataLayer = window.dataLayer || []
  // gtag.js reads `arguments` objects off the queue, not arrays, so this has
  // to stay a plain function exactly as Google's snippet writes it.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag("js", new Date())
  window.gtag("config", MEASUREMENT_ID)

  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}
