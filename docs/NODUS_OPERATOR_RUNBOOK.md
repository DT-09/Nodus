# NODUS Operator Runbook — 3PL Control

This runbook describes the first merchant-operated workflow. It is not a claim that the service is production-ready. Use test data until migrations, access isolation, backups, legal terms and the production environment have been verified.

## 1. Runtime configuration

Required server environment:

- `DATABASE_URL`: pooled PostgreSQL connection string used by Prisma.
- `DIRECT_URL`: direct PostgreSQL connection string for migrations.
- `NODUS_OPERATOR_SECRET`: high-entropy secret used only by the protected operator API.

Keep these values in Cloudflare Pages/Workers environment configuration. Never commit them, put them in browser code, or send them to a merchant. Configure production and preview values separately. The application does not send email or process payments in this release.

Deploy schema migrations before enabling merchant workspaces:

```bash
npm ci
npx prisma generate
npm run migrate:deploy
npm run typecheck
npm test
npm run build
```

The CI workflow must complete successfully before merging. The Cloudflare branch preview is a build preview, not proof that production database migrations or secrets are configured.

## 2. Review trial requests

The public form sends business-fit information to `POST /api/leads`. It stores:

- business name and contact name;
- work email and Shopify store domain;
- monthly order range and fulfilment setup;
- the merchant's stated control problem;
- consent and submission timestamps.

It does not collect source files or customer data.

List recent leads and workspaces through the protected operator endpoint:

```bash
curl -H "x-nodus-operator-secret: $NODUS_OPERATOR_SECRET" \
  https://YOUR_NODUS_HOST/api/operator/workspaces
```

Lead statuses are `new`, `contacted`, `qualified`, `rejected` and `converted`.

## 3. Provision a merchant workspace

Convert a qualified lead into an onboarding workspace:

```bash
curl -X POST https://YOUR_NODUS_HOST/api/operator/workspaces \
  -H "content-type: application/json" \
  -H "x-nodus-operator-secret: $NODUS_OPERATOR_SECRET" \
  -d '{"operation":"create_workspace_from_lead","leadId":"LEAD_ID"}'
```

The response contains a random merchant invitation token. It is stored only as a SHA-256 hash and is shown once. Send it to the merchant through a private channel. Do not paste it into an issue, chat room, analytics tool or public URL. The merchant enters it at `/portal`; the application exchanges it for an HttpOnly, Secure, SameSite session cookie.

Tokens expire after 30 days. Rotate access through the operator endpoint if a token is lost or exposed; rotation revokes all prior tokens for that workspace.

## 4. Onboard source data

The merchant portal accepts the following CSV formats. Files are parsed in memory and are limited to 5 MB and 20,000 data rows. NODUS stores normalized records, source filenames, hashes and row numbers, not the original uploaded files.

### Contract rate card

Required columns:

```csv
charge_code,unit,pricing,rate,currency,effective_from,effective_to
PICK,order,per_unit,0.45,USD,2026-01-01,
STORAGE,pallet_day,per_unit,1.20,USD,2026-01-01,
```

`pricing` must be `per_unit` or `fixed`. The merchant must confirm the rows against the signed agreement before the rate card is activated. Use ISO currency codes and effective dates. Avoid combining different currencies in one contract file.

### One invoice per CSV file

Required columns:

```csv
invoice_number,invoice_date,charge_code,quantity,unit,amount,currency
INV-1001,2026-10-31,PICK,120,order,54.00,USD
```

Optional columns: `description`, `activity_reference`, `service_date`, `period_start`, `period_end`.

Use `service_date` when the contract rate should be selected based on the date the service occurred. If absent, NODUS uses `invoice_date`. If the file contains multiple service dates, include a date on each line. Period fields must be consistent across all rows in the file.

### Operational activity

Required columns:

```csv
record_id,reference,charge_code,quantity,unit,occurred_at
ACT-9001,ORDER-9001,PICK,1,order,2026-10-30T12:00:00Z
```

`reference` must match the invoice line's `activity_reference` exactly. Quantity checks also require the same charge code and unit. Multiple activity rows for one reference and charge code are marked ambiguous; the system does not sum or choose them automatically in this release.

## 5. Reconcile and investigate

1. Confirm the correct provider is selected for every import.
2. Import and confirm the effective-dated rate card.
3. Import one invoice.
4. Import operational activity if it is available.
5. Run reconciliation from the invoice list.
6. Review each finding and its source references.
7. Record the case status and investigation note.
8. Record provider outcomes separately as raised, promised, posted, verified or rejected.

The engine uses integer minor-unit money arithmetic. It does not convert currencies. It does not infer missing activity as zero. It flags overlapping effective contract rules, unsupported units and exact-reference ambiguity for human review.

A calculated variance is not proof of provider liability, a valid dispute or recoverable money. A promised credit is not a posted credit. A verified outcome requires an external reference and a detailed evidence note.

## 6. Activate the seven-day trial

The trial is not started when the enquiry arrives or when an invitation is sent. It is activated only after the workspace contains:

- at least one provider;
- at least one active confirmed contract;
- at least one imported invoice.

Activate once:

```bash
curl -X POST https://YOUR_NODUS_HOST/api/operator/workspaces \
  -H "content-type: application/json" \
  -H "x-nodus-operator-secret: $NODUS_OPERATOR_SECRET" \
  -d '{"operation":"activate_trial","workspaceId":"WORKSPACE_ID"}'
```

The application sets `trialActivatedAt` and `trialEndsAt` exactly seven days apart. An expired trial becomes read-only; the operator cannot restart it through the activation action.

## 7. Convert to a paid subscription

The initial subscription lifecycle is operator-managed. There is no payment processor or self-serve checkout in this release. After the subscription has been independently confirmed, activate paid access:

```bash
curl -X POST https://YOUR_NODUS_HOST/api/operator/workspaces \
  -H "content-type: application/json" \
  -H "x-nodus-operator-secret: $NODUS_OPERATOR_SECRET" \
  -d '{"operation":"activate_subscription","workspaceId":"WORKSPACE_ID","planCode":"core_99","confirmed":true}'
```

Do not set `confirmed` unless the subscription has actually been confirmed. The workspace records its plan code and subscription start. For cancellation at the end of a confirmed billing period, set a future period end:

```bash
curl -X POST https://YOUR_NODUS_HOST/api/operator/workspaces \\
  -H "content-type: application/json" \\
  -H "x-nodus-operator-secret: $NODUS_OPERATOR_SECRET" \\
  -d '{"operation":"cancel_subscription","workspaceId":"WORKSPACE_ID","periodEndsAt":"2026-12-23T00:00:00.000Z"}'
```

The merchant retains access until that period end, then the workspace becomes read-only. Renewal, billing collection, invoices, tax handling and failed-payment recovery still require a proper billing workflow before self-serve scale.

## 8. Recurring period review

At the end of each billing period:

1. Import the new invoice and activity export.
2. Reconcile the invoice.
3. Review reopened or new exceptions.
4. Update provider responses and outcomes.
5. Generate a period report for the invoice date range.
6. Download the JSON report from the portal.
7. Compare verified outcomes and unresolved exceptions with the previous period.

Reports separate invoice totals by currency, exception status, and verified outcomes. They do not claim that every calculated variance has been recovered.

## 9. Current release boundaries

Not included:

- Shopify OAuth installation or automatic order synchronization in this 3PL portal;
- direct 3PL APIs or carrier polling;
- PDF/OCR contract or invoice extraction;
- automatic provider emails or claim submission;
- automatic invoice approval, payments, accounting journals or Shopify writes;
- self-serve payment checkout or automated subscription billing;
- customer self-service data export/deletion or automated retention schedules;
- automated email delivery of invitation tokens or trial notifications.

Before using production merchant data, verify the actual production database and Cloudflare secrets, migration status, backups and restore, rate limits, retention/deletion process, legal entity and privacy terms, incident response and tenant-isolation tests. Do not claim security certification or independent audit without evidence.
