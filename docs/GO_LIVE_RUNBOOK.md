# NODUS Cloudflare Public Release Runbook

## Current release state

The public release is a Cloudflare Pages website with Pages Functions and D1. It supports the marketing site, browser-local CSV analysis, synthetic demo and a persistent merchant enquiry form. The commercial offer is a free browser-local diagnostic plus a proposed USD 149 one-time Shipping Cost Audit pilot. The price is unvalidated; the public form records a request only and does not take payment. No monthly subscription is offered.

The public CSV workflow is the active product. Direct Shopify OAuth is not promoted as a live integration. Automated subscription billing, carrier polling, App Store distribution and continuous monitoring are not part of the current paid service.

## Cloudflare resources

- Pages project: `nodus-hq`
- Production origin: `https://nodus-hq.pages.dev`
- D1 database: `nodus-leads`
- Pages D1 binding: `NODUS_DB` (Preview and Production)
- Tables: `merchant_leads`, `lead_rate_limits`
- Functions: `/api/leads`, `/api/health`

## Public enquiry workflow

1. Merchant reviews the founding assessment scope, privacy notice and methodology.
2. Merchant submits the form at `/buyer-evaluation`.
3. Pages Function validates the payload, checks origin and consent, applies a honeypot and rate limit, and stores the lead in D1.
4. The operator checks Cloudflare Dashboard → Workers & Pages → D1 → `nodus-leads` and reviews new rows in `merchant_leads`.
5. The operator responds through the business-owned support inbox and agrees the scope before any source files are exchanged.
6. The merchant can run the browser-local CSV workflow at `/manual-data`. Files remain in the browser and are not uploaded.

The D1 enquiry form does not send an automatic email notification. Direct mailto contact links are available; the operator must also check D1 enquiries regularly.

## Required operational checks

- [ ] `/api/health` returns `status: ok` and `database: connected`.
- [ ] Assessment form rejects invalid email, missing consent, invalid store URL and oversized requests.
- [ ] Assessment form stores a valid test submission in D1.
- [ ] Rate limit rejects repeated submissions after the configured threshold.
- [ ] No order files, customer data, passwords or Shopify tokens are accepted by the form.
- [ ] D1 submissions are visible to the authorized operator.
- [ ] Privacy requests can be received and acted on.
- [ ] Operator checks D1 for new enquiries and monitors the support inbox.
- [ ] PWA installation works on supported desktop and mobile browsers.
- [ ] Manual CSV workflow works with the supplied templates and exports.

## Desktop application release

- Source project: `desktop/windows/` (WPF + Microsoft Edge WebView2).
- Release workflow: `.github/workflows/desktop-release.yml`.
- Trigger: push a tag matching `desktop-v*`.
- Output: `NODUS-Desktop-Windows-x64.exe` and a SHA-256 checksum, attached to the GitHub Release.
- Public download route: `/downloads`.
- The desktop client is an online application shell, not an offline copy of Shopify or an independent local engine. WebView2 Runtime and internet access are required.
- The website download route points at the latest GitHub release; until the first tagged build completes, the binary is not available.

## Shopify launch gates — not yet passed

- [ ] Authorized adult/business operator owns the Shopify Partner organization, Cloudflare billing, domain, contracts, tax and payment accounts.
- [ ] Create the production Shopify app and configure API key, secret, exact callback URLs and scopes.
- [ ] Implement a Cloudflare-compatible OAuth and session runtime; the existing Node/Prisma Shopify backend is not part of the Pages public release.
- [x] Configure the production D1 database binding and apply the current merchant schema.
- [x] Configure a random Cloudflare token-encryption secret in Preview and Production.
- [ ] Add Shopify API key and secret from the authorized Partner organization.
- [ ] Configure durable tenant-isolated merchant storage and migrations.
- [ ] Test install, session persistence, order pagination, incremental sync, webhooks, uninstall and data redaction.
- [ ] Verify Shopify Admin API access restrictions and current Shopify distribution requirements.
- [ ] Complete privacy, security, backup, incident-response and data-retention review.
- [ ] Complete a controlled merchant acceptance test before opening installs.

## Commercial operating requirements

Production configuration was inspected on 2026-11-21. The Pages project currently has the D1 binding and token-encryption variable, but does not have `NODUS_ADMIN_TOKEN` or `NODUS_PILOT_CHECKOUT_URL` configured in either Production or Preview. Therefore:
- The protected `/ops` console cannot authenticate an operator.
- The public pilot form cannot redirect a buyer to checkout.
- The form can store enquiries in D1, but there is no automatic new-lead notification. An operator must check D1 manually until a notification channel is implemented.

Required before accepting paid pilot requests:
- [ ] A responsible adult business operator is named and owns support, contracts, payment collection, tax and customer-data obligations.
- [ ] Configure a high-entropy `NODUS_ADMIN_TOKEN` as a Cloudflare secret in Production and Preview. Do not commit it or expose it in browser code.
- [ ] Configure `NODUS_PILOT_CHECKOUT_URL` with an HTTPS checkout route owned by the authorized business operator. Do not use a personal or unverified payment account.
- [ ] Configure lead notification or assign a documented daily D1 review owner; test that a new enquiry is noticed and acknowledged.
- [ ] Test the full path: valid pilot request → D1 record → operator review → scope acceptance → payment route → cleared-funds confirmation → paid status.
- [ ] Confirm that the checkout amount, currency, scope, refund/cancellation terms and legal seller identity match the published USD 149 offer.
- [ ] The paid pilot is delivered using a secure, agreed data-transfer method.
- [ ] No recurring subscription until billing, entitlement lifecycle, cancellation and support are tested.

Never equate a successful Pages deployment with a complete product launch or a purchase request with cleared revenue.
