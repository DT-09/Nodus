# NODUS Commercial Offer and Buyer Definition

**Status:** Commercial hypothesis and launch-scope decision  
**Date:** 2026-11-15  
**Product:** NODUS — Shopify Shipping Economics Control

## 1. Commercial decision

NODUS will not compete as a generic shipping dashboard or claim to be a universal carrier-audit platform.

Its initial wedge is:

> **Show Shopify merchants where the shipping amount collected at checkout diverges from evidenced fulfillment cost, explain which records support the difference, and let the merchant test better shipping policies against its own historical orders before changing anything.**

The product connects three views that are often handled separately:

1. Checkout economics — what the customer paid for shipping.
2. Fulfillment evidence — what carrier or 3PL records show the merchant paid.
3. Policy decisions — what flat rates or free-shipping thresholds would have produced on the historical order sample.

This is a positioning hypothesis, not a proven competitive moat. It must be tested with merchants.

## 2. Initial buyer

### Primary ideal customer profile

A Shopify merchant selling physical goods that:

- charges customers for shipping, offers free shipping, or uses flat-rate thresholds;
- has recurring carrier or 3PL cost records available as an export;
- has enough order and fulfillment complexity that spreadsheet review is burdensome;
- wants to understand shipping contribution by order, destination, method, or policy;
- has an owner, ecommerce operator, or finance/operations lead who can review the findings.

### Economic buyer

Founder/owner, ecommerce director, operations lead, or finance/controller.

### Daily user

Ecommerce operations, fulfillment, or finance analyst.

### Disqualifiers

Do not target stores that lack usable cost evidence, have only occasional shipments, sell digital products, or cannot authorize access to the relevant Shopify and carrier records.

Do not invent a shipment-volume cutoff. Establish qualification from actual buyer interviews and pilot data.

## 3. The expensive job

The buyer is not purchasing charts. The buyer is trying to make and defend decisions such as:

- Are shipping charges collected at checkout covering the fulfillment costs evidenced for those orders?
- Which orders, destinations, shipping methods, or fulfillment patterns account for the largest supported differences?
- Which amounts are matched, unmatched, incomplete, or still require human review?
- Are repeated cost patterns pointing to a policy, packaging, product-data, or operational issue?
- What would a different flat rate or free-shipping threshold have produced on the historical order sample?
- What should be investigated or changed first, and what evidence supports that decision?

The core pain is fragmented evidence and weak decision confidence—not a lack of another dashboard.

## 4. The concrete deliverable: Shipping Economics Decision Pack

Every completed assessment must produce a dated, exportable decision pack with the following sections.

### A. Scope and data-quality statement

- Shopify store and authorized data window.
- Reporting currency and any mixed-currency exclusions.
- Number of orders and records included.
- Sync freshness and pagination status.
- Shopify permission boundary.
- Carrier-cost source, import date, and supported format.
- Missing, incomplete, unmatched, and excluded records.

### B. Order-level shipping economics

For each supported order:

- Shipping revenue recorded by Shopify.
- Carrier/3PL cost evidence imported for that order.
- Match method and review state.
- Supported difference, if calculable.
- Source references and calculation explanation.
- Explicit unknown state where cost coverage is incomplete.

Never treat missing cost as zero. Never label a revenue-cost difference as profit without accounting for other relevant costs and taxes.

### C. Exception register

A prioritized worklist of records requiring attention:

- unmatched cost records;
- incomplete cost coverage;
- duplicate or conflicting source records;
- material order-level differences;
- records requiring merchant review.

Every exception must link to its source record and show whether it is a fact, a candidate match, or a hypothesis.

### D. Historical policy replay

Where the data supports it, compare the current flat-rate or free-shipping policy with proposed alternatives using the stored historical order sample.

Show:

- sample window and order count;
- current versus proposed policy;
- formula and assumptions;
- affected order segments;
- estimated shipping revenue under each scenario;
- cost coverage and exclusions;
- limitations, including the absence of demand/conversion elasticity evidence.

A historical replay is not a forecast and does not prove conversion lift.

### E. Decision brief

A concise merchant-facing brief containing:

- the three most material supported findings;
- what is known and what remains uncertain;
- the next action for each finding;
- the evidence required to validate it;
- the policy scenario worth reviewing, if any;
- a clear statement of what NODUS cannot conclude from the available data.

### F. Reproducible evidence export

The workspace exports (1) a full merchant-scoped CSV register and (2) a JSON Shipping Economics Decision Pack. The JSON pack contains the complete stored order and cost-evidence scope, deterministic order-level reconciliation, matched/unmatched evidence states, exception findings, per-currency complete-coverage summaries, saved policy replays, economic-value attestations, methodology limitations and a SHA-256 digest of the canonical payload. It is designed for independent inspection and repeatable comparison. It does not independently verify merchant coverage attestations or accounting outcomes.

## 5. What NODUS sells first

### Founding assessment

A tightly scoped assessment for one authorized Shopify store, one reporting currency, the order history available under granted permissions, and one supported carrier-cost CSV export.

The current repository's documented Founding Merchant Value Programme is no-fee and no-obligation. Keep that offer until the first assessments establish whether the deliverable is useful and whether a recurring job exists.

Do not promise savings, recovered carrier credits, profit improvement, or conversion lift.

### Recurring product

A subscription becomes credible only when NODUS can repeatedly perform a job the merchant values, such as:

- refresh eligible Shopify order data;
- ingest recurring cost evidence with low review burden;
- rerun reconciliation;
- surface new material exceptions;
- compare observed outcomes after merchant policy changes;
- preserve a review and decision history.

A scheduled Shopify order refresh alone is not recurring shipping-cost monitoring. Carrier billing ingestion, drift detection, and merchant alerting must be implemented and verified before they are sold as such.

Do not publish fixed prices or activate paid plans until real buyer evidence, recurring value, billing, and entitlements are verified.

## 6. Positioning against alternatives

The category already has competitors. Publicly described alternatives include:

- OCT Shipping Analytics PRO: compares Shopify shipping revenue with merchant-entered actual shipping costs and presents shipping margin views.
- Shopvibe: describes order-level comparisons across checkout shipping charges, labels, carrier invoices, and 3PL bills.
- Oh Ship!: describes historical audits of carrier adjustment charges and shipping-margin recommendations.
- Parcel-audit providers such as Reveel, Sifted, ShipSigma, and others focus on carrier invoice auditing and recovery workflows.

Therefore, NODUS must not claim that shipping-cost visibility or invoice auditing is unique.

Its intended distinction is the evidence-linked workflow from Shopify order economics to reviewed cost coverage, explainable exceptions, and historical shipping-policy replay in one Shopify-native workspace.

This distinction is only valuable if the end-to-end workflow is materially easier, clearer, or more useful than the buyer's current tools. Validate that with real merchants.

Public references (reviewed 2026-11-15):

- https://apps.shopify.com/shipping-analytics-pro
- https://shopvibe.app/
- https://apps.shopify.com/oh-ship
- https://www.sendcloud.com/blog/shipping-data-analytics-software/

These sources establish publicly described product positioning, not market share, customer satisfaction, retention, or willingness to pay.

## 7. Buyer validation: evidence required before expansion

Do not treat repository completeness, website traffic, app installs, survey compliments, or free usage as proof of demand.

For each qualified merchant, record:

1. The current process used to compare checkout shipping revenue with actual fulfillment cost.
2. How often the process occurs and who owns it.
3. The time and operational burden involved.
4. The decisions delayed or made with incomplete evidence.
5. The systems and exports the merchant can actually provide.
6. Which findings in the NODUS pack the merchant considers actionable.
7. Whether the merchant would use the workflow again next month.
8. Whether the merchant is willing to pay for that recurring outcome, and what budget it would replace.

The strongest evidence is repeated use and a real, authorized paid commitment—not positive comments.

### Decision gates

- **Problem gate:** Multiple qualified merchants independently describe the same costly, recurring job.
- **Deliverable gate:** A merchant can inspect the pack, trace findings to source records, and use it to make a real decision.
- **Repeatability gate:** The same workflow is useful in a later reporting period without disproportionate manual work.
- **Payment gate:** A merchant explicitly agrees to pay for the recurring outcome, and the paid workflow is implemented and legally/operationally ready.
- **Retention gate:** The merchant continues because the recurring value persists.

If a gate fails, fix the offer or product before adding unrelated features.

## 8. Acquisition without cold-email volume

The intended motion is inbound and product-led:

- a clear Shopify App Store listing after approval;
- search-intent pages explaining shipping-margin questions with worked, reproducible examples;
- a public sample Decision Pack using conspicuously synthetic data;
- a low-friction assessment intake that states the exact required exports and data handling;
- documentation that explains methodology and limitations;
- legitimate ecosystem referrals and partnerships.

Do not fabricate customer logos, reviews, savings, case studies, integrations, or App Store approval. Do not imply that a demo uses live customer data.

Inbound acquisition is not immediate or guaranteed. Measure qualified visits, assessment starts, completed data submissions, first useful result, repeat use, and paid conversion separately.

## 9. Current implementation boundary

The repository currently documents and implements a constrained foundation:

- Shopify order ingestion and persisted shipping revenue;
- carrier-cost CSV import;
- evidence matching/review and reconciliation workflows;
- historical policy replay;
- economic value ledger and audit events.

The repository also explicitly states that the following are not yet verified or generally available:

- direct UPS, FedEx, or USPS invoice integrations;
- automated carrier invoice polling;
- automatic shipping-policy writes;
- carrier-policy drift detection and merchant alerts;
- production-verified scheduled refresh;
- live subscription checkout and complete paid-plan lifecycle;
- Shopify App Store approval.

These are product and release constraints, not footnotes. Public copy and sales claims must respect them.

## 10. Immediate product priorities

Prioritize work in this order:

1. Complete and validate the full-scope JSON Decision Pack and CSV register, including deterministic totals, evidence coverage, limitations and integrity digest. The first implementation is now in the Reports workspace; CI and adversarial export tests remain required.
2. Make first-run onboarding tell the merchant exactly what data is needed, why it is needed, and what result they will receive.
3. Improve match review and exception prioritization; make uncertainty visible.
4. Validate the policy replay with adversarial fixtures and explain its assumptions in the UI and export.
5. Prove tenant isolation, privacy lifecycle, backup/restore, and production sync on an authorized test store.
6. Implement recurring carrier-cost intake and reliable recurring reconciliation before claiming continuous monitoring.
7. Implement and verify billing/entitlements only after recurring value is demonstrated.

**Definition of commercial progress:** a qualified merchant completes the assessment, uses the evidence to make a decision, returns for a later period, and makes an authorized payment for the recurring workflow.
