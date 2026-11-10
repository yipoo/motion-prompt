# GitHub / Vercel deployment

Repository: `yipoo/motion-prompt`; Vercel project: `yipoos-projects/motion-prompt`.

| Git branch | Vercel environment | Domain | APP_ENV |
| --- | --- | --- | --- |
| develop | Preview (branch-scoped variables) | https://dev.motion.yipoo.com | sandbox |
| main | Production | https://motion.yipoo.com | production |

Pushes to either branch automatically deploy through the existing Vercel GitHub integration. Other branches do not deploy. Preview responses include `X-Robots-Tag: noindex, nofollow`. Only `dev.motion.yipoo.com` has a Deployment Protection Exception for browser access and Stripe test webhooks; generated Preview URLs retain Vercel authentication. GitHub Pages remains an independent static publication on main.

## Environment variables

Database, authentication, storage and the existing catalog/webhook configuration are shared as requested. Stripe test API credentials are scoped only to Preview / develop; STRIPE_SECRET_KEY is intentionally unset in Production for the owner to fill in Vercel. SITE_URL, ALLOWED_ORIGIN, APP_ENV and feature flags are separate. Production paid-content flags remain false until live prices and webhook signing have been verified; static content and the shared auth configuration are available. EMAIL_OTP_READY remains false until the mail provider is verified.

Use `billing/vercel.preview.env.example` and `billing/vercel.env.example` as separate templates; store actual values in ignored local files. Run from the linked project directory:

```sh
node tools/sync-vercel-env.mjs preview billing/.env.preview
node tools/sync-vercel-env.mjs production billing/.env.production
```

The script validates domain and Stripe credential mode before saving, and scopes Preview values specifically to develop. Missing keys are skipped; existing keys are not deleted. Changes to environment variables require a new deployment.

For real payments, supply a live Stripe API key, live prices, live portal configuration and a live webhook secret for `https://motion.yipoo.com/api/billing/webhooks/stripe`. Production accepts only live Stripe keys/events; develop accepts only test keys/events. Stripe prices are checked against the current mode before Checkout. Shared database customer identities, idempotency keys and webhook event records are namespaced for live billing so test entitlements cannot grant production access. No database schema changes are required. The copied existing catalog, portal configuration and webhook signing secret are sandbox values: a live API key alone cannot make those values work in live mode. The existing test webhook (`we_1Ua8qqRVoxqLFlAGbpFh5mb2`) now targets `https://dev.motion.yipoo.com/api/billing/webhooks/stripe`; its signing secret and subscribed events were preserved. Configure authentication redirect allowlists for the matching domain as well.

Vercel settings: https://vercel.com/yipoos-projects/motion-prompt/settings
