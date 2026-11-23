# NODUS Operator Runbook — 3PL Control

This runbook describes the Cloudflare Pages Functions + D1 implementation. The public React application is static; the live API is implemented under `functions/api`. Do not add React Router server actions for API work.

## 1. Runtime configuration

The Cloudflare Pages project must have:

- A D1 database binding named `NODUS_DB`, connected to the existing NODUS D1 database.
- `NODUS_OPERATOR_SECRET` as a secret environment variable, at least 32 characters of high-entropy random data.
- Existing production Pages configuration and custom domain.

Do not commit the operator secret or put it in browser code. Configure production and preview environments separately. Shopify OAuth credentials are not required for this initial CSV-based 3PL workflow.

### D1 schema state

`migrations/0003_threepl_control.sql` and `migrations/0004_one_time_invitation_sessions.sql` have been applied to the remote D1 database bound as `NODUS_DB`. A pre-migration D1 export was created before each change; the new tables, `merchant_leads.business_name`, and one-time invitation session columns were verified, and both migrations were recorded in `nodus_schema_migrations`.

The existing database has no Wrangler `d1_migrations` ledger for migrations 0000–0002. Do not run `wrangler d1 migrations apply` against this database: it would try to replay the original schema. Future migrations must be applied deliberately through the Cloudflare D1 query API and recorded in `nodus_schema_migrations`, or the project must first adopt a verified baseline migration ledger.

Check `GET /api/threepl/health`; it returns `ready` only when the D1 tables and operator secret are available. The Prisma schema is not the 3PL runtime database; 3PL records live in D1.

## 2. Review trial requests

The public website form posts to `POST /api/leads`. It stores the business name, contact name, work email, permanent `.myshopify.com` domain, order range, fulfilment setup, business objective, consent and timestamps in `merchant_leads`.

The request form does not accept source files or customer records. Requests are rate-limited by source IP hash. No email notification is sent automatically in this release; review requests in the private operations console.

Open `/ops` and sign in with `NODUS_OPERATOR_SECRET`. The secret is exchanged for an eight-hour HttpOnly, Secure, SameSite=Strict session and is not saved in browser storage.

Lead statuses are `new`, `contacted`, `qualified`, `rejected` and `converted`. Mark a lead qualified only after confirming that it uses an external 3PL and can supply supported contract, invoice and activity records.

## 3. Provision a merchant workspace

From the qualified lead, choose **Provision workspace** in `/ops`.

The operator API creates a merchant-specific D1 workspace, issues a random invitation token and changes the lead status to converted. The token is stored only as a SHA-256 hash and is displayed once. Send it to the merchant through a private channel. Do not put it in a public issue, chat room or analytics tool.

The merchant opens `/portal`, enters the token and receives a seven-day HttpOnly, Secure, SameSite=Lax browser session. Invitation tokens expire after seven days and can be redeemed once. Redemption creates a separate seven-day browser session; logging out or losing that session requires the operator to rotate access. Rotating access revokes all prior tokens for that workspace.

## 4. Onboard source data

The merchant portal accepts CSV files up to 5 MB and 20,000 data rows. Files are parsed in memory. NODUS stores normalized records, source filename, file hash and source row numbers; the original uploaded CSV is not retained.

### Contract rate card

Required columns:

```csv
charge_code,unit,pricing,rate,currency,effective_from,effective_to
PICK,order,per_unit,0.45,USD,2026-01-01,
STORAGE,pallet_day,per_unit,1.20,USD,2026-01-01,
```

`pricing` must be `per_unit` or `fixed`. Use ISO currency codes and effective dates. The merchant must confirm the rows against the signed agreement before the contract is activated. A file must use one currency.

### One invoice per CSV

Required columns:

```csv
invoice_number,invoice_date,charge_code,quantity,unit,amount,currency
INV-1001,2026-10-31,PICK,120,order,54.00,USD
```

Optional columns: `description`, `activity_reference`, `service_date`, `period_start`, `period_end`.

Use `service_date` when the contract rate should be selected by the date the service occurred. If absent, NODUS uses `invoice_date`. Period fields must be consistent across the invoice file.

### Operational activity

Required columns:

```csv
record_id,reference,charge_code,quantity,unit,occurred_at
ACT-9001,ORDER-9001,PICK,1,order,2026-10-30T12:00:00Z
```

`reference` must match the invoice line's `activity_reference` exactly (case-sensitive after trimming). Quantity checks also require the same charge code and unit. Multiple activity rows with the same reference and charge code are marked ambiguous; they are not automatically summed.

## 5. Reconcile and investigate

1. Add the merchant's 3PL provider.
2. Import and confirm its effective-dated rate card.
3. Import one invoice.
4. Import operational activity if it is available.
5. Run reconciliation from the invoice list.
6. Review source references and calculations.
7. Record investigation status and notes.
8. Record provider outcomes as raised, promised, posted, verified or rejected.

The engine uses integer minor-unit money arithmetic and explicit currency. It does not convert currencies. It does not infer missing activity as zero. Overlapping rate rules, unsupported units, currency mismatches and ambiguous references require human review.

A calculated variance is not proof of provider liability, a valid dispute or recoverable money. A promised credit is not a posted credit. A verified outcome requires an external reference and a detailed evidence note.

## 6. Activate the seven-day trial

The trial does not start when the enquiry arrives or when an invitation is sent. It can be activated only after the workspace contains:

- at least one provider;
- at least one active, confirmed contract;
- at least one completed invoice import.

The operator console's **Activate 7-day trial** action enforces these checks. The application records activation and expiry timestamps exactly seven days apart. An expired trial becomes read-only; the activation action cannot restart it.

## 7. Convert to a paid subscription

The first subscription lifecycle is operator-managed. There is no payment processor or self-serve checkout in this release. After a subscription has actually been confirmed, use the operator console's **Activate Core $99 / month** action and confirm the subscription. Do not activate paid status before the subscription is confirmed.

For cancellation, record a future billing-period end date. Access remains available until that date, then becomes read-only. Renewal, payment collection, invoices, tax handling and failed-payment recovery still require a proper billing workflow before self-serve scale.

## 8. Recurring period review

At each billing period:

1. Import the new invoice and activity export.
2. Reconcile the invoice.
3. Review new exceptions and items not reproduced in the latest run.
4. Update provider responses and outcomes.
5. Generate a period report for the invoice date range.
6. Download the JSON report from the portal.
7. Compare verified outcomes and unresolved exceptions with the prior period.

Reports separate invoice totals by currency, exception status and verified outcomes. They do not claim that every calculated variance has been recovered.

## 9. Current release boundaries

Not included:

- Shopify OAuth installation or automatic order synchronization in this 3PL portal;
- direct 3PL APIs or carrier polling;
- PDF/OCR contract or invoice extraction;
- automatic provider emails or claim submission;
- automatic invoice approval, payments, accounting journals or Shopify writes;
- self-serve payment checkout or automated subscription billing;
- automated customer data export/deletion or retention schedules;
- automatic email delivery of merchant invitation tokens or trial notifications.

Before production merchant data is accepted, verify the remote D1 migration, Pages binding, operator secret, backup/export and restore process, retention/deletion process, legal entity and privacy terms, incident response and tenant-isolation tests. Do not claim security certification or independent audit without evidence.
