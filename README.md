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
- Full-scope JSON Shipping Economics Decision Pack with order-level reconciliation, evidence provenance, coverage summary, exception findings, saved policy replays, economic-value attestations, explicit limitations and a SHA-256 integrity digest.
- Economic value ledger with stage progression, posted-credit references and measured operating-time value, kept separate from realized cash.
- Shopify privacy/uninstall webhook handlers.
- Prisma migrations, health endpoint and CI quality checks.

## Not represented as live capabilities

The repository does **not** currently contain verified live UPS, FedEx or USPS API integrations. Carrier cost intake is CSV-based. Shopify App Pricing subscription lookup and a fail-closed server-side access gate are implemented behind a feature flag; the Partner Dashboard plans, credentials, live subscription lifecycle and production entitlement behaviour are not configured or verified. Shopify hosts plan selection and billing for new public apps; NODUS must not claim paid self-service readiness until the configured plans and full lifecycle tests pass. Carrier invoice polling, policy-drift detection and merchant alerting are not implemented. Scheduled Shopify order refresh exists in the repository but is not production-verified. Shopify shipping-policy writes remain disabled. There is no live checkout on the pricing page.

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
   - `DATABASE_URL` — pooled PostgreSQL connection string for serverless runtime
   - `DIRECT_URL` — direct PostgreSQL connection string for Prisma migrations and administrative operations
   - `PUBLIC_CONTACT_EMAIL` — authorized business support inbox
   - `CRON_SECRET` — high-entropy secret used only by the protected scheduled-sync endpoint
   - `NODE_ENV=production`
6. Use a separate Preview database and distinct `CRON_SECRET` values for Preview and Production. The Vercel build command runs `prisma migrate deploy`; never point Preview deployments at Production.
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

## Release and public launch

- [Launch-Day Release Gate](docs/LAUNCH_DAY.md) — technical, product, security and commercial acceptance checklist.
- [Go-Live Runbook](docs/GO_LIVE_RUNBOOK.md) — ordered sequence for public website, controlled pilot, paid pilot and public paid-app release.
- [Buyer Evaluation](docs/BUYER_EVALUATION.md) — scope and acceptance criteria for a merchant evaluation.
- [Economic Value Framework](docs/ECONOMIC_VALUE_FRAMEWORK.md) — evidence definitions, financial calculations and pricing gates.
- [Commercial Offer and Buyer Definition](docs/COMMERCIAL_OFFER.md) — target buyer, concrete decision-pack deliverable, competitive positioning and demand-validation gates.

The public site includes a clearly labelled [synthetic reconciliation walkthrough](/demo) and a factual [privacy and data-handling notice](/privacy). The demo is illustrative data, not a customer result. The privacy notice still requires the responsible operator to complete its legal identity, jurisdiction, processor, retention and regional disclosures before public merchant onboarding. A read-only production HTTP smoke test is available with `NODUS_BASE_URL=https://YOUR-PRODUCTION-ORIGIN npm run smoke:launch`; it does not replace real-store, tenant-isolation, webhook, backup-restore, billing, security or legal verification.

NODUS makes no unverified savings, recovery, customer, revenue or integration claims.

## Economic proof and commercial value

The merchant workspace includes an economic value ledger that keeps identified opportunities, merchant-validated opportunities and realized credits separate. The Reports workspace now exports both the full evidence CSV and a reproducible JSON Decision Pack. The JSON pack includes all stored orders and cost records, deterministic reconciliation, matched/unmatched states, diagnostics, per-currency complete-coverage summaries, saved policy simulations, merchant-attested value records, scope, sync provenance, methodology limitations and a SHA-256 digest of its canonical payload. Verify a downloaded pack offline with `npm run verify:decision-pack -- ./nodus-decision-pack-YYYY-MM-DD.json`. Realized records require a posted credit/refund/accounting reference. These statuses are merchant-attested; NODUS does not independently audit carrier or accounting postings.

The public commercial page offers a no-fee, no-obligation Founding Merchant Value Programme. It scopes one store, one reporting currency, available permitted order history and one supported carrier-cost export. The merchant receives an evidence coverage statement, exception register, supported historical policy replay, value ledger and review. A monthly subscription is proposed only if a credible ongoing use case and conservative recurring value are established. The internal value-fit threshold is at least 3× the proposed monthly fee; this is a pricing discipline, not a promised return. No fixed price list or live checkout is presented.

See [Economic Value Framework](docs/ECONOMIC_VALUE_FRAMEWORK.md) for value definitions, evidence requirements, the founding programme and subscription decision rules.

## Carrier cost evidence

Carrier invoice CSV imports accept the canonical template and common header aliases. If a file contains a carrier/provider column, its value is retained as the evidence source label. This is invoice-evidence intake, not a direct carrier API connection. Rate quotes and tracking APIs are not substitutes for the final billed invoice.

## Shopify App Pricing integration

The repository contains Partner API subscription verification and a fail-closed app-level access gate. It remains disabled until the authorized operator configures plans in Shopify Partner Dashboard and supplies the app handle, Partner organization ID, Partner API token, app GID and exact plan handles. Set `SHOPIFY_APP_PRICING_ENABLED=true` only after those settings are verified in a test app/store. The gate redirects merchants without an active recognized plan to Shopify's hosted plan selection page and denies access if verification fails. Shopify hosts plan selection and billing for new public apps; the application does not implement a separate card checkout. Approval, activation, plan changes, cancellation, delinquency, refund and uninstall lifecycle tests remain release gates.

For new public apps, Shopify App Pricing is the default and recommended billing method. See [Shopify's billing guidance](https://shopify.dev/docs/apps/launch/billing).

## Shopify API network security

Shopify's current security guidance requires public apps to restrict Admin API access to approved server IP addresses, with enforcement milestones beginning November 20, 2026. NODUS currently has no configured production egress allowlist. Before public production use, select a hosting architecture with stable outbound IPs, configure those addresses in the Shopify app's API access restrictions, and verify that all Admin API requests originate from the approved addresses. Vercel Static IPs are a paid Pro feature/add-on; verify current project pricing and usage before choosing it. Do not assume ordinary Vercel function egress is fixed. See [Shopify security requirements](https://shopify.dev/docs/apps/build/security) and [Vercel Static IP availability](https://vercel.com/changelog/static-ips-are-now-available-for-more-secure-connectivity).

## Scheduled Shopify refresh

The Vercel deployment includes a protected cron endpoint at `/api/cron/sync`, scheduled every five minutes. It processes a bounded batch of installed shops, resumes incomplete Shopify order pagination, uses a short lease to avoid duplicate workers, and applies exponential backoff after failures. The merchant Monitoring page exposes the last run, next run and failure state.

Set a strong random `CRON_SECRET` in Vercel Production and in local development if testing the endpoint manually. Vercel sends the secret as an Authorization bearer token. Do not expose it to browser code or commit it.

This scheduler refreshes Shopify order data only. It does not poll carrier billing accounts, detect shipping-policy drift, send merchant alerts, adjudicate disputed charges or independently verify recovered value. Production operation requires a configured `CRON_SECRET`, a verified production database, and Vercel Pro or Enterprise: Hobby is limited to personal, non-commercial use and daily Cron schedules, while this repository configures a five-minute schedule. See [Vercel plan limits](https://vercel.com/docs/plans/hobby) and [Cron configuration](https://vercel.com/docs/project-configuration/vercel-ts). An appropriately authorized adult/business operator must own the commercial hosting, Shopify Partner, legal and payout arrangements.
