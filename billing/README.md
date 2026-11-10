# Motion Prompt billing on Vercel

Frontend and billing API run together at https://motion.yipoo.com/ . The bilingual storefront/account page is `/account.html`; the free motion library remains at `/`.

See [the full integration plan](../docs/stripe-integration-plan.md) for decisions, access policies and launch requirements.

## Configuration

Use [vercel.env.example](vercel.env.example) as the field list. Keep actual values in ignored `billing/.env`, then sync through stdin without logging values:

```sh
npm ci
npm ci --prefix billing
node tools/sync-vercel-env.mjs production
npm run build:vercel
vercel deploy --prebuilt --prod --scope yipoos-projects
```

`DATABASE_URL` is the Supabase transaction pooler connection string (port 6543, password included), using certificate-verified TLS. `SUPABASE_SECRET_KEY` is a server-only `sb_secret_…` key; it is different from the browser's publishable key. Never include either in `NEXT_PUBLIC_` variables or browser code. Configure `SITE_URL` and `ALLOWED_ORIGIN` to the deployed canonical URL/origin. Preview environments must use separate sandbox settings and an explicitly allowed origin; no wildcard origin or request-header-derived redirect is accepted.

The private `motion_billing` schema has been created in the independent development project. Do not apply the migration to unrelated or production databases. `postgres.mjs` uses a shared transactional lock so separate Vercel function instances cannot race purchases. SQLite is only for local unit tests and the optional `dev.mjs` server.

## Authentication and files

Email sign-in opens a bilingual dialog with a resend cooldown and OTP verification. Set `EMAIL_OTP_READY=true` only after the custom SMTP provider and both signup/sign-in token templates have been configured and tested; the send button stays disabled before that verification.

Supabase Auth URL configuration must allow `https://motion.yipoo.com/account.html` and set the correct Site URL. For email OTP, configure the sign-in template to include `{{ .Token }}`; default magic links are also supported by the browser client. Supabase's default SMTP is for team testing, so configure a production sender before inviting the public. GitHub requires a configured GitHub OAuth application; only set `GITHUB_LOGIN_ENABLED=true` after that setup is complete. The backend requires current asymmetric JWT signing keys and validates their issuer, audience and expiry.

Create a private Storage bucket named `premium-packs` using Supabase's Storage API/dashboard, upload the new ZIP files named by the catalog, and never make the bucket public. The backend issues a 60-second signed download URL only after checking the signed-in user's purchased or active subscription access.

`PREMIUM_CONTENT_READY=false` keeps the separate $9 design pack disabled. `PRO_CONTENT_READY=true` enables sandbox Pro subscriptions for the existing 120 added motions. Keep this disabled while testing infrastructure. Even when it is enabled, this build accepts only sandbox Stripe keys and events. Tax collection remains disabled until registrations and product tax settings are confirmed.

## Sandbox catalog and webhook

The approved sandbox catalog is $9 one-time, $12 monthly and $99 yearly in USD. `setup-sandbox.mjs` creates or reuses the two Products, three Prices and Customer Portal configuration. `register-webhook.mjs` registers the canonical `/api/billing/webhooks/stripe` endpoint and writes its signing secret locally. Both scripts require sandbox keys and avoid printing secrets. Existing endpoints with an unavailable secret require retrieving the secret from Stripe Workbench rather than recreating the endpoint.

Webhook processing finishes before the function responds. Return 200 only after fulfillment and the event ID are committed; errors cause Stripe to retry. There is no background timer or recurring worker dependency. Monitor Stripe Workbench delivery failures and deploy operational alerts before live use.

## API

Prefix routes with `/api/billing`. Except `/public`, `/health`, and the signature-verified webhook, every route requires a valid Supabase bearer JWT.

| Route | Behavior |
| --- | --- |
| `GET /public` | Only public sign-in settings and agreed price display; no secrets |
| `GET /health` | Process/configuration status, not proof of a real payment |
| `GET /catalog` | Approved catalog |
| `POST /checkout` | SKU and language plus stable `Idempotency-Key`; server maps Price and Customer |
| `POST /portal` | Customer Portal for this user only |
| `GET /entitlements` | Purchased packs, Pro status and billing review hold |
| `GET /invoices` | This user's most recent 20 invoices |
| `GET /downloads/:sku` | Short-lived private signed URL, only with access |
| `GET /motions/:id?lang=en` | Full payload for #193–#312, only with active Pro; pack purchases do not unlock these motions |
| `POST /webhooks/stripe` | Raw body/signature verification, fulfillment before acknowledgment |

No customer/Price IDs, amounts, return URLs or access grants are trusted from the browser. Checkout success parameters do not grant entitlements. Existing MIT content stays free. Connect is omitted for the confirmed single-seller business.

The hosted service keeps #001–#192 free and gates #193–#312 behind Pro. The browser can still preview all animations. Existing MIT copies and attribution are preserved; this does not make previously published source private. Full Pro payloads are packaged into the billing function's `premium.json`, not into static exports. JSON export and the skill's loopback Pro handoff include reference code inline, so AI tools do not need the user's sign-in token.

## Tests

```sh
npm test --prefix billing
npm run build:vercel
```

Local automated tests use mocked Stripe calls and an in-memory store; PostgreSQL adapter tests cover transaction handling and contention behavior with a fake driver. They do not establish a real database connection or successful Stripe Checkout. Actual sandbox payment, renewal, invoice, refund and download tests must run after all deployment credentials and content are ready.

### OTP email template

Use `emails/sign-in.html` for both **Confirm sign up** and **Magic link or OTP** in Supabase. It displays `{{ .Token }}` and chooses Chinese/English using the exact per-request `RedirectTo` URL (`account.html?lang=en` or `?lang=zh`) (presentation only; never use metadata for paid access checks). Use `emails/sign-in.subject.txt` as the subject. Keep email OTP length at 6 and expiry at 600 seconds. The per-request redirect URL selects the language even when an existing user has different stored metadata. Configure custom SMTP before editing these templates. Never commit SMTP passwords or provider API keys.
