# NODUS Product Specification

## Positioning
Shopify conversion incident response for merchants with urgent, revenue-critical storefront, cart, checkout or purchase-tracking problems.

## Buyer
An established Shopify or Shopify Plus merchant with meaningful traffic, a measurable conversion regression or a reproducible purchase-path failure, urgency to resolve it, and budget for specialist diagnosis and remediation.

## Core job
Locate the failing purchase-journey step, identify the most plausible cause through reproducible evidence, implement an explicitly approved change in a safe environment, and verify the result.

## Workflow
1. Incident intake: store URL, affected journey, date window, urgency, monthly sessions, issue category and budget.
2. Evidence intake: comparable baseline/current funnel exports and optional device, channel or landing-page segments.
3. Diagnosis: calculate session-to-cart, cart-to-checkout, checkout-completion and session conversion rates.
4. Prioritisation: identify the largest measured regression and the segments where it concentrates.
5. Reproduction: inspect storefront behaviour, theme/app releases, checkout configuration, browser/device and payment/shipping conditions.
6. Remediation: record the proposed code/configuration change, merchant approval, implementation owner, test environment and rollback plan.
7. Verification: execute QA and preserve before/after evidence; do not attribute conversion lift without an appropriate comparison.

## Current implemented capabilities
- Local browser CSV parsing and validation.
- Baseline/current funnel comparison.
- Segment-level regression screening.
- Data-quality warnings.
- Counterfactual order-gap estimate with explicit limitations.
- JSON diagnostic export.
- D1-backed conversion incident enquiry intake.

## Not yet implemented
- Automatic access to private Shopify Analytics.
- Shopify app install and production OAuth credentials.
- Theme source retrieval, draft-theme patching or checkout configuration writes.
- Browser automation against a merchant's authenticated storefront.
- Persistent merchant case workspace and remediation approval records.
- Payment processing, qualified delivery staffing or a completed paid pilot.

## Commercial model to validate
- Target diagnostic rate: USD 100/hour, capped and scoped in advance.
- Remediation: separately scoped fixed-price or hourly work after diagnosis.
- Ongoing optimisation: only offered after actual repeat demand is established.
- No open-ended meter, guaranteed conversion lift or recovery claim.

## Acceptance criteria for commercial readiness
1. A real merchant authorises access to the relevant store and evidence.
2. Diagnosis identifies a reproducible failure or a measured regression with known limitations.
3. A qualified implementation owner produces and tests a change in a safe environment.
4. Merchant approves deployment and rollback plan.
5. Post-change QA and measurements are recorded.
6. A merchant pays for the work and confirms the delivered outcome.
7. Repeat demand is evidenced before a recurring subscription is sold.

## Operational boundary
No payment or client contract is activated by this repository. Seller identity, payment, tax, refunds, privacy obligations and delivery staffing must be established by an authorised adult-owned business before taking customer funds.