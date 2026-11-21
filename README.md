# NODUS

**Shipping economics intelligence for Shopify merchants.**

NODUS is a focused shipping-economics workbench: reconcile order shipping revenue with carrier and 3PL invoice evidence, inspect unresolved charges, review carrier spend, replay historical shipping policies and export a traceable decision pack.

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
- Free browser-local diagnostic and USD 99/month fixed-scope NODUS Pro monthly review enquiry.
- D1-backed lead capture, payment-state tracking and a token-protected private operator console.
- Contact-first monthly service enquiry; payment is arranged by invoice only through an authorized adult-operated business account.
- D1 health endpoint.

Shopify connection and sync are implemented in source but are not production-ready until Shopify Partner API credentials, Shopify app configuration, webhook registration, and end-to-end installation tests are completed. The production D1 schema is present. The Cloudflare token-encryption secret may be configured, but Shopify Partner API credentials and end-to-end installation tests have not been verified. Do not describe a Shopify installation as live until those checks pass.

## Explicit product boundaries

Current release boundaries:
- The public workflow is CSV-based. The Shopify OAuth and read-only sync code is not a verified live merchant integration.
- No scheduled background sync or carrier API / invoice polling.
- No Shopify fulfillment or tracking ingestion in the current public workflow.
- No automated recurring subscription billing or Shopify Billing API. NODUS Pro is a fixed-scope monthly review service, not a self-serve SaaS subscription; invoices and payment confirmation are handled by an authorized business operator.
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
- NODUS_PILOT_CHECKOUT_URL: optional HTTPS checkout link for the USD 149 pilot; configure only through an authorized adult-operated business account.

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

Commercial offer: a free browser-local diagnostic and a proposed USD 99/month fixed-scope monthly review service for one store, up to 2,000 orders and one carrier/3PL cost export per month. Deliverables include order-to-invoice reconciliation, carrier spend breakdown, an evidence-backed exception register, historical shipping-policy replay and a monthly decision brief. The public form records interest; it does not charge. Buyers contact NODUS by email to confirm fit and scope. An authorized adult business operator must issue the invoice, receive funds through an approved business account and confirm cleared payment before service begins. The USD 99/month price is a commercial offer to validate, not proven willingness to pay. NODUS_ADMIN_TOKEN protects the private /ops console. There is no automated recurring subscription billing. Public Shopify app monetization requires an eligible public App Store listing and compliant billing configuration. Pricing, contracts, invoices, tax handling, data-processing terms, customer support and binding commercial commitments require an appropriately authorized adult business operator. Do not publish customer logos, testimonials, customer counts or savings results without evidence and permission.

A code implementation is not proof of a production integration. A deployment is not proof of a functioning business. NODUS is ready for merchant onboarding only after the release gates above are passed.
