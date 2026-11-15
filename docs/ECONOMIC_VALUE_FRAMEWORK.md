# NODUS Economic Value Framework

## Commercial principle
NODUS is a shipping-economics control system. It must connect source records, explain calculations, disclose evidence coverage and preserve the evidence needed to challenge a result. A dashboard metric alone is not proof of economic value.

## Four evidence states
| State | Definition | Permitted claim |
|---|---|---|
| Identified | A potential discrepancy or opportunity exists in available records | Identified exposure; not savings |
| Validated | Merchant checked source, calculation and comparison baseline | Merchant-validated opportunity; not necessarily realized |
| Realized | A credit, refund or accounting adjustment is posted and has a realization reference | Merchant-attested realized amount, subject to independent audit |
| Independently verified | An independent finance control confirms the source and posting | Verified financial outcome |

The current value ledger records merchant attestations. It does not independently verify carrier credits or accounting postings.

## Financial categories
- Carrier credit: credit memo or adjustment posted by a carrier.
- Duplicate charge: duplicate invoice line confirmed against source invoices.
- Surcharge dispute: surcharge corrected or credited after review.
- Rate correction: invoice correction supported by the contracted rate schedule and carrier adjustment.
- Policy change: measured before/after economics with a controlled comparison; historical revenue replay alone is insufficient.
- Other: use only with a precise source and explanation.

## Financial definitions
- Identified exposure: value of records that may warrant investigation. Never label as recovered.
- Validated opportunity: merchant-confirmed calculation with source evidence and baseline. Not realized cash.
- Realized value: posted credit/refund/accounting adjustment with a separate realization reference.
- Net value: realized value attributable to the workflow minus subscription fee and incremental costs.
- Payback multiple: attributable realized value divided by subscription fee.
- Break-even recovery rate: subscription fee divided by monthly carrier spend.

Use integer minor units and explicit ISO currencies. Never sum currencies without a timestamped FX source and conversion policy. Exclude tax-inclusive shipping revenue from contribution claims unless tax is correctly separated.

## Proof workflow
1. Capture the carrier invoice line or accounting source and preserve its stable ID.
2. Match it to an order, fulfillment or tracking number. Ambiguous records require review.
3. Calculate the variance using the merchant's contracted rate, actual invoice and service conditions.
4. Record the source reference, calculation, comparison period and currency.
5. Keep the opportunity identified until the merchant validates it.
6. Keep it validated until a carrier credit, refund or ledger adjustment is posted.
7. Store the realization reference and date. Keep identified, validated and realized totals separate.
8. Report with evidence coverage, sample window, exclusions and limitations.

## ROI calculator
The public calculator uses only merchant-entered values: monthly carrier spend, confirmed monthly credits/corrections and selected target subscription price. It calculates break-even, confirmed-value coverage and net amount after the fee. It does not estimate recovery, forecast savings or claim NODUS caused credits.

## Pricing hypotheses
- Evidence: $99/month
- Control: $199/month
- Portfolio: $299/month

These are target prices, not active checkout offers. Before selling, define and enforce plan limits, complete corresponding features, configure Shopify App Pricing in the Partner Dashboard, and verify the buyer journey in development stores. Portfolio must not be sold until multi-store and scheduled governance are implemented and tested.

## Carrier integration truth
Carrier rate, tracking and label APIs are not equivalent to carrier invoice access. Rate quotes are estimates and can differ from negotiated account rates, surcharges, adjustments, taxes and final invoiced amounts.

NODUS must use carrier invoice/charge records or merchant-authorized billing exports for actual-cost reconciliation. Direct APIs can enrich tracking and rate context, but must never be presented as invoice truth unless the provider response actually represents a billed charge.

Current supported intake is merchant-provided carrier-cost CSV. No live UPS, FedEx or USPS invoice-feed integration is claimed. Carrier credentials and account permissions must be supplied by the carrier-account owner and tested against real authorized accounts before any integration is marked live.
