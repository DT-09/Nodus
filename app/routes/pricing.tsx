import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Shipping Cost Audit for Shopify merchants"},
 {name:"description",content:"A one-time, evidence-backed review of Shopify shipping revenue against carrier and 3PL cost records. Start with a free browser-local diagnostic."}
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
 "Historical flat-rate or free-shipping threshold replay where data supports it",
 "Written decision brief: findings, limitations and next actions"
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero">
   <p className="page-eyebrow">NODUS / COMMERCIAL OFFER</p>
   <h1>One shipment ledger.<br/><em>One decision-ready audit.</em></h1>
   <p className="page-lede">NODUS audits the relationship between shipping collected at checkout and carrier or 3PL costs supported by your records. Start with the free diagnostic. Buy a defined review only when the evidence shows a question worth investigating.</p>
  </header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free">
    <span className="nd-plan-kicker">01 / SELF-SERVE</span><h2>Free diagnostic</h2><p className="nd-plan-price">Free</p><p className="nd-plan-desc">Run the reconciliation yourself. No card, account or file upload required.</p>
    <ul>{freeItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/manual-data" className="cta-secondary">RUN THE FREE REVIEW ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro">
    <span className="nd-plan-kicker">02 / FIXED-SCOPE SERVICE</span><h2>Shipping Cost Audit</h2><p className="nd-plan-price">$149 <small>/ one-time pilot</small></p><p className="nd-plan-desc">A human-reviewed, evidence-backed audit for one store and one reporting window. This is a pilot price to test buyer demand, not a proven market price.</p>
    <ul>{auditItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/buyer-evaluation" className="cta-primary">REQUEST THE AUDIT ↗</Link>
   </article>
  </section>
  <section className="nd-pricing-process">
   <div><span>HOW THE PURCHASE WORKS</span><h2>Qualify the data.<br/><em>Agree the scope.</em></h2></div>
   <div className="nd-pricing-steps">
    <article><b>01</b><div><h3>Run the free diagnostic</h3><p>Use your own order and carrier-cost exports. The files stay in your browser.</p></div></article>
    <article><b>02</b><div><h3>Request the paid audit</h3><p>Tell us the store, reporting window, shipping setup and the decision you need to make. Do not upload customer data through the enquiry form.</p></div></article>
    <article><b>03</b><div><h3>Confirm fit and scope</h3><p>The operator confirms that the source formats and evidence can support the requested review, then issues written terms and an invoice.</p></div></article>
    <article><b>04</b><div><h3>Pay, then receive the audit</h3><p>Work begins only after the authorized seller confirms cleared payment. Delivery timing is agreed in writing before payment.</p></div></article>
   </div>
  </section>
  <section className="nd-pricing-value">
   <div><span>WHAT THE AUDIT DELIVERS</span><h2>Not a dashboard subscription.<br/><em>A traceable decision record.</em></h2><p>The buyer receives a dated review that separates supported findings from incomplete evidence. It is designed to help an operator decide what to investigate—not to promise that a carrier owes money.</p></div>
   <div className="nd-pricing-deliverables"><p><b>01 / COVERAGE</b> Reporting window, source quality, matches and exclusions</p><p><b>02 / RECONCILIATION</b> Order-level shipping revenue against matched carrier costs</p><p><b>03 / EXCEPTIONS</b> Unmatched, duplicate, ambiguous and incomplete records</p><p><b>04 / POLICY REPLAY</b> Historical rate and threshold comparison where supported</p><p><b>05 / DECISION BRIEF</b> Findings, limits and prioritized next actions</p></div>
  </section>
  <section className="nd-pricing-faq">
   <h2>Scope and trust</h2>
   <div><h3>Does NODUS guarantee savings or carrier credits?</h3><p>No. It identifies evidence and prioritizes investigation. A negative shipping balance is not proof of carrier overbilling or recoverable money.</p></div>
   <div><h3>Why is this not a monthly subscription?</h3><p>The current product does not provide verified continuous carrier monitoring or automatic monthly ingestion. A one-time audit is the honest offer until repeat demand and recurring delivery are demonstrated.</p></div>
   <div><h3>What data is required?</h3><p>The free workspace processes CSV files locally. For a paid audit, the operator agrees a secure, minimum-data handoff before any source files are shared. Never send passwords or access tokens.</p></div>
   <div><h3>Does the request form take payment?</h3><p>No. It records an enquiry only. A paid engagement exists only after the seller confirms fit, issues terms and an invoice, and verifies cleared funds.</p></div>
   <div><h3>Can I buy it again?</h3><p>Yes, if a later reporting period contains new carrier and order evidence worth reviewing. Repeat purchases are optional; NODUS does not auto-renew or bill monthly.</p></div>
  </section>
  <section className="nd-pricing-contact">
   <img src={NODUS_MARK} alt="NODUS six-node gold network mark"/>
   <h2>Start with the evidence.</h2><p>Run the free diagnostic first. Request a paid audit only if the result exposes a material question.</p>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">OPEN FREE WORKSPACE ↗</Link><Link to="/buyer-evaluation" className="cta-secondary">REQUEST A PAID AUDIT ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
