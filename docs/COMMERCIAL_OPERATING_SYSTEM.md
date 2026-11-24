# NODUS Commercial Operating System

**Status:** implementation map; no claim of validated demand or revenue  
**Baseline:** 2026-11-24  
**Production project:** Cloudflare Pages `nodus-hq`  
**Repository:** `DT-09/Nodus`

## 1. Commercial product definition

NODUS is a merchant-side 3PL invoice control system. It compares a merchant's active, effective-dated rate card with invoice lines and available warehouse activity records. It produces deterministic line-level results, evidence-linked exceptions, an investigation history, recorded provider outcomes and period reports.

The buyer is an e-commerce brand using one or more third-party fulfilment providers. The economic buyer is the owner, finance lead or operations lead accountable for fulfilment spend. The daily user is the person who reviews provider invoices and supporting exports.

The buyer's paid job is not "analytics". It is to answer, with source records:
- Which invoice lines agree with the applicable contract rate?
- Which billed quantities agree with supported activity?
- Which charges are unpriced, ambiguous or unsupported?
- What should the merchant ask the provider to explain?
- What happened to each exception, and which credits or corrections were actually verified?

A calculated variance is not proof of provider liability, a recoverable credit or cash saved.

## 2. Product and engine map

| Layer | Current implementation | Commercial boundary |
|---|---|---|
| Rate-card model | `app/domain/threepl-control.ts` | Effective dates, charge codes, units, fixed/per-unit rules and currency |
| Reconciliation engine | `reconcileThreePLInvoices` | Deterministic calculations; ambiguous and unsupported records remain unresolved |
| Persistent workflow | `functions/api/threepl/data.ts` + D1 migrations | Providers, contracts, invoices, activity, exceptions, events, outcomes and period reports |
| Merchant interface | `/portal` | Invite-only workspace; one-time invitation token, then merchant session |
| Operator lifecycle | `/ops` + `/api/operator/workspaces` | Lead review, workspace provisioning, invitation, trial, checkout and access revocation |
| Public acquisition | `/`, `/product`, `/methodology`, `/pricing`, `/buyer-evaluation` | Explain the offer, qualify a buyer and collect an enquiry |
| Payment state | Stripe/Razorpay helpers and signed webhooks | Subscription becomes active only after provider-confirmed webhook state |

The public browser CSV tool at `/manual-data` is a separate Shopify shipping-revenue-versus-carrier-cost diagnostic. It is not the same engine as the persistent 3PL contract/invoice portal. Do not present the two as one workflow until the product architecture deliberately joins them.

## 3. Buyer journey: required end-to-end state machine

1. **Discover** — buyer arrives through a problem-specific search page, useful diagnostic, partner referral or direct visit.
2. **Understand** — buyer sees the exact inputs, outputs, limits, data handling and commercial scope before sharing information.
3. **Qualify** — buyer submits a minimal enquiry; server validates it and stores it in D1.
4. **Operator review** — an authorized operator sees every offer type, checks fit and records new/contacted/qualified/rejected status.
5. **Provision** — qualified buyer receives a workspace and a one-time invitation token. The token is delivered privately; it is not a public account-creation URL.
6. **Onboard** — merchant adds a provider, confirms an effective-dated contract/rate card, imports an invoice and, where available, activity evidence.
7. **Trial gate** — trial activation is allowed only after a provider, active confirmed contract and completed invoice import exist. The seven-day period starts after the product has usable data, not when a lead form is submitted.
8. **Use** — merchant runs reconciliation, inspects exceptions, records provider responses and outcomes, and generates a period report.
9. **Pay** — authorized seller creates a hosted subscription checkout. The portal must not grant paid status from a browser redirect; signed payment webhooks are the source of truth.
10. **Retain** — each new invoice period creates a repeatable reason to return: new reconciliation, carried-forward exceptions, provider outcomes and a comparable period report.
11. **Exit** — cancellation, suspension, access revocation, data export and deletion requests have explicit paths.

## 4. Commercial offer rules

Keep these offers distinct:
- **Self-serve evaluation:** synthetic sample and public methodology; no customer data required.
- **Managed invoice review:** a separately scoped human service. A public request is not a booking, invoice or payment.
- **Recurring 3PL control:** the persistent merchant workspace and recurring review workflow. A subscription is not active until payment is confirmed.

The public site currently advertises a proposed USD 100/hour invoice-review offer and USD 99/month continuation. These are unvalidated test prices. The subscription code uses plan code `core_99`; no price is proven by code, a pricing page or a checkout link. Never state that a buyer has paid until the payment provider confirms cleared payment.

A one-time hourly engagement needs its own explicit order/payment/delivery lifecycle before it can be sold as instant checkout. Do not reuse the recurring subscription checkout for an hourly service.

## 5. Acquisition and demand measurement

The website must expose the business to existing buyer intent; it must not manufacture demand claims.

Build and measure:
- Search landing pages for 3PL invoice audit, fulfilment invoice reconciliation, warehouse pick-and-pack rate variance, storage billing review and 3PL contract compliance.
- Useful public methodology, CSV templates and a synthetic worked example. Each asset must state its limits and link to a relevant conversion path.
- Search Console impressions, clicks, query terms, indexed pages and crawl errors.
- Cloudflare Web Analytics or an equivalent privacy-respecting event source for landing visits and CTA events.
- Funnel events: landing view → methodology/product view → pricing view → enquiry start → enquiry submit → qualified → workspace provisioned → first invoice imported → first report generated → checkout created → payment confirmed → second-period use → renewal.
- Buyer-pool evidence: search-query volume and intent, relevant merchant community questions, public competitor offers and direct buyer evidence. Separate observed evidence from estimates and hypotheses.

Do not count page views, form submissions, trial invitations, checkout creation or webhook delivery as revenue. Revenue means confirmed funds received by the authorized seller. Recurring demand means actual repeat use and renewal, not a subscription price printed on the site.

## 6. Operating dashboard

Track weekly, using actual counts:
- qualified inbound enquiries and source;
- lead response time;
- qualification and rejection reasons;
- workspaces provisioned;
- onboarding completion and time-to-first-report;
- invoices and lines processed;
- evidence coverage and unresolved rate;
- reports delivered and buyer-accepted findings;
- checkout links created, paid conversions and failed payments;
- second-period activity, renewal, cancellation and refund;
- delivery hours and gross contribution per engagement.

Do not optimize traffic before the enquiry-to-delivery path works. Do not optimize sign-ups before first-value activation works. Do not scale paid acquisition before retention and delivery economics are measured.

## 7. Current launch blockers verified against repository and Cloudflare project configuration

- Production Pages project is `nodus-hq`; production branch is `main`.
- The production configuration lists a D1 binding and public contact/app URL variables.
- The production configuration does not list `NODUS_OPERATOR_SECRET`, `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET`. Preview shows an empty operator-secret value. Operator provisioning and hosted payment therefore cannot be treated as live.
- The production configuration shows `TOKEN_ENCRYPTION_KEY` as an empty secret value. Shopify token-encryption-dependent features must not be treated as ready until a valid secret is configured and verified.
- The lead form stores an enquiry in D1. It does not send an automatic email notification or collect payment.
- `/ops` requires an operator secret and is not usable until the authorized operator credential is configured.
- The 3PL portal is invite-only. The access token must be issued by the operator and delivered privately.
- Stripe/Razorpay webhook handlers exist, but webhook code alone is not a working payment system. Credentials, provider-side webhook configuration, checkout creation and a live test payment are required.
- The Shopify embedded app uses a Node/Prisma runtime and is not proof that the separate Cloudflare Pages portal is fully connected to Shopify OAuth.

Never commit secrets to Git. An authorized adult business operator must own seller identity, payment accounts, contracts, tax, refunds, support and customer-data obligations.

## 8. Acceptance gates before public paid launch

### Buyer experience
- [ ] One consistent product definition across home, product, pricing, methodology, demo, support and search pages.
- [ ] Exact supported buyer, problem, input files, deliverables, limitations and next step are visible.
- [ ] Every CTA resolves to a working route and has a measurable event.
- [ ] Mobile, keyboard and screen-reader flows are checked.

### Engine and delivery
- [ ] Automated tests cover valid matches, rate variances, quantity variances, ambiguous rules, missing activity, units, effective dates, currencies and duplicate inputs.
- [ ] A complete sample run creates exceptions, audit events, outcomes and a period report.
- [ ] Source hashes, source rows, calculations, limitations and report revision are inspectable.
- [ ] Merchant access isolation, invitation expiry/revocation, session expiry and export/deletion are tested.
- [ ] A real buyer acceptance test completes with non-synthetic data under agreed handling terms.

### Commercial operations
- [ ] Every enquiry offer type appears in the operator queue and can be qualified or rejected.
- [ ] A qualified enquiry can be provisioned without manual database edits.
- [ ] A named operator receives and responds to every new enquiry within a stated service window.
- [ ] Trial starts only after the workspace has usable evidence.
- [ ] Seller identity, scope, terms, refund policy, tax handling and support owner are confirmed.
- [ ] Hosted checkout, signed webhooks, cancellation, failed payment and access entitlement are tested with the authorized seller's account.
- [ ] One paid engagement is delivered end to end and accepted by a real buyer before claims of commercial validation.
- [ ] A second billing period is completed before claiming recurring demand.

### Growth and scaling
- [ ] Search indexing and analytics are configured and verified.
- [ ] Organic landing pages attract qualified buyer intent, not just generic traffic.
- [ ] Conversion, delivery capacity, support load, margin and retention are measured.
- [ ] Acquisition spend is not scaled until paid conversion and renewal are demonstrated.

## 9. Immediate engineering priority

The lead-to-workspace handoff was filtered to `offer_type='seven_day_trial'`, while the public enquiry form writes `offer_type='hourly_invoice_review'`. That made the current paid-review enquiries invisible in the operator's primary queue and prevented their normal status/provisioning path. The current implementation change broadens the operator queue to all enquiry types and displays offer, quote and payment state on each lead card.

This fixes the lead visibility/handoff defect. It does not configure the missing operator secret, create payment credentials, send notifications, prove buyer demand or make the service paid. Those remain explicit launch gates.
