# NODUS

**Shipping economics intelligence for Shopify.**

NODUS connects Shopify order-level shipping revenue with carrier-cost evidence, merchant-reviewed coverage, deterministic reconciliation, historical shipping-policy replay and auditable exports.

## Deployment target

NODUS is configured for **Vercel** through the React Router Vercel preset in `react-router.config.ts`. Use Vercel for the application runtime and managed PostgreSQL for durable storage. Do not deploy this as a Cloudflare Pages static site: it requires a Node-compatible server runtime, Shopify session storage and PostgreSQL. A commercial deployment must use Vercel Pro or Enterprise; Vercel Hobby is restricted to personal, non-commercial use. The configured five-minute cron schedule also requires Pro or Enterprise because Hobby cron jobs can run only once per day. See [Vercel plan terms](https://vercel.com/legal/terms) and [Cron Job limits](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing).

## Implemented capabilities

- Shopify embedded-app authentication and PostgreSQL session persistence.
- Merchant-scoped order ingestion with resumable pagination and incremental refresh.
- Carrier-cost CSV import with duplicate protection and currency validation.
- Evidence register and merchant-reviewed order matching.
- Deterministic reconciliation and diagnostics that keep missing evidence unknown.
- Historical flat-rate and free-shipping-threshold replay.
- Read-only Shopify Markets shipping configuration.
- Merchant-scoped CSV evidence export and audit events.
- Economic value ledger with stage progression, posted-credit references and measured operating-time value, kept separate from realized cash.
- Shopify privacy/uninstall webhook handlers.
- Prisma migrations, health endpoint and CI quality checks.

## Not represented as live capabilities

The repository does **not** currently contain live UPS, FedEx or USPS API integrations. Carrier cost intake is CSV-based. Direct carrier APIs are not implemented. Shopify App Pricing subscription lookup and a fail-closed app access gate are present, but Partner configuration and billing-lifecycle acceptance are not verified. Scheduled Shopify refresh is implemented in code but is not active until the production cron secret and deployment are configured. Shopify shipping-policy writes remain disabled. There is no live checkout on the pricing page.

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

## Economic proof and commercial value

The merchant workspace includes an economic value ledger that keeps identified opportunities, merchant-validated opportunities and realized credits separate. Realized records require a posted credit/refund/accounting reference. These statuses are merchant-attested; NODUS does not independently audit carrier or accounting postings.

The public commercial page offers a no-fee, no-obligation Founding Merchant Value Programme. It scopes one store, one reporting currency, available permitted order history and one supported carrier-cost export. The merchant receives an evidence coverage statement, exception register, supported historical policy replay, value ledger and review. A monthly subscription is proposed only if a credible ongoing use case and conservative recurring value are established. The internal value-fit threshold is at least 3× the proposed monthly fee; this is a pricing discipline, not a promised return. No fixed price list or live checkout is presented.

See [Economic Value Framework](docs/ECONOMIC_VALUE_FRAMEWORK.md) for value definitions, evidence requirements, the founding programme and subscription decision rules.

## Carrier cost evidence

Carrier invoice CSV imports accept the canonical template and common header aliases. If a file contains a carrier/provider column, its value is retained as the evidence source label. This is invoice-evidence intake, not a direct carrier API connection. Rate quotes and tracking APIs are not substitutes for the final billed invoice.

## Shopify App Pricing integration

The application includes Partner API subscription verification and an app-level access gate. It remains disabled until plans are configured in the authorized Shopify Partner Dashboard and all Partner API environment variables are supplied. Set `SHOPIFY_APP_PRICING_ENABLED=true` only after configuring the app handle, Partner organization ID, Partner API token, app GID and the exact plan handles. The gate fails closed on Partner API errors and redirects merchants without an active plan to Shopify's hosted plan selection page.

For new public apps, Shopify recommends Shopify App Pricing rather than custom Billing API charges. See [Shopify's billing guidance](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing).

## Scheduled Shopify refresh

The Vercel deployment includes a protected cron endpoint at `/api/cron/sync`, scheduled every five minutes. It processes a bounded batch of installed shops, resumes incomplete Shopify order pagination, uses a short lease to avoid duplicate workers, and applies exponential backoff after failures. The merchant Monitoring page exposes the last run, next run and failure state.

Set a strong random `CRON_SECRET` in Vercel Production and in local development if testing the endpoint manually. Vercel sends the secret as an Authorization bearer token. Do not expose it to browser code or commit it.

This scheduler refreshes Shopify order data only. It does not poll carrier billing accounts, adjudicate disputed charges or independently verify recovered value. Vercel Hobby is for non-commercial personal projects; a revenue-generating deployment requires an appropriate commercial hosting plan and account owner.
