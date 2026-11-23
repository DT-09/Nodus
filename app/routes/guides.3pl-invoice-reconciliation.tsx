import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"3PL invoice reconciliation checklist for Shopify merchants | NODUS"},
 {name:"description",content:"A practical guide to checking 3PL invoices against effective contract rates and exact-reference operational activity."},
 {property:"og:title",content:"3PL Invoice Reconciliation Checklist"},
 {property:"og:description",content:"Review contract terms, invoice lines, operational evidence and provider outcomes in a repeatable monthly process."}
];

const records=[
 ["Contract rate card","Charge code, unit, pricing method, rate, currency and effective dates. Confirm the rows against the signed agreement."],
 ["Provider invoice","Invoice number, invoice date, service date where available, charge code, quantity, unit, amount and currency."],
 ["Operational activity","Unique record ID, exact reference, charge code, quantity, unit and event timestamp when available."],
 ["Provider response","Dispute reference, response date, promised adjustment, credit note reference and posted amount."],
];
const controls=[
 ["Align the billing period","Confirm invoice dates and service dates. Use the service date to select the effective contract rate when the source provides it."],
 ["Check the contract version","Use the rule that applied to the charge date. Overlapping rules are ambiguous and need human resolution."],
 ["Recalculate line amounts","Compare the billed amount with the effective rate and billed quantity using the same currency and unit."],
 ["Verify billed quantities","Require an exact activity reference, matching charge code and matching unit. Do not treat missing activity as zero."],
 ["Keep unsupported charges visible","A charge without a matching rule is unpriced, not automatically an overcharge."],
 ["Track the provider response","Keep the case open while the provider reviews it. A promised credit is not a posted credit."],
 ["Verify the result","Record the credit note or transaction reference and evidence. Include only verified outcomes in the realized-value total."],
];

export default function ThreePLInvoiceReconciliation(){
 return <MarketingShell><main className="content-page">
  <header>
   <p className="page-eyebrow">FIELD GUIDE / 3PL FINANCE OPERATIONS</p>
   <h1>Reconcile the 3PL invoice.<br/><em>Keep the evidence.</em></h1>
   <p className="page-lede">A monthly control process for Shopify merchants that outsource fulfilment. The goal is not to label every difference an overcharge. It is to compare each billed line with the terms and operational records that can actually support it.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST A SEVEN-DAY TRIAL ↗</Link><Link to="/pricing" className="cta-secondary">VIEW MONTHLY SERVICE ↗</Link></div>
  </header>
  <section className="content-note">
   <span className="page-eyebrow">01 / THE THREE SOURCE RECORDS</span>
   <h2>Agreement. Invoice. Activity.</h2>
   <p>The contract describes what should be billed. The invoice records what was billed. Operational activity can support whether a quantity occurred. Each source answers a different question; none should silently substitute for another.</p>
   <div className="content-grid">{records.map(([title,body])=><article key={title}><span>SOURCE RECORD</span><h2>{title}</h2><p>{body}</p></article>)}</div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">02 / MONTHLY CONTROL CHECKLIST</span>
   <h2>Seven checks before raising a dispute.</h2>
   <div className="method-list">{controls.map(([title,body],i)=><article key={title}><b>{String(i+1).padStart(2,"0")}</b><div><h2>{title}</h2><p>{body}</p></div></article>)}</div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">03 / SUPPORTED CSV STRUCTURE</span>
   <h2>Start with structured exports.</h2>
   <p>For the initial NODUS onboarding path, prepare a rate card, one invoice per file and an operational activity export. Keep the provider's original charge codes and record references.</p>
   <p><strong>Rate card:</strong> charge_code, unit, pricing, rate, currency, effective_from, optional effective_to.</p>
   <p><strong>Invoice:</strong> invoice_number, invoice_date, charge_code, quantity, unit, amount, currency. Optional: service_date, period_start, period_end, description and activity_reference.</p>
   <p><strong>Activity:</strong> record_id, reference, charge_code, quantity, unit. Optional: occurred_at.</p>
   <p>CSV uploads are limited to 5 MB and 20,000 data rows. PDF extraction and direct provider integrations are not included in the initial release.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">04 / COMMON EXCEPTIONS</span>
   <h2>Do not turn an unknown into a conclusion.</h2>
   <ul>
    <li><strong>Unpriced charge:</strong> no effective contract rule matches the charge code and service date.</li>
    <li><strong>Ambiguous contract rule:</strong> more than one rule applies. A person must resolve the contract version.</li>
    <li><strong>Currency mismatch:</strong> the invoice and contract use different currencies. NODUS does not silently convert.</li>
    <li><strong>Activity ambiguity:</strong> multiple operational rows share the same reference and charge code.</li>
    <li><strong>Unit mismatch:</strong> the invoice and activity quantities cannot be compared on unlike units.</li>
    <li><strong>Unverified credit:</strong> the provider promised an adjustment, but no posted credit evidence exists.</li>
   </ul>
   <p>A calculated variance is a review signal, not proof of provider liability, a valid claim or recoverable money.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">05 / THE RECURRING REVIEW</span>
   <h2>Keep the case alive across billing periods.</h2>
   <p>NODUS stores contract versions, invoice rows, operational activity, reconciliation runs, exceptions, case events, period reports and outcome evidence in a merchant-specific workspace. Each new billing cycle can be checked against the terms and unresolved cases already on record.</p>
   <p>The first release does not automatically contact providers, submit disputes, approve invoices, change Shopify records or make payments. Those actions remain with the merchant.</p>
   <Link to="/buyer-evaluation#trial-request" className="cta-primary">EVALUATE YOUR SOURCE DATA ↗</Link>
  </section>
 </main></MarketingShell>;
}
