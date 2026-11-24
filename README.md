# NODUS

**Hourly 3PL invoice review and monthly fulfilment-cost control for Shopify and direct-to-consumer brands.**

NODUS checks fulfilment invoices against merchant-provided rate cards and available operational activity. The service is designed for e-commerce businesses that outsource warehousing, pick/pack, storage, returns or fulfilment to a third-party logistics provider (3PL).

Shopify is a merchant context, not a native integration in the current release. The workflow uses merchant-supplied CSV exports. It does not require Shopify OAuth, a store password or direct 3PL API credentials.

## Commercial offer

### First engagement — hourly invoice review

- Proposed opening rate: **USD 100 per hour**.
- Initial scope: one 3PL invoice, its active rate card and available activity export, subject to file compatibility.
- Deliverables: supported rate checks, quantity checks where references permit, an exception register, evidence gaps, questions for the provider and an exportable review pack.
- No recovery percentage, refund promise or guaranteed savings claim.
- Scope, qualified reviewer, fee and delivery terms must be confirmed in writing before work begins.

The USD 100 hourly rate is a proposed price to test, not a validated market-clearing rate or evidence of completed sales.

### Optional continuation — monthly control

- Proposed pilot price: **USD 99/month**.
- Pilot scope: one 3PL, one monthly invoice, one active rate card and one activity export.
- Carries open exceptions forward and preserves a dated review history.
- No automatic conversion from an hourly engagement. The merchant must approve the monthly scope separately.

The monthly price is also unvalidated. The current public site does not collect payment or activate a subscription.

## What the merchant receives

1. **Working review workspace** — import supported rate-card, invoice and operational-activity CSVs.
2. **Reconciliation** — compare invoice lines with effective-dated rates and exact activity references where available.
3. **Exception register** — separate matched, unmatched, ambiguous and incomplete records.
4. **Investigation history** — preserve notes, events and provider outcomes.
5. **Review pack** — export source references, calculations, exceptions and limitations.

A calculated variance is a review signal. It is not proof of provider liability, a valid dispute, recoverable money or realized savings. The merchant remains responsible for provider communications and payment decisions.

## Current file limits

- CSV only.
- Maximum 5 MB per file.
- Maximum 20,000 data rows per file.
- One invoice per invoice CSV.
- PDF extraction, spreadsheet ingestion, direct Shopify connections and live 3PL API polling are not included in the current release.

### Rate card CSV

Required: `charge_code, unit, pricing, rate, currency, effective_from`

Optional: `effective_to`

`pricing` is `per_unit` or `fixed`. Confirm imported rates against the signed agreement before activating them.

### Invoice CSV

Required: `invoice_number, invoice_date, charge_code, quantity, unit, amount, currency`

Optional: `external_line_id, description, service_date, period_start, period_end, activity_reference`

All lines in a file must use one invoice number, invoice date and currency.

### Operational activity CSV

Required: `record_id, reference, charge_code, quantity, unit`

Optional: `occurred_at`

Quantity comparisons require an exact reference, charge code and unit match. Missing activity is not treated as zero.

## Public website and intake

- Homepage: `/`
- Hourly review request: `/buyer-evaluation`
- Pricing: `/pricing`
- Sample review: `/demo`
- Browser CSV workflow: `/manual-data`
- Merchant workspace: `/portal`
- Private operator console: `/ops`

The request form stores a service enquiry in the merchant lead table. It does not create a booking, charge a card or promise service availability. A qualified reviewer, file compatibility, scope and seller/payment arrangements must be confirmed before paid work.

## Payment and seller status

- The existing Razorpay and Stripe adapters are not enabled for live payment processing.
- Live payment requires an authorized adult seller to complete provider onboarding, configure encrypted production secrets, register webhooks, apply the correct billing migration and pass the full test-mode lifecycle.
- Tax, refunds, disputes, seller identity and customer billing support require adult-owned business operations.
- No customer payment, completed paid pilot, renewal or revenue is established by this repository.
- Do not represent NODUS as having a qualified delivery team until the reviewer is confirmed and contracted.

## Cloudflare production configuration

Cloudflare Pages project: `nodus-hq`  
Production URL: https://nodus-hq.pages.dev  
Production branch: `main`  
Build command: `npm run build`  
Build output: `build/client`

Required binding: `NODUS_DB` (Cloudflare D1).  
Required secret: `NODUS_OPERATOR_SECRET` (high-entropy secret of at least 32 characters; never commit it to Git).

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

A successful build is not proof of a commercial business. Commercial acceptance also requires a qualified reviewer, adult-owned seller and payment operations, a paid pilot, and documented customer acceptance.
