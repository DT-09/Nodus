# NODUS

**The intelligence behind shipping decisions.**

NODUS is a Shopify-first shipping economics workspace. It brings current Shopify shipping charges, imported carrier-cost evidence, merchant review, deterministic reconciliation, historical rate replay and exportable audit records into one merchant-scoped application.

## Implemented in the repository

- Shopify embedded-app authentication and merchant-scoped PostgreSQL storage.
- Resumable, checkpointed Shopify order backfill with idempotent persistence and incremental refresh by order update time.
- Current Shopify shipping charges after discounts and refunds, using `currentShippingPriceSet`; tax-inclusive treatment is persisted and contribution is withheld when tax cannot be separated.
- CSV carrier-cost ingestion with invoice-line identity, currency precision checks and duplicate protection.
- Evidence register with manual order matching for ambiguous carrier records.
- Per-order cost-coverage attestations. New cost imports invalidate previous complete attestations; manual reassignment resets the affected orders.
- Deterministic reconciliation and diagnostics. Incomplete and currency-mismatched evidence cannot produce a shipping-contribution figure.
- Historical flat-rate and free-shipping-threshold replay, with saved runs and sample windows.
- Read-only Shopify Markets shipping configuration snapshot.
- Merchant-scoped CSV export of orders, cost evidence and saved simulations; exports and review actions are recorded in the audit log.
- PostgreSQL migrations, Docker production image, health endpoint and CI checks for migrations, typechecking, tests and build.

## Production release is not yet authorized or verified

The repository is not a public, revenue-generating launch. It still requires a configured Shopify Partner app, a real development store, approved scopes, production URL, hosting, managed PostgreSQL, secrets, backups, monitoring, legal/privacy materials, billing and App Store review. The live policy-write path remains disabled. PDF invoice extraction and continuous monitoring are not implemented.

The Shopify app configuration contains placeholders until the production app and URL are supplied. A passing CI run verifies code against a test PostgreSQL service; it does not verify Shopify installation, real merchant data or production deployment.

No customer, revenue, savings or recovery claims are made without independent evidence.

## Local setup

Requires Node.js 20.19+ or 22.12+, PostgreSQL, Shopify Partner app configuration and an authorized development store. Copy `.env.example` to `.env`, configure the app credentials, URL and database, install dependencies, run `npm run setup`, then `npm run dev`.

Never commit secrets, access tokens, environment files or merchant data.
