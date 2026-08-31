## Code sample for MLH: anonymous quote → secure write → async notification

This code sample is the functionality of a quote submittion system for LABMAREMI, a B2B web page. The sample handles the security, UI and functionality behind this feature and its relation with the database.

1. `src/pages/QuotePage.tsx` + `src/components/quote/` — the form
2. `src/lib/quoteSubmission.ts` — client wrapper calling the RPC
3. `supabase/migrations/0005_quote_submission_rpc.sql` — atomic write, honeypot check, zero direct table access
4. `supabase/migrations/0007_quote_notification.sql` — trigger enqueues async notification, never blocks the insert
5. `supabase/functions/quote-notification/index.ts` — edge function, constant-time secret check, idempotent send

