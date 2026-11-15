# NODUS Go-Live Runbook

This runbook defines the final sequence from repository release to public exposure. It deliberately separates a public marketing launch, a controlled merchant pilot, and a generally available paid Shopify app. They are different release states.

## Release states

| State | What may be claimed | What must be true |
|---|---|---|
| Public website | NODUS is accepting evaluation requests | Public pages, contact route, privacy disclosures and production health checks work |
| Controlled pilot | A named merchant can evaluate the implemented workflow | Authorized store install, data scope, evidence workflow, tenant isolation and support ownership are verified |
| Paid pilot | A merchant has agreed to a specific paid deliverable | Scope, acceptance criteria, price, invoice/payment terms and authorized business operator are in place |
| Public paid app | Eligible merchants can install and subscribe without manual intervention | Shopify distribution/review, production billing, entitlement lifecycle, support and operational controls are verified |

Do not describe one state as another.

## 1. Account and ownership gate

- [ ] An appropriately authorized adult/business operator owns the Shopify Partner organization, Vercel billing, domain registration, merchant contracts, invoicing, tax obligations and payment/payout accounts.
- [ ] The operator approves the public support contact and the person responsible for merchant data requests and incidents.
- [ ] The operator confirms the legal entity and jurisdiction that will contract with merchants.
- [ ] Never place personal credentials, payment data, customer data or API tokens in GitHub issues, public demos or source control.

## 2. Vercel production setup

NODUS uses the React Router Vercel preset and a Node.js server runtime. Use Vercel for the app; do not deploy it as a static Cloudflare Pages site.

- [ ] Use a commercial Vercel plan appropriate for the business workload and five-minute Cron configuration. Confirm the plan's current limits in Vercel before enabling the schedule.
- [ ] Connect the intended GitHub repository and confirm the root directory is the repository root.
- [ ] Set Node.js to 22.
- [ ] Set build command to `npm run vercel-build`.
- [ ] Attach a managed PostgreSQL database with backups and a tested restore procedure.
- [ ] Use separate Production and Preview databases. The Vercel build runs `prisma migrate deploy`.
- [ ] Configure Production and Preview variables independently:
  - `SHOPIFY_API_KEY`
  - `SHOPIFY_API_SECRET`
  - `SHOPIFY_APP_URL`
  - `SCOPES`
  - `DATABASE_URL`
  - `PUBLIC_CONTACT_EMAIL`
  - `CRON_SECRET`
  - `NODE_ENV=production`
- [ ] Keep all credentials server-side. Never use a `NEXT_PUBLIC_` or other client-exposed prefix for secrets.
- [ ] Set `SHOPIFY_APP_URL` to the exact canonical HTTPS origin.
- [ ] Set a unique high-entropy `CRON_SECRET` for each environment.
- [ ] Confirm the Vercel Cron schedule is present on the Production project and that the selected plan supports it.
- [ ] Configure uptime/error monitoring and operational alerts.

## 3. Shopify Partner configuration

- [ ] Create or select the production app in the authorized Partner organization.
- [ ] Replace the placeholder `client_id`, `application_url` and redirect URLs in `shopify.app.toml`.
- [ ] Make the Partner Dashboard URLs, `SHOPIFY_APP_URL` and TOML URLs match exactly.
- [ ] Confirm requested scopes match the enabled features and current Shopify policy.
- [ ] Confirm the intended distribution mode. App Store distribution does not mean App Store approval.
- [ ] Do not claim public App Store availability before Shopify approval.
- [ ] Verify OAuth and offline session persistence using a controlled development store.
- [ ] Verify `app/uninstalled`, `app/scopes_update`, `customers/data_request`, `customers/redact` and `shop/redact` webhooks.
- [ ] Verify the granted order-history window. The current configuration does not claim `read_all_orders`.

## 4. Database and application acceptance

- [ ] Confirm migrations are applied to the intended Production database.
- [ ] Confirm `/healthz` returns HTTP 200 and `{"status":"ok","service":"nodus"}`.
- [ ] Run the public HTTP smoke test:
  ```bash
  NODUS_BASE_URL=https://YOUR-PRODUCTION-ORIGIN npm run smoke:launch
  ```
- [ ] Confirm public homepage, product, methodology, pricing, security and support pages load.
- [ ] Confirm the carrier-cost CSV template is downloadable and contains the documented columns.
- [ ] Confirm the unauthenticated cron endpoint returns HTTP 401 (not 200 or 503).
- [ ] Confirm `/app` requires Shopify authentication.
- [ ] Install the app on a controlled store and complete the first order sync.
- [ ] Test pagination continuation, incremental refresh, duplicate imports, malformed CSV rows, invalid currencies and ambiguous matches.
- [ ] Verify incomplete cost coverage is never silently treated as zero.
- [ ] Verify tax-inclusive orders and mixed currencies are properly qualified.
- [ ] Verify one merchant cannot access another merchant's records or exports.
- [ ] Verify uninstall and privacy webhooks remove or redact the applicable data.
- [ ] Test backup restoration, not just backup creation.

The smoke test is a read-only HTTP check. It does not prove Shopify API correctness, tenant isolation, webhook behaviour, billing, security certification or legal compliance.

## 5. Commercial and payment gate

The current repository contains subscription-verification scaffolding, but recurring billing and complete server-side entitlement enforcement are not release-complete. The $99, $199 and $299 figures are pricing hypotheses, not live offers.

Before recurring checkout is enabled:

- [ ] Define each plan's exact store count, order volume, data retention, support, and feature entitlements.
- [ ] Remove or defer plan features that are not implemented and verified.
- [ ] Configure the corresponding Shopify App Pricing plans in the authorized Partner Dashboard.
- [ ] Configure the app handle, Partner organization ID, Partner API token, app GID and exact plan handles as server-side environment variables.
- [ ] Enable `SHOPIFY_APP_PRICING_ENABLED=true` only after configuration is complete.
- [ ] Verify access is denied when subscription verification fails or a plan is inactive.
- [ ] Test purchase approval, activation, plan change, cancellation, delinquency, reactivation and uninstall.
- [ ] Verify plan changes take effect within the documented entitlement-cache window.
- [ ] Publish clear recurring price, billing cadence, cancellation and refund terms.

A paid pilot may be offered only as a separately scoped business engagement with a written deliverable, acceptance criteria, price and payment terms. An authorized adult/business operator must own the agreement, invoice and payment collection. Do not collect payment for unimplemented features or promise a financial recovery.

## 6. Public exposure without cold outreach

- [ ] Make the public website the single source of truth for supported capabilities, limitations, evaluation process and support.
- [ ] Set a business-owned support inbox in `PUBLIC_CONTACT_EMAIL`; test the evaluation and support links from desktop and mobile.
- [ ] Publish accurate privacy, terms, data-retention/deletion, refund and support disclosures approved by the responsible operator.
- [ ] Add a clearly labelled synthetic-data walkthrough. Never present synthetic data as a customer result.
- [ ] Publish the CSV template and a concise evaluation guide.
- [ ] Add search metadata, social preview metadata, canonical URL and sitemap/robots policy after the final domain is chosen.
- [ ] Publish the Shopify App Store listing only when distribution and approval permit it.
- [ ] Use public discovery: searchable product pages, useful documentation, a transparent demo and permitted public founder/product channels.
- [ ] Do not fabricate testimonials, merchant logos, savings figures, app approval or customer counts.

## 7. Release decision

A release is **GO** only when all gates for the intended release state are checked and evidenced.

Record:
- Release commit:
- Production deployment URL:
- Canonical domain:
- Production database and migration status:
- Health check timestamp:
- Smoke-test result:
- Development-store install result:
- Tenant-isolation result:
- Webhook/privacy result:
- Backup restore result:
- Billing lifecycle result (if paid app):
- Shopify distribution/review status:
- Responsible business operator:
- Support and incident owner:

If any item is unknown, record it as unknown. Do not convert an unchecked requirement into a launch claim.
