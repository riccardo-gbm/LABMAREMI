/**
 * Public quote-form write path — the counterpart to catalogData.ts's reads.
 *
 * anon cannot SELECT quote_requests / quote_request_items, so the lead and its
 * items go in through the `submit_quote_request` security-definer RPC (migration
 * 0005), which inserts both atomically. camelCase in, snake_case at the RPC
 * boundary; throws on error so the caller can show a real failure state.
 */
export interface QuoteSubmission {
  companyName: string
  contactPerson: string
  phone: string
  email: string
  businessTypeId: string
  location: string
  message: string
  productIds: string[]
  /** Bot trap — real users never fill it. Rejected server-side. */
  honeypot: string
}

export async function submitQuoteRequest(input: QuoteSubmission): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/submit_quote_request`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company_name: input.companyName,
      contact_person: input.contactPerson,
      phone: input.phone,
      email: input.email,
      business_type_id: input.businessTypeId,
      location: input.location,
      message: input.message,
      product_ids: input.productIds,
      honeypot: input.honeypot,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || `HTTP error ${res.status}`)
  }
}
