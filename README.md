# NODUS

**Shopify conversion incident response: diagnose the failing purchase step, scope a controlled fix, and verify the result.**

NODUS is built for Shopify merchants whose storefront, cart, checkout or purchase tracking is failing or whose conversion performance has materially deteriorated.

## Product workflow

1. **Incident intake** — capture the store, affected journey, urgency, business context and evidence available.
2. **Funnel diagnosis** — compare baseline and current sessions, add-to-cart, checkout and purchase counts.
3. **Segment isolation** — identify whether a measured regression is concentrated by device, channel or landing-page segment.
4. **Investigation plan** — rank the checks that can confirm or reject likely causes.
5. **Controlled remediation** — define a merchant-approved change, implementation owner, test environment and rollback plan.
6. **Verification** — record QA and post-change measurements. A deployment is not a conversion lift.

## Current working diagnostic

The browser workspace is available at `/conversion-review`.

- Accepts CSV files with `period,segment,sessions,added_to_cart,reached_checkout,purchases`.
- `period` is `baseline` or `current`.
- Rows can be grouped by device, traffic source or landing page using `segment`.
- Aggregates repeated rows, calculates funnel rates, compares periods and segments, flags inconsistent counts and exports a JSON diagnostic.
- Files are processed locally in the browser; the funnel CSV is not uploaded.
- The modeled order gap is a counterfactual estimate, not verified lost orders or revenue.

Download the template from `/nodus-funnel-template.csv`.

## Commercial intake

The incident request form posts to `/api/conversion-leads` and stores enquiries in the Cloudflare D1 `conversion_leads` table. It does not book work, collect payment or promise availability.

The target opening rate is USD 100/hour for a capped diagnostic engagement. This is an unvalidated commercial target, not evidence of completed sales or a market-clearing rate. Remediation is separately scoped after the cause is established.

## Explicit limitations

- The current diagnostic does not automatically read private Shopify Analytics.
- No live theme or checkout changes are performed by the public diagnostic workspace.
- No conversion lift, recovered revenue or root cause is claimed without independent evidence.
- Live remediation requires a qualified implementation owner, merchant authorisation, safe staging, QA and rollback.
- Shopify Partner credentials, approved app scopes and a tested merchant installation are not yet configured.
- Payment processing, seller operations, tax/refund handling and a completed paid pilot are not established. An authorised adult-owned seller and payment operation are required before commercial payment is enabled.

## Development

Requirements: Node.js 22 and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Cloudflare Pages project: `nodus-hq`; production branch: `main`; build command: `npm run build`; output: `build/client`. D1 binding: `NODUS_DB`.
