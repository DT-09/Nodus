# NODUS Stripe billing release runbook

## What the integration does

- The merchant intake form records the requested offer and creates a hosted Stripe Checkout Session for paid offers.
- Shipping Cost Audit is a one-time USD 149 payment.
- Monthly Shipping Review is a USD 99/month recurring subscription.
- NODUS does not collect card details.
- Signed webhooks update the lead payment state. The operator console is not a payment processor and must never be used to mark an order paid without independent cleared-funds evidence.

## Required operator-owned setup

A legally eligible adult business operator must own the seller account, accept the processor terms, complete identity/business verification, set the legal business details and tax treatment, and control refunds and disputes. Do not use a minor's identity or misstate the seller.

Create a Stripe account in the seller's actual jurisdiction. Confirm the account can accept the intended international payments and recurring charges. Configure the seller's public business name, support contact, statement descriptor, terms, privacy policy, refund/cancellation policy and tax settings before live mode.

## Cloudflare Pages secrets

Set these as encrypted production secrets, never as source files or plain text variables:

- STRIPE_SECRET_KEY: live secret API key (use sk_test_... only in preview/test environments).
- STRIPE_WEBHOOK_SECRET: signing secret for the production webhook endpoint.

SHOPIFY_APP_URL must be the canonical HTTPS production origin. It is already used to construct checkout return URLs.

## Stripe webhook

Register POST https://<production-host>/api/stripe/webhook and subscribe to:

- checkout.session.completed
- invoice.paid
- invoice.payment_failed
- customer.subscription.deleted
- charge.refunded

Copy the endpoint signing secret into STRIPE_WEBHOOK_SECRET. Do not substitute the API secret.

## Database release

Apply migrations/0004_stripe_billing.sql to the production D1 database once, after confirming the columns and stripe_webhook_events table do not already exist. The migration is additive. Verify with PRAGMA table_info(merchant_leads) and a read of sqlite_master.

## Mandatory test sequence

1. Run the automated test suite and production build.
2. In Stripe test mode, submit a paid-audit request and complete a test payment.
3. Confirm the signed checkout.session.completed event records the checkout session and payment state.
4. Submit a monthly-review request and complete the first test subscription payment.
5. Trigger a test invoice payment failure and confirm payment_failed.
6. Cancel the test subscription and confirm cancelled.
7. Refund a one-time test payment and confirm refunded.
8. Verify duplicate webhook delivery is idempotent.
9. Confirm the operator console displays the resulting states.
10. Only after tax, seller, customer-support and refund workflows are approved should the account switch to live mode and a real low-value purchase be tested.

## Current release limitation

Code is not proof of a live payment. Production checkout remains disabled until the adult-operated payment account, encrypted Cloudflare secrets, D1 migration and webhook endpoint are configured and tested. Do not advertise a completed purchase flow before that sequence passes.
