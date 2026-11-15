# NODUS Architecture

NODUS is a Shopify-first modular monolith built with React Router, TypeScript, Prisma and PostgreSQL.

## Implemented boundaries

- **Identity and tenancy:** Shopify embedded-app authentication and merchant-scoped records.
- **Order ingestion:** bounded, resumable Shopify order synchronization with persisted checkpoints and incremental refresh.
- **Evidence:** carrier-cost CSV ingestion, duplicate protection, currency validation and manual order assignment.
- **Reconciliation:** deterministic order-to-cost matching; incomplete, ambiguous and currency-mismatched evidence is not silently included.
- **Diagnostics:** rule-based coverage and exception findings with source references.
- **Simulation:** saved historical replay for flat shipping rates and free-shipping thresholds.
- **Policy visibility:** read-only Shopify Markets shipping snapshot.
- **Reporting:** merchant-scoped CSV export and audit events.
- **Operations:** PostgreSQL migrations, Docker image, readiness endpoint and CI.

## Financial representation

Money is stored as integer minor units with an ISO currency code. Currency precision is validated. Cross-currency arithmetic is rejected until a timestamped, documented FX source is integrated. Tax-inclusive shipping amounts are flagged; contribution is withheld where tax cannot be separated.

## Shopify data and limits

The application pins Admin GraphQL API version 2026-07. Order ingestion is paginated and checkpointed, but Shopify access under the current `read_orders` grant is limited to the most recent 60 days. Older history requires Shopify approval for `read_all_orders`; NODUS does not claim that access.

The current Markets integration reads shipping configuration. It does not mutate checkout settings. Legacy delivery-profile assumptions must not be used as a substitute for the current Markets API model.

## Explicitly not implemented

- Production deployment, production secrets and managed database provisioning.
- Shopify Partner app registration, live install validation and App Store approval.
- Subscription billing and server-side plan entitlements.
- Automated policy writes and post-write verification.
- Scheduled monitoring and durable background job processing.
- PDF invoice extraction.
- Email delivery, merchant notifications and a private commercial enquiry intake.
- Completed legal/privacy review, incident response and tested production backup restoration.

## Security boundaries

All merchant data access must remain scoped to the authenticated Shopify merchant. Webhook signatures must be verified. Never log access tokens or ingest customer personal data unless a documented feature requires it. Do not claim certifications or compliance attestations that have not been independently achieved.

## Release principle

A passing CI run validates migrations, typechecking, tests, build and container construction against the CI environment. It does not prove a real Shopify installation, production deployment, billing flow, App Store approval or a paying customer.
