# GitHub / Vercel deployment

Repository: `yipoo/motion-prompt`; Vercel project: `yipoos-projects/motion-prompt`.

| Git branch | Vercel environment | Domain | APP_ENV |
| --- | --- | --- | --- |
| develop | Preview (branch-scoped variables) | https://dev.motion.yipoo.com | sandbox |
| main | Production | https://motion.yipoo.com | production |

Pushes to either branch automatically deploy through the existing Vercel GitHub integration. Other branches do not deploy. Preview responses include `X-Robots-Tag: noindex, nofollow`. Only `dev.motion.yipoo.com` has a Deployment Protection Exception for browser access and Stripe test webhooks; generated Preview URLs retain Vercel authentication. GitHub Pages remains an independent static publication on main.

## Environment variables

Existing Stripe test, auth, database, private-storage credentials and catalog are scoped to Preview / develop only. Production has its own SITE_URL, ALLOWED_ORIGIN, APP_ENV and feature flags. Production login and billing remain unavailable until independent production service settings are supplied; it never falls back to sandbox credentials. Public static content is available in both environments.

Use `billing/vercel.preview.env.example` and `billing/vercel.env.example` as separate templates; store actual values in ignored local files. Run from the linked project directory:

```sh
node tools/sync-vercel-env.mjs preview billing/.env.preview
node tools/sync-vercel-env.mjs production billing/.env.production
```

The script validates domain and Stripe credential mode before saving, and scopes Preview values specifically to develop. Missing keys are skipped; existing keys are not deleted. Changes to environment variables require a new deployment.

For real payments, supply an independent production auth/database/storage project, live Stripe prices, portal configuration and a webhook secret for `https://motion.yipoo.com/api/billing/webhooks/stripe`. The current billing starter explicitly rejects live Stripe keys/events; live-mode implementation and validation are required before enabling real payments. The existing test webhook (`we_1Ua8qqRVoxqLFlAGbpFh5mb2`) now targets `https://dev.motion.yipoo.com/api/billing/webhooks/stripe`; its signing secret and subscribed events were preserved. Configure authentication redirect allowlists for the matching domain as well.

Vercel settings: https://vercel.com/yipoos-projects/motion-prompt/settings
