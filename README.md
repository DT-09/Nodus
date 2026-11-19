# NODUS

**Shipping economics. Made inspectable.**

NODUS is being developed as a broader business operating system. The current public product is deliberately narrower: an installable web app with browser-local shipping-economics CSV analysis and a Cloudflare-backed founding-enquiry form.

## Current public release

Production site: https://nodus-hq.pages.dev

- Marketing and product-information website.
- Installable progressive web app (PWA) for compatible browsers. It is installed through the browser; there is no native desktop or mobile installer package.
- Browser-local CSV analysis for order exports and carrier / 3PL cost exports.
- Deterministic matching using supported order references and unique tracking references in the uploaded CSVs.
- Currency-separated calculations and unmatched-charge reporting.
- Downloadable CSV review register and JSON decision pack.
- Founding assessment enquiry form backed by Cloudflare Pages Functions and D1.
- D1 health endpoint at `/api/health`.

The CSV files selected by a visitor are processed in the browser. The analysis workflow does not upload those files to NODUS. The founding enquiry form stores only the contact and qualification fields submitted by the visitor; it does not collect CSV files, customer records, passwords or API tokens.

## Explicit release boundaries

The following are **not part of the current public release**:

- Shopify app installation, OAuth, or a connected Shopify merchant workspace.
- Native Windows, macOS, iOS or Android binaries; App Store or Google Play distribution.
- Scheduled or recurring monitoring, background order refresh, carrier API connections or invoice polling.
- Paid subscription billing, self-serve checkout or recurring plans.
- Automatic changes to Shopify settings, shipping rates, orders, refunds or other external business systems.
- General-purpose business intelligence, cross-business integrations, multi-agent diagnosis or autonomous business execution.

The founding form is an enquiry, not a purchase, service contract, data-access grant or guarantee that an assessment will be accepted. No customer count, testimonial, savings result or revenue claim is made without evidence.

## Cloudflare architecture

- **Cloudflare Pages:** React Router public site and PWA assets.
- **Pages Functions:** `/api/leads` assessment intake and `/api/health`.
- **Cloudflare D1:** `nodus-leads`, with the `NODUS_DB` binding in Preview and Production.
- **GitHub:** source control and CI.
- **Deployment:** Cloudflare Pages Git integration, production branch `main`.

No Vercel deployment is used for the public release. Do not add paid services or external providers without an explicit decision.

## Local development

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run verify:deployment
```

The Pages build command is `npm run build`; the output directory is `build/client`. Pages Functions live under `functions/`. The live D1 database contains the aggregate assessment-intake and rate-limit tables.

## Enquiry handling

1. A merchant reads the current product scope and privacy notice.
2. The merchant may submit the founding enquiry at `/buyer-evaluation`.
3. The request is stored in D1. Only an authorized operator should review and respond to enquiries.
4. The merchant can use `/manual-data` to run the browser-local CSV workflow.
5. No source files or store credentials are requested by the public form.

There is no automated notification or protected lead-management interface in the current release. An authorized adult business operator must manage enquiries, customer communications and any commercial relationship.

## Commercial and governance boundaries

- The founding enquiry is no-fee and no-obligation.
- No payment details are collected and no payments are accepted.
- No subscription or recurring service is currently offered.
- Any future contract, pricing, invoicing, tax, payment, data-processing or customer-support arrangement requires an authorized adult business operator.
- Publish no testimonials, customer logos or financial results without evidence and permission.

A deployed website is not proof of a revenue-generating business. The public release must remain explicit about what is live.
