# NODUS

**A connected operating platform for Shopify merchants. Shipping economics first.**

NODUS is designed to help merchants run their store with a clearer operating picture, evidence-backed diagnosis, prioritized roadmaps, practical guidance and controlled execution across finance, sales, marketing, customers, products, inventory, supply chain and operations. The current working product is the first commercial module: shipping-economics review. The wider business domains are an explicit roadmap, not a claim that every connector or workflow is already live.

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
- Browser-local CSV review tool and downloadable CSV / JSON decision packs.
- Founding assessment enquiry form and D1 health endpoint.

Shopify connection and sync are implemented in source but are not production-ready until Shopify Partner API credentials, Shopify app configuration, webhook registration, and end-to-end installation tests are completed. The production D1 schema is present and the Cloudflare token-encryption secret has been configured; Shopify API key and secret remain unavailable. Do not describe a Shopify installation as live until those checks pass.

## Explicit product boundaries

Not currently implemented:
- Scheduled background sync and automatic carrier API / invoice polling.
- Shopify fulfillment or tracking ingestion.
- Billing, subscriptions, paid checkout, or Shopify Billing API.
- Automatic edits to orders, shipping rates, refunds, inventory, or customer records.
- General-purpose finance, marketing, CRM, inventory, or multi-platform operations.
- Autonomous business execution.

The first Shopify integration requests read_orders only. The reconciliation engine does not access customer names, email addresses, shipping addresses, or payment details. Shopify's granted order-access window and API limits apply. A matched charge is evidence, not proof of complete cost coverage, profit, savings, or carrier recovery.

## Cloudflare production configuration

Cloudflare Pages project: nodus-hq  
Production URL: https://nodus-hq.pages.dev  
Production branch: main  
Build command: npm run build  
Build output: build/client

Required Pages bindings:
- NODUS_DB: the existing Cloudflare D1 database nodus-leads.

Required production environment variables / secrets:
- SHOPIFY_API_KEY: Shopify Partner app client ID.
- SHOPIFY_API_SECRET: Shopify Partner app client secret (secret).
- SHOPIFY_APP_URL: canonical HTTPS application origin, https://nodus-hq.pages.dev.
- TOKEN_ENCRYPTION_KEY: high-entropy random secret of at least 32 characters (secret).

Apply the schema once to the production D1 database:

```sh
npx wrangler d1 execute nodus-leads --remote --file=migrations/0001_shopify.sql
```

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

The intended commercial model is a seven-day free trial followed by a monthly Shopify-managed subscription. The website does not collect card details; Shopify must show the exact monthly price and obtain the merchant's approval before billing. Shopify App Pricing is not active until the Partner Dashboard app, public plan, trial duration, price and distribution settings are configured. Pricing, contracts, invoices, tax handling, data-processing terms, customer support, and binding commercial commitments require an appropriately authorized adult business operator. Do not publish customer logos, testimonials, customer counts, or savings results without evidence and permission.

A code implementation is not proof of a production integration. A deployment is not proof of a functioning business. NODUS is ready for merchant onboarding only after the release gates above are passed.
