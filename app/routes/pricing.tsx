import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Shipping Cost Audit and Monthly Review"},
 {name:"description",content:"Reconcile Shopify shipping revenue against carrier and 3PL costs. Start with a free diagnostic, a fixed-scope audit, or a recurring monthly review."}
];

const freeItems=[
 "Reconcile supported order and carrier CSV exports in your browser",
 "See matched, unmatched, ambiguous and currency-mismatched records",
 "Review carrier spend by provider and cost type",
 "Replay a shipping policy against historical baskets",
 "Export the CSV register and JSON decision pack"
];
const auditItems=[
 "One Shopify store and one agreed 30-day reporting window",
 "Up to 2,000 orders and one carrier or 3PL cost export",
 "Data coverage and source-quality assessment",
 "Evidence-backed exception register with source references",
 "Order-level shipping revenue versus matched fulfillment cost",
 "Historical shipping-policy replay where data supports it",
 "Written decision brief with findings, limitations and next actions"
];
const monthlyItems=[
 "One Shopify store, reviewed each month",
 "Up to 2,000 orders and one carrier or 3PL cost export per month",
 "Monthly reconciliation and evidence coverage review",
 "Prioritized exception register with source references",
 "Carrier spend breakdown and material change review",
 "Comparison with the previous period when prior evidence is available",
 "Monthly decision brief and action register"
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero">
   <p className="page-eyebrow">NODUS / COMMERCIAL OFFER</p>
   <h1>Control shipping costs.<br/><em>Every reporting period.</em></h1>
   <p className="page-lede">NODUS connects Shopify shipping revenue with carrier and 3PL cost evidence. Start with a free diagnostic, use a one-time audit to establish the baseline, or have NODUS review the evidence every month.</p>
  </header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free">
    <span className="nd-plan-kicker">01 / SELF-SERVE</span><h2>Free diagnostic</h2><p className="nd-plan-price">Free</p><p className="nd-plan-desc">Run the reconciliation yourself. No account or file upload required.</p>
    <ul>{freeItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/manual-data" className="cta-secondary">RUN THE FREE REVIEW ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro">
    <span className="nd-plan-kicker">02 / BASELINE AUDIT</span><h2>Shipping Cost Audit</h2><p className="nd-plan-price">$149 <small>/ one-time</small></p><p className="nd-plan-desc">A human-reviewed baseline for one store and one reporting window.</p>
    <ul>{auditItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/buyer-evaluation?offer=paid_audit" className="cta-primary">REQUEST THE AUDIT ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro nd-plan-monthly">
    <span className="nd-plan-kicker">03 / RECURRING SERVICE</span><h2>Monthly Shipping Review</h2><p className="nd-plan-price">$99 <small>/ month</small></p><p className="nd-plan-desc">A recurring, human-reviewed shipping economics report built from each month's order and carrier-cost exports.</p>
    <ul>{monthlyItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/buyer-evaluation?offer=monthly_review" className="cta-primary">REQUEST MONTHLY REVIEW ↗</Link>
   </article>
  </section>
  <section className="nd-pricing-process">
   <div><span>HOW THE SERVICE WORKS</span><h2>Bring the records.<br/><em>Get a monthly decision.</em></h2></div>
   <div className="nd-pricing-steps">
    <article><b>01</b><div><h3>Run the free diagnostic</h3><p>Use your own order and carrier-cost exports. The free tool processes files in your browser.</p></div></article>
    <article><b>02</b><div><h3>Choose the right scope</h3><p>Request the one-time baseline audit or the recurring monthly review. We confirm the source formats and reporting scope.</p></div></article>
    <article><b>03</b><div><h3>Submit each reporting period</h3><p>For the monthly service, provide the agreed exports for each month through the agreed data handoff. NODUS reviews each period and prepares the report.</p></div></article>
    <article><b>04</b><div><h3>Receive the decision brief</h3><p>Get the reconciliation, exception register, coverage statement and prioritized actions. The monthly review is analyst-delivered, not an automated carrier-monitoring alert.</p></div></article>
   </div>
  </section>
  <section className="nd-pricing-value">
   <div><span>WHAT THE SERVICE DELIVERS</span><h2>Not another dashboard.<br/><em>A monthly control record.</em></h2><p>Each reporting period gets a dated review that separates supported findings from incomplete evidence. The goal is to make recurring shipping-cost decisions easier to inspect and act on.</p></div>
   <div className="nd-pricing-deliverables"><p><b>01 / COVERAGE</b> Reporting window, source quality, matches and exclusions</p><p><b>02 / RECONCILIATION</b> Order-level shipping revenue against matched carrier costs</p><p><b>03 / EXCEPTIONS</b> Unmatched, duplicate, ambiguous and incomplete records</p><p><b>04 / PERIOD COMPARISON</b> Changes from the previous period where comparable data exists</p><p><b>05 / DECISION BRIEF</b> Findings, limitations and prioritized next actions</p></div>
  </section>
  <section className="nd-pricing-faq">
   <h2>Scope and trust</h2>
   <div><h3>Does NODUS guarantee savings or carrier credits?</h3><p>No. It identifies evidence and prioritizes investigation. A negative shipping balance is not proof of carrier overbilling or recoverable money.</p></div>
   <div><h3>Is the monthly review automated monitoring?</h3><p>No. It is a recurring analyst-delivered review based on the order and carrier-cost exports supplied for each period. NODUS does not claim continuous carrier polling or real-time alerts.</p></div>
   <div><h3>What is included each month?</h3><p>One store, up to 2,000 orders, one carrier or 3PL cost export, an evidence coverage review, exception register, period comparison where possible and a written decision brief.</p></div>
   <div><h3>What data is required?</h3><p>The free workspace processes CSV files locally. For a paid service, the agreed data handoff and retention period are confirmed before source files are shared. Never send passwords or access tokens.</p></div>
   <div><h3>Can I start with one audit?</h3><p>Yes. The one-time audit establishes a baseline. The monthly service is a separate recurring engagement for buyers who need a new review each reporting period.</p></div>
  </section>
  <section className="nd-pricing-contact">
   <img src={NODUS_MARK} alt="NODUS six-node gold network mark"/>
   <h2>Make shipping economics a monthly control.</h2><p>Run the free diagnostic, then request the scope that matches the work you need done.</p>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">OPEN FREE WORKSPACE ↗</Link><Link to="/buyer-evaluation?offer=monthly_review" className="cta-secondary">REQUEST MONTHLY REVIEW ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
