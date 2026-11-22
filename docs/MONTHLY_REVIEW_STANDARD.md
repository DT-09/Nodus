# NODUS Monthly Shipping Review — Operating Standard

## Monthly scope

- One Shopify store.
- One reporting period per month.
- Up to 2,000 orders.
- One carrier or 3PL cost export.
- One reporting currency per comparison.
- One monthly decision report.

## Monthly intake

1. Confirm the store and reporting period.
2. Confirm the merchant is authorized to share the exports.
3. Receive the Shopify order export and carrier/3PL cost export through the agreed handoff.
4. Record filenames, received timestamps and SHA-256 hashes.
5. Preserve original files and work from copies.
6. Confirm reporting window, currencies, source control totals and coverage limits.

## Analysis

1. Validate required headers and row counts.
2. Reject malformed amounts, invalid currencies and duplicate source IDs.
3. Match by exact order reference or unique tracking number only.
4. Keep currency mismatches and ambiguous references unresolved.
5. Never treat missing cost evidence as zero.
6. Calculate shipping balance only when coverage is attested complete and tax treatment supports the comparison.
7. Review carrier spend by carrier and cost type.
8. Compare the current period with the previous period only when definitions and coverage are comparable.
9. Run historical policy replay only when order subtotal is present.
10. Independently recalculate a sample of material rows.

## Customer deliverables

- Print-ready monthly HTML report, suitable for saving as PDF.
- CSV order and exception register.
- JSON decision pack.
- Written decision brief with findings, limitations and next actions.

## Quality gate

- Totals reconcile to source control totals or differences are explained.
- Material findings link to source references.
- No missing costs are treated as zero.
- Mixed currencies remain separate.
- Incomplete coverage is visible.
- Negative shipping balance is not described as carrier overbilling or recovered savings.
- Historical policy replay is not described as a demand, conversion or profit forecast.
- Report, CSV and JSON exports agree.
- A second reviewer checks every material finding.

## Monthly continuity

For each period, record:
- reporting period and source hashes;
- order and charge counts;
- matched and unresolved counts;
- coverage status;
- currency-separated totals;
- material findings and actions;
- delivery date;
- merchant feedback;
- whether the merchant requests the next period.

A monthly renewal is justified by a useful new review, not by an automatic dashboard login. Do not claim automated monitoring or real-time alerts.
