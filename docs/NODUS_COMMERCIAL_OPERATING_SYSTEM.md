# NODUS Commercial Operating System

**Product:** NODUS — 3PL Billing & Performance Control  
**Buyer:** Shopify merchant finance or operations owner  
**Initial delivery:** software-backed monthly control service  
**Commercial standard:** claim only what is implemented, tested and supported by source evidence.

## 1. The business

NODUS is the merchant-side control layer for outsourced fulfilment relationships. It is not a WMS, generic dashboard or one-off invoice audit.

Every billing period it must answer:
1. What did the provider charge?
2. Which charges agree with the effective agreement and available activity evidence?
3. Which discrepancies require investigation?
4. What did the provider promise to correct?
5. Which credits actually appeared and were verified?
6. How are cost, exceptions and resolution outcomes changing?

The durable asset is the connected merchant-owned history of agreements, source records, calculations, cases, provider responses and verified outcomes.

## 2. Market position

The category already contains invoice-audit products, reconciliation tools and 3PL operating systems. A CSV invoice checker is not a defensible differentiator.

The wedge is **cross-period accountability**: link contract/rate rule → invoice line → supporting activity → investigation → provider response → posted adjustment → subsequent period report.

Research reviewed 23 November 2026:
- Shopify 3PL app category: https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-third-party-logistics-3pl
- Ratecard Audit comparison: https://rotomal.com/3pl-invoice-audit/
- Shopify fulfilment software overview: https://www.shopify.com/blog/ecommerce-fulfillment-software
- 2026 3PL software comparison: https://www.technbrains.com/blog/best-3pl-software/

These sources establish category activity, not market size, demand or NODUS differentiation. Recheck competitor capabilities and prices before publishing comparisons.

### Positioning

> NODUS gives Shopify merchants an independent, evidence-linked record of what their 3PL agreed to charge, what it billed, what the available operational records support, and whether reported problems were resolved.

### Claims we must not make

- No guaranteed savings, credits or provider liability.
- A calculated variance is not a confirmed overcharge.
- A promised credit is not a posted credit; a posted credit is not verified until matched to evidence.
- Missing activity is not proof that an activity did not occur.
- SLA performance is excluded unless contractual definitions and required timestamps exist.
- Inventory accuracy is excluded until receipt, movement, adjustment and count records are implemented.
- Shopify or 3PL integrations are not live until installed and end-to-end tested in production.

## 3. Initial ideal customer

Qualify only where the merchant:
- runs a Shopify store selling physical goods;
- uses at least one external 3PL;
- receives recurring itemised provider invoices;
- has a written agreement, rate card or verifiable billing terms;
- can export invoices and enough activity data to support checks;
- has a named finance or operations owner who can act on findings;
- has recurring review burden, uncertainty or disputes.

Defer merchants without usable source records, an accountable buyer or a material recurring problem. Do not invent order-volume thresholds; derive them from observed economics.

## 4. Commercial offer

### Seven-day evaluation

This is a data-fit and workflow test, not an unlimited free bespoke audit. Start the clock only after the workspace is usable and contains a confirmed contract, provider and imported invoice.

Evaluate supported formats, checks that can run without guessing, actionable findings, case workflow and willingness to review the next billing period.

### Core — proposed $99/month

This price is a hypothesis, not validated willingness to pay. Include only after production acceptance:
- persistent provider and effective-dated contract records;
- recurring invoice and activity intake;
- deterministic reconciliation with source-row lineage;
- persistent exception and provider-response tracking;
- promised, posted and verified adjustment ledger;
- period reports and equal-length prior-period comparisons;
- clearly scoped operator-assisted review.

Do not bundle unbuilt SLA monitoring, inventory reconciliation, automatic provider contact, Shopify OAuth, direct 3PL APIs or automated payment collection.

### Renewal value test

Before asking for renewal, document at least one recurring benefit: material supported discrepancies the merchant chose to investigate, measurable review time saved, earlier evidence-backed operational issue, better dispute follow-through, or useful provider-review evidence.

Never count calculated exposure as recovered savings. Internal target: defensible recurring value of at least 3× the fee; this is an internal test, not a promised return.

## 5. Monthly operating cycle

1. Collect the next invoice, current contract/rate changes and available activity exports.
2. Validate period coverage, currency, row counts, duplicates, required columns, effective dates and source integrity.
3. Reconcile deterministically; retain engine version, input hash, source references and limitations.
4. Triage findings as supported variance, missing evidence, ambiguous rule or no reproduced issue.
5. Record merchant investigation decisions and provider responses.
6. Track outcomes as raised, promised, posted, verified or rejected.
7. Compare invoice totals, open cases and verified outcomes with the immediately preceding equal-length period. Keep currencies separate.
8. Identify recurring patterns and next actions. Period comparisons are descriptive, not causal.
9. Show the merchant what changed, what remains open, what was verified and what the next review covers.

## 6. First merchant pilot acceptance

A pilot is not successful because a workspace exists or a report downloads. Acceptance requires:
- real merchant authorisation to use business records;
- validated contract, invoice and activity inputs;
- reproducible findings with retained evidence;
- merchant review of each finding and its actionability;
- at least one provider response or explicit no-action decision;
- a second billing period processed, or explicit merchant confirmation that the recurring review is valuable before that period arrives;
- explicit agreement to pay and subsequent renewal.

Record negative results. A clean invoice can show review coverage, but does not prove savings.

## 7. Acquisition system

Build high-intent inbound assets:
- 3PL invoice review checklist;
- rate-card and invoice CSV templates;
- evidence guide explaining which records support each charge check;
- worked examples clearly labelled as synthetic;
- pages for specific charge categories only when the product supports those checks;
- transparent compatibility and trial-request page.

Seek genuine referrals from ecommerce accountants, fractional finance operators and independent fulfilment consultants. Never fabricate partnerships, reviews, customer logos or case studies. SEO is not an immediate revenue source; measure qualified requests and conversion, not page views alone.

## 8. Commercial scorecard

Track weekly:
- qualified trial requests and data-fit rate;
- time from request to usable workspace;
- first reconciliation completion;
- findings the merchant accepts as worth investigating;
- provider responses;
- verified posted credits, separately from exposure;
- operator minutes per merchant;
- paid conversion, second-period completion, renewal and cancellation reasons.

Include operator time, hosting, support, payment fees and compliance in unit economics. If manual effort breaks the economics, automate a proven repeated task or narrow the service.

## 9. Product gates

### Gate A — safe pilot
- production D1 migration and bindings verified;
- operator secret configured outside source control;
- tenant isolation tested on every read/write route;
- invitation, session expiry, revocation and workspace status tested;
- CSV limits, malformed files, duplicates and exact money arithmetic tested;
- export/deletion, retention, backup and restore procedures operational;
- privacy notice, terms, data processing terms and incident contact ready;
- no customer PII required for the first workflow.

### Gate B — repeatable monthly service
- period comparisons tested against fixtures and edge cases;
- repeated imports idempotent or explicitly versioned;
- historical contract versions auditable;
- cases/outcomes cannot silently overwrite evidence;
- operator workload measured;
- second-period workflow accepted by a real merchant.

### Gate C — scale, only after customer evidence
- Shopify read-only OAuth and webhooks;
- direct 3PL connectors customers actually require;
- SLA measurement with explicit contractual definitions;
- inventory movement and adjustment reconciliation;
- self-serve billing, invoices, tax and failed-payment handling;
- customer-controlled notifications.

## 10. Decision rules

- If merchants cannot provide activity records, redesign around the records they do have; never pretend invoice-only data proves quantities.
- If findings are rarely actionable, change the data model or target segment before adding dashboards.
- If customers value only a one-time audit, sell a scoped one-off service rather than disguising it as SaaS.
- If second-period usage does not happen, recurring value is unproven.
- If operator effort exceeds the economics, automate the proven repeated task or narrow scope.
- Never merge or deploy based only on a successful build. Require production acceptance and rollback readiness.

**Commercial truth:** NODUS earns recurring revenue only when a real merchant repeatedly receives enough verified control, saved effort or decision value to choose renewal.
