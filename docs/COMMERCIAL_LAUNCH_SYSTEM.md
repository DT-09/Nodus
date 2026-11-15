# NODUS Commercial Launch System

**Owner:** NODUS operating team  
**Decision date:** 2026-11-15  
**Status:** Internal operating plan. Every claim and offer is constrained by the current repository and external release gates.

## 1. Commercial objective

Turn NODUS from a technically substantial Shopify app into a credible merchant evaluation that can produce three kinds of evidence:

1. **Problem evidence:** a qualified merchant has a recurring, costly shipping-economics review problem.
2. **Product evidence:** NODUS can connect the merchant's permitted Shopify order data to a supported carrier/3PL cost export and produce a traceable decision pack.
3. **Commercial evidence:** the merchant uses the result, returns for another period, and is willing to pay for a clearly defined recurring outcome.

Do not use website traffic, compliments, GitHub activity, free installs or a large feature list as substitutes for these outcomes.

## 2. Market reality and positioning decision

Shipping-cost analytics is already a populated category. NODUS must not claim that comparing checkout shipping revenue with fulfillment costs is unique.

Public product pages reviewed on 2026-11-15:

- **OCT Shipping Analytics PRO** describes comparing Shopify shipping revenue with merchant-entered actual shipping costs, with breakdowns by method, country and order value. Its Shopify App Store listing currently shows a free price point and no reviews.
- **Shopvibe** describes order-level matching across checkout charges, Shopify labels, carrier invoice lines and 3PL bills; adjustment review and dispute packets; multiple bill formats; and a free tier plus a $29/month Launch plan.
- **Oh Ship!** describes carrier adjustment detection, shipping-margin analysis and notifications; its listing shows free, $39/month, $99/month and $249/month tiers.

References:
- https://apps.shopify.com/shipping-analytics-pro
- https://shopvibe.app/
- https://apps.shopify.com/shopvibe
- https://apps.shopify.com/oh-ship

These are public positioning and list-price observations, not market-share, retention or customer-satisfaction evidence. Recheck before using them in external materials.

### Competitive conclusion

NODUS is not currently feature-equivalent to the strongest visible alternatives. Shopvibe publicly claims broader cost-source coverage, more invoice formats and dispute workflows. NODUS must not imply superiority on automation, invoice ingestion, recovery or carrier coverage.

The credible initial wedge is narrower:

> **An evidence-led shipping-economics review for Shopify merchants who can provide carrier or 3PL cost exports: connect checkout shipping revenue to reviewed cost evidence, expose coverage gaps, and replay supported shipping policies against the merchant's own historical orders.**

The intended distinction is the quality of the evidence trail and the decision pack—not a claim to have invented shipping analytics. This distinction remains a hypothesis until merchants say it changes a real decision.

### Positioning statement

For Shopify merchants using external carriers or 3PLs who need to understand shipping economics across separate order and billing records, NODUS is a read-only shipping-economics workspace that connects permitted order data with merchant-provided cost evidence, explains supported discrepancies, and tests historical policy scenarios. Unlike a summary dashboard, it keeps source references, matching state, coverage, assumptions and limitations attached to the result.

### One-sentence value proposition

**See what checkout collected, what your available fulfillment records support, where evidence is missing, and what a different shipping policy would have produced on the same historical orders.**

### Message hierarchy

1. **Outcome:** make a shipping decision you can explain.
2. **Problem:** checkout revenue and carrier/3PL cost evidence live in separate records.
3. **Mechanism:** Shopify order data + supported CSV evidence + deterministic matching/reconciliation + historical policy replay.
4. **Proof:** source-linked exceptions, explicit coverage and reproducible exports.
5. **Boundary:** CSV cost intake; no direct carrier invoice API, automatic carrier polling, dispute submission, live policy writes or verified self-serve billing.

Avoid generic claims such as "AI-powered logistics", "recover every dollar", "real-time carrier audit", "automatic savings", "profit optimization" or "all carriers".

## 3. Ideal customer profile

### Primary segment

A Shopify merchant that:
- sells physical goods;
- uses an external carrier, fulfillment provider or 3PL;
- has recurring parcel or 3PL cost records available as a CSV export;
- charges shipping, offers free shipping or uses flat-rate/threshold policies;
- already spends time reconciling order and fulfillment records;
- has an owner or operations/finance lead who can authorize Shopify access and review the findings.

### Buyer and user

- **Economic buyer:** founder/owner, ecommerce director, operations lead or finance/controller.
- **Daily user:** ecommerce operations, fulfillment or finance analyst.
- **Internal champion:** person currently responsible for the spreadsheet, invoice review or shipping-policy decision.

### Disqualify early

Do not accept as a fit if the store:
- sells only digital goods;
- has no usable carrier/3PL cost export;
- cannot authorize access to the relevant Shopify store;
- expects direct carrier integrations, PDF extraction, automatic disputes, automated policy writes or continuous carrier monitoring;
- wants guaranteed savings or a recovery promise.

Do not invent a minimum shipment-volume threshold. Establish fit from the buyer's process, frequency and available records.

## 4. Offer architecture

### Offer A — Founding Merchant Value Programme

**Current public offer: no fee, no obligation.**

Scope:
- one authorized Shopify store;
- one reporting currency;
- order history available under granted Shopify permissions;
- one supported carrier-cost CSV export;
- a defined historical sample.

Deliver:
1. scope and data-quality statement;
2. evidence coverage summary;
3. matched, unmatched, duplicate, ambiguous and incomplete exception register;
4. deterministic order-level calculations with source references;
5. historical flat-rate/free-shipping replay where the data supports it;
6. value ledger separating identified, merchant-validated and merchant-attested realized outcomes;
7. written decision brief, limitations and next actions;
8. merchant review.

No payment details. No automatic subscription. No testimonial requirement. Do not request raw invoices or customer data before the operator has approved the secure data-handling workflow.

### Offer B — Paid pilot (not currently open)

Only consider after the founding assessment demonstrates a real recurring job. The pilot must have:
- an authorized business operator;
- written scope and acceptance criteria;
- a defined reporting period and supported inputs;
- a price and payment terms approved by that operator;
- a lawful invoicing and collection process;
- a verified production environment and support owner.

Do not take payment for unsupported integrations or unfinished billing.

### Offer C — Recurring subscription (future gate)

A subscription is credible only when NODUS can repeatedly perform a job the merchant values. A scheduled Shopify order refresh by itself is not continuous shipping-cost monitoring. Carrier evidence is currently merchant-imported; carrier invoice polling and drift alerts are not implemented.

Before subscriptions:
- recurring value is demonstrated in repeated periods;
- merchants explicitly agree to pay;
- Shopify App Pricing plans are configured;
- server-side entitlements and plan limits are verified;
- approval, activation, change, cancellation, delinquency, refund and uninstall paths are tested;
- support, privacy and operations are ready.

### Pricing discipline

Do not publish a price list now. Competitor list prices are reference points, not proof of NODUS willingness-to-pay. Determine a price only after observing the recurring workload and buyer budget.

Internal rule: conservative, merchant-accepted recurring value should be at least 3× the proposed monthly fee. This is a pricing discipline, not a guaranteed return. Keep realized cash, operating-time value and decision value separate. Never charge a percentage of merely identified or disputed exposure.

## 5. Acquisition strategy — inbound, not cold outreach

The initial acquisition motion is deliberately product-led and searchable. No mass cold-email campaign.

### Channel 1 — High-intent search

Build useful pages around questions a merchant already searches:
- Shopify shipping cost reconciliation;
- compare Shopify shipping revenue with carrier costs;
- 3PL invoice reconciliation for Shopify orders;
- free-shipping threshold analysis;
- flat-rate shipping policy analysis;
- how to match carrier invoice lines to Shopify orders;
- shipping-cost data coverage and reconciliation methodology.

Each page must answer the query with a worked method, sample data clearly marked synthetic, limitations, and one next action: inspect the sample Decision Pack or request the founding assessment. Do not publish thin keyword pages or repeat the same copy under different URLs.

### Channel 2 — Public proof assets

Publish:
- a synthetic end-to-end Decision Pack with conspicuous "synthetic example" labelling;
- the carrier-cost CSV template;
- a plain-language methodology page;
- a buyer evaluation guide;
- an explanation of what NODUS does not yet support.

A buyer should be able to inspect the method before sharing store data.

### Channel 3 — Shopify ecosystem discovery

After the authorized operator completes the Shopify distribution requirements:
- prepare a factual App Store listing;
- use accurate screenshots of the real product;
- describe CSV-based evidence intake precisely;
- publish only after Shopify approval;
- request reviews only from genuine users, without incentives or pressure.

Do not claim App Store availability or approval before it exists.

### Channel 4 — Educational public distribution

Publish short, useful analyses in relevant merchant/operator communities and founder channels. Lead with a calculation, a data-quality lesson or a reproducible sample—not a sales pitch. Respect community rules. Do not scrape members, automate unsolicited messages or post repetitive promotions.

### Channel 5 — Partner referrals

Once the evaluation is repeatable, build relationships with Shopify agencies, fractional ecommerce finance operators and 3PL consultants who encounter shipping-cost review problems. Offer a transparent sample and referral process. Do not imply endorsement or pay for reviews.

### What not to do

- no mass cold email;
- no fake customer logos, quotes, reviews or case studies;
- no fabricated savings or recovery numbers;
- no paid acquisition until conversion and economics are measured;
- no App Store listing claims before approval;
- no "enterprise-ready" or certification claims without independent evidence.

## 6. Website conversion system

The existing public site already has a product overview, synthetic demo, methodology, security, privacy, buyer evaluation and no-fee programme page. Treat those as the conversion path:

**Search / referral → Homepage → Sample demo → Evaluation guide → Programme application → Authorized store evaluation → Decision Pack → Repeat-use discussion.**

Required checks before public traffic:
- canonical production domain is chosen and verified;
- public pages and links load on mobile and desktop;
- PUBLIC_CONTACT_EMAIL points to a monitored, business-owned inbox;
- application and privacy contact routes work;
- privacy notice is completed by the responsible operator with legal identity, jurisdiction, actual database provider, retention, backup expiry and regional disclosures;
- terms and data deletion/support disclosures are approved;
- synthetic sample data is clearly labelled;
- metadata, sitemap and robots use the canonical domain;
- no placeholder URLs, unsupported capability claims or dead CTAs remain.

The application should not accept merchant data submissions through an unapproved channel. First contact should collect only qualification details: store URL, approximate order-volume band, carrier/3PL type, whether a CSV export exists, and the question to investigate. Do not request access tokens, customer exports or invoice files in a public form.

## 7. Inbound sales playbook

### Qualification: five questions

1. How do you currently compare shipping collected at checkout with carrier or 3PL costs?
2. How often do you review it, and who owns the process?
3. Which source exports can you provide, and do they contain order or tracking references?
4. What decision is blocked or made with weak evidence today?
5. If the assessment is useful, would you need this review again next month?

### Qualification score

Mark each as Yes / No / Unknown:
- authorized Shopify administrator available;
- physical-goods store with external fulfillment costs;
- usable carrier/3PL CSV export;
- stable order or tracking references;
- recurring review process;
- named buyer/champion;
- decision the buyer wants to make.

Proceed only when the first four are Yes and the buyer has a concrete operating question. Treat Unknown as unresolved, not as Yes.

### First-response template

"Thanks for your interest in NODUS. The founding assessment is a no-fee, no-obligation review for one Shopify store, one reporting currency and one supported carrier/3PL cost CSV. It connects the order data Shopify permits us to read with the cost records you provide, then reports evidence coverage, supported exceptions and a historical policy replay where the data allows it. It does not promise recovered credits or use direct carrier invoice APIs. To check fit, please share your store URL, approximate monthly order-volume range, carrier/3PL type, whether a cost CSV is available, and the shipping question you want to answer. Please do not send credentials, customer data or invoice files at this stage."

### Evaluation review agenda

1. Confirm the sample window, permissions, currency and exclusions.
2. Show evidence coverage before showing headline totals.
3. Inspect matched and unmatched examples.
4. Trace every material finding to its source record and calculation.
5. Review policy replay assumptions and limitations.
6. Ask which finding changes a real operating decision.
7. Ask whether the same job recurs and what currently pays for it.
8. Agree the next step—or close the evaluation if the evidence is not useful.

### Follow-up sequence

- **Day 0:** acknowledge enquiry and send scope/data checklist.
- **After qualification:** agree a bounded evaluation and authorized connection.
- **After delivery:** schedule one evidence review; ask the merchant to validate or reject findings.
- **7–14 days after review:** ask whether the decision was acted on and what evidence changed.
- **Next reporting cycle:** ask whether the workflow was repeated and whether the merchant would pay for that recurring outcome.

These are suggested intervals, not automated outreach. Do not send repeated messages after a decline.

## 8. Sales pipeline and operating record

Track every inbound merchant in a private, access-controlled CRM or approved business workspace. Minimum fields:

- merchant ID and store domain;
- source channel and landing page;
- date first seen;
- buyer role and authorized administrator status;
- fulfillment model and carrier/3PL;
- monthly order-volume band (not exact order data at intake);
- CSV availability and format;
- recurring review cadence;
- primary decision question;
- qualification status and unresolved items;
- evaluation consent and scope;
- data connection date and sample window;
- Decision Pack delivery date;
- findings validated/rejected by merchant;
- repeat-use date;
- willingness-to-pay evidence;
- proposed paid scope, if eligible;
- next action, owner and date;
- permission status for any quote, logo or case study.

Pipeline stages:
1. **Inbound** — enquiry received.
2. **Qualified** — first-four fit criteria met.
3. **Scoped** — boundaries and consent agreed.
4. **Connected** — authorized store connected.
5. **Evidence imported** — supported cost export loaded.
6. **Delivered** — Decision Pack reviewed with merchant.
7. **Validated** — merchant confirms which findings are actionable.
8. **Repeat-use** — a later period is completed.
9. **Paid intent** — explicit willingness to pay for defined recurring scope.
10. **Paid pilot / subscription** — only after commercial and technical gates.
11. **Closed / not fit** — reason recorded, no pressure.

## 9. Measurement dashboard

Measure the funnel by cohort and source. Do not optimize for vanity metrics.

| Metric | Definition | Why it matters |
|---|---|---|
| Qualified organic visits | Visits to high-intent pages that reach the evaluation/demo | Search demand quality |
| Evaluation starts | Qualified visitors who begin an enquiry | Message-to-offer conversion |
| Qualified enquiries | Enquiries meeting the first-four fit criteria | Buyer fit |
| Connection rate | Qualified merchants who complete authorized Shopify connection | Onboarding friction |
| Evidence import rate | Connected merchants who successfully import a supported cost CSV | Data compatibility |
| First useful result | Merchant reaches a traceable finding or explicit coverage result | Activation |
| Decision usefulness | Merchant identifies a real decision supported by the pack | Product value |
| Repeat-use rate | Evaluated merchants returning in a later reporting period | Recurring need |
| Paid conversion | Repeat-use merchants making an authorized paid commitment | Commercial validation |
| Time to first result | Elapsed time from connection to useful result | Operational efficiency |
| Evidence completeness | Share of in-scope records with usable cost evidence | Data quality, not a marketing claim |

Set numeric targets only after a baseline cohort exists. Never invent conversion benchmarks or market size.

## 10. First 30-day commercial execution

### Days 1–3: launch control
- verify canonical domain and live routes;
- configure monitored business contact and privacy request channels;
- complete operator/legal disclosures;
- run the synthetic demo and sample export end-to-end;
- verify that all public copy matches current product capability;
- prepare the private CRM fields and evaluation checklist.

### Days 4–10: demand capture
- publish one substantive guide on Shopify shipping-cost reconciliation;
- publish one substantive guide on free-shipping threshold analysis;
- make the synthetic Decision Pack easy to inspect;
- submit useful educational posts in relevant public communities where permitted;
- measure qualified visits and enquiries by source.

### Days 11–20: founding evaluations
- qualify inbound merchants using the first-four criteria;
- complete only bounded, authorized evaluations;
- record CSV compatibility and data gaps;
- deliver Decision Packs and review them with merchants;
- document the decisions the evidence did or did not support.

### Days 21–30: commercial evidence
- follow up on actionability and repeat-use need;
- compare findings across evaluations without exposing merchant data;
- identify the smallest recurring workflow merchants actually want;
- estimate support and operating effort;
- decide whether to continue the no-fee cohort, change the offer, or define a paid pilot for an authorized operator.

Do not announce product-market fit after one evaluation. Do not launch recurring billing because the calendar says day 30.

## 11. Launch-state claims

| State | What can be said | What must be true |
|---|---|---|
| Public information site | NODUS explains its product and invites interest | Public routes, canonical domain, contact, privacy and legal disclosures verified |
| Founding evaluation | NODUS accepts bounded no-fee merchant evaluations | Real authorized store test, tenant isolation, secure data handling, support owner |
| Paid pilot | NODUS delivers a defined paid assessment | Written scope, acceptance, price, authorized business operator, lawful invoice/collection |
| Public paid app | Merchants can install and subscribe | Shopify approval/distribution, tested billing and entitlements, production operations and support |

A successful build or deployment is not proof of commercial readiness.

## 12. Non-negotiable operator boundary

An appropriately authorized adult/business operator must own or approve commercial hosting, Shopify Partner organization, legal identity, contracts, invoices, tax obligations, payment/payout accounts, privacy responses and incident handling. Do not bypass age, identity, platform or legal requirements. The product can be researched, designed and improved without pretending these responsibilities have been completed.

## 13. Immediate decision

**Do not compete head-on with full-featured carrier-audit apps yet.** Launch NODUS as a transparent, tightly scoped shipping-economics evaluation for merchants who already have exportable 3PL/carrier cost evidence. Use the no-fee founding programme to learn whether the evidence pack and historical policy replay solve a recurring problem. Build paid recurring service only after repeated use and explicit willingness to pay.

That is the shortest honest route from an engineered product to a commercial product.
