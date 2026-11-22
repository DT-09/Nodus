# NODUS Lead and Order Operations

## Lead intake

The public form at `/buyer-evaluation` writes an enquiry to the Cloudflare D1 `merchant_leads` table through `/api/leads`.

A successful form submission means only:
- the enquiry passed server-side validation;
- the lead record was written to D1;
- a reference ID was returned.

It does **not** mean:
- a seller accepted the engagement;
- a payment was taken;
- an audit was scheduled;
- a customer account was created;
- a service contract exists.

## Daily operator queue

Until a tested notification channel exists, an authorized operator must check the D1 lead table at least once each business day.

For each new lead:
1. Record the lead reference and received timestamp.
2. Check whether the store, volume and shipping setup fit the published pilot scope.
3. Review the stated business question.
4. Respond through the business-owned support inbox.
5. Request no source files until a secure transfer process and data terms are agreed.
6. Mark the lead as qualified, declined or awaiting information in the operator's separate control log.

Do not expose the D1 database or admin console to customers.

## Paid engagement control

Before accepting money:
1. Confirm an authorized adult operator owns the seller identity and payment account.
2. Confirm the service scope and delivery schedule in writing.
3. Issue the applicable terms, privacy/data handling terms and invoice.
4. Confirm cleared funds in the authorized payment account.
5. Create an engagement record and begin the delivery checklist.

The form's `priceQuote` is a requested pilot price only. It is not a checkout session, invoice or payment confirmation.

## Required business metrics

Track these as actual counts, not estimates:
- enquiries received;
- qualified enquiries;
- scopes accepted;
- invoices issued;
- invoices paid;
- audits delivered;
- delivery time;
- material findings accepted by the buyer;
- second purchases;
- refunds or complaints.

Do not count form submissions as revenue. Revenue is recorded only after cleared funds are confirmed by the authorized seller.
