# NODUS Merchant Evaluation

## The buyer

Shopify merchants with recurring carrier or 3PL charges, meaningful parcel volume, and flat-rate or free-shipping decisions they need to review. The first evaluation should be narrow: one store, one currency, one carrier-cost CSV format and a defined historical sample.

## The problem NODUS addresses

Shopify shipping charges and carrier-cost records often live in separate systems. A merchant needs to know which orders have usable cost evidence, which records remain unmatched, and what a proposed flat rate or free-shipping threshold would have produced on a historical order sample.

NODUS connects those records and keeps the evidence and assumptions visible.

## Founding assessment terms

The first assessment is no-fee and no-obligation. Scope it to one authorized Shopify store, one reporting currency, the accessible order-history window, and one supported carrier-cost CSV export. Do not collect payment details or auto-enrol the merchant in a subscription.

The deliverable is a dated assessment pack containing: (1) sample window and Shopify permission boundary, (2) evidence-coverage statement, (3) matched/unmatched/incomplete exception register with source references, (4) reproducible calculations and any supported historical policy replay, (5) an economic value ledger separating identified, merchant-validated and merchant-attested realized outcomes, and (6) limitations and follow-up actions. The merchant reviews and confirms its own records. A discrepancy is not a recovered credit.

A subscription is considered only after delivery and only where the merchant agrees there is a recurring job worth paying for. No positive review or public case study is required to participate.

## Evaluation workflow

1. Connect an authorized Shopify development or merchant store.
2. Synchronize the order history available under the granted Shopify permissions.
3. Import carrier-cost CSV records using the documented format.
4. Review unmatched records and manually assign only supported matches.
5. Review cost coverage for each order. Missing or partial coverage is not treated as zero cost.
6. Inspect diagnostics and replay a proposed flat rate or free-shipping threshold against the stored historical sample.
7. Export the full evidence CSV and the reproducible JSON Shipping Economics Decision Pack. The JSON pack contains the complete stored order/evidence scope, deterministic reconciliation, matched/unmatched evidence states, diagnostics, per-currency summaries, policy replay history, value-ledger attestations, methodology limitations and a SHA-256 digest.

## What the merchant receives

- A merchant-scoped record of the Shopify orders NODUS was permitted to read.
- Imported carrier-cost evidence with duplicate and currency checks.
- Visible matched, unmatched and incomplete-coverage states.
- Deterministic reconciliation and diagnostics.
- Saved historical shipping-revenue replay with assumptions and sample window.
- An exportable evidence register and audit trail.
- A JSON Decision Pack with complete stored-scope reconciliation, source-linked findings, currency-separated summaries, reproducibility metadata and integrity digest.

## What this evaluation does not promise

- Confirmed savings, recovered revenue, profit improvement or conversion lift.
- A complete ledger beyond the Shopify permissions granted to the app.
- PDF invoice extraction or automatic carrier portal integrations.
- Automated changes to live Shopify shipping settings.
- Automated carrier billing monitoring or carrier alerts. Scheduled Shopify order refresh is separate and requires a configured production cron.
- Cross-currency normalization.
- A substitute for accounting, tax, legal or financial advice.

Download the blank [carrier-cost CSV template](../public/nodus-carrier-cost-template.csv) and map the carrier export to its required columns before evaluation.

## Data required

- An authorized Shopify store connection.
- Carrier-cost CSV with `invoice_id`, `charge_id`, `amount` and `currency`.
- Optional exact order reference, tracking number, charge date and cost type.
- A merchant reviewer who can attest whether imported cost records represent complete or partial coverage.

Do not send passwords, API tokens, customer personal data or unredacted documents through public issue trackers.

## First evaluation acceptance criteria

The evaluation is useful only if the merchant can:
- identify the order sample and its permission limits;
- inspect a carrier cost record back to its imported source row;
- distinguish matched, unmatched and incomplete evidence;
- reproduce a saved historical replay from its recorded assumptions;
- export the underlying records and JSON Decision Pack for independent review;
- verify the pack's SHA-256 canonical-payload digest.

## Commercial status

The repository does not yet have a live subscription checkout, verified production deployment or App Store listing. Prices shown in planning material are hypotheses, not offers. Do not accept payment or represent the service as generally available until an authorized business operator has completed the legal, billing, deployment and Shopify release requirements.
