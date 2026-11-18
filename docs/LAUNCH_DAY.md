# NODUS Public Release Acceptance

## What can be launched now

- Cloudflare Pages public website and PWA.
- Product architecture, methodology, privacy, security, pricing and synthetic demo pages.
- Browser-local order/carrier CSV analysis.
- Cloudflare D1-backed founding assessment enquiry intake.
- No-fee, no-obligation founding assessment request.

## What must not be claimed

- Shopify OAuth installation or App Store availability.
- Persistent merchant workspace or automatic order synchronization.
- Direct carrier APIs, invoice polling or PDF/OCR ingestion.
- General-purpose cross-business intelligence or autonomous execution.
- Paid subscription checkout or verified recurring merchant value.

## Production checks

- [ ] Latest Pages deployment completed successfully.
- [ ] Pages Functions compile and deploy.
- [ ] `NODUS_DB` is bound in Production and Preview.
- [ ] D1 tables `merchant_leads` and `lead_rate_limits` exist.
- [ ] `/api/health` confirms D1 connectivity.
- [ ] Valid assessment submission creates one D1 record.
- [ ] Invalid and repeated submissions are rejected.
- [ ] Assessment consent links to the current privacy notice.
- [ ] The operator can review and delete lead records in D1.
- [ ] Manual CSV files remain browser-local and downloadable outputs work.
- [ ] PWA installation instructions are accurate across supported browsers.

## Human operating requirements

- [ ] Authorized adult/business operator owns the commercial activity and accounts.
- [ ] A monitored support inbox and response process are active.
- [ ] The operator checks D1 for new enquiries until automated notifications exist.
- [ ] A secure data-transfer process is agreed before requesting merchant source records.
- [ ] No paid work begins without written scope, price, acceptance criteria and authorized operator approval.

## Shopify release gates

Shopify installation remains disabled until OAuth, session persistence, tenant isolation, data synchronization, privacy webhooks, API access requirements and controlled-store tests pass on a Cloudflare-compatible runtime.

## Definition of a successful public release

A successful public release means a merchant can understand the offer, inspect the synthetic example, request an assessment, receive a response and use the supported local analysis workflow. It does not mean NODUS is already the complete autonomous business operating system described in its long-term architecture.
