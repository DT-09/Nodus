# NODUS

> **Business direction:** The authoritative target-state is [NODUS Master Business & Product Blueprint](docs/NODUS_MASTER_BLUEPRINT.md). The existing shipping-economics implementation is the starting codebase, not the final commercial product. Current capabilities and unverified integrations remain described below as implementation facts.

**Merchant-side 3PL billing and evidence control for Shopify merchants.**

NODUS keeps the merchant's provider agreements, 3PL invoices, available operational activity, investigation history and provider outcomes in one persistent workspace. The initial commercial workflow is CSV-based and focused on contract-rate reconciliation and evidence-backed exception resolution. The previous shipping-economics workbench remains legacy code; do not mix its capabilities or offer with the current 3PL control offer.

## Commercial operations

See the [NODUS Operator Runbook](docs/NODUS_OPERATOR_RUNBOOK.md) for trial intake, workspace provisioning, supported CSV formats, reconciliation, case handling and the manual subscription lifecycle. Use the [Merchant Pilot Execution Pack](docs/NODUS_MERCHANT_PILOT_EXECUTION_PACK.md) to qualify, scope, deliver and evaluate the first real merchant pilot.

The recurring 3PL control runtime is implemented as Cloudflare Pages Functions backed by the existing D1 binding `NODUS_DB`. The static merchant portal and private operator console call those Functions. Apply `migrations/0003_threepl_control.sql` to the configured remote D1 database and set `NODUS_OPERATOR_SECRET` before enabling the workflow. The Prisma schema is not the 3PL runtime store.

This branch is not a claim of production readiness or revenue. The D1 migration, Cloudflare environment, tenant-isolation tests, backup/restore, privacy controls and live merchant onboarding must be verified before production data is accepted.

## Current product implementation

Production site: https://nodus-hq.pages.dev

- Marketing site, installable PWA shell and a Windows desktop WebView2 application source project.
- Shopify OAuth authorization flow implemented as Cloudflare Pages Functions.
- Per-store offline access token encryption using AES-GCM and a Cloudflare secret.
- Hashed, expiring merchant sessions; browser session cookies are HttpOnly and Secure.
- Read-only order synchronization through Shopify Admin GraphQL API version 2026-07.
- Persistent carrier / 3PL CSV imports scoped by Shopify store.
- Exact Shopify order-name or order-ID matching, with identical currency required.
- Unmatched and currency-mismatched charge review.
- Merchant workspace with order totals, imported cost evidence, and reconciliation summaries.
- Signed Shopify webhook receiver for uninstall and privacy topics.
- Browser-local CSV review tool with exact decimal arithmetic, exception register and downloadable CSV / JSON decision packs.
- Device-local aggregate reporting history for up to 24 periods; raw source files are not persisted.
- Free browser-local diagnostic, USD 149 one-time baseline audit request, and USD 99/month recurring Monthly Shipping Review request.
- Print-ready monthly report export alongside the CSV register and JSON decision pack.
- D1-backed lead capture, payment-state tracking and a token-protected private operator console.
- Contact-first paid-audit request; the form records interest only. An authorized adult-operated seller must confirm scope, issue terms and invoice, and verify cleared payment before delivery.
- D1 health endpoint.

Shopify connection and sync are implemented in source but are not production-ready until Shopify Partner API credentials, Shopify app configuration, webhook registration, and end-to-end installation tests are completed. The production D1 schema is present. The Cloudflare token-encryption secret may be configured, but Shopify Partner API credentials and end-to-end installation tests have not been verified. Do not describe a Shopify installation as live until those checks pass.

## Explicit product boundaries

Current release boundaries:
- The public workflow is CSV-based. The Shopify OAuth and read-only sync code is not a verified live merchant integration.
- No scheduled background sync or carrier API / invoice polling.
- No Shopify fulfillment or tracking ingestion in the current public workflow.
- The Monthly Shipping Review is a human-delivered recurring service based on merchant-supplied exports each period; it is not continuous carrier monitoring or automated carrier polling.
- No automated subscription checkout, Shopify Billing API, real-time carrier polling or background carrier invoice ingestion.
- No automatic edits to orders, shipping rates, refunds, inventory, or customer records.
- No general-purpose finance, marketing, CRM, inventory, or multi-platform operations.
- No autonomous business execution.
- Local period history is device-specific and stores aggregate metrics only; it is not a cloud workspace or automatic monitor.

The first Shopify integration requests read_orders only. The reconciliation engine does not access customer names, email addresses, shipping addresses, or payment details. Shopify's granted order-access window and API limits apply. A matched charge is evidence, not proof of complete cost coverage, profit, savings, or carrier recovery.

## Cloudflare production configuration

Cloudflare Pages project: nodus-hq  
Production URL: https://nodus-hq.pages.dev  
Production branch: main  
Build command: npm run build  
Build output: build/client

Cloudflare Pages is the canonical NODUS web deployment. The `functions/` directory contains Pages Functions. This repository has no separate Workers entrypoint; do not run `wrangler deploy` against the root React Router application. The separate Workers Build trigger is restricted to `workers/*`, `wrangler.jsonc` and `wrangler.toml` changes, and its preview builds are disabled; Cloudflare Pages handles application previews and production deployments.

Required Pages bindings:
- NODUS_DB: the existing Cloudflare D1 database nodus-leads.

Required production environment variables / secrets:
- SHOPIFY_API_KEY: Shopify Partner app client ID.
- SHOPIFY_API_SECRET: Shopify Partner app client secret (secret).
- SHOPIFY_APP_URL: canonical HTTPS application origin, https://nodus-hq.pages.dev.
- TOKEN_ENCRYPTION_KEY: high-entropy random secret of at least 32 characters (secret).
- NODUS_ADMIN_TOKEN: operator token of at least 32 characters (secret).
- No checkout URL is configured. The public form is an enquiry endpoint; an authorized adult seller must handle any invoice and approved payment route outside the form.

Apply migrations to a fresh D1 database in lexical order:

```sh
npx wrangler d1 execute nodus-leads --remote --file=migrations/0000_commercial_base.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0001_shopify.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0002_commercial_intake.sql
```

For an existing database, inspect `sqlite_master` and `PRAGMA table_info` before applying migrations. Migration `0002_commercial_intake.sql` uses `ALTER TABLE` and is not safe to rerun after its columns exist. Do not infer schema state from the Pages project database table-count metadata alone; verify it with SQL.

Shopify Partner app configuration:
- App URL: https://nodus-hq.pages.dev/workspace
- Redirect URL: https://nodus-hq.pages.dev/api/shopify/callback
- Scopes: read_orders
- Webhook endpoint: https://nodus-hq.pages.dev/api/shopify/webhooks
- API version: 2026-07

The Shopify app TOML is a template. Replace client_id with the actual Partner Dashboard value. The client secret and token encryption key must never be committed to Git.

## Local development and quality checks

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run verify:deployment
```

## Commercial and governance boundaries

Current commercial hypothesis: a free, scoped seven-day evaluation followed by NODUS Core at USD 99/month. The evaluation uses one merchant workspace, one external 3PL, one confirmed rate card, one invoice period and available activity exports. The recurring service is intended to carry forward exception history, provider responses, promised/posted/verified outcomes and period comparisons. Pricing and willingness to renew are unvalidated. The first customer workflow is CSV-based and includes operator involvement; it is not continuous monitoring. The public form records requests only. No automated checkout, paid customer, verified recovery or renewal is established. Do not publish customer logos, testimonials, customer counts or savings results without evidence and permission.

A code implementation is not proof of a production integration. A deployment is not proof of a functioning business. NODUS is ready for merchant onboarding only after the release gates above are passed.
