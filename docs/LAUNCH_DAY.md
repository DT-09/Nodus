# NODUS Launch-Day Release Gate

This is the operational checklist for moving from a passing codebase to a real merchant launch. Items marked external require the account owner or service operator; a repository commit cannot complete them.

## 1. Business and ownership

- [ ] An appropriately authorized adult/business operator owns the commercial relationship, legal terms, Shopify Partner account and payout arrangements.
- [ ] Confirm the NODUS name and domain can be used commercially; complete trademark and domain clearance.
- [ ] Publish a business-owned support and privacy contact. Do not publish a minor's personal contact details. Set `PUBLIC_CONTACT_EMAIL` to that authorized business inbox; the public evaluation and support pages stay closed when it is unset.
- [ ] Approve Terms of Service, Privacy Policy, data retention/deletion policy and support commitments with qualified review.

## 2. Shopify app

- [ ] Create the production app in the authorized Shopify Partner organization.
- [ ] Replace `client_id`, application URL and redirect URLs in `shopify.app.toml` with the actual app values.
- [ ] Confirm the requested scopes and the current Shopify review requirements.
- [ ] Install on a controlled development store and complete OAuth, session persistence, order sync, webhook delivery, uninstall and redaction tests.
- [ ] Verify the 60-day order access boundary and determine whether `read_all_orders` approval is required for the target buyer.
- [ ] Complete App Store listing assets, disclosures, review submission and approval before claiming public availability.

## 3. Production infrastructure

- [ ] Provision a production HTTPS domain, managed application host and managed PostgreSQL database.
- [ ] Configure production secrets in the hosting provider; never commit them.
- [ ] Deploy the exact CI-verified commit and confirm `/healthz` returns HTTP 200.
- [ ] Run Prisma migrations through the production release process.
- [ ] Configure encrypted backups and complete a restore test.
- [ ] Configure structured redacted logs, uptime/error alerts, resource limits and incident ownership.
- [ ] Verify uninstall and privacy webhooks against the deployed URL.

## 4. Product acceptance

- [ ] Complete a real-store install-to-first-result test.
- [ ] Import a permissioned carrier CSV and test duplicate, invalid currency, malformed row and ambiguous match cases.
- [ ] Verify tenant isolation with two separate stores.
- [ ] Verify tax-inclusive and mixed-currency cases remain correctly qualified.
- [ ] Confirm exports contain only the authenticated merchant's records.
- [ ] Confirm no live shipping policy write is exposed as available.
- [ ] Confirm unsupported capabilities are not marketed as implemented.

## 5. Commercial release

- [ ] Choose the initial offer and price from buyer evidence; do not publish unvalidated price hypotheses as purchasable plans.
- [ ] Configure Shopify-managed pricing or the currently required Shopify billing path in the Partner Dashboard.
- [ ] Verify trial, subscription approval, cancellation, delinquency and entitlement enforcement in test and permitted live environments.
- [ ] Publish buyer-owned support contact, privacy policy and terms.
- [ ] Publish the App Store listing only after approval.
- [ ] Define the first merchant evaluation scope and acceptance criteria in `docs/BUYER_EVALUATION.md`.

## 6. Release verification record

Record:
- Release commit SHA:
- Production URL:
- Shopify app ID:
- Production database migration status:
- `/healthz` result and timestamp:
- Test store install result:
- Webhook verification result:
- Billing test result:
- Backup restore result:
- App Store status:
- Release owner:

## Current repository status

The codebase has a passing CI run for migrations, typechecking, tests, build and Docker image construction. The external setup above is not present in the repository and has not been verified. Until the blocking items are completed, NODUS is not a public production launch and must not accept merchant payments.
