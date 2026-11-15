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

## Value measurement
Measure three distinct forms of value and never silently combine them:

1. **Realized financial value:** posted carrier credits, refunds or accounting adjustments with source and realization references. Mark as merchant-attested unless an independent finance control verifies the posting.
2. **Operating value:** measured reduction in time spent importing, matching, investigating and preparing shipping-cost reviews. Record a baseline and follow-up using the same task definition. Convert hours to money only with a merchant-approved loaded labor rate.
3. **Decision value:** better-supported shipping policy and carrier decisions. Report the decision, source window and subsequent observed result. Historical replay alone is not realized value.

For every value statement, disclose the currency, time window, evidence coverage, attribution method, exclusions and whether it is realized, avoided, estimated or operational. Do not attribute an outcome to NODUS merely because it was recorded in NODUS. Avoid double counting a carrier credit and the same correction as separate benefits.

## Founding Merchant Value Programme
The first commercial motion is a limited, no-fee, no-obligation assessment for a small founding cohort. Scope each assessment to one Shopify store, one reporting currency, the order history available under granted permissions, and one supported carrier-cost export.

Deliver:
- a data and evidence coverage statement;
- a matched/unmatched/incomplete evidence register;
- a deterministic exception worklist with source references;
- a historical shipping-policy replay where the data supports it;
- an economic value ledger that separates identified, validated and realized records;
- a written limitations section and a review with the merchant.

The merchant makes the final decision about whether an exception is valid and whether a credit was posted. Do not promise a recovery or ask for payment before the assessment is delivered. Participation does not require a positive review, testimonial or public case study. Obtain separate explicit permission before publishing any quote, logo, metric or case study. Never fabricate or purchase reviews.

## Subscription decision rule
Do not publish a fixed price list before there is evidence of willingness to pay and ongoing operating value. After the assessment, propose a monthly subscription only if there is a credible recurring job for NODUS to perform and the merchant agrees that the continuing scope matters.

As an internal value-fit threshold, aim for conservative, merchant-accepted recurring value of at least 3× the proposed monthly fee. This is a pricing discipline, not a guarantee or a claim that NODUS caused all measured outcomes. If recurring value is not demonstrated, do not recommend a subscription.

Set the fee from the actual ongoing scope: order volume, number of stores, carrier evidence volume, review cadence, required reporting and support. Begin with monthly billing. Consider annual billing only after retention and sustained value are established. Do not charge a percentage of disputed or merely identified exposure. Do not activate paid plans until Shopify-supported recurring billing, server-side entitlements, plan limits and lifecycle tests are complete.

## Carrier integration truth
Carrier rate, tracking and label APIs are not equivalent to carrier invoice access. Rate quotes are estimates and can differ from negotiated account rates, surcharges, adjustments, taxes and final invoiced amounts.

NODUS must use carrier invoice/charge records or merchant-authorized billing exports for actual-cost reconciliation. Direct APIs can enrich tracking and rate context, but must never be presented as invoice truth unless the provider response actually represents a billed charge.

Current supported intake is merchant-provided carrier-cost CSV. No live UPS, FedEx or USPS invoice-feed integration is claimed. Carrier credentials and account permissions must be supplied by the carrier-account owner and tested against real authorized accounts before any integration is marked live.
