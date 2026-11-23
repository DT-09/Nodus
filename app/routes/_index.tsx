import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — 3PL billing and performance control"},
 {name:"description",content:"Compare Shopify merchants' 3PL contracts, invoices and operational activity. Investigate exceptions and track provider outcomes."},
 {property:"og:title",content:"NODUS — 3PL Billing & Performance Control"},
 {property:"og:description",content:"Contract rates, invoice evidence, operational activity and verified provider outcomes in one merchant workspace."},
 {name:"theme-color",content:"#17131c"},
];

const services=[
 {n:"01",title:"Know what was agreed",tag:"CONTRACT / RATE CARD",body:"Keep effective-dated provider rates, charge codes, units and pricing rules in one versioned record."},
 {n:"02",title:"Check what was billed",tag:"INVOICE / LINE ITEMS",body:"Compare invoice lines with the matching contract rule. Keep currency, quantities and source rows attached."},
 {n:"03",title:"Verify what happened",tag:"OPERATIONAL ACTIVITY",body:"Compare billed quantities only when the provider activity contains an exact reference and matching unit."},
 {n:"04",title:"Close the loop",tag:"EXCEPTIONS / OUTCOMES",body:"Investigate exceptions, record provider responses and distinguish promised credits from posted and verified outcomes."},
];
const steps=[
 ["IMPORT","Bring the records","Add the provider, confirm the rate card, then import invoice and operational CSV exports."],
 ["RECONCILE","Calculate what the evidence supports","Use effective contract dates, exact money arithmetic and explicit reference matching."],
 ["INVESTIGATE","Keep the case alive","Record the review status, source evidence, provider response and next action."],
 ["VERIFY","Measure the outcome","Track promised, posted and verified adjustments in the next period report."],
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nodus-home">
   <section className="nh-hero">
    <div className="nh-copy">
     <p className="nh-eyebrow"><span></span> 3PL BILLING & PERFORMANCE CONTROL</p>
     <h1>Your 3PL bill.<br/>Your evidence.<br/><em>Your control.</em></h1>
     <p className="nh-lede">NODUS checks what your fulfilment provider charged against what your agreement says—and verifies billed quantities against operational activity when the records support it.</p>
     <div className="nh-actions">
      <Link to="/buyer-evaluation#trial-request" className="nh-primary">REQUEST A SEVEN-DAY TRIAL <span>↗</span></Link>
      <Link to="/product" className="nh-secondary">EXPLORE THE CONTROL SYSTEM ↗</Link>
     </div>
     <div className="nh-meta"><span>CONTRACT RATE CONTROL</span><i></i><span>INVOICE RECONCILIATION</span><i></i><span>PROVIDER OUTCOMES</span></div>
    </div>
    <div className="nh-product">
     <div className="nh-product-top"><div className="nh-product-brand"><img src={NODUS_MARK} alt="NODUS network mark"/><div><b>NODUS</b><small>3PL CONTROL DESK</small></div></div><span className="nh-product-state">EVIDENCE / FIRST</span></div>
     <div className="nh-product-title"><span>ONE MERCHANT-OWNED RECORD</span><h2>From agreed rates<br/><em>to verified outcomes.</em></h2></div>
     <div className="nh-sources">
      <article><span>01 / AGREEMENT</span><b>Contract rate card</b><small>Effective dates · charge codes · units</small><strong>WHAT WAS AGREED</strong></article>
      <div className="nh-connector"><span></span><b>+</b><span></span></div>
      <article><span>02 / BILLING</span><b>3PL invoice lines</b><small>Amounts · quantities · currency · references</small><strong>WHAT WAS CHARGED</strong></article>
     </div>
     <div className="nh-engine"><span className="nh-engine-mark" aria-hidden="true">N</span><div><b>Deterministic control engine</b><small>Effective rate · exact reference · source lineage</small></div><span className="nh-engine-arrow">↗</span></div>
     <div className="nh-output">
      <div><span>CALCULATED</span><b>Rate variance</b></div>
      <div><span>UNSUPPORTED</span><b>Needs review</b></div>
      <div><span>RESOLVED</span><b>Verified outcome</b></div>
     </div>
     <div className="nh-ledger-preview" aria-label="Illustrative NODUS workflow, not customer data"><div className="nh-ledger-head"><span>WORKFLOW RECORD</span><span>AGREEMENT / INVOICE / ACTIVITY</span></div><div className="nh-ledger-row"><span>Effective rate</span><b>Invoice amount</b><em>Compare</em></div><div className="nh-ledger-row"><span>Activity reference</span><b>Billed quantity</b><em>Verify</em></div><div className="nh-ledger-row"><span>Provider response</span><b>Credit evidence</b><em>Track</em></div></div>
     <p className="nh-product-note">ILLUSTRATIVE WORKFLOW · NO CUSTOMER DATA SHOWN</p>
    </div>
   </section>

   <section className="nh-statement">
    <div><span>THE CONTROL GAP</span><h2>Your agreement, invoice and warehouse activity rarely arrive as one record.<br/><em>NODUS connects the evidence.</em></h2></div>
    <p>Invoice auditing alone cannot verify every billed quantity. Activity exports alone do not show whether the rate was agreed. NODUS brings the available records together and keeps unsupported conclusions visible.</p>
   </section>

   <section className="nh-services">
    <div className="nh-section-heading"><span>THE PRODUCT / FOUR CONTROL LAYERS</span><h2>From provider billing<br/><em>to accountable outcomes.</em></h2></div>
    <div className="nh-service-grid">{services.map(item=><article key={item.n}><span className="nh-service-number">{item.n}</span><small>{item.tag}</small><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
   </section>

   <section className="nh-process">
    <div className="nh-section-heading"><span>THE WORKFLOW / FOUR STEPS</span><h2>Every exception has<br/><em>a path to resolution.</em></h2></div>
    <div className="nh-steps">{steps.map((step,i)=><article key={step[0]}><span>0{i+1} / {step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div>
   </section>

   <section className="nh-proof">
    <div className="nh-proof-copy"><span>THE RECURRING VALUE</span><h2>Next month's invoice<br/><em>does not start from zero.</em></h2><p>Keep rate versions, open disputes, provider responses and verified credits together. Each billing period adds to the operating history instead of restarting the investigation.</p><Link to="/methodology">READ THE CONTROL METHOD ↗</Link></div>
    <div className="nh-proof-list">
     <div><b>01</b><span>Contract rules with effective dates</span></div>
     <div><b>02</b><span>Invoice totals and source-line evidence</span></div>
     <div><b>03</b><span>Operational quantity checks where references match</span></div>
     <div><b>04</b><span>Persistent exceptions and provider case history</span></div>
     <div><b>05</b><span>Promised, posted and verified outcomes</span></div>
    </div>
   </section>

   <section className="nh-close">
    <span>NODUS / 3PL BILLING & PERFORMANCE CONTROL</span>
    <h2>Stop reviewing<br/><em>each invoice in isolation.</em></h2>
    <p>Start with your real agreement, a 3PL invoice and the operational activity you can export. The seven-day trial begins only after your workspace is ready.</p>
    <div className="nh-actions nh-actions-center"><Link to="/buyer-evaluation#trial-request" className="nh-primary">REQUEST THE TRIAL ↗</Link><Link to="/pricing" className="nh-secondary">VIEW THE MONTHLY SERVICE ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
