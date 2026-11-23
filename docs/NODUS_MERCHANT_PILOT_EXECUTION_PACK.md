# NODUS Merchant Pilot — Execution Pack

Status: operating procedure for the first authorised merchant pilot.
Product scope: CSV-based 3PL billing and evidence control.
Commercial status: no customer, payment, recovery or renewal is implied by this document.

## 1. Who qualifies

Accept a pilot only when the merchant:
- Runs a Shopify store selling physical goods.
- Uses at least one external 3PL and receives recurring invoices.
- Can provide the applicable contract/rate card, one invoice and the corresponding activity export.
- Has authority to share those business records for this review.
- Has an operations or finance owner who can review findings and follow up with the provider.

Do not activate a trial if there is no external 3PL, no applicable rate card, no usable invoice, no evidence of activity where quantity verification is required, or no authorised business contact.

The lead form is an enquiry, not proof of fit. Confirm each condition before provisioning a workspace.

## 2. Exact pilot scope

Initial pilot covers:
1. One merchant workspace.
2. One named 3PL provider.
3. One confirmed contract/rate-card file.
4. One invoice period, one invoice per CSV.
5. The corresponding activity export, if available.
6. One reconciliation run per invoice input version.
7. Review of each exception with the merchant.
8. One evidence-backed period report and next-action register.

Do not silently expand the pilot to other providers, currencies, business units or periods. Agree scope first.

## 3. Required source files

### Contract / rate card

Required columns:
`charge_code,unit,pricing,rate,currency,effective_from,effective_to`

- `pricing` is `per_unit` or `fixed`.
- Use ISO currency codes and ISO dates.
- The merchant must confirm each imported rule against its agreement.
- Ambiguous tiers, minimums, bundled services, surcharges or conditional terms remain out of automated scope until represented and confirmed.

### Invoice

Required columns:
`invoice_number,invoice_date,charge_code,quantity,unit,amount,currency`

Optional:
`external_line_id,description,activity_reference,service_date,period_start,period_end`

Upload one invoice per CSV. Do not combine currencies in one file.

### Operational activity

Required columns:
`record_id,reference,charge_code,quantity,unit,occurred_at`

Quantity verification is allowed only when the activity reference, charge code and unit match the invoice line. A missing match is not proof that the provider did not perform the work.

## 4. Review protocol

For each invoice:
1. Confirm invoice identity, dates, currency, row count and total against the source statement.
2. Confirm that the active contract version applies to the service date or invoice date used by the rule.
3. Run reconciliation and preserve the input hash and engine version.
4. Classify each finding as a supported rate variance, supported quantity variance, duplicate/unsupported charge, missing evidence, ambiguous rule or other explicitly defined result.
5. Inspect the source row and calculation for every material finding.
6. Mark a finding ready to raise only after merchant review.
7. Record provider response and evidence.
8. Record raised, promised, posted and verified outcomes as distinct states.
9. Never mark a promised amount as recovered. Count an outcome as verified only when the supporting credit/statement reference and evidence note are present.

## 5. Merchant deliverable

Deliver a period report containing:
- Review scope, dates, provider and currencies.
- Source files received, hashes, row counts and missing inputs.
- Reconciliation coverage and explicit exclusions.
- Invoice totals by currency.
- Exception register with source references, calculations, severity and status.
- Provider responses and unresolved questions.
- Promised, posted and verified outcomes shown separately.
- Comparison with the immediately preceding equal-length period, where data exists.
- Limitations and specific next actions.

The report must distinguish:
- **Calculated variance:** a rule-based difference requiring review.
- **Disputed amount:** an amount the merchant has chosen to raise.
- **Promised credit:** provider commitment not yet evidenced on a statement.
- **Posted credit:** credit visible on a provider statement or transaction record.
- **Verified outcome:** merchant-reviewed evidence supports closure.

Do not claim confirmed savings, recovered cash, provider fault or SLA failure unless the source evidence and contractual definition support that statement.

## 6. Seven-day evaluation

The seven-day clock starts only after:
- The private workspace is provisioned.
- The merchant can sign in.
- Required source formats have passed a readiness check.
- The merchant has been told what is and is not included.

Suggested cadence:
- Day 1: source readiness and provider/contract setup.
- Day 2: invoice and activity import; reconciliation.
- Days 3–4: merchant review of exceptions and evidence.
- Days 5–6: provider questions and outcome tracking, if the merchant elects to raise them.
- Day 7: report review, unresolved work, fit decision and commercial discussion.

Do not imply a provider will respond within seven days. The trial tests whether NODUS can perform a useful review and preserve the workflow, not whether the provider resolves a dispute on that schedule.

## 7. Recurring-value test

Before offering ongoing service, record the merchant's baseline:
- Time spent reviewing each 3PL invoice.
- Number of invoices/providers reviewed per period.
- Existing method for checking contracted rates and quantities.
- Existing open disputes and promised credits.
- Which recurring checks the merchant wants to continue.
- Who owns the review and provider follow-up.

After the first period, ask the merchant to assess:
- Were findings accurate and actionable?
- Did the evidence reduce review or dispute-preparation effort?
- Did the case register prevent any issue from being lost?
- Which parts would they use in the next billing period?
- What would make the service not worth renewing?

Do not convert a one-time discrepancy into a recurring-value claim. A recurring subscription is justified only when the merchant has a repeated workflow and values the continued control record, review or follow-up.

## 8. Commercial offer and pricing validation

Current public price hypothesis: NODUS Core at $99/month. This is not validated willingness to pay.

For each qualified pilot, record:
- The price presented.
- Whether the merchant accepts, rejects or negotiates it.
- The specific reason for the decision.
- Which recurring deliverables they expect at that price.
- Whether they pay and whether they renew after the next billing period.

Do not discount before understanding the objection. Do not represent a free pilot as paid demand. Do not claim a merchant is a customer until a paid transaction is confirmed.

## 9. Pilot success and stop conditions

A pilot is **technically successful** only if:
- Source data imports without silent loss or mutation.
- Calculations can be reproduced from retained normalized records and source references.
- Every finding is traceable to its source rows and rule.
- Unsupported matches remain unresolved.
- Tenant access is verified and the merchant can access only its own records.
- The merchant can review cases and generate the period report.

A pilot is **commercially promising** only if the merchant confirms a repeated job, identifies ongoing value and agrees to continue on a paid basis.

Stop or narrow scope when:
- Source records cannot support reliable comparisons.
- Findings are mostly ambiguous or immaterial.
- The merchant has no owner for review and follow-up.
- Existing tools already solve the problem adequately.
- The merchant does not value another review period.

## 10. Current product boundaries

Do not sell these as live capabilities until implemented and accepted:
- Automatic Shopify synchronisation or OAuth.
- Direct 3PL integrations.
- Inventory reconciliation.
- SLA measurement without defined contractual terms and timestamp evidence.
- PDF/OCR rate-card or invoice extraction.
- Automatic provider disputes or communications.
- Automatic subscription collection.
- Guaranteed savings, recovery or provider performance improvements.

The initial pilot is CSV-based. Manual operator involvement must be disclosed and measured.