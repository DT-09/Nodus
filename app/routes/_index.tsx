import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Shipping economics intelligence for Shopify"},
 {name:"description",content:"Reconcile Shopify shipping revenue with carrier and 3PL invoices. Investigate unmatched charges, replay shipping policies and export an evidence-backed decision pack."},
 {property:"og:title",content:"NODUS — Shipping economics intelligence"},
 {property:"og:description",content:"A working review system for Shopify shipping revenue, carrier costs and evidence."},
 {name:"theme-color",content:"#17131c"},
];

const services=[
 {n:"01",title:"Reconcile the money",tag:"ORDER ↔ INVOICE",body:"Match shipping collected on each order to carrier and 3PL charges. Keep exact references, currencies and source records attached to every result."},
 {n:"02",title:"Expose the exceptions",tag:"INVESTIGATION QUEUE",body:"Separate unmatched charges, ambiguous references, currency mismatches, incomplete coverage and orders where evidenced shipping cost exceeds shipping collected."},
 {n:"03",title:"Model shipping policy",tag:"HISTORICAL REPLAY",body:"Replay a proposed flat rate and free-shipping threshold against historical order baskets when order subtotal is present. See the revenue difference without pretending to forecast demand."},
 {n:"04",title:"Keep a decision record",tag:"EVIDENCE PACK",body:"Save period summaries locally and export the review register and structured decision pack for finance, operations and carrier follow-up."},
];

const steps=[
 ["IMPORT","Bring the records","Load Shopify order data and carrier or 3PL invoice lines."],
 ["MATCH","Connect the evidence","Use supported order and tracking references; ambiguous records remain unresolved."],
 ["REVIEW","Investigate what matters","Check coverage, inspect carrier spend and review negative shipping balances only when coverage is attested."],
 ["DECIDE","Export the record","Download the evidence register and decision pack. Keep assumptions and limitations with the result."],
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nodus-home">
   <section className="nh-hero" data-reveal>
    <div className="nh-copy">
     <p className="nh-eyebrow"><span></span> SHIPPING ECONOMICS INTELLIGENCE / SHOPIFY</p>
     <h1>The economics<br/>behind every<br/><em>shipment.</em></h1>
     <p className="nh-lede">NODUS connects Shopify shipping revenue with carrier and 3PL invoice records. It shows what is matched, what remains unresolved, and where evidenced delivery costs exceed what the customer paid for shipping.</p>
     <div className="nh-actions">
      <Link to="/manual-data" className="nh-primary">RUN THE FREE REVIEW <span>↗</span></Link>
      <Link to="/demo" className="nh-secondary">INSPECT A DECISION PACK ↗</Link>
     </div>
     <div className="nh-meta"><span>ORDER-LEVEL RECONCILIATION</span><i></i><span>CARRIER COST INTELLIGENCE</span><i></i><span>LOCAL FILE PROCESSING</span></div>
    </div>
    <div className="nh-product">
     <div className="nh-product-top"><div className="nh-product-brand"><div><b>NODUS</b><small>SHIPPING CONTROL DESK</small></div></div><span className="nh-product-state">WORKFLOW / READY</span></div>
     <div className="nh-product-title"><span>01 / EVIDENCE WORKSPACE</span><h2>One view of<br/><em>shipping economics.</em></h2></div>
     <div className="nh-sources">
      <article><span>01 / SOURCE</span><b>Shopify orders</b><small>Order value · shipping collected · tax treatment</small><strong>ORDER RECORDS</strong></article>
      <div className="nh-connector"><span></span><b>+</b><span></span></div>
      <article><span>02 / SOURCE</span><b>Carrier invoices</b><small>Invoice lines · billed cost · order references</small><strong>COST EVIDENCE</strong></article>
     </div>
     <div className="nh-engine"><span className="nh-engine-mark" aria-hidden="true">N</span><div><b>Deterministic matching engine</b><small>Reference · tracking · currency · coverage</small></div><span className="nh-engine-arrow">↗</span></div>
     <div className="nh-output">
      <div><span>MATCHED</span><b>Source-linked</b></div>
      <div><span>UNMATCHED</span><b>Needs review</b></div>
      <div><span>COVERAGE</span><b>Explicit status</b></div>
     </div>
     <div className="nh-ledger-preview" aria-label="Illustrative order and carrier evidence preview"><div className="nh-ledger-head"><span>ILLUSTRATIVE RECORD VIEW</span><span>ORDER / COST / LINK</span></div><div className="nh-ledger-row"><span>Order reference</span><b>Carrier charge</b><em>Linked</em></div><div className="nh-ledger-row"><span>Tracking reference</span><b>Invoice line</b><em>Review</em></div><div className="nh-ledger-row"><span>Currency check</span><b>Source record</b><em>Verified</em></div></div>
     <p className="nh-product-note">ILLUSTRATIVE INTERFACE · NOT MERCHANT DATA</p>
    </div>
   </section>

   <section className="nh-statement" data-reveal>
    <div><span>THE PROBLEM</span><h2>Shipping revenue and delivery cost live in different systems.<br/><em>NODUS brings the evidence together.</em></h2></div>
    <p>Most shipping reports show averages. NODUS works at the order and invoice-line level, so operators can see which records support a conclusion—and which do not.</p>
   </section>

   <section className="nh-services" data-reveal>
    <div className="nh-section-heading"><span>THE PRODUCT / FOUR OPERATING SERVICES</span><h2>From raw records<br/><em>to controlled decisions.</em></h2></div>
    <div className="nh-service-grid">{services.map(item=><article key={item.n}><span className="nh-service-number">{item.n}</span><small>{item.tag}</small><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
   </section>

   <section className="nh-process" data-reveal>
    <div className="nh-section-heading"><span>THE WORKFLOW / FOUR STEPS</span><h2>Every result has<br/><em>a traceable path.</em></h2></div>
    <div className="nh-steps">{steps.map((step,i)=><article key={step[0]}><span>0{i+1} / {step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div>
   </section>

   <section className="nh-proof" data-reveal>
    <div className="nh-proof-copy"><span>THE OUTPUT</span><h2>A decision pack<br/><em>your team can inspect.</em></h2><p>Every review can produce a CSV register and a structured JSON decision pack. The output preserves order references, matched charge records, unresolved items, currency boundaries and calculation limits.</p><Link to="/demo">OPEN THE SAMPLE REPORT ↗</Link></div>
    <div className="nh-proof-list">
     <div><b>01</b><span>Matched and unmatched cost evidence</span></div>
     <div><b>02</b><span>Carrier and cost-type spend breakdowns</span></div>
     <div><b>03</b><span>Coverage-aware shipping balance</span></div>
     <div><b>04</b><span>Historical shipping-policy replay</span></div>
     <div><b>05</b><span>Exportable review register and decision pack</span></div>
    </div>
   </section>

   <section className="nh-close" data-reveal>
    <span>NODUS / SHIPPING ECONOMICS</span>
    <h2>See the evidence.<br/><em>Then decide.</em></h2>
    <p>Start with a free review using your own supported CSV exports. Files are processed in your browser and are not uploaded to NODUS.</p>
    <div className="nh-actions nh-actions-center"><Link to="/manual-data" className="nh-primary">OPEN THE FREE WORKSPACE ↗</Link><Link to="/pricing" className="nh-secondary">VIEW COMMERCIAL OFFER ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
