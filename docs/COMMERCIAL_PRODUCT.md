# NODUS — Commercial Product Definition

**Decision date:** 17 November 2026  
**Product category:** Shopify shipping margin control  
**Commercial status:** Product direction approved; paid production launch blocked by external account and verification gates.

## 1. Product decision

NODUS is no longer marketed as a general shipping analytics dashboard.

It is a **shipping margin control system** for Shopify merchants that use flat-rate or free-shipping policies and have recurring carrier or 3PL cost records.

### Core promise

Know what shipping actually costs the store, identify where customer shipping charges fail to cover evidenced fulfillment costs, and test better shipping policies against historical orders before changing the live store.

### The job customers pay for

Every month, a merchant needs to answer:

1. What did customers pay for shipping?
2. What did the carrier or 3PL actually bill for the corresponding orders?
3. Which orders have complete, partial, missing, duplicate or unmatched cost evidence?
4. Which products, destinations, methods or policy segments create the largest supported shipping subsidy?
5. What would a different flat rate or free-shipping threshold have produced on the same historical order sample?
6. What should the merchant investigate or change next?

NODUS sells the decision workflow and evidence pack, not charts.

## 2. Initial ideal customer

Target Shopify merchants that:
- sell physical goods and ship recurring parcels;
- use free-shipping thresholds, flat rates or shipping promotions;
- have carrier or 3PL invoices available as CSV exports;
- have enough shipping activity that manual reconciliation is a recurring task;
- have an owner, ecommerce operator, finance lead or fulfillment lead who can act on the findings.

Disqualify digital-only stores, low-frequency shippers, merchants without cost evidence, and stores unable to authorize Shopify access.

Do not publish an arbitrary order-volume cutoff until pilot data establishes one.

## 3. The product workflow

### Step 1 — Connect Shopify
Read the authorized order, shipping-line, fulfillment and product context. Respect granted permissions and Shopify's historical data limits.

### Step 2 — Import actual carrier/3PL costs
Accept supported CSV exports. Preserve original identifiers, currency, source row and import provenance. Reject duplicates and invalid currencies. Do not imply direct carrier API integrations.

### Step 3 — Reconcile
Match cost records to orders using supported references. Keep matched, candidate, unmatched, duplicate, incomplete and currency-mismatched states distinct. Missing evidence is never zero cost.

### Step 4 — Measure shipping contribution
For complete, reviewed, single-currency coverage only, calculate shipping collected less evidenced carrier/3PL cost. Clearly disclose taxes, refunds, exclusions and coverage. Do not call this total order profit.

### Step 5 — Test policies
**Implemented in the current product branch:** replay flat-rate and free-shipping threshold alternatives against the latest 250 historical orders in a selected currency. The engine now carries matched carrier/3PL costs into each scenario and reports observed and replayed shipping contribution, while holding historical fulfillment cost constant.

Only merchant-reviewed complete-coverage, tax-exclusive orders with a recorded subtotal enter the contribution calculation. Partial or missing cost evidence, tax-inclusive orders and missing subtotals are excluded and counted. Tracking-number matches are checked against the full stored order set to avoid false uniqueness inside the sample.

The replay remains a historical counterfactual, not a conversion forecast. It does not model demand, abandonment, changes in carrier/service mix, taxes, geographic rate selection, discounts or product margin. Shipping contribution is not total profit.

### Step 6 — Deliver the decision pack
Produce an exception queue and reproducible CSV/JSON pack with source references, calculations, coverage, assumptions, limitations and next actions.

## 4. Differentiation

The category already has profit dashboards and shipping analytics tools. NODUS must not claim that cost visibility is unique.

The intended distinction is a narrow, evidence-first workflow:
- imported billed-cost evidence rather than only estimated shipping rules;
- explicit coverage and uncertainty states;
- order-level traceability from Shopify order to carrier-cost row;
- historical policy replay with cost-adjusted shipping contribution, explicit evidence eligibility and exclusion counts;
- an exportable decision pack suitable for operations and finance review.

This distinction remains a hypothesis until merchants confirm that it is materially more useful than their current workflow.

## 5. Offer and pricing hypothesis

**Founding paid plan hypothesis: $29/month per Shopify store.**

Included:
- one connected Shopify store;
- Shopify order synchronization within granted permissions;
- recurring merchant-provided carrier/3PL CSV imports;
- order-level shipping reconciliation and evidence coverage;
- exception review;
- saved flat-rate and free-shipping threshold scenarios with cost-adjusted shipping contribution on eligible orders;
- CSV and JSON decision-pack exports.

No claim of direct UPS/FedEx/USPS API integration, automatic carrier invoice polling, automatic shipping-policy changes, guaranteed savings or App Store approval.

The $29 price is a testable launch hypothesis, not validated willingness to pay. Validate it through paid commitments and repeat use. Do not activate billing until the Shopify Partner configuration, plan handles, subscription lifecycle, entitlements, refunds/cancellation and production tests are complete.

## 6. Why a merchant should pay

A merchant is not paying for a shipping revenue chart. They are paying to replace a recurring spreadsheet investigation with:
- an evidence-backed view of shipping subsidy;
- a ranked list of records that need attention;
- reproducible comparisons of policy alternatives;
- a review history that can be shared with finance and operations.

The subscription is justified only if the merchant imports new cost evidence and uses the results again in a later period. Scheduled Shopify order sync alone is not a recurring carrier-cost monitoring service.

## 7. Acquisition system

Build acquisition around high-intent problems:
- Shopify free-shipping threshold profitability;
- shipping rate under-recovery;
- carrier invoice versus Shopify order reconciliation;
- shipping subsidy by destination or fulfillment method;
- carrier-cost CSV reconciliation workflow.

Required public assets:
1. A landing page with one buyer and one clear promise.
2. A synthetic, clearly labelled interactive sample.
3. A methodology page with formulas and limitations.
4. A supported CSV template and import guide.
5. A product demo showing the end-to-end workflow.
6. A pricing page with explicit scope and no unsupported claims.
7. A working, monitored merchant enquiry path.
8. A Shopify App Store listing only after the app and listing meet Shopify requirements.

Do not fabricate testimonials, customers, recovered credits, savings, certifications, integrations or approval.

## 8. Commercial metrics

Track:
- qualified landing-page visits;
- connect-start rate;
- successful store connections;
- first carrier-cost import completion;
- evidence coverage rate;
- time to first useful decision pack;
- number of actionable findings accepted by the merchant;
- repeat import and review rate in the next billing period;
- trial-to-paid conversion;
- paid retention and cancellation reasons.

Traffic and free signups are not revenue validation. The strongest signal is repeat use followed by a real paid commitment.

## 9. Release gates

### Engineering
- Validate the cost-adjusted replay against real merchant exports, including partial shipments, refunds, multi-currency orders, duplicate labels and cost credits; do not call it total profit or a forecast.
- Production database configured, migrated, backed up and restore-tested.
- Shopify OAuth, scopes, webhooks, uninstall and tenant isolation tested against a real development store.
- Carrier CSV import, reconciliation, policy replay and exports tested with edge cases.
- Monitoring, error reporting, rate limits and security review completed.
- PWA/download experience tested across supported devices if advertised.

### Commercial
- Business-owned support and privacy contact configured.
- Privacy notice completed with the real legal operator, jurisdiction, processors, retention and regional disclosures.
- Commercial hosting plan and database ownership established.
- Shopify Partner production app and billing plans configured.
- Billing lifecycle and entitlement enforcement verified.
- Public enquiry intake tested end-to-end.
- Pricing and product claims reviewed against shipped capabilities.

### Operator
The commercial hosting, Shopify Partner, legal, payout and customer-data responsibilities must be owned and supervised by an authorized adult/business operator. Do not collect merchant data or payments before these controls are in place.

## 10. Current known blockers

The connected Vercel project currently reports no visible environment variables. Its latest deployment is marked READY, but that alone does not establish a working production application. Shopify credentials, production database configuration, cron secrets, billing plans, support contact and real-store verification remain unproven.

The repository itself documents that direct carrier APIs, automatic carrier invoice polling, automated policy writes and public App Store approval are not live capabilities.

**Launch decision:** Prepare the product and public commercial experience around the shipping-margin-control offer. Do not represent the business as accepting paid production merchants until every external release gate above is verified.
