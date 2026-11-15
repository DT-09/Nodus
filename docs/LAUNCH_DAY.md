# NODUS Launch-Day Release Gate

This checklist separates deployable repository work from external account setup and real-world verification. A successful build does not prove that Shopify installation, merchant data, carrier integrations, billing or App Store approval work.

## 1. Deployment architecture

- [ ] Deploy the React Router application to Vercel using the preset configured in `react-router.config.ts`.
- [ ] Use Vercel Pro or Enterprise for commercial hosting and the configured five-minute Cron schedule. Hobby is for personal, non-commercial use and limits Cron to daily schedules ([plan limits](https://vercel.com/docs/plans/hobby), [Cron configuration](https://vercel.com/docs/project-configuration/vercel-ts)). Verify the schedule appears in the production project.
- [ ] Ensure an authorized adult/business operator owns the hosting account, billing and production access.
- [ ] Use managed PostgreSQL with durable backups and a documented restore procedure.
- [ ] Configure a separate database for Vercel Preview deployments. The Vercel build command runs Prisma migrations.
- [ ] Use Node.js 22 and the repository root as the Vercel project root.
- [ ] Set the Vercel build command to `npm run vercel-build`.
- [ ] Configure Production and Preview environment variables independently: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, `SCOPES`, `DATABASE_URL`, `DIRECT_URL`, `PUBLIC_CONTACT_EMAIL`, `CRON_SECRET`, and `NODE_ENV=production`.
- [ ] Keep credentials server-side. Never expose secrets through client-side environment variables.
- [ ] Confirm Production and Preview use separate databases. Use the provider's pooled URL for `DATABASE_URL` and direct/non-pooled URL for `DIRECT_URL`; both must target the same environment database.
- [ ] Generate distinct high-entropy `CRON_SECRET` values for Production and Preview. Keep them server-side and out of source control.

## 2. Shopify application configuration

- [ ] Create the production app in the authorized Shopify Partner organization.
- [ ] Set the exact production HTTPS origin in `SHOPIFY_APP_URL`.
- [ ] Replace the placeholder `client_id`, `application_url` and redirect URLs in `shopify.app.toml`.
- [ ] Make Shopify Partner Dashboard URLs and TOML URLs match exactly.
- [ ] Confirm requested scopes and current Shopify review requirements.
- [ ] Configure stable outbound egress IPs and restrict Admin API access to those addresses in Shopify. Shopify's public-app security enforcement begins November 20, 2026; do not launch without confirming the applicable current deadline and allowlist status. Vercel Static IPs require a paid Pro feature/add-on; ordinary function egress is not a fixed allowlist.
- [ ] Install on a controlled development store and test OAuth, session persistence, order sync and configured webhooks.
- [ ] Test `app/uninstalled`, `app/scopes_update`, `customers/data_request`, `customers/redact` and `shop/redact`.
- [ ] Verify the 60-day order-access boundary; seek `read_all_orders` approval if older orders are required.
- [ ] Complete App Store listing, disclosures, review submission and approval before claiming public App Store availability.

## 3. Production infrastructure

- [ ] Confirm `/healthz` returns HTTP 200 after migrations and database connectivity are available.
- [ ] Confirm the deployed responses include HSTS, `X-Content-Type-Options: nosniff`, the documented `Referrer-Policy` and restrictive `Permissions-Policy`; keep Shopify Admin embedding functional.
- [ ] Confirm Prisma migrations are applied to the intended database.
- [ ] Enable encrypted automated backups and complete a restore test.
- [ ] Configure uptime, error and resource alerts.
- [ ] Ensure logs redact credentials, session tokens and merchant-sensitive payloads.
- [ ] Verify the hosting provider's outbound IPs are stable, documented and the same IPs configured in Shopify's Admin API access restrictions.
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

- [ ] Run the scoped Founding Merchant Value Programme before proposing any subscription. Do not publish fixed prices until ongoing value, scope and willingness to pay are established.
- [ ] Before any paid conversion, configure Shopify App Pricing plans and verify the existing Partner API subscription lookup and fail-closed access gate against real test subscriptions. Complete approval, activation, plan-change, cancellation, delinquency, refund and uninstall lifecycle tests.
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
| Shopify App Pricing subscription lookup | Implemented behind a feature flag; Partner configuration and live lifecycle tests required |\n| Server-side subscription access gate | Implemented behind a feature flag; fail-closed behavior requires live verification |\n| Plan setup and billing lifecycle | Not verified; Partner plan configuration and lifecycle acceptance remain release gates |
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

The repository can be deployed to Vercel after real credentials, database and Shopify URLs are configured. That does **not** make NODUS enterprise-production complete or commercially launch-ready. Direct carrier invoice APIs remain unimplemented. Shopify App Pricing configuration, full billing-lifecycle verification and scheduled-sync production verification remain external release gates. The public offer should be the no-fee Founding Merchant Value Programme until recurring value is established. Do not charge merchants for unimplemented functionality.


The current product offer remains the no-fee Founding Merchant Value Programme. Subscription discussions must follow delivery of the evidence pack and merchant agreement that recurring value exists. The current app access gate and Shopify App Pricing lookup are code-level implementations only; live Partner configuration and complete lifecycle tests are still required.
