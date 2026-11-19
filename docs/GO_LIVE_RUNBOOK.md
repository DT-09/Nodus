# NODUS Cloudflare Public Release Runbook

## Current release state

The public release is a Cloudflare Pages application with Pages Functions and D1. It supports the marketing site, PWA install shell, browser-local CSV analysis, synthetic demo and a persistent founding-assessment enquiry form. A Windows desktop WebView2 client and GitHub release workflow have been added; the first downloadable binary still requires a tagged release build.

It is **not** yet a fully live Shopify merchant operating system. Production Shopify installation, Shopify-managed subscriptions, recurring sync, App Store distribution and general business execution remain gated by credentials, Partner Dashboard configuration and acceptance tests.

## Cloudflare resources

- Pages project: `nodus-hq`
- Production origin: `https://nodus-hq.pages.dev`
- D1 database: `nodus-leads`
- Pages D1 binding: `NODUS_DB` (Preview and Production)
- Tables: `merchant_leads`, `lead_rate_limits`
- Functions: `/api/leads`, `/api/health`

## Public assessment workflow

1. Merchant reviews the founding assessment scope, privacy notice and methodology.
2. Merchant submits the form at `/buyer-evaluation`.
3. Pages Function validates the payload, checks origin and consent, applies a honeypot and rate limit, and stores the lead in D1.
4. The operator checks Cloudflare Dashboard → Workers & Pages → D1 → `nodus-leads` and reviews new rows in `merchant_leads`.
5. The operator responds through the business-owned support inbox and agrees the scope before any source files are exchanged.
6. The merchant can run the browser-local CSV workflow at `/manual-data`. Files remain in the browser and are not uploaded.

There is no automatic email notification for new leads yet. Do not claim otherwise.

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

## Commercial gates — not yet passed

- [ ] A responsible business operator is named and owns support.
- [ ] Enquiry notification and protected lead-management workflow are configured.
- [ ] The founding assessment is delivered using a secure, agreed data-transfer method.
- [ ] Paid scope, pricing, invoicing, tax, cancellation and refund terms are approved by the authorized operator.
- [ ] No public paid subscription until billing and entitlement lifecycle are tested.

Never equate a successful Pages deployment with a complete product launch.
