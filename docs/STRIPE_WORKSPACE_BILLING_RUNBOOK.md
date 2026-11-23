# NODUS Stripe subscription release runbook

## Implemented payment lifecycle

- Operator creates a hosted Stripe Checkout Session for an onboarded merchant after the seven-day trial.
- The checkout is a USD 99/month recurring subscription for NODUS Core.
- The checkout session is tied to the NODUS workspace ID in Stripe metadata.
- A signed `checkout.session.completed` event records the Stripe customer and subscription but does not grant paid access.
- A signed `invoice.paid` event activates the subscription and merchant access.
- A signed `invoice.payment_failed` event moves the subscription to past due.
- A signed `customer.subscription.updated` event syncs active/past-due state and period-end cancellation.
- A signed `customer.subscription.deleted` event ends the subscription.
- Operator cancellation calls Stripe and schedules cancellation at the paid period end.
- Duplicate webhook event IDs are ignored.

## Seller and payment-account ownership

A legally eligible adult must own and operate the seller account, accept the payment processor terms, complete identity/business verification, provide accurate seller and tax details, control refunds/disputes, and own customer billing support. Do not use a minor's identity or misstate the seller.

Create and verify the Stripe account in the seller's actual jurisdiction. Confirm international card acceptance and recurring payments are supported. Configure public business details, statement descriptor, support contact, terms, privacy, refund/cancellation policy and tax settings before live mode.

## Encrypted Cloudflare production secrets

Set both as encrypted Pages production secrets; never put them in source files or ordinary text variables:

- `STRIPE_SECRET_KEY`: live secret API key. Use `sk_test_...` only in Preview/test.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the production webhook endpoint.

The webhook handler is `POST /api/stripe/webhook`.

## Stripe webhook configuration

Register the endpoint and subscribe to:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Use the endpoint-specific signing secret as `STRIPE_WEBHOOK_SECRET`. Do not substitute the API key.

## Database migration

Apply `migrations/0005_stripe_workspace_billing.sql` to the production D1 database once. Before applying, inspect `PRAGMA table_info(threepl_workspaces)` and `sqlite_master` for the three Stripe columns, cancellation flag and `stripe_webhook_events`. Do not rerun the migration if its columns/table already exist. Test against a separate database first.

## Test-mode acceptance

1. Configure Stripe test secrets in Preview and a separate test webhook endpoint.
2. Complete a trial workspace using test data.
3. Generate a checkout link from the operator console.
4. Complete the $99/month test subscription.
5. Confirm checkout completion alone leaves access pending.
6. Confirm the first signed `invoice.paid` event activates access.
7. Trigger a failed invoice and confirm access is not treated as paid.
8. Schedule cancellation and confirm the subscription remains active through its paid period.
9. Confirm deletion at period end changes the workspace to cancelled.
10. Replay a webhook and confirm idempotent handling.
11. Only after test-mode acceptance, seller/tax/support approval and a real low-value purchase should live mode be enabled.

## Current release gates

The code does not create a Stripe account or supply keys. Live checkout is unavailable until the adult-owned seller account and encrypted production secrets are configured. No live payment, customer, renewal or revenue is claimed by the implementation alone.
