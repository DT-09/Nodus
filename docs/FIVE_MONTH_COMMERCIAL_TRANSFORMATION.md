# NODUS — Five-Month Commercial Transformation Plan

**Planning window:** 23 November 2026 – 23 April 2027  
**Status:** Execution plan; all commercial targets are hypotheses until observed  
**Product wedge:** Shopify shipping economics and fulfillment-cost control  
**Primary buyer:** Established Shopify brands with physical goods, recurring carrier/3PL costs, multiple shipping methods or locations, and enough shipment volume to justify monthly control.

## 1. The strategic decision

NODUS will not become a generic Shopify operating system during this five-month window. It will become the best focused system we can build for one costly, recurring job:

> Show a merchant where shipping economics are deteriorating, prove each finding against source records, explain the likely cause, and help the merchant track resolution.

The product loop is:

1. Connect authorized Shopify data and ingest carrier/3PL cost evidence.
2. Reconcile orders, fulfillments, shipments, labels, invoice lines, credits and adjustments.
3. Quantify coverage and isolate exceptions without treating missing evidence as zero.
4. Explain likely causes with deterministic rules and source references.
5. Simulate supported shipping-policy alternatives using historical data and explicit assumptions.
6. Assign, track and document merchant-approved actions.
7. Re-measure the next period and show whether the issue recurred or changed.

Do not expand into generic CRM, inventory, marketing, accounting, customer support or autonomous store administration before this loop is proven.

## 2. Commercial thesis and differentiation

A reconciliation report alone is easy to copy and often episodic. NODUS must earn recurring use through a continuous control workflow:

- **Evidence graph:** link each order, fulfillment, shipment, label, invoice line, adjustment and credit to its source.
- **Coverage-aware economics:** report matched, unmatched, ambiguous, duplicate, excluded and stale evidence separately.
- **Root-cause workflow:** turn exceptions into explainable cases with owner, status, next action and outcome.
- **Policy decision support:** replay supported shipping policy scenarios against historical baskets; clearly distinguish historical replay from a demand forecast.
- **Period-over-period control:** compare recurring cost patterns, surcharge mix, exception rates and policy outcomes only where data is comparable.
- **Audit trail:** preserve source IDs, calculation versions, reviewer decisions and merchant-approved changes.

NODUS must not claim that a shipping shortfall is carrier overbilling, recoverable money, profit loss or guaranteed savings. A result becomes a verified outcome only when supported by source evidence and merchant confirmation.

## 3. Ideal customer profile

### Primary segment

Shopify merchants selling physical products that:
- ship at meaningful recurring volume;
- use one or more external carriers or a 3PL;
- have multiple shipping zones, methods, profiles, warehouses or package patterns;
- receive regular carrier invoices or cost exports;
- have an operations, ecommerce or finance owner responsible for shipping economics.

### Qualification signals

Prioritize merchants with:
- split shipments or multiple labels per order;
- recurring surcharges, adjustments or address corrections;
- material differences between customer shipping charges and fulfillment costs;
- frequent changes to shipping rates or free-shipping thresholds;
- enough data to support a defensible comparison.

Do not prioritize very low-volume, digital-only or single-method stores without usable cost evidence.

### Buyer and user

- Economic buyer: founder, COO, ecommerce director or finance/controller.
- Daily operator: fulfillment, ecommerce operations or finance analyst.
- Trigger: rising carrier costs, margin pressure, a 3PL/carrier review, a shipping-policy change, or unexplained cost variance.

## 4. Product architecture and release gates

### P0 — Production trust

- Verify Shopify Partner configuration, OAuth, scopes, webhook registration and end-to-end installation.
- Confirm token encryption, tenant isolation, session security, uninstall cleanup and privacy webhooks.
- Verify production D1 schema and migrations against the live database.
- Add integration tests against a development Shopify store.
- Add idempotent sync, pagination, retry, rate-limit handling and resumable checkpoints.
- Make data freshness, coverage and sync failures visible to the merchant.
- Do not label the integration production-ready until installation and data sync pass end-to-end tests.

### P1 — Correct shipping evidence model

The current exact-order-reference reconciliation is a useful baseline, not a complete shipping-cost ledger. Extend it to support:
- one order to multiple fulfillments, packages and labels;
- multiple invoice lines per shipment;
- tracking and label references where authorized data exists;
- partial fulfillments, voided labels, refunds, credits and late adjustments;
- duplicate invoice detection;
- tax, duties, surcharges and currency as distinct concepts;
- explicit candidate matches and human review for ambiguous records;
- deterministic decimal arithmetic and reproducible calculation versions.

Never silently allocate an unmatched charge or infer missing cost.

### P2 — Merchant action and outcome workspace

Each material exception should have:
- stable case ID and rule version;
- source evidence and calculation;
- severity, confidence and explanation;
- recommended next step;
- owner, status, due date and notes;
- resolution evidence and merchant confirmation;
- period-over-period recurrence status.

The first release can track actions without writing to Shopify. Read-only by default. Any future write operation requires explicit merchant approval, least-privilege scopes, audit logging and read-back verification.

### P3 — Recurring value

- Scheduled order and fulfillment sync with freshness indicators.
- Repeatable carrier/3PL data import and mapping templates.
- Monthly cost and exception trends.
- Alerts only for rules with validated signal quality and clear thresholds.
- Monthly executive decision brief and downloadable evidence pack.
- Tenant-level history, role-based access and data-retention controls.

### P4 — Distribution readiness

- Shopify App Store listing only after policy, security, support and installation requirements are met.
- Clear onboarding, sample data, in-product explanation and first-value workflow.
- Search landing pages for specific, high-intent jobs (3PL invoice reconciliation, Shopify shipping cost analysis, carrier surcharge review, free-shipping threshold analysis).
- Useful free diagnostic that leads naturally into the paid product.
- Agency, 3PL and ecommerce-operations partnerships with clear referral terms.

## 5. Commercial model — hypotheses to test

Do not treat the current $149 one-time audit or $99/month monthly review as validated pricing. Test willingness to pay against buyer segment, shipment volume, evidence complexity and verified value.

Potential offer structure:

1. **Free diagnostic:** limited, self-serve, transparent about local processing and unsupported cases.
2. **Paid baseline review:** fixed scope, human-reviewed, paid before delivery through a compliant adult-operated business/payment arrangement.
3. **Core subscription:** recurring reconciliation, exception workflow, history, monitoring and monthly reporting.
4. **Advanced / multi-location:** higher volume, multiple carriers/3PLs, additional users, richer reporting and integrations.
5. **Implementation service:** optional fixed-scope data mapping and onboarding; not a disguised mandatory consulting dependency.

Price points must be established by paid pilots and observed renewal, not by copying competitors or inventing ROI. Do not promise savings or price against an unverified recovery estimate.

## 6. Distribution without dependence on mass cold outreach

Primary acquisition assets:
- Shopify App Store discovery once eligible and approved.
- High-intent search pages tied to concrete merchant problems.
- Free shipping-cost diagnostic and sample evidence pack.
- Public methodology, sample reports and transparent limitations.
- Partnerships with Shopify agencies, 3PL consultants and ecommerce finance operators.
- Referral mechanism after a merchant has received a useful result.
- Product-led onboarding with a clear path from first diagnostic to connected store to recurring control.

Measure qualified traffic and completed activation, not page views alone. Do not fabricate reviews, testimonials, customer logos, savings, integrations or app approval.

## 7. Five-month execution sequence

### Phase 1 — Weeks 1–2: prove the wedge and close production gaps
- Freeze the ICP and one paid job.
- Audit the current code against actual deployed behavior.
- Complete Shopify install/sync test matrix.
- Run representative data through reconciliation tests, including split shipments, duplicate charges, partial evidence and credits.
- Remove or relabel claims that exceed verified functionality.
- Prepare a fixed-scope pilot and report template.

**Exit gate:** one complete test-store installation and repeatable evidence-backed review, with known limitations documented.

### Phase 2 — Weeks 3–6: deliver paid pilot outcomes
- Recruit a small number of qualified design partners through inbound, existing relationships and partner referrals.
- Run the same scoped review for each.
- Record data coverage, delivery time, accepted findings, operator actions and buyer feedback.
- Charge for at least one real engagement using a compliant seller/payment setup.
- Identify which findings recur and which reports actually change decisions.

**Exit gate:** paid delivery completed, buyer confirms usefulness, and the next-period use case is explicit.

### Phase 3 — Weeks 7–10: convert repeat work into software
- Build the highest-frequency exception workflow.
- Add durable tenant-scoped history and period comparison.
- Automate only deterministic steps that passed manual quality review.
- Introduce a recurring plan with explicit entitlements and compliant billing.
- Track activation, time-to-first-value, weekly active stores and renewal intent.

**Exit gate:** merchants can complete the recurring workflow without bespoke founder intervention for every step.

### Phase 4 — Weeks 11–16: scale qualified acquisition
- Publish high-intent content and the free diagnostic.
- Launch partner referral materials and onboarding.
- Submit to the Shopify App Store only when product, policy, support and security gates are met.
- Test pricing by segment and usage.
- Improve conversion from diagnostic to connected store to paid plan.

**Exit gate:** repeatable acquisition channel with measurable paid conversion and acceptable support burden.

### Phase 5 — Weeks 17–22: retention and unit economics
- Improve recurring exception signal quality.
- Reduce manual delivery time per merchant.
- Track gross margin, churn, expansion, support cost and data-processing cost.
- Build multi-store and higher-volume features only when paid demand supports them.
- Stop channels and features that do not improve activation, retention or contribution margin.

**Exit gate:** repeat customers, demonstrable retained value and a credible path to profitable growth.

## 8. Operating dashboard

Review weekly:
- qualified merchant visits;
- free diagnostic completions;
- connected-store activations;
- time to first useful finding;
- evidence coverage and match rate;
- number of findings accepted by merchants;
- actions opened, resolved and verified;
- paid conversion;
- recurring revenue actually collected;
- renewal and churn;
- average delivery/support time per account;
- gross margin and contribution margin;
- security incidents, sync failures and data deletion requests.

A lead is not a customer. A request is not a sale. A subscription started is not retained revenue. A flagged amount is not recovered value.

## 9. Financial reality and decision rule

A multi-million-dollar personal net worth inside five months is an extreme outlier, not a forecast. Revenue, profit, company valuation and founder-owned liquid wealth are different measures. No product plan can guarantee the requested outcome.

The correct objective is to maximize the probability of building a durable, high-value business while proving each commercial assumption with real transactions. Do not spend five months building features before asking whether buyers will pay. Do not raise the price until the value is demonstrated. Do not broaden the product before the wedge retains customers.

## 10. Governance and age-related operating constraints

The founder is under 18. Contracts, payment processing, tax registration, business banking and platform accounts must follow the relevant jurisdiction and provider rules. Use an authorized adult-operated seller or obtain appropriate legal guidance where required. Do not bypass age restrictions, misrepresent identity or accept customer data before security and contractual controls are ready.

## 11. Definition of success on 23 April 2027

NODUS should be judged on:
- production-verified Shopify onboarding and data sync;
- a correct, tested shipping evidence model;
- real merchants using the product;
- paid work delivered to a documented scope;
- recurring usage and renewal evidence;
- measurable merchant-accepted outcomes;
- repeatable acquisition;
- transparent unit economics and operating controls.

The multi-million-dollar ambition remains the upside target. These operating results are the work that can make NODUS valuable enough to pursue it.
