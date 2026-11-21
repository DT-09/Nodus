import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS — Shopify shipping cost reconciliation"},
  {name:"description",content:"Reconcile Shopify shipping revenue with carrier and 3PL cost records. Inspect matched charges, unresolved exceptions and evidence coverage."},
  {property:"og:title",content:"NODUS — Make shipping costs inspectable"},
  {property:"og:description",content:"Evidence-led shipping cost reconciliation for Shopify merchants."},
  {name:"theme-color",content:"#17151d"},
];

const domains=[
 ["01","Shipping revenue","Order-level shipping charges, discounts, refunds and currency treatment","ORDER ECONOMICS"],
 ["02","Carrier costs","Carrier, label and 3PL charges tied to source records","COST EVIDENCE"],
 ["03","Order matching","Reference and tracking-based reconciliation with explicit match rules","DETERMINISTIC MATCHING"],
 ["04","Exceptions","Unmatched charges, incomplete records and ambiguous references","REVIEW QUEUE"],
 ["05","Currency controls","Keep amounts separated by their source currency during reconciliation","CURRENCY HANDLING"],
 ["06","Review exports","Download the CSV register and JSON decision pack","DOWNLOADABLE OUTPUTS"],
];

const loop=[
 ["IMPORT","Load the source records","Bring in the order export and carrier or 3PL cost file."],
 ["VALIDATE","Check the data","Inspect required fields, references, dates, amounts and currency codes."],
 ["MATCH","Link costs to orders","Use supported order references and unique tracking references; preserve ambiguous matches for review."],
 ["CLASSIFY","Separate the exceptions","Distinguish matched, unmatched and incomplete evidence instead of treating missing data as zero."],
 ["REVIEW","Verify the coverage","Inspect source rows and confirm which costs are represented for each order."],
 ["EXPORT","Create the decision record","Download the reconciliation register and reproducible JSON decision pack."],
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nd-home">
   <section className="nd-hero">
    <div className="nd-hero-copy">
     <p className="nd-eyebrow"><span></span> MERCHANT OPERATIONS / FOR SHOPIFY</p>
     <h1>Know what shipping<br/>costs. Find what needs<br/><em>your attention.</em></h1>
     <p className="nd-lede">NODUS compares shipping revenue recorded in Shopify order exports with carrier or 3PL charges supplied by the merchant. It shows what matched, what did not, where evidence is incomplete and which records deserve investigation. No invented savings. No silent assumptions.</p>
     <div className="nd-actions">
      <Link to="/manual-data" className="nd-button nd-button-primary">RUN A SHIPPING REVIEW <span>↗</span></Link>
      <Link to="/demo" className="nd-button nd-button-quiet">INSPECT THE SAMPLE <span>↗</span></Link>
      <Link to="/buyer-evaluation" className="nd-button nd-button-quiet">REQUEST AN EVALUATION <span>↗</span></Link>
     </div>
     <div className="nd-proofline"><span>ORDER-LEVEL REVIEW</span><i></i><span>TRACEABLE EVIDENCE</span><i></i><span>NO ASSUMED SAVINGS</span></div>
    </div>
    <div className="nd-ledger-stage" aria-label="Illustrative NODUS shipping economics review">
     <div className="nd-ledger-top"><span>RECONCILIATION / WORKFLOW 01</span><span className="nd-ledger-status"><i></i> SAMPLE DATA</span></div>
     <div className="nd-ledger-sources"><article><small>01 / ORDER RECORDS</small><strong>Shopify orders</strong><span>Shipping collected</span><b>$8,420.00</b><em>128 order rows</em></article><div className="nd-ledger-join"><span></span><b>+</b><span></span></div><article><small>02 / COST EVIDENCE</small><strong>Carrier & 3PL</strong><span>Imported charges</span><b>$6,985.40</b><em>143 cost rows</em></article></div>
     <div className="nd-ledger-engine"><div className="nd-engine-mark">N</div><div><b>Evidence matching engine</b><small>Reference · tracking · currency · coverage</small></div><span>RECONCILE <i>↗</i></span></div>
     <div className="nd-ledger-results"><article><small>MATCHED</small><b>117</b><span>Order-linked costs</span></article><article><small>UNMATCHED</small><b>11</b><span>Charges to investigate</span></article><article><small>INCOMPLETE</small><b>4</b><span>Coverage needs review</span></article></div>
     <p className="nd-ledger-caption">ILLUSTRATIVE VALUES ONLY · NOT CUSTOMER RESULTS</p>
    </div></section>

   <section className="nd-manifesto">
    <div><span className="nd-index">01 / THE IDEA</span><h2>Shipping costs are easy to overlook.<br/><em>Unclear evidence makes them harder to control.</em></h2></div>
    <p>NODUS brings order-level shipping revenue and carrier-cost records into one review. Each match, exception and calculation remains traceable to its source. The result is a clearer basis for operational decisions—not a promise of automatic savings.</p>
   </section>

   <section className="nd-command" id="platform">
    <div className="nd-section-head"><div><span className="nd-index">02 / THE NODUS METHOD</span><h2>One review.<br/><em>Every charge has a status.</em></h2></div><p>Start with order records and carrier-cost evidence. NODUS matches what it can, isolates what it cannot, and keeps currency and evidence coverage visible throughout the review.</p></div>
    <div className="nd-domain-grid">{domains.map(([n,title,desc,tag])=><article key={n}><span className="nd-domain-no">{n}</span><div className="nd-domain-glyph"><i></i><i></i><i></i></div><h3>{title}</h3><p>{desc}</p><small>{tag}</small></article>)}</div>
    <div className="nd-domain-foot"><span>CURRENT RELEASE: BROWSER-LOCAL CSV ANALYSIS</span><Link to="/product">VIEW PRODUCT ARCHITECTURE ↗</Link></div>
   </section>

   <section className="nd-loop">
    <div className="nd-section-head"><div><span className="nd-index">03 / THE REVIEW PROCESS</span><h2>From source data<br/><em>to a reviewable decision.</em></h2></div><p>A disciplined workflow: import, reconcile, investigate exceptions and export a decision pack. No external store changes are made by this workflow.</p></div>
    <div className="nd-loop-grid">{loop.map(([step,title,desc],i)=><article key={step}><div className="nd-loop-top"><span>0{i+1}</span><i>{i===5?"↻":"→"}</i></div><small>{step}</small><h3>{title}</h3><p>{desc}</p></article>)}</div>
    <div className="nd-loop-note"><span className="nd-loop-pulse"></span> BROWSER-LOCAL ANALYSIS · SOURCE REFERENCES PRESERVED · NO STORE CHANGES</div>
   </section>

   <section className="nd-console">
    <div className="nd-console-copy"><span className="nd-index">04 / THE CSV REVIEW TOOL</span><h2>See the evidence.<br/><em>Know what needs review.</em></h2><p>The current tool reads order and carrier-cost CSV files in your browser. It separates matched costs from unmatched charges and exports a review register and decision pack.</p><ul><li>Which charges matched an order?</li><li>Which charges remain unmatched?</li><li>Where is cost coverage incomplete?</li><li>What should the operations team verify next?</li></ul><Link to="/manual-data" className="nd-text-link">OPEN THE SHIPPING COST WORKSPACE ↗</Link></div>
    <div className="nd-console-art">
     <div className="nd-window-bar"><span>NODUS / CSV REVIEW</span><span className="nd-live-label">SYNTHETIC SAMPLE</span></div>
     <div className="nd-window-title"><div><small>SHIPPING ECONOMICS / SAMPLE DATASET</small><h3>Evidence review</h3></div><span>01 — 06</span></div>
     <div className="nd-window-metrics"><article><small>ORDERS REVIEWED</small><b>128</b><span>Illustrative sample</span></article><article><small>UNMATCHED COSTS</small><b>11</b><span>Require investigation</span></article><article><small>REVIEW STATUS</small><b>4</b><span>Incomplete coverage</span></article></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Order records</b><small>Shipping revenue and order references</small></div><em>IMPORTED</em></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Carrier-cost evidence</b><small>Carrier and fulfilment charge rows</small></div><em>IMPORTED</em></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Decision pack</b><small>Traceable CSV register and JSON export</small></div><em>AVAILABLE</em></div>
     <div className="nd-window-foot">SYNTHETIC SAMPLE · NOT A LIVE MERCHANT ACCOUNT</div>
    </div>
   </section>

   <section className="nd-live">
    <div className="nd-section-head"><div><span className="nd-index">05 / AVAILABLE NOW</span><h2>A useful first release.<br/><em>A larger system ahead.</em></h2></div><p>The current public workflow is the browser-local CSV review. A separate read-only Shopify connection exists in source code but is not yet verified for merchant use. We will not describe it as live until installation, synchronization, privacy handling and end-to-end tests pass.</p></div>
    <div className="nd-release-grid">
     <article className="nd-release-live"><span className="nd-release-status">CURRENT IMPLEMENTATION</span><h3>Shipping economics intelligence</h3><p>The live public workflow accepts order and carrier-cost CSV files, matches supported references, separates currencies, flags unmatched records and exports a review register and decision pack.</p><ul><li>Browser-local order CSV analysis</li><li>Carrier-cost CSV evidence intake</li><li>Reviewable reconciliation and decision packs</li><li>Downloadable CSV and JSON review packs</li></ul><Link to="/manual-data">RUN THE CSV REVIEW ↗</Link></article>
     <article className="nd-release-next"><span className="nd-release-status">SYSTEM EXPANSION</span><h3>The wider NODUS platform</h3><p>Finance, marketing, inventory, customer intelligence and permissioned execution remain planned platform capabilities. They are not part of the current public release.</p><ul><li>Unified business state and knowledge graph</li><li>Specialist analysis and diagnosis engines</li><li>Objective planning and durable execution</li><li>Permissioned actions and outcome learning</li></ul><Link to="/product">READ THE ARCHITECTURE & BOUNDARIES ↗</Link></article>
    </div>
   </section>

   <section className="nd-trust">
    <div className="nd-trust-intro"><span className="nd-index">06 / BUILT FOR CONTROL</span><h2>Your data.<br/><em>Your authority.</em></h2><p>Every finding links back to its source. Your team reviews the evidence and decides what happens next.</p></div>
    <div className="nd-trust-grid"><article><b>01</b><h3>Evidence provenance</h3><p>Source, freshness, calculation and uncertainty remain visible.</p></article><article><b>02</b><h3>Tenant boundaries</h3><p>Merchant records and permissions must remain isolated.</p></article><article><b>03</b><h3>Approval by impact</h3><p>Consequential external changes require explicit authority.</p></article><article><b>04</b><h3>Verified execution</h3><p>A request is not success. External state must be checked.</p></article></div>
    <div className="nd-trust-links"><Link to="/security">SECURITY & DATA HANDLING ↗</Link><Link to="/privacy">PRIVACY NOTICE ↗</Link><Link to="/methodology">METHOD & LIMITATIONS ↗</Link></div>
   </section>

   <section className="nd-commercial">
    <div className="nd-commercial-copy"><span className="nd-index">07 / MERCHANT ASSESSMENT</span><h2>A clear scope.<br/><em>Evidence before commitment.</em></h2><p>There is no active paid subscription or checkout today. Start with the sample workflow, then request a no-fee evaluation of the supported CSV workflow. A recurring plan will be offered only after NODUS proves repeatable value and its billing and support operations are ready.</p><div className="nd-actions"><Link to="/pricing" className="nd-button nd-button-primary">SEE THE EVALUATION OFFER ↗</Link><Link to="/buyer-evaluation" className="nd-button nd-button-quiet">REQUEST AN EVALUATION ↗</Link></div></div>
    <div className="nd-commercial-aside"><span>EVIDENCE OVER PROMISES</span><b>01</b><p>One defined store and data scope.</p><b>02</b><p>Findings tied to actual source records.</p><b>03</b><p>Clear limits and human review.</p><b>04</b><p>Recurring pricing only after value is established.</p></div>
   </section>

   <section className="nd-final">
    <div className="nd-final-mark"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M50 8 84 29 84 71 50 92 16 71 16 29 50 8Z"/><path d="M50 8 50 50 84 71M50 50 16 71M16 29 50 50 84 29M50 50 50 92"/></g><g fill="currentColor"><circle cx="50" cy="8" r="4.2"/><circle cx="84" cy="29" r="4.2"/><circle cx="84" cy="71" r="4.2"/><circle cx="50" cy="92" r="4.2"/><circle cx="16" cy="71" r="4.2"/><circle cx="16" cy="29" r="4.2"/></g></svg></div>
    <span className="nd-index">NODUS / SHIPPING ECONOMICS</span><h2>Shipping economics.<br/><em>Made inspectable.</em></h2><p>Review order and carrier-cost records in a structured workflow. Keep the source evidence, understand the exceptions and decide what deserves attention.</p><div className="nd-actions"><Link to="/manual-data" className="nd-button nd-button-primary">OPEN THE CSV REVIEW ↗</Link><Link to="/demo" className="nd-button nd-button-quiet">INSPECT THE SAMPLE ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
