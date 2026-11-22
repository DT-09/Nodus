# NODUS — Master Business & Product Blueprint

**Status:** Authoritative target-state specification  
**Revision:** 1.0  
**Branch:** `commercial/recurring-3pl-control`  
**Decision:** Build a recurring 3PL operations-control product, beginning with evidence-backed billing and service-performance control.  
**Deployment:** Cloudflare Pages and Cloudflare-native services. Vercel is not a deployment target.

---

## 1. The business we are building

NODUS is an independent operations-control platform for Shopify merchants that outsource fulfilment to third-party logistics providers (3PLs).

**Core promise:** Know whether your 3PL is charging what was agreed, meeting the commitments it made, and resolving the problems it caused.

NODUS connects four kinds of evidence:

1. The merchant's 3PL agreement, rate card and service-level commitments.
2. The 3PL's invoices, adjustments and credits.
3. Shopify order and fulfilment records.
4. 3PL operational exports, where available, such as pick/pack, dispatch, receiving, storage and exception events.

It turns those records into a traceable control system: validate → reconcile → detect → investigate → resolve → verify → compare the next period.

NODUS is not a warehouse-management system, carrier, accounting platform, generic analytics dashboard, or a promise of automatic savings. It is a merchant-side control layer over the fulfilment relationship.

### 1.1 Why this is recurring

The underlying job repeats:
- 3PL invoices arrive every billing period.
- Orders and fulfilment activity continue.
- Rate cards, surcharges and operating terms change.
- Exceptions remain open across periods.
- Credits may be promised but not posted.
- Service performance varies.
- Merchants need evidence for provider reviews and contract decisions.

A one-time audit can reveal a baseline. A recurring control record tracks what happens next. NODUS earns renewal only when it continues to find material issues, reduce review work, improve provider accountability, or support decisions the merchant values.

### 1.2 Positioning hypothesis

The differentiating hypothesis is not simply "we audit 3PL invoices." Existing tools already market invoice auditing and rate-card comparison.

NODUS aims to connect **billing evidence + operational evidence + dispute/credit lifecycle + provider performance history** in one merchant-owned record. This hypothesis must be tested against the buyer's existing tools and workflow. Do not claim competitors lack a capability without current evidence.

---

## 2. Initial customer and buying situation

### Ideal customer profile

A Shopify merchant that:
- sells physical products;
- outsources fulfilment to at least one 3PL;
- receives recurring 3PL invoices;
- has a rate card, contract or written billing terms;
- can export order/fulfilment data and 3PL invoice lines;
- has enough invoice complexity, shipment activity or operational exceptions that manual checking is costly;
- has an operations, finance or ecommerce owner who can act on findings.

### Buyer roles

- **Economic buyer:** founder, COO, finance lead or operations director.
- **Daily user:** fulfilment, ecommerce operations or finance analyst.
- **Data approver:** Shopify administrator and 3PL account owner.

### Disqualify when

- The merchant has no external 3PL.
- The 3PL relationship is simple and already fully controlled by an existing tool.
- No contract/rate-card evidence or usable invoice detail is available.
- The source data cannot support the proposed comparison.
- The merchant cannot authorize access to the records.
- The potential value is immaterial compared with the fee.

Do not invent an order-volume threshold. Qualify by invoice spend, complexity, repeat frequency, evidence quality, current review effort and decision impact.

---

## 3. First commercial product: 3PL Billing & Performance Control

The first release must be narrow enough to validate and complete enough to be useful.

### 3.1 Required source inputs

**A. Commercial terms**
- Rate card / contract in a supported structured format initially (CSV/XLSX); PDF extraction is not a launch dependency.
- Effective dates, service categories, units, tiers, minimums, surcharges, currency, billing rules and service commitments.
- Human-reviewed normalization for ambiguous terms.

**B. Billing evidence**
- Monthly 3PL invoice lines in supported CSV format.
- Invoice ID, billing period, line ID, charge category, quantity, unit rate, amount, currency, order/shipment reference where present.
- Adjustments, credits, taxes and minimum charges kept distinct.

**C. Shopify evidence**
- Orders, order IDs, fulfilment status, timestamps and tracking references where supplied by merchant exports.
- No customer personal data is needed for the initial billing workflow; minimize fields collected.

**D. 3PL operational evidence (when available)**
- Pick/pack/dispatch timestamps, receiving events, storage snapshots, exception events and provider reference IDs.
- SLA checks run only when the source contains the required timestamps and contractual definition.

The first customer can start with secure, agreed CSV handoff. Do not block the first paid pilot on a Shopify app integration. Do not claim a live Shopify integration until production installation and end-to-end tests pass.

### 3.2 Core analysis

1. **File and period validation**
   - Detect duplicate files and duplicate invoice lines.
   - Validate totals, dates, currencies, row counts and required fields.
   - Identify missing or inconsistent references.
   - Preserve source filename, row/line reference and import timestamp.

2. **Contract normalization**
   - Convert rate-card terms into explicit, versioned rules.
   - Record effective dates and rule provenance.
   - Require human confirmation for ambiguous or incomplete rules.
   - Never guess a billing rule.

3. **Invoice reconciliation**
   - Recalculate eligible invoice lines from the agreed rate card and supported quantities.
   - Detect rate mismatch, duplicate line, unexpected fee, incorrect quantity where independent activity evidence exists, missing credit, currency mismatch, out-of-period charge and unsupported charge.
   - Separate confirmed calculation variance from a question requiring provider clarification.
   - Never infer a billable quantity from an absent source record.

4. **Operational performance checks**
   - Compare actual timestamps with contractual service levels only where the required events and definitions exist.
   - Identify late dispatch, receiving delay, recurring exception, backlog or missing event only when source coverage supports it.
   - Report coverage and exclusions alongside all performance rates.

5. **Exception and resolution management**
   - Every finding includes rule, amount if calculable, source references, calculation, confidence/validation state, owner, status, due date, notes and history.
   - Status lifecycle: detected → needs evidence → ready for review → merchant approved → raised with provider → provider response → credit promised / rejected / corrected → verified closed.
   - A promised credit is not a received credit.
   - Record actual posted credit or invoice adjustment separately from identified exposure.

6. **Period comparison**
   - Compare invoice categories, rate changes, provider performance, unresolved cases and confirmed outcomes across periods.
   - Preserve comparable scopes; do not compare unlike billing periods or currencies.
   - Carry open cases forward without double-counting them.

7. **Decision pack**
   - Period scope and source coverage.
   - Reconciliation results and calculation methods.
   - Exception register with evidence.
   - Provider performance where measurable.
   - Open disputes, promised credits and verified credits separately.
   - Limitations, questions and recommended next actions.
   - CSV export and print-ready report.

### 3.3 Explicit first-release exclusions

- Automatic filing of carrier or 3PL claims.
- Contacting providers on the merchant's behalf.
- Automatic payment, invoice approval or accounting journal creation.
- Automatic changes to Shopify orders, inventory, refunds or shipping configuration.
- Direct 3PL API integrations before a named customer requires one and it is tested.
- General-purpose warehouse management, inventory planning or accounting.
- AI-generated financial conclusions without deterministic calculations and source evidence.
- PDF/OCR ingestion until extraction accuracy, review and auditability are proven.
- Multi-platform commerce beyond Shopify.
- Claims of guaranteed recovery or savings.

---

## 4. Product architecture and trust model

### 4.1 Main product surfaces

1. **Merchant onboarding:** business profile, provider, data scope, permissions and source checklist.
2. **Data room:** private source uploads, import status, validation errors, source lineage and retention controls.
3. **Terms workspace:** normalized rate cards, contract versions, effective dates and human-confirmed rules.
4. **Control centre:** period overview, coverage, material findings, open cases and recent changes.
5. **Reconciliation:** invoice-line detail, expected-vs-billed calculation and source evidence.
6. **Performance:** SLA and operational metrics only when measurable from supplied data.
7. **Cases:** assigned work, notes, due dates, provider responses, status and audit history.
8. **Outcomes ledger:** exposure identified, provider-confirmed adjustment, promised credit, posted credit, time saved and other verified outcomes kept separate.
9. **Reports:** period report, decision pack, trend comparison and export.
10. **Operator console:** secure internal review of trial requests, tenant setup, processing state and delivery QA.

### 4.2 Shared operational record

Every source row, normalized term, calculation, finding, status change and verified outcome must be traceable to a merchant and reporting period. Tenant isolation is mandatory.

### 4.3 Deterministic-first engine

- Use exact decimal arithmetic for money.
- Version all rules and calculations.
- Store source references and normalization decisions.
- Treat ambiguous matches as unresolved.
- Keep currency and tax concepts separate.
- Re-run analysis idempotently.
- Maintain audit events for important user and operator actions.
- Human review is required for ambiguous contract language and low-confidence findings.
- AI may assist with classification or explanation later, but it cannot invent source facts or silently approve a financial conclusion.

### 4.4 Security baseline

- Tenant-scoped authorization on every data access.
- Least-privilege access to Shopify; read-only by default.
- Encryption in transit and at rest.
- Private object storage for source documents; no public file URLs.
- File size/type/signature validation and safe parsing.
- No secrets, tokens or customer PII in logs.
- Configurable retention and verified deletion workflow.
- Backups and tested restore procedure.
- Rate limiting, abuse controls and secure session handling.
- Privacy policy, data processing terms, subprocessor list and incident process before production customer data.
- No public security certification claims without certification.

---

## 5. Recurring service and subscription model

### 5.1 Seven-day trial

The trial is request-based until onboarding and integrations are genuinely ready.

1. Merchant submits a trial request and describes its 3PL setup.
2. NODUS checks fit and data compatibility.
3. Merchant receives a secure onboarding path and supported source template.
4. NODUS activates a real merchant workspace and imports real merchant records.
5. The seven-day clock starts only when the merchant can use the activated workspace.
6. The merchant reviews findings, cases, evidence and report.
7. At the end, NODUS shows the work completed, unresolved items, limitations and recurring scope.

Do not advertise instant self-serve activation before it exists. Do not start the trial clock while waiting for onboarding. The trial must not be a static demo populated with fabricated customer results.

### 5.2 Paid plans

Prices are hypotheses to validate, not proven willingness to pay.

- **Core — $99/month:** one store, one 3PL, one monthly invoice period, agreed source limits, core billing reconciliation, exception register and monthly report.
- **Growth — $149/month:** higher source limits, additional invoice categories or one additional provider where supported, cross-period case tracking and provider performance reporting where evidence permits.
- **Scale — $299/month:** multiple providers/locations, higher volume, richer history, role-based workflow and advanced reporting, only after those capabilities exist.
- **Enterprise:** scoped only after demonstrated demand and delivery capacity.

No plan may list a feature that is not implemented and tested. Publish plan limits, data requirements, support response expectations, trial terms, cancellation and refund terms before accepting recurring payment.

### 5.3 Value test

A subscription is justified only when the merchant confirms recurring value. Track:
- accepted, evidence-backed billing corrections;
- posted credits separately from identified exposure and promised credits;
- measurable review time saved;
- provider issues resolved or escalated;
- recurring performance improvements;
- decisions changed because of NODUS.

An internal target is at least 3× monthly fee in conservative merchant-accepted recurring value. This is a decision rule, not a promised return. If value is not recurring, do not pressure the merchant to renew.

### 5.4 Delivery economics

Track operator minutes per account, support burden, import failure rate, review effort and gross margin. Automate only stable, repeated tasks. The service must not scale by quietly adding unlimited manual labour to a low subscription fee.

---

## 6. Website and acquisition system

The website is the acquisition and trust layer for the actual product. It must never imply the product is more complete than it is.

### Pages
- Home: one clear problem, target customer, evidence-led promise and trial CTA.
- Product: real workflow and actual interface.
- Solutions: invoice accuracy, contract compliance, fulfilment performance and unresolved credits.
- How it works: source inputs, analysis, case lifecycle and outcomes.
- Integrations & data: supported imports now; verified integrations only.
- Pricing: clear monthly plans and exact limits.
- Trial: request, qualification, activation and seven-day terms.
- Security & privacy: real controls, retention, deletion and permissions.
- Insights: useful original guides and templates targeting buyer-intent searches.
- Contact: working enquiry path.

### Acquisition
1. High-intent search pages for 3PL invoice audit, 3PL rate-card reconciliation, Shopify 3PL billing errors, fulfilment invoice review and 3PL SLA tracking.
2. Free, genuinely useful templates: 3PL invoice checklist, rate-card comparison template and monthly provider scorecard.
3. Original, evidence-based guides; no fabricated case studies.
4. Search indexing, technical SEO, structured metadata and analytics with privacy controls.
5. Shopify App Store listing only after a verified app installation and a compliant listing.
6. Real partner referrals only where a relationship exists.

Organic acquisition compounds slowly and is not guaranteed. Measure qualified visits, trial requests and activated trials—not pageviews alone. No mass unsolicited outreach is part of the default acquisition strategy.

### Design rules
- Preserve the approved NODUS six-node gold network logo exactly; do not stretch, crop, redraw or substitute it.
- Semi-transparent 50% navigation, no border, rounded edges.
- Smoked charcoal-purple / neutral palette with restrained gold accents.
- Syncopate only for the NODUS title.
- Editorial/architectural layout, readable typography, real product illustrations and organised footer.
- No fake dashboard data presented as real merchant data.
- Every CTA and form must work; no dead buttons.

---

## 7. Commercial operating system

A business is not operational until it can safely receive, qualify, serve and retain customers.

Required workflows:
1. Trial request capture and acknowledgement.
2. Fit qualification and data compatibility review.
3. Terms, scope and permissions confirmation.
4. Secure data collection and tenant setup.
5. Import validation and exception handling.
6. Human QA of contract normalization and material findings.
7. Trial activation and seven-day usage tracking.
8. Report delivery and customer feedback.
9. Subscription entitlement and access lifecycle.
10. Monthly period rollover and reminder.
11. Cancellation, export and deletion.
12. Incident and support handling.

Do not collect sensitive customer records that are unnecessary for the analysis. Do not accept source files through an unsecured public form or ordinary email attachment.

---

## 8. Metrics and validation gates

### Product quality
- Import success rate and validation failures.
- Percentage of invoice value classified with traceable evidence.
- Duplicate and ambiguous record rates.
- Calculation reproducibility.
- False-positive rate from merchant review.
- Report delivery time.
- Data deletion completion.

### Customer value
- Findings accepted as actionable.
- Confirmed adjustments and posted credits.
- Promised credits still outstanding.
- Review time saved.
- Open-case resolution time.
- Repeat use in the next reporting period.

### Commercial
- Qualified trial requests.
- Trial activation rate.
- Trial completion rate.
- Trial-to-paid conversion.
- Monthly recurring revenue actually collected.
- Renewal and churn.
- Support/delivery cost per account.
- Gross margin by plan.

### Gates
- **Gate A — Product readiness:** complete end-to-end test with synthetic fixtures, tenant isolation tests, security review and reproducible decision pack.
- **Gate B — Real-data readiness:** one authorized merchant dataset processed with explicit scope, data coverage and human QA.
- **Gate C — Trial readiness:** activated account, real onboarding, seven-day access lifecycle, support and deletion tested.
- **Gate D — Paid readiness:** exact scope, plan entitlements, terms, cancellation, billing and access lifecycle tested.
- **Gate E — Recurring proof:** at least one customer completes a second period and renews; stronger validation requires multiple independent customers and repeat periods.

A lead is not a customer. A trial is not revenue. A proposed credit is not a realized credit. A deployed website is not product-market fit.

---

## 9. Engineering execution order

### Workstream 1 — Baseline and product truth
- Audit existing routes, database, imports, domain engine, Shopify app and Cloudflare configuration.
- Identify duplicate or conflicting specs.
- Freeze a single supported product scope.
- Keep the existing main branch intact; work in a dedicated feature branch.

### Workstream 2 — Core 3PL control engine
- Define canonical contract, invoice, invoice-line, operational-event, case and outcome schemas.
- Build CSV import templates and validation.
- Normalize rate cards with versioned effective dates.
- Reconcile billed amounts against contract rules and independently supported quantities.
- Add evidence lineage, deterministic findings and calculation tests.
- Add period comparison and outcome ledger.

### Workstream 3 — Merchant workspace
- Tenant-scoped source vault and data retention.
- Onboarding and import status.
- Control centre, invoice reconciliation, case workflow, provider performance and reports.
- Role/permission boundaries and audit events.

### Workstream 4 — Trial and commercial operations
- Request → qualification → secure onboarding → activation → seven-day expiry.
- Operator console with safe access controls.
- Trial state and plan entitlement lifecycle.
- Subscription billing only after scope, terms and cancellation are verified.

### Workstream 5 — Marketing website
- Rewrite positioning around 3PL Billing & Performance Control.
- Preserve logo and approved design language.
- Replace shipping-economics-only messaging where it conflicts with the actual product.
- Publish only capabilities that have passed acceptance tests.
- Add high-intent pages and useful resources.

### Workstream 6 — Production hardening and release
- Automated tests, typecheck, build, migration validation and smoke tests.
- Cloudflare Pages preview and production deployment checks.
- Shopify integration only when credentials, scopes, webhook configuration and end-to-end tests are verified.
- Privacy/security/retention review.
- Trial with real merchant data.
- Paid conversion and second-period renewal measurement.

---

## 10. Definition of done

NODUS is not "finished" because the homepage is redesigned or a branch is merged.

The business is operational when:
- A qualified Shopify merchant can understand the offer and request a trial.
- A real account can be securely activated.
- A merchant can provide supported source data without unsafe handling.
- NODUS can validate the data and reproduce its calculations.
- It can identify and explain supported billing discrepancies and service-level exceptions.
- The merchant can manage cases and record provider responses.
- NODUS distinguishes exposure, promised credits and verified posted credits.
- It delivers a useful report every period.
- The customer can see value, manage subscription access and cancel.
- The service can deliver at a sustainable cost.
- At least one merchant completes a second period and renews; broader recurring demand requires multiple independent renewals.

**North star:** recurring revenue earned through recurring, verified operational value.
