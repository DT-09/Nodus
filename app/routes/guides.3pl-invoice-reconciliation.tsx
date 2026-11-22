import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Shopify 3PL Invoice Reconciliation Checklist | NODUS"},
 {name:"description",content:"A practical checklist for matching Shopify orders to 3PL and carrier invoice lines, checking coverage, and reviewing shipping-cost exceptions."},
 {property:"og:title",content:"Shopify 3PL Invoice Reconciliation Checklist"},
 {property:"og:description",content:"Match order references to billed shipping costs and keep incomplete evidence visible."}
];

const fields=[
 ["Invoice identity","Invoice ID, charge-line ID and invoice date. Keep the carrier's original identifiers."],
 ["Order linkage","Exact Shopify order reference or a tracking number that maps to one order only."],
 ["Financial values","Amount and currency as billed. Do not combine currencies or silently convert values."],
 ["Charge classification","Carrier, charge type and shipment date where the source provides them."],
 ["Coverage window","The complete invoice period, including adjustments, credits and later-billed surcharges represented in the export."]
];
const checks=[
 ["Confirm the reporting window","Choose one monthly period and confirm that order and invoice exports cover the same dates."],
 ["Check source completeness","Compare invoice totals and line counts with the carrier or 3PL statement. Record missing pages, late adjustments and excluded charge types."],
 ["Match conservatively","Use an exact order reference first. Use tracking only when it resolves to one order. Leave ambiguous matches unresolved."],
 ["Keep unmatched costs visible","A charge without an order reference is not zero and should not disappear from the review."],
 ["Compare like with like","Compare shipping revenue and supported carrier cost only within the same currency and compatible tax treatment."],
 ["Review exceptions","Prioritize duplicates, unmatched charges, currency conflicts and negative shipping balances for human inspection."],
 ["Repeat each month","Use the same definitions and coverage checks each period so changes are comparable."]
];

export default function ThreePLInvoiceReconciliation(){
 return <MarketingShell><main className="content-page">
  <header>
   <p className="page-eyebrow">FIELD GUIDE / 3PL FINANCE OPERATIONS</p>
   <h1>How to reconcile Shopify orders with 3PL invoices.</h1>
   <p className="page-lede">A practical monthly control for merchants who need to compare checkout shipping revenue with carrier and third-party logistics charges. The hard part is not arithmetic. It is proving that each billed line belongs to the right shipment and that the reporting period is complete.</p>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">RUN THE FREE RECONCILIATION ↗</Link><Link to="/pricing" className="cta-secondary">VIEW MONTHLY REVIEW ↗</Link></div>
  </header>
  <section className="content-note">
   <span className="page-eyebrow">01 / SOURCE DATA</span>
   <h2>What a useful 3PL export needs</h2>
   <p>Start with the final billed charge lines, not an estimate or rate card. A rate card explains what should be charged; an invoice export shows what was billed. Both can matter, but they answer different questions.</p>
   <div className="content-grid">{fields.map(([title,body])=><article key={title}><span>REQUIRED CONTROL</span><h2>{title}</h2><p>{body}</p></article>)}</div>
   <p>Download the <a href="/templates/nodus-orders-template.csv" download>Shopify order template</a> and <a href="/templates/nodus-carrier-cost-template.csv" download>carrier-cost template</a> to check the supported columns.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">02 / MONTHLY CHECKLIST</span>
   <h2>Seven checks before trusting the total</h2>
   <div className="method-list">{checks.map(([title,body],i)=><article key={title}><b>{String(i+1).padStart(2,"0")}</b><div><h2>{title}</h2><p>{body}</p></div></article>)}</div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">03 / COMMON EXCEPTIONS</span>
   <h2>Do not hide the difficult rows</h2>
   <ul>
    <li><strong>Unmatched charge:</strong> a billed line has no supported order match.</li>
    <li><strong>Ambiguous tracking:</strong> one tracking value could point to more than one order.</li>
    <li><strong>Duplicate line:</strong> a repeated source charge ID needs investigation before totals are trusted.</li>
    <li><strong>Currency mismatch:</strong> the charge and order use different currencies and must remain separate.</li>
    <li><strong>Incomplete coverage:</strong> the export does not prove that all relevant charges for the period are present.</li>
   </ul>
   <p>A negative shipping balance is a review signal. It is not proof of carrier overbilling, a recoverable credit or profit loss. Missing cost evidence must remain unknown, not zero.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">04 / NODUS WORKFLOW</span>
   <h2>Run the comparison, then review the evidence</h2>
   <p>NODUS currently accepts Shopify order CSVs and carrier/3PL cost CSVs. It matches by exact order reference or a unique tracking number, keeps currencies separate, and exports an order register and decision pack. The browser-local workflow does not upload source files.</p>
   <p>It does not currently parse PDF invoices, poll carrier APIs, or automatically ingest 3PL systems. Non-order-linked warehouse fees may remain outside the order-level comparison and should be reviewed separately.</p>
   <p>For a recurring analyst-delivered review, the NODUS Monthly Shipping Review covers one store, up to 2,000 orders and one carrier/3PL cost export per reporting period. Each month produces a coverage review, exception register, carrier spend summary and written decision brief. It is not continuous monitoring or real-time alerting.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation?offer=monthly_review" className="cta-primary">REQUEST MONTHLY REVIEW ↗</Link><Link to="/guides/shopify-shipping-cost-reconciliation" className="cta-secondary">READ THE RECONCILIATION METHOD ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
