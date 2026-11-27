# NODUS — product definition: dispute economics and evidence control

Status: discovery-stage product definition. This is not a claim of market validation or production readiness.

## One-sentence promise

Give high-volume merchants one auditable view of what disputes actually cost, what they recover, where evidence is incomplete, and which dispute workflows deserve attention — across the tools they already use.

## Initial customer

A merchant with a dedicated payments/finance function, recurring chargeback operations, and data spread across a storefront, one or more payment processors, and dispute-management services.

Do not target small merchants with low dispute volume. Do not target all e-commerce businesses indiscriminately.

## Initial paid pilot

A fixed-scope, read-only analysis of one merchant's redacted historical export set for one defined period:
- Normalise dispute, transaction, fee, alert, and outcome records.
- Reconcile records across supplied systems using deterministic identifiers and explicit match confidence.
- Calculate observed direct fees, documented internal labour (only when supplied), recovered amount, and net outcome.
- Show evidence coverage and deadline status only where source fields support it.
- Produce a case-level exception register and monthly economics report.
- Preserve source-row provenance and calculation explanations.

No fabricated benchmark, inferred savings, automatic payment action, or guaranteed win rate.

## Product modules

1. **Connectors / imports:** versioned CSV schemas first; APIs only after pilot demand and buyer security review.
2. **Canonical dispute ledger:** transaction, dispute, alert, fee, evidence item, outcome, provider, timestamps, source reference.
3. **Reconciliation engine:** deterministic joins, duplicate detection, unmatched-record queue, explicit confidence and provenance.
4. **Unit-economics engine:** fees, recoveries, documented labour, net value, cost per case, recovery rate; never fill missing values with guesses.
5. **Evidence readiness:** required-field completeness by reason code and processor; no claim that completeness guarantees a win.
6. **Workflow control:** deadlines, ownership, review status, exception queues; human approval remains mandatory.
7. **Reporting:** case drill-down, cohort analysis, provider comparison, exportable monthly review.
8. **Security:** tenant isolation, role-based access, encryption, audit logs, deletion and retention controls before confidential multi-tenant production.

## Initial acceptance criteria

- Every calculated number links to source rows and a documented formula.
- Missing data is shown as missing, not silently estimated.
- Duplicate and unmatched records are visible and exportable.
- Same input files produce deterministic results.
- The product distinguishes gross recovered value from net value after documented costs.
- No claim of causation, fraud, prevention, or recovered funds without evidence.
- Synthetic test fixtures cover duplicates, partial matches, timezone differences, refunds, reversals, multiple currencies, and missing fee records.

## Pricing discipline

Do not publish a made-up $500/month or $1,000/month plan. The paid pilot price must be tested with qualified buyers against the measurable value and scope. Recurring pricing follows only after repeat use and conversion.

## First milestone

Before building integrations: complete the 10-buyer discovery and secure 2 paid pilots. If buyers do not confirm this exact problem and commit budget, stop or change the wedge rather than expanding the codebase.
