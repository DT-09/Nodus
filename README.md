# NODUS

**Shipping economics intelligence for Shopify.**

NODUS connects Shopify order-level shipping revenue with carrier-cost evidence, merchant-reviewed coverage, deterministic reconciliation, historical shipping-policy replay and auditable exports.

## Deployment target

NODUS is configured for **Vercel** through the React Router Vercel preset in `react-router.config.ts`. Use Vercel for the application runtime and managed PostgreSQL for durable storage. Do not deploy this as a Cloudflare Pages static site: it requires a Node-compatible server runtime, Shopify session storage and PostgreSQL.

## Implemented capabilities

- Shopify embedded-app authentication and PostgreSQL session persistence.
- Merchant-scoped order ingestion with resumable pagination and incremental refresh.
- Carrier-cost CSV import with duplicate protection and currency validation.
- Evidence register and merchant-reviewed order matching.
- Deterministic reconciliation and diagnostics that keep missing evidence unknown.
- Historical flat-rate and free-shipping-threshold replay.
- Read-only Shopify Markets shipping configuration.
- Merchant-scoped CSV evidence export and audit events.
- Shopify privacy/uninstall webhook handlers.
- Prisma migrations, health endpoint and CI quality checks.

## Not represented as live capabilities

The repository does **not** currently contain verified live UPS, FedEx or USPS API integrations. Carrier cost intake is CSV-based. Recurring subscription billing and server-side paid-plan entitlements are not implemented. Scheduled monitoring is not active. Shopify shipping-policy writes remain disabled. There is no live checkout on the pricing page.

Do not advertise these as available, accept payment for them, or imply App Store approval. A production deployment is not the same as a commercially complete product.

## Vercel deployment

1. Create the production Shopify app in the authorized Shopify Partner account.
2. Create a managed PostgreSQL database.
3. Import `DT-09/Nodus` into Vercel. Keep the repository root as the project root.
4. Use Node.js 22 and the build command `npm run vercel-build`. This generates Prisma Client, applies committed migrations, then builds the React Router application.
5. Add these Vercel environment variables:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL` — exact public HTTPS origin
   - `SCOPES` — must match `shopify.app.toml`
   - `DATABASE_URL` — PostgreSQL connection string
   - `PUBLIC_CONTACT_EMAIL` — authorized business support inbox
   - `NODE_ENV=production`
6. Use a separate Preview database. The Vercel build command runs `prisma migrate deploy`; never point Preview deployments at Production.
7. Deploy once, copy the stable production URL, then update `application_url` and every redirect URL in `shopify.app.toml` and the Shopify Partner configuration. Redeploy after the URLs match exactly.
8. Verify OAuth install, order sync, privacy webhooks, uninstall, database persistence and `/healthz` against a real development store before inviting merchants.

Never put secrets in source control or expose them to client-side variables.

## Local development

Requires Node.js 22, PostgreSQL and a configured Shopify Partner app. Copy `.env.example` to `.env`, set credentials and the database URL, then run:

```bash
npm install
npm run setup
npm run dev
```

## Release gate

See [Launch-Day Release Gate](docs/LAUNCH_DAY.md) and [Buyer Evaluation](docs/BUYER_EVALUATION.md). These distinguish repository work from external Shopify, hosting, legal, security, billing and App Store requirements.

NODUS makes no unverified savings, recovery, customer, revenue or integration claims.
