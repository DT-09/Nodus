# NODUS Razorpay subscription release runbook

## Preferred India payment adapter

NODUS supports Razorpay Subscriptions for eligible India-based sellers. The integration creates a monthly USD 99 plan through the API when no `RAZORPAY_PLAN_ID` is configured, creates a bounded subscription for the merchant workspace, and returns Razorpay's hosted authorisation URL.

Razorpay's India product availability, international-card enablement, currency support and settlement terms are account-specific. Confirm that the seller's approved account supports international recurring card subscriptions in USD before enabling live mode. Razorpay subscription settlements for India are in INR. The business remains responsible for customer contracts, tax, export reporting, refunds, support and access policy.

## Required encrypted Cloudflare production secrets

- `RAZORPAY_KEY_ID`: live API key ID.
- `RAZORPAY_KEY_SECRET`: live API secret.
- `RAZORPAY_WEBHOOK_SECRET`: endpoint signing secret.
- `RAZORPAY_PLAN_ID`: optional. If absent, NODUS creates the USD 99 monthly plan and stores its ID in D1.

Use separate test-mode credentials and webhook secret in Preview. Never commit credentials or place them in ordinary text variables.

## Webhook endpoint

Register `POST https://nodus-hq.pages.dev/api/razorpay/webhook` in the Razorpay Dashboard. Configure the endpoint signing secret as `RAZORPAY_WEBHOOK_SECRET`.

Subscribe to:
- `subscription.authenticated`
- `subscription.charged`
- `subscription.pending`
- `subscription.halted`
- `subscription.cancelled`
- `subscription.completed`
- `subscription.paused`
- `subscription.resumed`
- `subscription.expired`

The receiver verifies HMAC-SHA256 over the raw request body using `X-Razorpay-Signature`, then deduplicates using `x-razorpay-event-id`. Paid access is granted on `subscription.charged`; authentication alone does not grant paid access. Pending and halted subscriptions lose paid access. Cancellation at cycle end preserves access through the paid period.

## Database migration

Apply `migrations/0005_stripe_workspace_billing.sql` once after inspecting the target D1 schema. It adds provider identifiers, hosted checkout references, a plan cache and a webhook event inbox. The table `stripe_webhook_events` may already exist; the migration uses `CREATE TABLE IF NOT EXISTS`. Do not rerun the migration after its columns are present.

## Test-mode acceptance

1. Configure Razorpay test credentials in Preview.
2. Confirm the account test environment supports the intended USD subscription plan.
3. Create a merchant trial workspace and activate the trial.
4. Generate a hosted subscription link from the operator console.
5. Complete customer authorisation.
6. Confirm authentication alone leaves the workspace pending.
7. Confirm `subscription.charged` grants paid access exactly once.
8. Trigger a pending or failed renewal and confirm access is restricted.
9. Trigger halted and confirm access remains restricted.
10. Schedule cancellation at cycle end and confirm access remains through the paid period.
11. Confirm the cancelled event revokes access.
12. Replay the same event ID and confirm it is ignored.
13. Test expired authorisation and confirm the checkout link is cleared.
14. Only after test-mode acceptance, adult seller approval and a low-value live pilot should live credentials be configured.

## Legal and operating ownership

An authorized adult must own the seller identity and payment account, complete KYC and account approval, set accurate business and tax details, accept provider terms, control refunds/disputes and operate customer support. Do not misstate the seller or use another person's identity without their authorization.

## Current live gates

Code support does not mean a Razorpay account is approved or international subscriptions are enabled. Live payment collection remains disabled until an eligible adult-owned merchant account and encrypted production credentials are configured and the test lifecycle is verified. No live transactions, customers, renewals or revenue are claimed.
