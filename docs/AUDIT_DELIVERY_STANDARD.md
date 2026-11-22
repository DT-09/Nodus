# NODUS Shipping Cost Audit — Delivery Standard

This standard defines the exact work included in the one-time pilot. It is an operating checklist, not a claim that an audit has been completed.

## Engagement boundary

- One Shopify store.
- One agreed reporting window, no longer than 30 days.
- Maximum 2,000 orders.
- One carrier or 3PL cost export.
- One reporting currency per comparison.
- One written decision pack.
- No direct carrier claims, accounting opinion, tax advice, live store changes or guaranteed savings.

Reject or re-scope data that falls outside these limits before invoicing.

## Intake gate

Do not accept source files until:
- the buyer's authority to share the data is confirmed;
- the store and reporting window are agreed in writing;
- the exact source formats and required columns are checked;
- the buyer understands that incomplete coverage limits conclusions;
- a secure transfer method and retention/deletion period are agreed;
- the authorized seller has issued terms and an invoice;
- cleared payment has been confirmed.

The public enquiry form is not a purchase and must never be treated as authorization to begin work.

## Analysis procedure

1. Record the engagement ID, store, period, file names, file hashes, received timestamps and operator.
2. Preserve original source files as read-only. Work from copies.
3. Validate headers, row counts, unique order IDs, unique invoice/charge IDs, currencies, date coverage and required references.
4. Record missing fields, malformed rows, duplicate rows and exclusions before calculating totals.
5. Run the NODUS reconciliation workflow using supported order and carrier CSV formats.
6. Inspect matched, unmatched, ambiguous, duplicate and currency-mismatched records separately.
7. Do not infer a zero carrier cost from a missing invoice row.
8. Only calculate shipping balance where coverage is explicitly attested complete and tax treatment allows the comparison.
9. Check totals against source-file control totals. Independently recalculate a sample of matched records.
10. Run historical policy replay only when the required order subtotal and shipping-revenue fields are present.
11. Have a second reviewer inspect every material finding and the stated limitations.
12. Export the CSV register and JSON decision pack. Record output hashes.

## Required report sections

### 1. Executive decision brief
- Buyer question.
- Reporting window and scope.
- Three to five most material supported findings.
- What the buyer can do next.
- What the data cannot establish.

### 2. Evidence coverage
- Files and record counts.
- Included and excluded records.
- Match coverage and match methods.
- Currency and tax treatment.
- Known data gaps and assumptions.

### 3. Reconciliation
- Shipping revenue by currency.
- Matched carrier/3PL cost by currency.
- Supported order-level comparisons.
- Explicit unknown values where cost coverage is incomplete.

### 4. Exception register
- Stable source reference.
- Exception type and severity.
- Why it was flagged.
- Evidence available.
- Human action required.
- Status: open, resolved, or not actionable.

### 5. Policy replay
- Historical basket sample.
- Current policy assumptions.
- Alternative policy assumptions.
- Revenue arithmetic only.
- Explicit warning that historical replay does not forecast conversion, demand, profit or customer behaviour.

### 6. Method and limitations
- Matching precedence.
- Calculations and rounding.
- Missing-data handling.
- Currency boundaries.
- Tax treatment.
- Known parser or source limitations.

## Release checklist

- [ ] All totals reconcile to source control totals or differences are explained.
- [ ] No missing cost is treated as zero.
- [ ] No negative shipping balance is called carrier overbilling.
- [ ] No amount is described as recovered or recoverable without independent confirmation.
- [ ] Every material finding has a source reference.
- [ ] All mixed currencies remain separate.
- [ ] Synthetic examples are not mixed with buyer data.
- [ ] A second reviewer checked the report.
- [ ] The CSV and JSON exports open and agree with the report.
- [ ] The buyer receives only the agreed files through the agreed channel.
- [ ] Retention and deletion actions are recorded.

## Completion and repeat purchase

Record delivery date, scope completed, exceptions left unresolved, buyer feedback and any requested follow-up. A later audit is a new purchase for a new period; no auto-renewal is implied. Recommend another audit only when new records and a material unresolved question justify it.
