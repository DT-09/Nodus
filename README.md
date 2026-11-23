# NODUS

**Merchant-side 3PL billing and fulfilment-cost control.**

NODUS compares third-party logistics (3PL) invoices with merchant-confirmed contract rates and available operational activity. It preserves source references, investigation history and provider outcomes in a persistent merchant workspace.

The product is platform-neutral. Shopify is not required. The initial onboarding path uses merchant-supplied CSV exports.

## Commercial product

NODUS is designed for e-commerce brands that outsource warehousing, pick/pack and fulfilment to one or more 3PL providers.

The recurring workflow:

1. Register a 3PL provider and import its effective-dated contract rate card.
2. Import each invoice as a separate CSV file.
3. Import operational activity where the provider supplies stable record references.
4. Reconcile invoice charges against the applicable contract rules.
5. Investigate exceptions and preserve source evidence.
6. Record provider responses and distinguish raised, promised, posted and verified outcomes.
7. Generate period reports and carry unresolved cases into the next review.

A calculated variance is a review signal. It is not proof of provider liability, a valid dispute, recoverable money or realized savings.

## Current application

Production marketing site: https://nodus-hq.pages.dev

Private entry points:
- Merchant workspace: `/portal`
- Operator console: `/ops`
- Trial request: `/buyer-evaluation#trial-request`

Core implementation:
- Merchant-specific D1 workspaces and tenant-scoped provider, contract, invoice, activity, exception, event, outcome and report records.
- CSV intake for rate cards, one invoice per file, and operational activity.
- Integer minor-unit money arithmetic with currency precision.
- Effective-dated contract matching and explicit ambiguity handling.
- Exact-reference activity matching; missing activity is not treated as zero.
- Reconciliation run hashes and source-row references.
- Persistent exception investigation and case events.
- Outcome states that separate raised, promised, posted and verified adjustments.
- Period reports with currency-separated totals and equal-length prior-period comparisons.
- One-time merchant invitation links exchanged for expiring HttpOnly sessions.
- Private operator session and workspace lifecycle controls.

## CSV formats

Rate card:
- Required: `charge_code, unit, pricing, rate, currency, effective_from`
- Optional: `effective_to`
- `pricing` is `per_unit` or `fixed`.
- Confirm every imported rate against the signed agreement before activating it.

Invoice (one invoice per file):
- Required: `invoice_number, invoice_date, charge_code, quantity, unit, amount, currency`
- Optional: `external_line_id, description, service_date, period_start, period_end, activity_reference`
- All lines in a file must use one invoice number, invoice date and currency.

Operational activity:
- Required: `record_id, reference, charge_code, quantity, unit`
- Optional: `occurred_at`
- Quantity comparisons require an exact reference, charge code and unit match.

Uploads are CSV-only, limited to 5 MB per file and 20,000 data rows. PDF extraction, spreadsheet ingestion and direct provider APIs are not part of the current release.

## Cloudflare production configuration

Cloudflare Pages project: `nodus-hq`  
Production URL: https://nodus-hq.pages.dev  
Production branch: `main`  
Build command: `npm run build`  
Build output: `build/client`

Required binding:
- `NODUS_DB`: Cloudflare D1 database.

Required secret:
- `NODUS_OPERATOR_SECRET`: high-entropy secret of at least 32 characters. Never commit it to Git.

The 3PL workflow does not require Shopify Partner credentials, Shopify OAuth, Shopify Admin API access or direct 3PL API credentials.

## Database migrations

Apply in lexical order only after inspecting the actual target database:

```sh
npx wrangler d1 execute nodus-leads --remote --file=migrations/0000_commercial_base.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0001_shopify.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0002_commercial_intake.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0003_lead_lifecycle_audit.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0003_threepl_control.sql
npx wrangler d1 execute nodus-leads --remote --file=migrations/0004_one_time_invitation_sessions.sql
```

For an existing database, inspect `sqlite_master` and `PRAGMA table_info` first. The migrations contain `ALTER TABLE` statements and must not be blindly rerun. Verify every migration against a non-production database before applying it to production.

## Commercial status and limits

- The seven-day trial request is a qualification request; it does not automatically activate a trial.
- Operator provisioning and access-token issuance are implemented. Automatic customer invitation email delivery is not.
- Stripe-hosted USD 99/month subscription checkout is implemented for operator-issued links. Signed webhooks activate access only after a paid invoice, track payment failures, and schedule cancellation at period end.
- Live payment processing remains disabled until an authorized adult seller configures encrypted `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, registers the `/api/stripe/webhook` endpoint, and tests the full lifecycle in Stripe test mode.
- Tax handling, seller identity, refunds/disputes and customer billing support still require adult-owned business operations.
- The USD 99/month price is a hypothesis, not validated willingness to pay.
- No paying merchant, completed paid pilot, renewal, customer result or revenue is established by this repository.
- No SLA or inventory reconciliation is offered.
- NODUS does not automatically contact providers, file disputes, approve invoices, make payments or modify merchant platform records.
- Original uploaded files are processed in memory; normalized records, file hashes and source references are stored.

## Development

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
npm run verify:deployment
npm run typecheck
npm test
npm run build
```

A successful build is not proof of a production-ready service or a commercial business. Production acceptance also requires migration verification, tenant-isolation testing, data lifecycle procedures, operational monitoring, a legitimate payment process and an authorized merchant pilot.
