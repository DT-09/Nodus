# NODUS

**The intelligence behind shipping decisions.**

NODUS is a Shopify-first shipping economics intelligence and policy-control application. It is designed to ingest source data, reconcile shipping charges and costs, diagnose issues, simulate policy alternatives, obtain merchant approval, execute supported changes, verify the result and monitor outcomes.

## Current verified scope

- Shopify React Router application foundation and authenticated merchant workspace.
- Resumable, checkpointed Shopify order backfill with idempotent persistence and explicit progress reporting.
- Merchant-reviewed per-order cost-coverage status with audit-log entries; incomplete or currency-mismatched evidence cannot produce a contribution figure.
- Deterministic money, reconciliation, diagnostics, historical policy replay and approval state-machine modules.
- Carrier cost CSV import with duplicate invoice-line protection and explicit currency validation.
- Initial unit tests and GitHub Actions CI.

## Not yet production-ready

End-to-end order-to-invoice reconciliation UI, PDF extraction, complete policy simulation UI, supported Shopify write execution, scheduled monitoring, Shopify billing, production infrastructure, legal/support operations, App Store review and merchant validation remain outstanding. See `docs/PRODUCT_SPEC.md` and `docs/CARRIER_CSV_FORMAT.md`.

A repository commit is not a live Shopify integration or commercial launch. No savings or revenue claim is made until verified with real merchant data.

## Local setup

Requires Node.js 20.19+ or 22.12+, PostgreSQL, Shopify Partner app configuration and a development store. Copy `.env.example` to `.env`, configure credentials and URLs, install dependencies, run `npm run setup`, then `npm run dev`.

Never commit secrets, access tokens, environment files or merchant data.
