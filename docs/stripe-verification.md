# Stripe / Vercel verification — 2026-11-10

Deployed frontend and backend: https://motion.yipoo.com/

Account/pricing: https://motion.yipoo.com/account.html

## Completed

- Canonical domain `motion.yipoo.com` bound to this Vercel project. Added the explicit `motion` CNAME to `cname.vercel-dns-017.com` in the Vercel-managed `yipoo.com` zone. Verified HTTPS 200 and the old Vercel alias's 308 redirect. Existing DNS records were preserved.
- Hosted access is now 192 free original effects and 120 Pro additions. Both static packages exclude Pro specification/prompt/code-helper exports and strip paid specifications from the public catalog; preview metadata and renderer code remain visible. Active Pro is checked on the server before returning private payloads. Copy/composition/JSON and skill handoff include complete references only after that check.
- Deployed Pro access fixture test passed: anonymous request 401, signed-in non-subscriber 403, temporary active Pro fixture 200 with complete specification and code, canceled fixture 403. The fixture and auth user were removed. This was an access-control test, not proof of a paid Stripe subscription.

- Vercel deployment reported READY, canonical alias assigned.
- New independent Supabase development project `motion-prompt` created in the selected organization, quoted $0/month. Billing schema created with six private tables and browser access denied. Private Storage bucket created.
- Certificate-verified Postgres connection and transaction advisory lock tested against that actual development database. Official Supabase CA bundled in the function; certificate verification stays enabled.
- Actual Supabase temporary-user creation, password sign-in and server JWT verification passed. No email was sent. This establishes token/auth integration, not public email delivery or GitHub OAuth configuration.
- Actual Stripe sandbox Checkout Sessions created for $9 one-time, $12/month and $99/year. Each repeated idempotency key returned the same URL. An open Pro checkout prevented a second subscription checkout.
- Actual sandbox Customer Portal creation and invoice-list reads passed.
- Unpaid Checkout Sessions did not grant access. All created checkout sessions were expired, and temporary auth users, Stripe customer and local request/customer records were cleaned up.
- 17 automated billing tests passed, covering fulfillment, subscription state, failed/duplicate deliveries, refunds/disputes/fraud holds, authentication rejection, signatures, private downloads, public configuration filtering, transaction rollback and lock contention. The local tests mock Stripe and database-driver calls where applicable.
- Live Vercel HTTP checks: `/`, `/account.html`, `/api/v1/catalog.json`, and health returned 200; unauthenticated entitlements returned 401; `.env` and private billing paths returned 404. Forged webhook signature returned 400; an actual configured signing secret with an ignored sandbox fixture event returned 200 through the deployed handler and database lock.
- Public settings expose only public Supabase information and the approved price display, never database, Stripe or Storage secret keys.
- Live browser checks passed for Chinese/English price labels and a 390-pixel phone viewport: page width stayed at 390 pixels and the logo stayed inside the header. Desktop and mobile proof screenshots are retained locally under `.oil-ui/billing/`.

## Not established / not enabled

- No real money was collected, and live-mode keys are rejected.
- Checkout creation is verified; card completion, successful paid fulfillment, actual invoice generation, recurring renewal and real refund/dispute lifecycle have not yet been tested end-to-end.
- The separate $9 design pack has not been delivered and stays disabled. Pro covers the existing 120 added motions; their static prompt/specification/kit exports are removed from both hosted packages and served through authenticated Pro endpoints. Preview renderer code and previously published MIT copies remain public; this is a hosted-service access policy, not withdrawal of existing licenses.
- Public email OTP delivery is configured; see the verified email follow-up below. GitHub OAuth remains disabled until its application is configured. The temporary-user password check does not prove these user-facing flows.
- Tax registrations, tax setup, refund policy, operational alerts, and the suitable commercial Vercel plan remain launch requirements.

All 312 motions remain previewable. The original 192 are free to use through the service; the 120 additions require Pro for full hosted specs, prompts and exports. Existing MIT rights and attribution remain intact. Existing GitHub Pages exports remain intact; the Vercel artifact points exported prompt/code URLs to its own host.

### Email login follow-up (2026-11-10)

- Account sign-in now opens an accessible bilingual dialog with separate email/code steps, a 60-second resend cooldown, pinned destination address, pending states and recoverable errors. New users use the same OTP flow.
- Supabase Site URL set to `https://motion.yipoo.com`; redirect allowlist includes `https://motion.yipoo.com/account.html`. Existing redirect entries were preserved.
- Initial Stripe sandbox endpoint readback at the canonical domain passed (enabled, 11 event types, API version `2026-10-28.endive`); later environment separation migrated sandbox delivery to `https://dev.motion.yipoo.com/api/billing/webhooks/stripe`. Production live delivery uses the canonical domain; see `deployment.md` for current environment settings.
- Custom SMTP enabled through Resend with a dedicated yipoo.com sending-only key; sender `Motion Prompt <noreply@yipoo.com>`. The credential is stored only in Supabase, never in browser assets or Git.
- Email OTP length 6, expiration 600 seconds; resend cooldown 60 seconds. Both signup and sign-in templates select subject/body language using each request's exact redirect URL, including existing users switching UI language.
- Authorized real email tests to the owner returned `delivered` in Resend. The six-digit code verified successfully and created a real session; the test client signed out afterward. English subject/body rendered correctly after the provider's template cache refreshed.
- Production and development use the same Supabase login by explicit user choice; payment mode/customer/event separation is preserved.
