# NODUS

The intelligence behind shipping decisions.

NODUS is a Shopify-first shipping economics intelligence and policy-control application. Its closed loop ingests source data, reconciles shipping charges and costs, diagnoses issues, simulates policy alternatives, obtains merchant approval, executes supported changes, verifies the result and monitors outcomes.

## Repository status

- Definitive specification: docs/PRODUCT_SPEC.md
- Shopify React Router application foundation.
- Initial authenticated Shopify order snapshot.
- Deterministic money, reconciliation, diagnostics, historical replay and approval state-machine modules.
- Initial unit tests and CI workflow.

This is not a production launch. Shopify credentials, development-store verification, persistent ingestion jobs, carrier/3PL evidence adapters, billing, production infrastructure, App Store review and merchant validation remain outstanding.

Requires Node.js 20.19+ or 22.12+, PostgreSQL, Shopify Partner app configuration and a development store. Copy .env.example to .env, install dependencies, run npm run setup, link the app with Shopify CLI, configure real URLs and run npm run dev.

Never commit secrets, access tokens, environment files or merchant data. See docs/PRODUCT_SPEC.md.
