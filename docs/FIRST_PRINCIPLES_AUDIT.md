# NODUS First-Principles Audit

**Audit date:** 2026-11-15  
**Repository:** `DT-09/Nodus`  
**Audited ref:** `main` at `84bec3000123f0b64426c7ad5ff34ee5e1dfe231`  
**Method:** README, product/commercial/architecture documents, Prisma schema, domain engine, ingestion services, selected routes, deployment configuration, CI workflow and latest Actions run reviewed. Public competitor and Shopify platform documentation checked separately.

**Status:** First-pass evidence audit. This is not a security certification, production acceptance, market validation or full line-by-line review of every route.

---

## 1. Executive decision

**Do not expand NODUS with more features yet. Keep the project alive, but narrow its immediate proof obligation.**

The strongest current hypothesis is not "another Shopify shipping analytics dashboard." That category already contains products describing substantially the same basic comparison of checkout shipping revenue and actual carrier cost. OCT Shipping Analytics PRO's public Shopify App Store listing describes order-level shipping revenue/cost comparison, loss-making orders and free-shipping analysis; its listing currently shows a free price and zero reviews. This establishes a direct competitor's public positioning, not adoption, retention or customer satisfaction.

The defensible hypothesis worth testing is narrower:

> For Shopify merchants whose carrier or 3PL billing evidence lives outside Shopify, NODUS can turn recurring, fragmented invoice exports and Shopify order data into a traceable, reviewable monthly shipping-economics reconciliation and decision record.

This is still a hypothesis. There is no verified merchant evidence in the repository establishing frequency, cost of the current process, actionable findings, repeat use or willingness to pay.

The next work should be **data correctness, evidence provenance and one real merchant evaluation**, not policy automation, carrier APIs, AI, extra dashboards or a larger feature surface.

## 2. What is established

### Repository and implementation facts

The following are directly supported by the current source tree:

- NODUS is a Shopify embedded application using React Router, TypeScript, Prisma and PostgreSQL.
- Shopify order data is ingested with pagination and persisted sync checkpoints.
- The current declared order scope is `read_orders`; Shopify's official documentation says this covers orders created in the most recent 60 days by default. Older orders require `read_all_orders` in addition to `read_orders`, with Shopify approval for Partner-created public apps.
- Carrier-cost intake is CSV, not live UPS/FedEx/USPS invoice API ingestion.
- Cost records are matched by exact order reference, or by an unambiguous tracking number when no explicit order reference is supplied.
- Reconciliation uses integer minor units and currency codes; cross-currency addition is rejected.
- Cost coverage has explicit complete/partial/unknown states. The code intentionally withholds contribution when coverage is incomplete or tax-inclusive revenue cannot be separated.
- Historical policy simulation compares shipping revenue under a flat-rate/free-shipping-threshold rule. It explicitly does not model demand, conversion, abandonment, shipping cost or profit.
- Shopify Markets shipping configuration is read-only. Policy writes are disabled.
- The app contains a scheduled Shopify order refresh endpoint and GitHub Actions runner. That is distinct from carrier invoice polling, policy-drift monitoring or merchant alerting.
- Subscription lookup/access-gate code exists behind a feature flag, but Partner configuration and the full billing lifecycle are not verified.
- The Decision Pack contains stored orders, cost records, matches, findings, simulations, merchant value attestations and a SHA-256 digest. A digest detects payload changes; it does not prove that source records were authentic or complete.
- The economic value ledger stores merchant-entered attestations. It does not independently verify carrier credits or accounting postings.

### Automated verification

The latest `NODUS CI` run associated with the audited main commit completed successfully. The run executed dependency installation and production dependency audit, Prisma generation/migrations/schema-drift check, deployment configuration validation, TypeScript typecheck, Vitest tests, production build and Docker build.

This is strong evidence that the current repository passes its configured CI environment. It is not evidence of successful live Shopify OAuth, real carrier-data correctness, tenant isolation in production, operational recovery, merchant value or willingness to pay.

### Platform constraint

Shopify's official access-scope documentation confirms that `read_orders` is limited to the last 60 days unless `read_all_orders` is also granted. This limits the historical sample NODUS can promise at onboarding unless additional access is approved or the merchant's own prior exports are supported through a separately defined import workflow.

References:
- Shopify scopes and order permissions: https://shopify.dev/docs/api/usage/access-scopes
- Shopify order access: https://shopify.dev/docs/api/admin-graphql/2026-07/objects/Order
- Direct competing public listing: https://apps.shopify.com/shipping-analytics-pro

## 3. First-principles problem analysis

### The problem, independent of NODUS

A merchant may collect a shipping amount at checkout and incur a different fulfillment cost later. Those records can exist in different systems, use different identifiers, arrive at different times and contain adjustments or credits. A merchant may need to reconcile them to understand coverage, exceptions and policy decisions.

This is a plausible operational problem. The existence of a mathematical difference is not enough to establish that it is frequent, expensive, difficult to solve, or budget-worthy for a particular merchant.

### Who could have the problem?

A plausible initial segment is a Shopify merchant that:

- ships physical goods at enough volume for manual reconciliation to be burdensome;
- uses external carrier accounts or one or more 3PLs;
- can export actual billed charge lines with stable invoice/charge IDs and order or tracking references;
- reviews shipping economics at a recurring cadence;
- has an owner in finance, operations or ecommerce who can act on the findings.

This ICP is not validated. Do not invent a shipment-volume threshold. Qualify by evidence availability, current process, frequency, decision impact and buyer ownership.

### What is the buyer actually buying?

Not charts. The buyer might be buying:

1. Less time spent assembling and matching separate exports.
2. Better visibility into which orders have complete cost evidence.
3. A defensible exception list that can be traced to source records.
4. A repeatable monthly review of carrier/3PL charges and shipping contribution.
5. Better-supported decisions about rates and free-shipping policies.

Each item needs a measured baseline and a merchant-confirmed outcome. A discrepancy is not a recovered credit. A historical revenue replay is not a profit forecast.

### What would make NODUS unnecessary?

- The merchant's shipping/label platform already provides accurate order-level billed costs and sufficient reporting.
- The merchant's 3PL provides a usable reconciliation report.
- The current spreadsheet process is cheap, trusted and infrequent.
- The merchant cannot export sufficiently detailed charge records.
- The number of ambiguous or shared shipments makes order-level allocation unreliable.
- The financial or operating value is too small to justify another app, data permission and review process.

These are real alternatives, including doing nothing. NODUS must beat the actual alternative, not an imagined empty market.

## 4. Bayesian hypothesis ledger

Do not manufacture numerical probabilities. The current evidence is not calibrated enough to justify precise percentages. Update confidence directionally and record why.

| Hypothesis | Prior position | Evidence observed | Current posterior judgment | What would change the judgment |
|---|---|---|---|---|
| H1: Some Shopify merchants have a shipping revenue/cost reconciliation problem | Plausible | The underlying records are separate; several public products describe this job | **High confidence that the problem exists in some segment**; prevalence and severity unknown | Interviews and workflow observation across qualified merchants |
| H2: NODUS's current basic revenue-vs-cost comparison is differentiated | Uncertain | OCT Shipping Analytics PRO publicly describes substantially the same basic comparison and policy use case | **Low confidence**; feature presence alone is not differentiation | Demonstrate a workflow competitors/current tools do not handle materially better |
| H3: The target segment has usable carrier/3PL exports | Unknown | NODUS accepts structured CSV with invoice/charge IDs and optional order/tracking references | **Unknown** | Obtain permissioned sample exports from multiple qualified merchants and measure usable-field rates |
| H4: Merchants find the output actionable | Unknown | Synthetic demo and deterministic engine exist; no verified merchant assessment is documented | **Unknown** | A merchant independently reviews a real pack and takes a documented action |
| H5: The workflow recurs often enough to support a subscription | Weakly supported | Manual CSV intake and scheduled Shopify order refresh exist; carrier invoice polling and alerts do not | **Low/unknown** | Repeat the same workflow in a later billing cycle and measure time, new exceptions and continued use |
| H6: Merchants will pay for the recurring outcome | Unknown | No verified payment, subscription revenue or willingness-to-pay evidence is documented | **Unknown** | Explicit paid commitment after delivery, under an authorized business operator |
| H7: The current engine is technically reliable enough for external financial review | Moderate positive evidence | Deterministic core, explicit unknown states, tests and green CI; risks below remain | **Promising foundation, not production-validated** | Fix identified correctness risks, add adversarial tests, validate with real labelled records and independent review |

### Bayesian discipline

For every next experiment, pre-register:

- hypothesis;
- target segment and qualification criteria;
- sample and source of evidence;
- expected observation if the hypothesis is true;
- expected observation if it is false;
- pass/fail threshold;
- result and confidence update.

Do not count website visits, compliments, waitlist entries or free sign-ups as willingness to pay. Do not infer market size or demand from competitor existence.

## 5. Technical findings requiring action

### P0 — Stale coverage attestation after Shopify order changes

**Evidence:** `app/services/shipping-snapshot.server.ts` updates persisted order name, date, currency, shipping revenue, tax treatment, subtotal and tracking numbers during synchronization. The update path does not reset `costCoverageStatus`, `coverageReviewedAt` or `coverageReviewedBy` when those source facts change.

**Why it matters:** A merchant can attest that all applicable costs are covered, then Shopify order/fulfillment data can change. The old complete attestation may remain attached to changed tracking or revenue data. The reconciliation engine can then calculate a contribution using a review that no longer corresponds to the current source state.

**Required invariant:** A complete-coverage attestation is valid only for the exact relevant order/fulfillment source state that was reviewed. Any material change to shipping revenue, currency, tax treatment, fulfillment/tracking identifiers or other cost-allocation inputs must invalidate it. Prefer a stable source fingerprint over resetting reviews on every unchanged sync.

**Required tests:** changed tracking number invalidates; changed shipping amount invalidates; changed currency/tax treatment invalidates; unchanged sync preserves review; concurrent refresh cannot restore stale review.

### P0 — Carrier label can change deduplication identity

**Evidence:** `app/domain/carrier-csv.ts` derives `sourceSystem` from the free-text carrier label. `ShippingCost` uniqueness is `merchantId + sourceSystem + sourceRecordId`, where `sourceRecordId` is invoice ID plus charge ID.

**Why it matters:** The same invoice/charge line can be imported again under a different carrier label or alias, producing a different `sourceSystem` and therefore a different database uniqueness key. The same economic charge could be counted twice.

**Required invariant:** A source charge must have a stable identity independent of display labels. Provider/account identity should be stored separately from the canonical deduplication key. Define how invoice IDs are scoped across accounts and providers before changing the key.

**Required tests:** same invoice and charge imported with two carrier aliases; same invoice/charge across genuinely distinct carrier accounts; same source row re-imported; provider label normalization.

### P1 — Evidence provenance is weaker than the product promise

**Evidence:** `ShippingCost` stores source IDs, invoice reference, amount, currency and optional references. The import path does not persist the original uploaded file, file hash, row number, import batch, parser version or original raw row. The Decision Pack exports normalized records, not the original file/row artifact.

**Why it matters:** A reviewer can inspect normalized values, but cannot always reproduce the value from the exact source row or establish which uploaded file/version produced it. SHA-256 over the exported JSON proves integrity of that JSON payload after export; it does not authenticate its upstream source.

**Required decision:** Either narrow the public promise to normalized source identifiers and merchant-supplied evidence, or add private source-file/batch provenance with tenant isolation, retention/deletion, access control and secure storage. Do not call the export a fully source-verifiable audit pack until this is solved.

### P1 — Reconciliation model is narrower than real shipping economics

**Evidence:** The current engine matches cost lines to orders by exact order reference or one unambiguous tracking number. It aggregates matched lines per order. It does not model a full shipment/label/fulfillment graph or deterministic allocation of a shared charge across multiple orders.

**Why it matters:** Split shipments, multi-package orders, consolidated shipments, shared 3PL fees, adjustments, voided labels, late credits and accessorial charges can make a simple order-to-cost sum incomplete or misleading.

**Required decision:** Define the first supported reconciliation contract narrowly. Reject unsupported allocation patterns or mark them for human review. Do not imply general invoice audit or universal parcel-cost completeness.

### P1 — Historical policy replay is not an economics forecast

**Evidence:** `app/domain/simulation.ts` compares historical shipping revenue under a flat rate and free-shipping threshold. Its own assumptions state that historical baskets remain unchanged and no demand/conversion response is modelled. It does not replay shipping cost.

**Implication:** This is a historical shipping-revenue comparison, not expected profit, margin improvement, conversion impact or policy optimization.

**Required decision:** Keep the feature secondary and label it accurately. Do not build a more elaborate optimizer until a merchant demonstrates that this decision is a repeated, budgeted job and the necessary cost/demand data is available.

### P1 — Scheduled refresh has a low fixed throughput ceiling

**Evidence:** `app/routes/api.cron.sync.ts` processes at most three merchants per invocation. `.github/workflows/scheduled-sync.yml` invokes it every five minutes. Each successful merchant is scheduled again after 15 minutes.

**Implication:** Nominal maximum is 36 merchant syncs/hour. At a 15-minute cadence, that is enough for roughly nine continuously due merchants before accounting for execution time, retries, backfill size or API throttling. This is a prototype-scale scheduler, not evidence of scalable monitoring.

**Required decision:** Measure actual sync duration and expected merchant count before increasing scope. If the target is more than a small cohort, redesign scheduling with durable queue semantics, fair claiming, bounded concurrency, rate-limit awareness and observable backlog.

### P2 — Documentation drift

**Evidence:** `README.md` and the current source describe scheduled Shopify order refresh. `docs/ARCHITECTURE.md` still lists scheduled monitoring and durable background processing as not implemented without distinguishing the implemented bounded order-refresh runner from unimplemented carrier monitoring/alerts.

**Required action:** Correct the architecture document so repository claims agree. Keep production configuration and live execution explicitly unverified.

## 6. Commercial thesis: what to test before building more

### Narrowest valuable deliverable

A monthly, merchant-reviewed **Shipping Cost Reconciliation Pack** for one Shopify store, one currency, one authorized period and one supported carrier/3PL export:

- exact data scope and Shopify permission window;
- imported charge-line register and import provenance;
- matched, unmatched, duplicate, ambiguous and incomplete states;
- only defensible order-level calculations;
- explicit cost coverage and limitations;
- exceptions with source references;
- CSV/JSON export;
- measured time spent versus the merchant's current process.

Do not require automated carrier APIs to test this narrow workflow. A repeatable CSV workflow may be enough to establish whether the monthly job matters. If merchants will not provide a second period or use the output again, recurring SaaS is not yet justified.

### What not to build now

- Direct carrier APIs without evidence that CSV is the adoption blocker.
- PDF/OCR intake before measuring the actual formats merchants can export.
- Autonomous shipping-policy writes.
- AI-generated diagnosis.
- More generic dashboard visualizations.
- Subscription checkout before repeat demand and billing operations are proven.
- Broad enterprise positioning unsupported by security and operational evidence.

### Buyer evidence protocol

For each qualified evaluation, record:

1. Current process and tools used.
2. Frequency and owner of the reconciliation.
3. Actual elapsed time and manual steps.
4. Data formats available and proportion of rows with stable references.
5. Number and value of matched, unmatched and ambiguous lines.
6. Whether the merchant trusts the calculation after tracing it to source records.
7. What action the merchant takes and what evidence supports that action.
8. Whether the merchant repeats the process in the next period.
9. Whether the merchant explicitly agrees to pay for the recurring outcome and what budget it replaces.

The first programme can remain no-fee. Do not treat participation as proof of willingness to pay. A later paid pilot requires a clearly defined deliverable, acceptance criteria and an appropriately authorized adult/business operator for legal, hosting, billing and payout arrangements.

## 7. Decision gates

| Gate | Pass condition | Fail response |
|---|---|---|
| Data feasibility | Several qualified merchants can provide usable exports with stable identifiers | Narrow supported sources or stop the segment |
| Correctness | Reconciliation matches independently reviewed source records and handles unsupported cases conservatively | Fix model/parser before more features |
| Deliverable value | Merchant can trace results and takes a documented operational/financial action | Redesign output around the actual decision |
| Repeatability | Same merchant repeats the workflow in a later period with acceptable effort | Do not position as recurring SaaS |
| Willingness to pay | Explicit paid commitment for the recurring outcome | Keep it research/free evaluation or abandon the commercial thesis |
| Operations | Tenant isolation, deletion, backup recovery, security, support and billing gates pass | Do not onboard external merchants or charge |

## 8. Immediate execution sequence

1. Add regression coverage and fix stale coverage attestations.
2. Stabilize carrier charge identity and cross-import deduplication.
3. Decide and implement source-file/import-batch provenance, or narrow the audit-pack claim.
4. Correct architecture documentation and the public feature truth table.
5. Run adversarial tests for split shipments, repeated tracking numbers, credits, duplicates, late adjustments, mixed currencies, refunds and changed Shopify order state.
6. Complete a controlled real-store evaluation with permissioned, representative data.
7. Measure the merchant's existing process and NODUS-assisted process.
8. Repeat with the same merchant in a later period.
9. Only then decide whether a subscription product is justified.

## 9. Final conclusion

NODUS has a credible engineering foundation and passes its current CI pipeline. That is real progress.

But its original basic product proposition is not unique. The current commercial thesis remains unproven. More importantly, two source-level risks can undermine the integrity of financial outputs: stale complete-coverage attestations after source changes, and import deduplication identity that depends on a free-text carrier label.

**The correct next move is not to add features. It is to make the evidence trustworthy, then prove that a specific merchant repeats and values the workflow.**

Until those conditions are met, NODUS is an evaluation-stage product foundation—not a commercially validated, production-ready or revenue-generating business.
