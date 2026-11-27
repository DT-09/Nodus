# Merchant dispute economics — market evidence (27 November 2026)

## Decision

NODUS will test a narrow B2B product: **merchant dispute economics and evidence-control software**.

It is not yet a validated business. Public research establishes a funded problem category and existing purchases; it does not prove that buyers will purchase this specific product from NODUS. No revenue, customers, conversion lift, recovery, or customer outcome is claimed.

## Buyer and problem

**Economic buyer:** CFO, VP Payments, Head of Payments, or Head of Risk at a high-volume e-commerce merchant.

**Operational users:** chargeback/dispute operations and finance teams.

**Costly recurring job:** understand the fully loaded cost and outcome of disputes across processors and dispute vendors; identify cases and workflows that consume more in fees and staff time than they return; preserve complete evidence and deadline status; reconcile provider charges and outcomes.

The product must not claim to prevent fraud, guarantee wins, or recover funds. It provides decision support and evidence controls; authorised merchant staff retain control of refunds, submissions, and payment actions.

## Evidence of existing spend and pain

1. **Mastercard, 2025 Global Chargebacks Outlook.** Merchants report annual chargeback-technology spending of $100,000–$500,000. The report says 50% manage chargebacks and fraud in-house, 34% outsource chargebacks while keeping fraud management in-house, and 16% outsource both. This is direct evidence of an established budget category, especially among larger merchants. Source: https://www.mastercard.com/content/dam/mc/com/shared/news-and-trends/insights/2025/2025-global-chargebacks-outlook/pdf/2025-state-of-chargebacks-report.pdf

2. **Mastercard / Javelin, 2026 chargeback research.** Average total cost per chargeback is reported at $120.57–$139.34 for merchants with $250m–$500m and $100m–$250m revenue, respectively, and $233.01 for merchants with $1bn+ revenue. The report says 79% of merchants use a third-party service or platform for at least some chargeback workflows. Source: https://www.mastercard.com/content/dam/mc/com/shared/news-and-trends/insights/2026/2026-javelin-chargebacks-white/2026%20Chargebacks%20Javelin%20White%20Paper.pdf

3. **Visa / Cybersource, 2026 Global eCommerce Payments and Fraud Report.** More than 80% of merchants identify data and technology as their biggest fraud-management challenges; 62% say reducing time spent on fraud management will be a moderate or major factor in future investments. The report also records pressure to contain operating costs and constrained staffing/tool budgets. Source: https://www.cybersource.com/content/dam/documents/campaign/fraud-report/Visa_CYBS_2026_Global_eCommerce_PaymentsandFraudReport.pdf

4. **Juniper Research / Chargeflow, 2026 survey.** The published findings say only 11% of enterprise respondents describe their chargeback process as mostly or fully automated; 69% require at least an 11-percentage-point improvement in dispute win rates. This is useful but must be treated as vendor-sponsored research, not independent proof. Source: https://www.chargeflow.io/data-lab/the-state-of-chargeback-management

5. **Public competitor price anchors.** Chargeback.io publishes $15 per selected alert and $0.50 starting per transaction for certain deflection services. Chargeflow advertises a 25% fee on recovered chargebacks. These prove that providers publicly charge for adjacent outcomes; they do not establish willingness to pay NODUS. Sources: https://chargeback.io/pricing and https://www.chargeflow.io/pricing

6. **Mastercard's 2026 summary.** Mastercard reports an average $128 in third-party fees and internal costs per chargeback, based on its 2026 research, and projects 359 million global chargebacks in 2029. Source: https://www.mastercard.com/global/en/news-and-trends/Insights/2025/what-s-the-true-cost-of-a-chargeback-in-2025.html

## Competitive reality

This is a crowded category. Chargeflow, Chargeback.io, Verifi/Ethoca and processor-native tools already automate alerts, evidence assembly, submissions, or dispute recovery. NODUS must not launch as another generic chargeback automation product.

The proposed wedge is an **independent economics and control layer** across the merchant's existing tools:
- Import processor, storefront, and dispute-vendor exports.
- Reconcile disputes, fees, recoveries, alerts, and case outcomes.
- Calculate fully loaded cost and net recovery by processor, reason code, product, and period where source data supports it.
- Flag missing evidence, deadline risk, duplicate records/fees, and unprofitable workflows.
- Produce traceable case-level explanations and a finance-ready monthly review.

This wedge is a product hypothesis. Its differentiation and buyer urgency remain to be tested.

## What the evidence does not prove

- It does not prove a merchant will buy NODUS.
- It does not prove the proposed independent control layer is missing from current competitors.
- It does not establish a suitable NODUS price.
- It does not establish that $100/hour of revenue is attainable.
- It does not establish customer acquisition cost, retention, margins, or sales-cycle length.
- Vendor-sponsored surveys and vendor-published pricing are not independent market validation.

## Commercial validation gates — no premature launch

Do not call this a revenue-generating business until all gates pass:

1. **Problem interviews:** obtain 10 interviews with qualified merchant finance/payments buyers. Record current workflow, tools, dispute volume, annual spend, and concrete failure modes. Do not pitch first.
2. **Artifact evidence:** obtain at least 3 redacted sample exports or screenshots from authorised buyers showing the cross-tool reconciliation problem. Do not request cardholder data or full payment credentials.
3. **Competitive test:** show the proposed workflow to buyers who already use Chargeflow, Chargeback.io, or processor-native tools. Ask what remains unresolved and whether they would replace, add, or reject the product.
4. **Paid commitment:** secure at least 2 paid, fixed-scope design-partner pilots with written scope, price, data terms, and acceptance criteria before building deep integrations.
5. **Outcome proof:** measure time saved, discrepancies found, fee reconciliation accuracy, evidence completeness, and user adoption against a buyer-approved baseline. Do not claim prevented losses or recovered funds unless independently verified.
6. **Recurring conversion:** obtain at least 2 pilot-to-paid recurring conversions before describing the product as recurring SaaS.

## Revenue target arithmetic

$100 per operating hour across 2,080 hours/year equals $208,000 annual revenue, or about $17,333/month. This is a revenue target, not owner earnings or profit. Any customer-count and price scenario must be labelled illustrative until buyers sign and pay.

## Data and trust requirements

- Start with synthetic and redacted CSV exports.
- Never collect full card numbers, CVV, passwords, or authentication secrets.
- No payment execution, automatic refunds, or dispute submissions in the initial product.
- Tenant isolation, access control, encryption, retention/deletion controls, audit logs, incident response, and appropriate contracts are launch blockers for confidential customer data.
- Do not claim SOC 2, PCI DSS, or other certification unless independently obtained.
