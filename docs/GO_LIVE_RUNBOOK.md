# NODUS Go-Live Runbook

This runbook separates a public website launch, a controlled merchant evaluation, a paid pilot and a generally available paid Shopify app. Do not claim a later release state before its acceptance gates pass.

## Release states

| State | Permitted claim | Required evidence |
|---|---|---|
| Public website | NODUS is open for merchant evaluations | Public pages, working evaluation route, privacy disclosures, production health and smoke checks |
| No-fee founding evaluation | A merchant can assess the supported workflow | Authorized store connection, defined data scope, tenant isolation, source-linked deliverable and support owner |
| Paid pilot | A merchant has agreed to a defined paid deliverable | Written scope, acceptance criteria, price, payment terms and authorized business operator |
| Public paid app | Eligible merchants can install and subscribe self-serve | Shopify distribution/review, tested billing lifecycle, server-side entitlements, plan limits, support and operations |

## 1. Business ownership and account access

- [ ] An appropriately authorized adult/business operator owns commercial hosting, Shopify Partner organization, domain, contracts, invoices, tax obligations and payment/payout accounts.
- [ ] The operator approves the legal entity, jurisdiction, support contact and person responsible for merchant data requests and incidents.
- [ ] Do not place credentials, API tokens, customer records or payment data in source control, public demos or GitHub issues.

## 2. Vercel production deployment

NODUS requires a Node.js server runtime and PostgreSQL. The deployment target is Vercel, not static Cloudflare Pages.

- [ ] Use a Vercel commercial plan suitable for business hosting and the configured five-minute Cron schedule. Hobby is not a commercial hosting plan and has tighter Cron limits.
- [ ] Connect `DT-09/Nodus` to the intended Vercel project. Root directory: repository root.
- [ ] Set Node.js 22 and build command `npm run vercel-build`.
- [ ] Attach managed PostgreSQL with backups and a tested restore procedure.
- [ ] Use separate Production and Preview databases.
- [ ] Configure Production and Preview independently: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, `DATABASE_URL`, `PUBLIC_CONTACT_EMAIL`, `CRON_SECRET`, and `NODE_ENV=production`.
- [ ] Use a unique high-entropy `CRON_SECRET` per environment. Keep secrets server-side.
- [ ] Confirm the five-minute Cron schedule is enabled on the Production project and supported by the selected plan.
- [ ] Configure uptime and error monitoring.
- [ ] Verify production security response headers with `npm run smoke:launch`; confirm Shopify Admin can still embed the app.

## 3. Shopify Partner configuration

- [ ] The authorized operator creates or selects the production app in the Partner organization.
- [ ] Replace placeholder `client_id`, `application_url` and redirect URLs in `shopify.app.toml`.
- [ ] Make Partner Dashboard URLs, `SHOPIFY_APP_URL` and TOML URLs match exactly.
- [ ] Confirm scopes match the features and current Shopify policy.
- [ ] Verify OAuth, offline session persistence, order sync and uninstall using a controlled development store.
- [ ] Verify `app/uninstalled`, `app/scopes_update`, `customers/data_request`, `customers/redact` and `shop/redact` webhooks.
- [ ] Confirm order-history permissions and limits. Do not claim access to all historical orders unless Shopify grants it.
- [ ] Do not claim App Store availability or approval before Shopify has granted it.

## 4. Production acceptance

- [ ] Confirm migrations are applied to the intended Production database.
- [ ] Confirm `/healthz` returns HTTP 200 and `{"status":"ok","service":"nodus"}`.
- [ ] Run `NODUS_BASE_URL=https://YOUR-PRODUCTION-ORIGIN npm run smoke:launch`.
- [ ] Confirm homepage, product, demo, methodology, pricing, security, privacy and support routes load.
- [ ] Confirm the carrier-cost CSV template downloads with the documented headers.
- [ ] Confirm unauthenticated `/api/cron/sync` returns HTTP 401.
- [ ] Confirm `/app` requires Shopify authentication.
- [ ] Install on a controlled store and complete the first order sync.
- [ ] Test pagination continuation, incremental refresh, duplicate imports, malformed CSV, invalid currencies and ambiguous matches.
- [ ] Verify incomplete cost coverage is never silently treated as zero.
- [ ] Verify one merchant cannot access another merchant's records or exports.
- [ ] Verify uninstall and privacy webhooks remove or redact applicable data.
- [ ] Restore a backup in a non-production environment and verify it.

The HTTP smoke test is read-only. It does not prove Shopify API correctness, tenant isolation, webhook behaviour, billing, security certification or legal compliance.

## 5. Merchant evaluation and payment

The first offer is the no-fee, no-obligation Founding Merchant Value Programme. It is deliberately limited to one store, one reporting currency, permitted order history and one supported carrier-cost CSV export.

Deliver the evidence coverage statement, matched/unmatched/incomplete register, deterministic exception worklist, supported historical policy replay where the data permits it, economic value ledger and limitations. The merchant reviews and confirms its own records. A discrepancy is not a recovered credit.

- [ ] Confirm evaluation scope and data handling before connecting a store.
- [ ] Deliver the evidence pack before discussing a subscription.
- [ ] Propose a monthly fee only if there is a credible recurring job and conservative merchant-accepted recurring value supports it.
- [ ] Keep realized credits, operating-time value and decision value separate. Do not claim NODUS caused a recovery without evidence.
- [ ] A paid pilot requires a written scope, acceptance criteria, price and payment terms. An authorized adult/business operator owns the agreement, invoice and collection.
- [ ] Do not enable recurring checkout until Shopify App Pricing configuration, plan limits, server-side entitlements and approval/activation/change/cancellation/delinquency/uninstall lifecycle tests pass.
- [ ] Do not accept payment for direct carrier APIs, automated invoice polling, policy writes, alerts or other unimplemented capabilities.

## 6. Public exposure without cold outreach

- [ ] Choose and verify the canonical production domain.
- [ ] Complete and legally review the factual [privacy and data-handling notice](/privacy), including legal identity, jurisdiction, database provider, retention and backup-expiry periods, and regional disclosures.
- [ ] Publish terms, support, evaluation and deletion disclosures approved by the responsible operator.
- [ ] Verify evaluation and support links from desktop and mobile.
- [ ] Publish the synthetic demo, CSV template and buyer evaluation guide. Keep synthetic data labelled as synthetic.
- [ ] Add canonical metadata, social preview metadata, sitemap and robots policy after the final domain is chosen.
- [ ] Publish a Shopify App Store listing only when distribution and approval permit it.
- [ ] Use public discovery: searchable product pages, useful documentation, transparent demos and permitted public product/founder channels.
- [ ] Never fabricate testimonials, merchant logos, savings, customer counts or App Store approval.

## 7. Release record

Record the release commit, production URL, canonical domain, database/migration status, health-check timestamp, smoke-test result, development-store install result, tenant-isolation result, privacy-webhook result, backup-restore result, billing status (if applicable), Shopify distribution status, responsible business operator and support/incident owner.

If any item is unknown, record it as unknown. Do not convert an unchecked requirement into a launch claim.
