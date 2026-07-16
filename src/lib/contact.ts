/**
 * Placeholder contact details (Phase 1 demo — not a real number/inbox yet).
 * Shared by Home and Contact so the two pages never drift apart.
 */
// Digits only, no + or spaces, country code included (593 = Ecuador).
// This is the single place to change the WhatsApp number for the whole app.
export const WHATSAPP_NUMBER = "593999999999"
export const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`
export const PHONE_DISPLAY = "+593 99 999 9999"
export const EMAIL_DISPLAY = "ventas@labmaremi.ec"

// Placeholder office location — generic Quito coordinates for the demo.
export const OFFICE_MAP_SRC =
  "https://www.google.com/maps?q=-0.180653,-78.467834&z=13&output=embed"

// Sample coverage sectors — realistic Quito-area geography, no client data.
export const coverageSectors = [
  "Norte de Quito",
  "Centro Histórico",
  "Sur de Quito",
  "Cumbayá",
  "Tumbaco",
  "Valle de los Chillos",
  "Calderón",
  "Sangolquí",
]
