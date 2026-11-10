# Stripe / Vercel verification — 2026-11-10

Deployed frontend and backend: https://motion-prompt.vercel.app/

Account/pricing: https://motion-prompt.vercel.app/account.html

## Completed

- Vercel deployment reported READY, canonical alias assigned.
- New independent Supabase development project `motion-prompt` created in the selected organization, quoted $0/month. Billing schema created with six private tables and browser access denied. Private Storage bucket created.
- Certificate-verified Postgres connection and transaction advisory lock tested against that actual development database. Official Supabase CA bundled in the function; certificate verification stays enabled.
- Actual Supabase temporary-user creation, password sign-in and server JWT verification passed. No email was sent. This establishes token/auth integration, not public email delivery or GitHub OAuth configuration.
- Actual Stripe sandbox Checkout Sessions created for $9 one-time, $12/month and $99/year. Each repeated idempotency key returned the same URL. An open Pro checkout prevented a second subscription checkout.
- Actual sandbox Customer Portal creation and invoice-list reads passed.
- Unpaid Checkout Sessions did not grant access. All created checkout sessions were expired, and temporary auth users, Stripe customer and local request/customer records were cleaned up.
- 15 automated billing tests passed, covering fulfillment, subscription state, failed/duplicate deliveries, refunds/disputes/fraud holds, authentication rejection, signatures, private downloads, public configuration filtering, transaction rollback and lock contention. The local tests mock Stripe and database-driver calls where applicable.
- Live Vercel HTTP checks: `/`, `/account.html`, `/api/v1/catalog.json`, and health returned 200; unauthenticated entitlements returned 401; `.env` and private billing paths returned 404. Forged webhook signature returned 400; an actual configured signing secret with an ignored sandbox fixture event returned 200 through the deployed handler and database lock.
- Public settings expose only public Supabase information and the approved price display, never database, Stripe or Storage secret keys.
- Live browser checks passed for Chinese/English price labels and a 390-pixel phone viewport: page width stayed at 390 pixels and the logo stayed inside the header. Desktop and mobile proof screenshots are retained locally under `.oil-ui/billing/`.

## Not established / not enabled

- No real money was collected, and live-mode keys are rejected.
- Checkout creation is verified; card completion, successful paid fulfillment, actual invoice generation, recurring renewal and real refund/dispute lifecycle have not yet been tested end-to-end.
- The premium content has not been delivered. `PREMIUM_CONTENT_READY=false` keeps checkout disabled at both browser and server boundaries.
- Public email OTP/magic-link delivery needs production SMTP, callback settings and email-template configuration. GitHub OAuth remains disabled until its application is configured. The temporary-user password check does not prove these user-facing flows.
- Tax registrations, tax setup, refund policy, operational alerts, and the suitable commercial Vercel plan remain launch requirements.

The free 312-motion MIT library remains available. Existing GitHub Pages exports remain intact; the Vercel artifact points exported prompt/code URLs to its own host.
