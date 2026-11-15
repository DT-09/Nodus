# NODUS

**Shipping economics intelligence for Shopify.**

NODUS connects Shopify order-level shipping revenue with carrier-cost evidence, merchant-reviewed coverage, deterministic reconciliation, historical shipping-policy replay and auditable exports.

## Deployment target

NODUS is configured for **Vercel** through the React Router Vercel preset in `react-router.config.ts`. Use Vercel for the application runtime and managed PostgreSQL for durable storage. Do not deploy this as a static Cloudflare Pages site: it requires a Node-compatible server runtime, Shopify session storage and PostgreSQL.

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

The repository does **not** currently contain verified live UPS, FedEx or USPS invoice API integrations. Carrier cost intake is CSV-based. Shopify App Pricing and subscription verification have partial scaffolding, but recurring billing, complete lifecycle testing and production entitlements are not release-complete. Carrier invoice polling, policy-drift detection and merchant alerts are not implemented. Scheduled Shopify order refresh exists in the repository but is not production-verified. Shopify shipping-policy writes remain disabled. There is no live checkout on the pricing page.

Do not advertise these as available, accept payment for them, or imply App Store approval. A production deployment is not the same as a commercially complete product.

## Vercel deployment

1. Have the authorized business operator create/select the production Shopify app in the Partner organization.
2. Create a managed PostgreSQL database.
3. Import `DT-09/Nodus` into Vercel. Keep the repository root as the project root.
4. Use Node.js 22 and the build command `npm run vercel-build`. This generates Prisma Client, applies committed migrations, then builds the React Router application.
5. Add these Vercel environment variables:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL` — exact public HTTPS origin
   - `SCOPES` — must match `shopify.app.toml`
   - `DATABASE_URL` — PostgreSQL connection string
   - `PUBLIC_CONTACT_EMAIL` — business-owned support inbox
   - `CRON_SECRET` — strong, unique server-side secret for the protected scheduled-sync endpoint
   - `NODE_ENV=production`
6. Use a separate Preview database. The Vercel build command runs `prisma migrate deploy`; never point Preview deployments at Production.
7. Deploy a preview first. After confirming the stable production URL, update `application_url` and every redirect URL in `shopify.app.toml` and the Shopify Partner configuration. Redeploy after the URLs match exactly.
8. Verify OAuth install, order sync, privacy webhooks, uninstall, database persistence and `/healthz` against a real development store before inviting merchants.

Never put secrets in source control or expose them to client-side variables.

## Local development

Requires Node.js 22, PostgreSQL and a configured Shopify Partner app. Copy `.env.example` to `.env`, set credentials and the database URL, then run:

```bash
npm install
npm run setup
npm run dev
```

## Release and public launch

- [Launch-Day Release Gate](docs/LAUNCH_DAY.md) — technical, product, security and commercial acceptance checklist.
- [Go-Live Runbook](docs/GO_LIVE_RUNBOOK.md) — ordered sequence for public website, controlled pilot, paid pilot and public paid-app release.
- [Buyer Evaluation](docs/BUYER_EVALUATION.md) — scope and acceptance criteria for a merchant evaluation.
- [Economic Value Framework](docs/ECONOMIC_VALUE_FRAMEWORK.md) — evidence definitions, financial calculations and pricing gates.

The public site includes a clearly labelled [synthetic reconciliation walkthrough](/demo) so prospective merchants can inspect the evidence model before connecting a store. It is illustrative data, not a customer result.\n\nA read-only production HTTP smoke test is available:

```bash
NODUS_BASE_URL=https://YOUR-PRODUCTION-ORIGIN npm run smoke:launch
```

It checks public pages, the CSV template, application/database health, unauthenticated cron rejection and Shopify authentication on the merchant workspace. It does not replace real-store, tenant-isolation, webhook, backup-restore, billing, security or legal verification.

NODUS makes no unverified savings, recovery, customer, revenue or integration claims.

## Economic proof and commercial value

The merchant workspace includes an economic value ledger that keeps identified opportunities, merchant-validated opportunities and realized credits separate. Realized records require a posted credit/refund/accounting reference. These statuses are merchant-attested; NODUS does not independently audit carrier or accounting postings.

The public pricing page includes a break-even calculator. It uses merchant-entered carrier spend and confirmed credits only; it does not forecast savings or claim NODUS caused a recovery. Target prices ($99/$199/$299) are hypotheses, not active checkout offers.

## Carrier cost evidence

Carrier invoice CSV imports accept the canonical template and common header aliases. If a file contains a carrier/provider column, its value is retained as the evidence source label. This is invoice-evidence intake, not a direct carrier API connection. Rate quotes and tracking APIs are not substitutes for the final billed invoice.

## Shopify App Pricing integration

The application includes Partner API subscription-verification scaffolding and an app-level access gate. It remains disabled until plans are configured in the authorized Partner Dashboard and all Partner API environment variables are supplied. Set `SHOPIFY_APP_PRICING_ENABLED=true` only after configuring the app handle, Partner organization ID, Partner API token, app GID and exact plan handles. The gate fails closed on Partner API errors and redirects merchants without an active plan to Shopify's hosted plan-selection page. The full subscription lifecycle and plan entitlements still require production verification.

For new public apps, Shopify recommends Shopify App Pricing rather than custom Billing API charges. See [Shopify's billing guidance](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing).

## Scheduled Shopify refresh

The Vercel deployment includes a protected cron endpoint at `/api/cron/sync`, scheduled every five minutes. It processes a bounded batch of installed shops, resumes incomplete Shopify order pagination, uses a short lease to avoid duplicate workers, and applies exponential backoff after failures. The merchant Monitoring page exposes the last run, next run and failure state.

Set a strong random `CRON_SECRET` in Vercel Production and in local development if testing the endpoint manually. Vercel sends the secret as an Authorization bearer token. Do not expose it to browser code or commit it.

This scheduler refreshes Shopify order data only. It does not poll carrier billing accounts, detect shipping-policy drift, send merchant alerts, adjudicate disputed charges or independently verify recovered value. Production operation requires a configured `CRON_SECRET`, a verified production database, and a Vercel plan that supports commercial use and the configured five-minute Cron schedule. Confirm current plan limits before launch. An appropriately authorized adult/business operator must own commercial hosting, Shopify Partner, legal, contracting, invoicing and payout arrangements.
