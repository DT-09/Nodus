# NODUS Architecture

NODUS is a modular monolith built on Shopify's React Router app framework. Authentication is isolated in app/shopify.server.ts; Prisma access in app/db.server.ts; pure calculations in app/domain; Shopify data access in app/services.

## Domain boundaries

Identity and tenancy; Shopify ingestion and webhooks; source evidence; reconciliation; diagnostics; historical policy simulation; policy approval state machine; billing and entitlements; reporting and monitoring.

## Financial representation

Internal calculations use integer minor units and an ISO currency code. Cross-currency arithmetic is rejected until a timestamped, documented FX source is integrated.

## Safety boundaries

The initial authenticated snapshot reads a bounded latest-order sample, not a complete ledger. Cost evidence is not ingested. The dashboard therefore does not calculate under-recovery. Shopify shipping writes are disabled until API capability and read-back verification are proven against a development store.

## Shopify API baseline

The application pins Admin API 2026-07. Shopify recommends its React Router template for most new apps. deliveryProfileUpdate is a potential controlled-write API; each operation requires permission review, a validated before-state, explicit approval and read-back verification.
