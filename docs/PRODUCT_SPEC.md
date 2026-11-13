# NODUS — Definitive Product, Engineering & Commercial Specification

**Status:** Strategic baseline locked; implementation specification  
**Date:** 2026-11-13  
**Repository:** DT-09/Nodus  
**Product category:** Shopify shipping economics intelligence and policy control  
**Primary market:** English-speaking Shopify merchants, initially US, UK, Canada and Australia  
**Commercial model:** Recurring SaaS subscription  
**Product principle:** Evidence before recommendation. Approval before execution. Verification after execution.

---

## 1. Executive definition

NODUS is a Shopify-first platform that helps merchants understand, evaluate and control the economics of their shipping policies. It connects customer shipping charges, fulfillment costs, shipping configuration and operational evidence into one traceable workflow.

The complete product loop is:

1. **Ingest** supported Shopify and merchant-provided data.
2. **Reconcile** customer shipping revenue against supported fulfillment-cost evidence.
3. **Diagnose** the causes of material differences and configuration problems.
4. **Simulate** alternative shipping policies using explicit assumptions and historical scenarios.
5. **Approve** a proposed policy change through an authorized merchant.
6. **Execute** only changes supported by Shopify APIs and the merchant's permissions.
7. **Verify** the resulting configuration by reading it back and testing applicable scenarios.
8. **Monitor** subsequent outcomes and detect drift or recurring exceptions.

NODUS is not a carrier, label-purchasing product, warehouse-management system, generic analytics dashboard or autonomous agent with unrestricted store access.

### 1.1 Product promise

Help Shopify merchants make evidence-backed shipping decisions and safely implement and verify supported policy changes.

### 1.2 Non-promises

NODUS must not promise guaranteed savings, increased conversion, recovered carrier charges, carrier dispute success or universal Shopify setting control. Estimates must be labelled as estimates, with assumptions and data coverage disclosed.

---

## 2. Strategic decisions (locked)

- Product ambition: closed-loop intelligence and policy control.
- Initial platform: Shopify only.
- Architecture: modular integration boundary; future platforms are not launch dependencies.
- Commercial priority: balanced product quality, speed and market validation.
- Distribution: Shopify App Store, organic search, useful free assessment and legitimate ecosystem partnerships.
- Revenue: recurring subscriptions with explicit plan entitlements.
- Trust: read-only by default; explicit approval before supported write operations; audit and read-back verification.
- No fabricated customers, reviews, savings, results, integrations or launch status.

---

## 3. Buyer and market definition

### 3.1 Initial ideal customer profile

Established Shopify merchants selling physical goods with meaningful order volume and non-trivial shipping operations. Strong qualification signals include multiple shipping zones, locations, profiles, carriers or 3PL arrangements; frequent carrier adjustments; multiple packages per order; complex product dimensions; or material differences between collected shipping revenue and fulfillment cost.

Initial target geographies: United States, United Kingdom, Canada and Australia.

Economic buyer: founder, ecommerce director, operations leader or finance/controller. Daily user: ecommerce operations or fulfillment analyst.

### 3.2 Exclusions from the initial ICP

- Very low-volume stores with simple shipping arrangements.
- Digital-only stores.
- Merchants without sufficient source data to support reliable findings.
- Stores whose required operations are unsupported by Shopify APIs or available evidence.

### 3.3 Jobs to be done

- Explain where shipping economics are unfavorable.
- Trace an exception to source records.
- Identify data or configuration defects.
- Compare proposed shipping policies before changing production.
- Safely approve and verify supported changes.
- Monitor whether the issue returns.

### 3.4 Market-validation requirement

The ICP and willingness to pay remain hypotheses until tested with qualified merchants. Public competitor listings do not reveal private usage, retention, churn or actual customer outcomes. Competitor capability comparisons must be based only on verifiable public claims.

---

## 4. Competitive position

Known public products to benchmark:

- **Shopvibe:** shipping charge versus label/carrier/3PL cost audits, invoice uploads, under-recovery and shipping setup checks.
- **RateProof:** checkout shipping-rate monitoring and rate drift alerts.
- **ShipCheck:** bulk shipping-rate scenario testing and anomaly detection.

NODUS must not differentiate by renaming audit charts. Its intended differentiation is the connected loop from source evidence to root cause, policy simulation, approval, supported execution, read-back verification and continuous monitoring.

This is a positioning hypothesis. Before public launch, repeat a dated competitive review of App Store listings, websites, pricing, onboarding and public documentation. Do not infer hidden capabilities from absence of marketing copy.

---

## 5. Product modules and functional requirements

### 5.1 Merchant identity and onboarding

- Shopify OAuth / embedded app authentication using Shopify's recommended application framework.
- Validate signed session context and shop identity on every protected request.
- Install, reconnect, uninstall and permission-revocation handling.
- Explain requested scopes and why each is required.
- Onboarding checklist: connect, choose data window, inspect coverage, run first analysis.
- Never request merchant passwords or Shopify access tokens through NODUS UI.
- Store tokens encrypted at rest; never log secrets.

### 5.2 Data ingestion

Initial supported sources:
- Shopify orders and order shipping lines.
- Products, variants, weights and dimensions where available.
- Fulfillment orders and fulfillments where authorized.
- Shopify shipping configuration: profiles, zones, methods/rates and locations where available to the app.
- Shopify Shipping label costs where accessible through the relevant API and merchant setup.
- Merchant-uploaded carrier invoices and 3PL statements in explicitly supported formats.

Requirements:
- Use GraphQL Admin API with pinned, supported API version.
- Least-privilege scopes; document scope-to-feature mapping.
- Webhooks for relevant order, fulfillment, product, app lifecycle and configuration events where supported.
- Idempotent webhook processing, HMAC verification, replay protection and durable retry.
- Backfill with pagination, rate-limit handling, checkpointing and resumability.
- Record source system, source ID, retrieval time, currency, raw/normalized status and ingestion version.
- Deduplicate by tenant + source system + source ID.
- Show data coverage, freshness and unsupported fields.
- Do not imply that a missing record means zero cost.

### 5.3 Document and invoice intake

- Private uploads only; validate MIME type, file signature, size and malware-scanning status.
- Initial target formats: CSV and PDF; image extraction is a later capability unless extraction quality can be verified.
- Preserve original document and page/row references.
- Extract carrier, invoice identifier, dates, currency, charge lines, tracking/reference identifiers, adjustments and totals.
- Validate extracted totals against document totals.
- Low-confidence fields require human review.
- Never fabricate missing line items or silently normalize ambiguous currencies.
- Tenant-scoped object storage and retention/deletion controls.

### 5.4 Reconciliation engine

Core entities: order, order shipping charge, fulfillment, shipment, label, invoice, invoice line, adjustment, cost allocation and reconciliation match.

Matching priority:
1. Exact provider/source reference.
2. Exact tracking or label identifier.
3. Explicit order/fulfillment reference.
4. Deterministic composite match using merchant-approved rules.
5. Candidate match requiring human review.

Requirements:
- Support one order to multiple labels and multiple invoice lines.
- Handle partial fulfillment, split shipments, voided labels, refunds, duplicate invoices and late adjustments.
- Preserve gross charge, credits, taxes, duties and currency distinctions; do not collapse unlike concepts.
- Currency conversion only when a documented exchange-rate source and timestamp exist.
- Every match has method, confidence, evidence references and review state.
- Unmatched amounts remain unmatched; they are never silently allocated.
- Reconciliation is repeatable and idempotent.
- Calculations use decimal arithmetic, not binary floating-point.
- Explain the formula and included/excluded cost categories.

### 5.5 Diagnostics

Initial deterministic rules:
- Shipping revenue versus evidenced fulfillment cost gap.
- Repeated carrier adjustments/surcharges.
- Unmatched invoice charges.
- Multiple labels or packages per order.
- Missing or implausible product shipping attributes.
- Destination/method cost outliers.
- Shipping-profile and rate configuration inconsistencies.
- Data freshness or coverage gaps.

Every finding must contain:
- Stable rule ID and version.
- Tenant and affected records.
- Severity and confidence.
- Evidence references.
- Calculation and assumptions.
- Explanation of likely cause, distinguishing fact from hypothesis.
- Recommended next step.
- Status, owner and resolution history.

No AI-generated finding may be presented as fact without supporting evidence and deterministic validation.

### 5.6 Policy simulation

Initial supported scenario types must be explicitly mapped to Shopify's supported configuration and rate behavior. Candidate scenarios include flat-rate changes, free-shipping threshold changes, zone/rate comparisons and product grouping/profile scenarios where the API and store configuration permit.

Requirements:
- Use historical order baskets and destination samples where available.
- Display sample size, coverage, excluded records and date window.
- Compare current versus proposed configuration.
- Separate observed historical results from modelled estimates.
- Disclose assumptions and uncertainty.
- Identify adversely affected segments, not just aggregate averages.
- Do not claim conversion or demand elasticity without validated behavioral evidence.
- Save immutable scenario inputs, engine version and results for reproducibility.
- Reject unsupported or ambiguous scenarios rather than invent results.

### 5.7 Policy approval and execution

- Read-only by default.
- Generate a proposed-change object with before state, desired state, rationale, evidence, simulation and affected scope.
- Require an authorized merchant to approve each change.
- Revalidate preconditions immediately before execution.
- Use only documented Shopify mutations and scopes.
- Do not execute if the live configuration differs from the approved baseline.
- Use idempotency and operation state tracking where possible.
- Record actor, approval time, execution request, API response summary and verification result.
- Read the configuration back after execution.
- If execution partially fails, report exact state and safe next action; never claim rollback unless rollback was performed and verified.
- Unsupported changes become manual instructions with clear boundaries.
- No unattended autonomous policy changes in initial release.

### 5.8 Continuous monitoring

- Scheduled reconciliation and diagnostics.
- Webhook-triggered refresh where appropriate.
- Drift detection against approved policy state.
- New exceptions and unresolved issue reminders.
- Post-change comparison using observed data.
- Merchant-configurable notification frequency.
- Avoid noisy alerts; deduplicate and group repeated findings.
- Provide pause, disconnect and uninstall behavior.

### 5.9 Reporting

- Evidence-backed issue worklists.
- Reconciliation summaries.
- Source-level drilldown.
- Simulation comparison reports.
- Approved-change and verification history.
- Data coverage and methodology.
- CSV export initially; PDF only when output is accurate and accessible.
- No report may imply confirmed recovery or savings unless realized and measured.

---

## 6. Application information architecture

Primary navigation:
1. Overview
2. Orders
3. Evidence
4. Diagnostics
5. Simulations
6. Policies
7. Monitoring
8. Reports
9. Settings

Every page must have loading, empty, error, permission-denied and stale-data states. Tables need pagination, filtering, sorting and accessible keyboard behavior. Destructive actions require confirmation. No dead controls or decorative data presented as live.

### 6.1 Overview

Show:
- Last successful sync and data coverage.
- Reconciled/unmatched totals with clear definitions.
- Priority findings.
- Recent approved policy changes.
- Monitoring status.
- Next recommended action.

Do not show invented store metrics in production. Development fixtures must be visibly marked as demo data.

### 6.2 Public website

Pages:
- Home
- Product
- How it works
- Use cases
- Pricing
- Methodology
- Security and privacy
- Documentation
- Resources
- Support
- App Store installation path

Home page narrative:
1. Shipping economics problem.
2. NODUS promise.
3. Real interface and evidence example.
4. Observe-to-Verify workflow.
5. Qualified use cases.
6. Pricing and limitations.
7. Trust, privacy and permissions.
8. Installation / assessment CTA.

Website must use genuine product captures or clearly labelled fixtures. No fake customer logos, testimonials, reviews or performance claims.

---

## 7. Data model (logical)

Minimum entities:
- Tenant (Shopify shop)
- Installation / OAuth session
- User / actor
- Permission grant
- Subscription / entitlement / usage event
- Product / variant
- Location
- Shipping profile / zone / rate
- Order / order line / shipping line
- Fulfillment / shipment / label
- Source document / invoice / invoice line
- Cost / adjustment / currency rate
- Reconciliation run / match / candidate
- Diagnostic rule / finding / evidence reference
- Simulation / scenario / result
- Policy snapshot / proposed change / approval / execution
- Webhook receipt / background job / sync checkpoint
- Audit event
- Notification / report
- Data deletion request

All merchant-owned rows must be tenant-scoped. Enforce tenant isolation at the service and database layers; test cross-tenant access explicitly. Use immutable audit events for security-sensitive actions.

---

## 8. Security, privacy and trust requirements

- Tenant isolation enforced server-side and at database query boundaries.
- OAuth state and session validation.
- HMAC verification for Shopify webhooks.
- Least-privilege API scopes.
- Secrets encrypted at rest and redacted from logs.
- TLS for all external traffic.
- Secure headers, CSRF protections and input validation.
- Rate limiting and abuse controls.
- Private file storage with short-lived access links.
- Upload size/type controls and malware scanning.
- Dependency scanning and secret scanning in CI.
- Audit logs for authentication, permission, billing and policy actions.
- Data retention, export and deletion process.
- Uninstall webhook triggers token revocation and defined data handling.
- Incident response and backup restoration procedure.
- Privacy policy and terms reviewed for actual data practices before public launch.

Do not claim certifications or compliance attestations that have not been independently achieved.

---

## 9. Billing and commercial model

Initial price hypotheses:
- Free: limited assessment and basic setup checks.
- Core: USD 29/month.
- Growth: USD 79/month.
- Scale: USD 199/month.

These are unvalidated. Pricing, usage limits and feature gates must be tested with qualified merchants.

Billing requirements:
- Shopify-supported recurring subscription flow.
- Server-side entitlement enforcement.
- Trial and plan transition handling.
- Billing status reconciliation.
- Grace period and delinquency behavior.
- Cancellation and uninstall handling.
- Usage metering with auditable definitions.
- Clear plan comparison and upgrade/downgrade behavior.
- No charge without merchant authorization.

Commercial metrics:
- MRR and average revenue per merchant.
- App listing impressions and conversion.
- Install-to-activation rate.
- Time to first useful result.
- Free-to-paid conversion.
- Gross margin and cost to serve.
- Monthly logo churn and revenue churn.
- Net revenue retention.
- Support burden per merchant.

Revenue is proven only by real payments and continued retention.

---

## 10. Acquisition and launch strategy

Primary acquisition:
1. Shopify App Store listing.
2. Search-intent pages grounded in actual methodology.
3. Useful free shipping economics assessment.
4. Public documentation and worked examples.
5. Legitimate Shopify/ecommerce ecosystem partnerships.

Funnel:
Discovery → product understanding → install → connect → first useful analysis → paid subscription → recurring monitoring → retention.

Measure each stage. Do not equate traffic, waitlist entries, installs or free users with paying customers.

App Store publication requires Shopify's review and approval. Development completion does not equal publication.

---

## 11. Proposed technology architecture

- Shopify's recommended React Router app template, subject to current template compatibility.
- TypeScript and React.
- Shopify Polaris for embedded Admin UI.
- PostgreSQL.
- Durable background job processing.
- Private object storage for evidence documents.
- Shopify Admin GraphQL API and verified webhooks.
- Shopify Billing APIs / managed pricing approach as applicable to current Shopify requirements.
- Managed application hosting and database.
- Structured logs, error tracking, uptime monitoring and backups.
- CI for typecheck, lint, tests, build, dependency and secret checks.

Prefer modular monolith initially over premature microservices. Keep domain boundaries explicit: identity, ingestion, evidence, reconciliation, diagnostics, simulation, policy control, billing and notifications.

Use decimal arithmetic for financial values. Store money as integer minor units plus ISO currency where possible; document currency precision and rounding rules.

---

## 12. Reliability and operations

- Idempotent ingestion and webhook processing.
- Durable retry with bounded exponential backoff.
- Dead-letter handling and operator visibility.
- Rate-limit-aware Shopify API client.
- Database migrations with rollback/recovery strategy.
- Automated backups and tested restore.
- Health and readiness endpoints.
- Structured, redacted logs.
- Error budgets and alert thresholds.
- Job latency and queue depth monitoring.
- Data freshness indicators.
- Graceful degradation when Shopify or external providers are unavailable.

---

## 13. Quality and acceptance criteria

### Functional
- A real Shopify development store can install and authenticate.
- A merchant can inspect and revoke permissions.
- Data ingestion is paginated, resumable and idempotent.
- Reconciliation matches supported fixtures correctly.
- Every financial result links to source evidence.
- Diagnostic results are reproducible and explainable.
- Simulations disclose data coverage and assumptions.
- No policy change occurs without explicit approval.
- Supported changes are read back and verified.
- Monitoring detects defined changes and exceptions.
- Billing entitlements are enforced server-side.
- Tenant isolation tests pass.

### Financial correctness
- Decimal arithmetic.
- Explicit currency handling.
- No double counting.
- Split shipments and multiple labels handled.
- Duplicates and late adjustments handled.
- Unmatched values remain visible.
- Every aggregate is drillable to evidence.

### Security
- Cross-tenant access tests.
- OAuth and webhook verification tests.
- No secrets in logs or client bundles.
- Upload validation and access controls.
- Permission revocation and uninstall behavior.
- Dependency and secret scans.

### Experience
- Responsive embedded app.
- Accessible controls and tables.
- Loading/empty/error/permission/stale states.
- No dead buttons.
- No fabricated production metrics.
- Onboarding produces a first useful result.

### Production
- CI green on the exact release commit.
- Production deployment and health checks verified.
- Database backup and restore tested.
- Billing verified in Shopify test environment and live environment as permitted.
- App Store submission and approval completed.
- Support and legal pages published.

A green unit-test suite is not evidence of production readiness.

---

## 14. Test strategy

Required test layers:
- Unit tests for money, matching, diagnostics and simulation calculations.
- Property tests for idempotency, rounding and reconciliation invariants.
- Integration tests for persistence, jobs, webhooks and Shopify adapters.
- Contract tests for API response shapes and permission boundaries.
- End-to-end tests for install-to-first-result, approval-to-verification and billing lifecycle.
- Security tests for tenant isolation, authorization, upload access and webhook forgery.
- Failure tests for rate limits, timeouts, partial API updates and duplicate events.

Fixtures must include:
- Single-label order.
- Multi-label order.
- Split fulfillment.
- Duplicate invoice.
- Late carrier adjustment.
- Refund and voided label.
- Currency mismatch.
- Missing tracking reference.
- Unmatched invoice line.
- Missing product weight.
- Multiple profiles and locations.
- Permission revoked mid-sync.
- Shopify API timeout during policy execution.
- Stale configuration before approval is executed.

---

## 15. Unresolved assumptions and validation plan

| ID | Assumption / unknown | Validation required | Release blocker? |
|---|---|---|---|
| U1 | Merchants will pay for closed-loop policy control beyond audit tools | Qualified buyer interviews and paid pilot evidence | Commercial |
| U2 | Shopify exposes all required order/fulfillment/label data for target stores | API scope and dev-store proof | Yes |
| U3 | Carrier/3PL invoice formats can be normalized reliably | Obtain representative, permissioned samples | Yes for each advertised provider |
| U4 | Policy simulations can model merchant scenarios accurately enough | Golden datasets and scenario comparisons | Yes |
| U5 | Required policy changes are writable through supported Shopify APIs | Mutation/permission/plan capability matrix | Yes for each automated action |
| U6 | Merchants trust an app with shipping configuration write permissions | Usability and security validation | Yes for write feature |
| U7 | $29/$79/$199 pricing aligns with willingness to pay | Pricing interviews and paid conversion | Commercial |
| U8 | App Store listing can acquire qualified installs economically | Listing funnel measurement | Commercial |
| U9 | Data retention and deletion expectations can be met | Legal/privacy review and implementation | Yes |
| U10 | Document extraction cost and accuracy are sustainable | Benchmark representative documents | Yes for paid document feature |
| U11 | Product name NODUS and domains are available | Trademark and domain clearance | Yes before brand launch |
| U12 | Hosting and support costs permit healthy gross margin | Cost model using measured usage | Commercial |

No unresolved assumption may be quietly converted into a product claim.

---

## 16. Delivery and release gates

The work is one integrated product, delivered in dependency order. Internal sequencing does not create separate public product versions.

1. Establish repository, CI and application foundation.
2. Implement secure Shopify identity and tenant model.
3. Implement ingestion, webhook processing and source evidence.
4. Implement reconciliation and diagnostics.
5. Implement policy simulation.
6. Implement approval, supported execution and verification.
7. Implement recurring monitoring and reporting.
8. Implement billing and entitlement enforcement.
9. Complete application UX, public website, docs and support.
10. Validate security, reliability, economics and merchant workflows.
11. Deploy production infrastructure.
12. Submit and obtain App Store approval.
13. Measure actual acquisition, paid conversion and retention.

Each release gate requires test evidence and a recorded limitation list.

---

## 17. Definition of done

NODUS is complete only when a real merchant can install it, connect a Shopify store, understand what data is available, receive correct evidence-backed shipping analysis, simulate a policy change, explicitly approve a supported change, see it applied and verified, monitor subsequent results, and pay through a working recurring subscription.

The public website, documentation, security controls, support, operations and App Store approval must also be complete.

NODUS is commercially validated only after real merchants pay and continue paying. No code commit can substitute for that evidence.

---

## 18. Non-negotiable engineering rules

1. No fake data presented as live data.
2. No unsupported savings or conversion claims.
3. No untraceable financial totals.
4. No silent policy writes.
5. No cross-tenant data exposure.
6. No swallowed errors or false success states.
7. No secrets committed to the repository.
8. No dead UI controls.
9. No unverified integrations advertised as working.
10. No launch claim before production and App Store verification.
