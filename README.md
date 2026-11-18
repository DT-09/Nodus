# NODUS

**Your business. Understood. Advanced.**

NODUS is being developed as a connected business operating system. The first commercial wedge is Shopify shipping economics: connect order shipping revenue with carrier/3PL cost evidence, identify what can and cannot be reconciled, and produce a reviewable decision pack.

## Current public release

The production website runs on **Cloudflare Pages**. Public dynamic intake runs through **Cloudflare Pages Functions** and **D1**.

- Brand and commercial website with product architecture, methodology, security, privacy, pricing and synthetic demonstration pages.
- Installable PWA for compatible desktop and mobile browsers.
- Cloudflare Pages Functions OAuth endpoints for Shopify read-only order access, encrypted access-token storage, D1-backed merchant sessions, order sync and privacy/uninstall webhooks. The OAuth flow remains inactive until Shopify Partner credentials are configured.
- Browser-local manual data workflow for order and carrier-cost CSV files.
- Deterministic matching using order references and unique tracking references.
- Currency-separated calculations and unmatched-charge review.
- Downloadable CSV register and JSON decision pack.
- Founding assessment request form stored in Cloudflare D1.
- Request validation, honeypot, per-IP-hash rate limiting and privacy notice.
- D1-backed health endpoint at `/api/health`.

## Explicit release boundaries

The following are **not live** in the current public release:

- Shopify App Store distribution and review approval.
- Automated scheduled Shopify sync and event-driven order webhooks. The initial connected workspace uses an operator-triggered, resumable order sync.
- Direct carrier APIs, carrier invoice polling or PDF/OCR extraction.
- Cross-business financial, marketing, CRM, inventory or supplier integrations.
- Multi-agent diagnosis, general-purpose business intelligence or autonomous execution.
- Shopify App Store distribution, paid subscription billing or self-serve checkout.
- Native iOS/Android store binaries. The PWA is the current cross-device delivery method.

The manual CSV workflow runs in the browser. Uploaded files are not sent to NODUS. The assessment form stores only business contact and qualification details; it does not collect source files or Shopify credentials.

## Cloudflare architecture

- **Cloudflare Pages:** static React Router SPA and PWA assets.
- **Pages Functions:** `/api/leads` assessment intake and `/api/health`.
- **Cloudflare D1:** `nodus-leads`, with the `NODUS_DB` binding in Preview and Production.
- **GitHub:** source control and CI only; no GitHub runtime dependency.

No Vercel deployment is used for the public release. Keep the Cloudflare project on the connected `nodus-hq` Pages project. Avoid adding paid services or external providers without an explicit decision.

## Local development

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The current Pages deployment builds to `build/client` using `npm run build`. Pages Functions live under `functions/`. D1 schema is managed in the Cloudflare database `nodus-leads`; the live tables are `merchant_leads` and `lead_rate_limits`.

## Merchant launch workflow

1. Merchant reads the scope, methodology and privacy notice.
2. Merchant submits the founding assessment request at `/buyer-evaluation`.
3. The request is stored in D1. The operator reviews submissions in the Cloudflare dashboard under Workers & Pages → D1 → `nodus-leads`.
4. The operator responds through the configured support inbox and confirms scope before any data is exchanged.
5. The merchant may use `/manual-data` to run the current browser-local CSV workflow.
6. The operator reviews evidence and limitations before proposing any separately scoped service.

There is no automated email notification for new submissions yet. The operator must check the D1 database for new enquiries and monitor the support inbox.

## Commercial controls

- The founding assessment is no-fee and no-obligation.
- No automatic subscription or payment details are collected.
- Do not claim recovered credits, guaranteed savings, App Store approval, or unsupported integrations.
- Any paid service requires an authorized adult/business operator to approve the scope, contract, invoicing, tax and payment arrangements.
- Publish no testimonials, customer logos or financial results without evidence and permission.

## Next engineering milestones

1. Automated lead notification and protected lead-management workflow.
2. Secure merchant identity and tenant model.
3. Shopify Partner app credentials, OAuth, privacy webhooks and installation acceptance.
4. Durable merchant database and order synchronization.
5. Reconciliation persistence, scheduled carrier evidence imports and repeatable reports.
6. Permissioned execution runtime with approval gates and outcome verification.
7. Billing lifecycle, support operations and production security review.
8. Broader business intelligence domains and specialist agents.

A deployed website is not proof of a running autonomous business. The public release must remain explicit about what is live.
