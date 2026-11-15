# NODUS Launch-Day Release Gate

This checklist separates deployable repository work from external account setup and real-world verification. A successful build does not prove that Shopify installation, merchant data, carrier integrations, billing or App Store approval work.

## 1. Deployment architecture

- [ ] Deploy the React Router application to Vercel using the preset configured in `react-router.config.ts`.
- [ ] Use managed PostgreSQL with durable backups and a documented restore procedure.
- [ ] Configure a separate database for Vercel Preview deployments. The Vercel build command runs Prisma migrations.
- [ ] Use Node.js 22 and the repository root as the Vercel project root.
- [ ] Set the Vercel build command to `npm run vercel-build`.
- [ ] Configure Production and Preview environment variables independently: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, `DATABASE_URL`, `PUBLIC_CONTACT_EMAIL`, `CRON_SECRET`, and `NODE_ENV=production`.
- [ ] Keep credentials server-side. Never expose secrets through client-side environment variables.
- [ ] Confirm Production and Preview use separate databases.
- [ ] Confirm the selected Vercel plan supports the configured five-minute Cron schedule; verify the schedule appears in the production project.
- [ ] Generate distinct high-entropy `CRON_SECRET` values for Production and Preview. Keep them server-side and out of source control.

## 2. Shopify application configuration

- [ ] Create the production app in the authorized Shopify Partner organization.
- [ ] Set the exact production HTTPS origin in `SHOPIFY_APP_URL`.
- [ ] Replace the placeholder `client_id`, `application_url` and redirect URLs in `shopify.app.toml`.
- [ ] Make Shopify Partner Dashboard URLs and TOML URLs match exactly.
- [ ] Confirm requested scopes and current Shopify review requirements.
- [ ] Install on a controlled development store and test OAuth, session persistence, order sync and configured webhooks.
- [ ] Test `app/uninstalled`, `app/scopes_update`, `customers/data_request`, `customers/redact` and `shop/redact`.
- [ ] Verify the 60-day order-access boundary; seek `read_all_orders` approval if older orders are required.
- [ ] Complete App Store listing, disclosures, review submission and approval before claiming public App Store availability.

## 3. Production infrastructure

- [ ] Confirm `/healthz` returns HTTP 200 after migrations and database connectivity are available.
- [ ] Confirm Prisma migrations are applied to the intended database.
- [ ] Enable encrypted automated backups and complete a restore test.
- [ ] Configure uptime, error and resource alerts.
- [ ] Ensure logs redact credentials, session tokens and merchant-sensitive payloads.
- [ ] Assign an operational owner and incident response procedure.
- [ ] Verify database connection limits under concurrent serverless requests.

## 4. Product acceptance

- [ ] Complete a real development-store install-to-first-result test.
- [ ] Verify initial backfill, pagination continuation and incremental refresh.
- [ ] Confirm tax-inclusive orders and mixed currencies remain correctly qualified.
- [ ] Import permissioned carrier CSV samples; test duplicates, malformed rows, invalid currencies and ambiguous matches.
- [ ] Verify new evidence invalidates prior complete-coverage attestations.
- [ ] Verify two separate stores cannot access each other's records.
- [ ] Confirm exports contain only the authenticated merchant's records.
- [ ] Confirm no live shipping-policy write is exposed.
- [ ] Confirm unsupported features are not described as implemented.

## 5. Commercial readiness — blocking

- [ ] Agreed price hypotheses: $99, $199 and $299 per month. Define exact plan limits and feature entitlements before presenting them as purchasable subscriptions.
- [ ] Implement Shopify-supported recurring billing and server-side entitlement enforcement.
- [ ] Test approval, activation, plan changes, cancellation, delinquency and uninstall.
- [ ] Do not accept payment until advertised paid capabilities are implemented and verified.
- [ ] Publish accurate Terms, Privacy Policy, data retention/deletion policy and business-owned support contact.
- [ ] Have an appropriately authorized adult/business operator own legal, financial, Shopify Partner and payout arrangements.
- [ ] Complete trademark and domain clearance before broad brand launch.

## 6. Integration truth table

| Capability | Repository status |
|---|---|
| Shopify order ingestion | Implemented; live-store verification required |
| Carrier cost CSV import | Implemented |
| UPS direct API | Not implemented / not verified |
| FedEx direct API | Not implemented / not verified |
| USPS direct API | Not implemented / not verified |
| Reconciliation and diagnostics | Implemented; validation required |
| Historical policy simulation | Implemented |
| Shopify policy writes | Disabled |
| Scheduled Shopify order refresh | Implemented in repository; production Cron, credentials and execution not verified |
| Carrier invoice polling, policy-drift detection and merchant alerts | Not implemented |
| Recurring billing and entitlements | Not implemented |
| App Store approval | External; not verified |

## 7. Release verification record

- Release commit SHA:
- Vercel Production deployment URL:
- Shopify app ID:
- Production database migration status:
- `/healthz` result and timestamp:
- Development-store install result:
- Order backfill and incremental sync result:
- Webhook verification result:
- Tenant-isolation test result:
- Backup restore result:
- Billing status:
- App Store status:
- Release owner:

## Current release decision

The repository contains a deployable Vercel-targeted application and a protected scheduled Shopify order-refresh endpoint. A successful build still does **not** prove production readiness. The current product can be evaluated as a CSV-first, evidence-led workflow after Shopify OAuth, database isolation, webhooks, tenant boundaries, backups and scheduled execution pass real-store acceptance tests. Do not market direct carrier invoice APIs, policy-drift alerts, or autonomous policy writes: they are not implemented. Do not accept recurring subscription payments until Shopify App Pricing, server-side entitlements, plan limits and the complete subscription lifecycle are configured and tested. Public commercial operation also requires an appropriately authorized adult/business operator for legal, financial, Shopify Partner and payout responsibilities.
