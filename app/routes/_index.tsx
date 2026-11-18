import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS — Shipping economics for Shopify merchants"},
  {name:"description",content:"Understand shipping revenue, carrier costs and the evidence between them. NODUS helps Shopify merchants review shipping economics with traceable calculations and clear exceptions."},
  {property:"og:title",content:"NODUS — Shipping economics, made inspectable"},
  {property:"og:description",content:"A practical shipping-cost review workflow for Shopify merchants."},
  {name:"theme-color",content:"#17151d"},
];

const domains=[
 ["01","Finance","Margin, cash signals, expenses and financial exposure","FINANCIAL INTELLIGENCE"],
 ["02","Sales & revenue","Demand, pricing, conversion and repeat purchase","REVENUE INTELLIGENCE"],
 ["03","Marketing & growth","Acquisition, retention, campaigns and performance","GROWTH INTELLIGENCE"],
 ["04","Customers","Segments, behaviour, loyalty and customer value","CUSTOMER INTELLIGENCE"],
 ["05","Products & inventory","SKU performance, stock risk and demand planning","PRODUCT INTELLIGENCE"],
 ["06","Supply chain","Suppliers, fulfilment, shipping and returns","OPERATIONS INTELLIGENCE"],
 ["07","Business operations","Workflows, exceptions, tasks and recurring work","OPERATIONAL INTELLIGENCE"],
 ["08","Strategy","Priorities, opportunities and scenario planning","STRATEGIC INTELLIGENCE"],
 ["09","Risk & control","Anomalies, exposure, permissions and audit","RISK INTELLIGENCE"],
];

const loop=[
 ["SENSE","Connect the signals","Bring together the business records and operational events the merchant authorises."],
 ["UNDERSTAND","Build the business picture","Resolve entities, measure performance and preserve source, freshness and confidence."],
 ["INVESTIGATE","Find the real cause","Test explanations against evidence. Separate a verified finding from a plausible hypothesis."],
 ["STRATEGIZE","Choose the intervention","Rank actions by expected impact, confidence, cost, time, risk and feasibility."],
 ["EXECUTE","Put approved work in motion","Prepare and run supported actions within explicit permissions and approval boundaries."],
 ["VERIFY","Check what changed","Read back external state and compare actual outcomes with the intended result."],
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nd-home">
   <section className="nd-hero">
    <div className="nd-hero-copy">
     <p className="nd-eyebrow"><span></span> SHIPPING ECONOMICS / FOR SHOPIFY MERCHANTS</p>
     <h1>Know what<br/>shipping really<br/><em>costs.</em></h1>
     <p className="nd-lede">Compare the shipping revenue recorded in your orders with carrier and fulfilment costs. Find unmatched charges, incomplete evidence and orders that need review—without mistaking missing data for savings.</p>
     <div className="nd-actions">
      <Link to="/pricing" className="nd-button nd-button-primary">RUN A SHIPPING COST REVIEW <span>↗</span></Link>
      <Link to="/product" className="nd-button nd-button-quiet">REQUEST A MERCHANT ASSESSMENT <span>↗</span></Link>
     </div>
     <div className="nd-proofline"><span>ORDER-LEVEL REVIEW</span><i></i><span>TRACEABLE EVIDENCE</span><i></i><span>NO ASSUMED SAVINGS</span></div>
    </div>
    <div className="nd-orbit-stage" aria-label="Abstract NODUS business intelligence network illustration">
     <div className="nd-orbit nd-orbit-a"></div><div className="nd-orbit nd-orbit-b"></div><div className="nd-orbit nd-orbit-c"></div>
     <div className="nd-orbit-core"><div className="nd-core-mark"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M50 8 84 29 84 71 50 92 16 71 16 29 50 8Z"/><path d="M50 8 50 50 84 71M50 50 16 71M16 29 50 50 84 29M50 50 50 92"/></g><g fill="currentColor"><circle cx="50" cy="8" r="4.2"/><circle cx="84" cy="29" r="4.2"/><circle cx="84" cy="71" r="4.2"/><circle cx="50" cy="92" r="4.2"/><circle cx="16" cy="71" r="4.2"/><circle cx="16" cy="29" r="4.2"/></g></svg></div><span>NODUS</span><small>BUSINESS INTELLIGENCE</small></div>
     <div className="nd-orbit-label nd-label-one"><b>01</b><span>FINANCE</span></div><div className="nd-orbit-label nd-label-two"><b>02</b><span>OPERATIONS</span></div><div className="nd-orbit-label nd-label-three"><b>03</b><span>GROWTH</span></div><div className="nd-orbit-label nd-label-four"><b>04</b><span>STRATEGY</span></div>
     <div className="nd-orbit-caption">ONE CONNECTED BUSINESS MODEL <span>·</span> MANY SPECIALIST ENGINES</div>
    </div>
   </section>

   <section className="nd-manifesto">
    <div><span className="nd-index">01 / THE IDEA</span><h2>Shipping costs are easy to overlook.<br/><em>Unclear evidence makes them harder to control.</em></h2></div>
    <p>NODUS brings order-level shipping revenue and carrier-cost records into one review. Each match, exception and calculation remains traceable to its source. The result is a clearer basis for operational decisions—not a promise of automatic savings.</p>
   </section>

   <section className="nd-command" id="platform">
    <div className="nd-section-head"><div><span className="nd-index">02 / THE NODUS METHOD</span><h2>One review.<br/><em>Every charge accounted for.</em></h2></div><p>Start with order records and carrier-cost evidence. NODUS matches what it can, isolates what it cannot, and keeps currency and evidence coverage visible throughout the review.</p></div>
    <div className="nd-domain-grid">{domains.map(([n,title,desc,tag])=><article key={n}><span className="nd-domain-no">{n}</span><div className="nd-domain-glyph"><i></i><i></i><i></i></div><h3>{title}</h3><p>{desc}</p><small>{tag}</small></article>)}</div>
    <div className="nd-domain-foot"><span>THE ARCHITECTURE EXTENDS BEYOND THESE FIRST DOMAINS</span><Link to="/product">VIEW PRODUCT ARCHITECTURE ↗</Link></div>
   </section>

   <section className="nd-loop">
    <div className="nd-section-head"><div><span className="nd-index">03 / THE REVIEW PROCESS</span><h2>From source data<br/><em>to a reviewable decision.</em></h2></div><p>A disciplined workflow: import, reconcile, investigate exceptions and export a decision pack. No external store changes are made by this workflow.</p></div>
    <div className="nd-loop-grid">{loop.map(([step,title,desc],i)=><article key={step}><div className="nd-loop-top"><span>0{i+1}</span><i>{i===5?"↻":"→"}</i></div><small>{step}</small><h3>{title}</h3><p>{desc}</p></article>)}</div>
    <div className="nd-loop-note"><span className="nd-loop-pulse"></span> CONTINUOUS MONITORING · HUMAN AUTHORITY PRESERVED · OUTCOMES RECORDED</div>
   </section>

   <section className="nd-console">
    <div className="nd-console-copy"><span className="nd-index">04 / THE MERCHANT WORKSPACE</span><h2>See the evidence.<br/><em>Know what needs review.</em></h2><p>The current public workflow reviews order and carrier-cost CSV files in the browser. It gives merchants a structured view of matches, unmatched charges, evidence gaps and downloadable review records.</p><ul><li>Which charges matched an order?</li><li>Which charges remain unmatched?</li><li>Where is cost coverage incomplete?</li><li>What should the operations team verify next?</li></ul><Link to="/demo" className="nd-text-link">OPEN THE SHIPPING COST WORKSPACE ↗</Link></div>
    <div className="nd-console-art">
     <div className="nd-window-bar"><span>NODUS / BUSINESS COMMAND</span><span className="nd-live-label">CONCEPT VIEW</span></div>
     <div className="nd-window-title"><div><small>BUSINESS OVERVIEW / ALL SYSTEMS</small><h3>Operating picture</h3></div><span>01 — 06</span></div>
     <div className="nd-window-metrics"><article><small>BUSINESS HEALTH</small><b>—</b><span>Connect data to establish</span></article><article><small>PRIORITY FINDINGS</small><b>—</b><span>Evidence required</span></article><article><small>ACTIVE OBJECTIVES</small><b>—</b><span>Awaiting business context</span></article></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Business state</b><small>Connect authorised data sources</small></div><em>NOT CONNECTED</em></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Diagnosis engine</b><small>Findings require source evidence</small></div><em>STANDBY</em></div>
     <div className="nd-work-row"><span className="nd-work-dot"></span><div><b>Execution control</b><small>Approval-bound actions only</small></div><em>GUARDED</em></div>
     <div className="nd-window-foot">ILLUSTRATIVE PRODUCT DIRECTION · NOT A LIVE MERCHANT ACCOUNT</div>
    </div>
   </section>

   <section className="nd-live">
    <div className="nd-section-head"><div><span className="nd-index">05 / WHAT EXISTS TODAY</span><h2>Ambition is not<br/><em>a release note.</em></h2></div><p>We will not pretend every division is already autonomous. The public release is a browser-based shipping-cost review workflow. Direct Shopify installation and automatic data sync are not yet available.</p></div>
    <div className="nd-release-grid">
     <article className="nd-release-live"><span className="nd-release-status">CURRENT IMPLEMENTATION</span><h3>Shipping economics intelligence</h3><p>The live public workflow accepts order and carrier-cost CSV files, matches supported references, separates currencies, flags unmatched records and exports a review register and decision pack.</p><ul><li>Browser-local order CSV analysis</li><li>Carrier-cost CSV evidence intake</li><li>Reviewable reconciliation and decision packs</li><li>Downloadable CSV and JSON review packs</li></ul><Link to="/shipping-cost-reconciliation">OPEN THE SHIPPING COST WORKSPACE ↗</Link></article>
     <article className="nd-release-next"><span className="nd-release-status">SYSTEM EXPANSION</span><h3>The wider NODUS platform</h3><p>Finance, marketing, inventory, customer intelligence and permissioned execution remain planned platform capabilities. They are not part of the current public release.</p><ul><li>Unified business state and knowledge graph</li><li>Specialist analysis and diagnosis engines</li><li>Objective planning and durable execution</li><li>Permissioned actions and outcome learning</li></ul><Link to="/product">READ THE ARCHITECTURE & BOUNDARIES ↗</Link></article>
    </div>
   </section>

   <section className="nd-trust">
    <div className="nd-trust-intro"><span className="nd-index">06 / THE TRUST CONTRACT</span><h2>Control is not<br/><em>an afterthought.</em></h2><p>Business software earns authority by being inspectable, predictable and honest about its limits.</p></div>
    <div className="nd-trust-grid"><article><b>01</b><h3>Evidence provenance</h3><p>Source, freshness, calculation and uncertainty remain visible.</p></article><article><b>02</b><h3>Tenant boundaries</h3><p>Merchant records and permissions must remain isolated.</p></article><article><b>03</b><h3>Approval by impact</h3><p>Consequential external changes require explicit authority.</p></article><article><b>04</b><h3>Verified execution</h3><p>A request is not success. External state must be checked.</p></article></div>
    <div className="nd-trust-links"><Link to="/security">SECURITY & DATA HANDLING ↗</Link><Link to="/privacy">PRIVACY NOTICE ↗</Link><Link to="/methodology">METHOD & LIMITATIONS ↗</Link></div>
   </section>

   <section className="nd-commercial">
    <div className="nd-commercial-copy"><span className="nd-index">07 / THE FOUNDING MERCHANT PROGRAMME</span><h2>A clear scope.<br/><em>Evidence before commitment.</em></h2><p>Request a no-fee review of whether your store data fits the current workflow. The assessment defines the records, limits and deliverables before any work begins. No savings claim is made without supporting evidence.</p><div className="nd-actions"><Link to="/pricing" className="nd-button nd-button-primary">REQUEST AN ASSESSMENT ↗</Link><Link to="/buyer-evaluation" className="nd-button nd-button-quiet">CHECK MERCHANT FIT ↗</Link></div></div>
    <div className="nd-commercial-aside"><span>NO FABRICATED RESULTS</span><b>01</b><p>One defined store and data scope.</p><b>02</b><p>Findings tied to actual source records.</p><b>03</b><p>Clear limits and human review.</p><b>04</b><p>Recurring pricing only after value is established.</p></div>
   </section>

   <section className="nd-final">
    <div className="nd-final-mark"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M50 8 84 29 84 71 50 92 16 71 16 29 50 8Z"/><path d="M50 8 50 50 84 71M50 50 16 71M16 29 50 50 84 29M50 50 50 92"/></g><g fill="currentColor"><circle cx="50" cy="8" r="4.2"/><circle cx="84" cy="29" r="4.2"/><circle cx="84" cy="71" r="4.2"/><circle cx="50" cy="92" r="4.2"/><circle cx="16" cy="71" r="4.2"/><circle cx="16" cy="29" r="4.2"/></g></svg></div>
    <span className="nd-index">NODUS / THE NEXT OPERATING LAYER</span><h2>Shipping economics.<br/><em>Made inspectable.</em></h2><p>Review order and carrier-cost records in a structured workflow. Keep the source evidence, understand the exceptions and decide what deserves attention.</p><div className="nd-actions"><Link to="/pricing" className="nd-button nd-button-primary">REQUEST A MERCHANT ASSESSMENT ↗</Link><Link to="/install" className="nd-button nd-button-quiet">OPEN THE NODUS WORKSPACE ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
