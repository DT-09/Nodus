import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS — The operating intelligence for your business"},
  {name:"description",content:"Understand your business, find what needs attention, and turn evidence into controlled action. NODUS is building an autonomous business operating system for Shopify merchants."},
  {property:"og:title",content:"NODUS — Your business, understood and advanced"},
  {property:"og:description",content:"One connected operating system for business intelligence, diagnosis, strategy and execution."},
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
     <p className="nd-eyebrow"><span></span> BUSINESS OPERATING INTELLIGENCE / NODUS</p>
     <h1>Your business.<br/><em>Understood.</em><br/>Advanced.</h1>
     <p className="nd-lede">A business should not need a dozen disconnected tools to understand itself. NODUS is being built to connect the signals, diagnose what matters, shape the next move and carry approved work through to verified outcomes.</p>
     <div className="nd-actions">
      <Link to="/pricing" className="nd-button nd-button-primary">START A FOUNDING ASSESSMENT <span>↗</span></Link>
      <Link to="/product" className="nd-button nd-button-quiet">EXPLORE THE SYSTEM <span>↗</span></Link>
     </div>
     <div className="nd-proofline"><span>ONE BUSINESS MODEL</span><i></i><span>TRACEABLE DECISIONS</span><i></i><span>CONTROLLED EXECUTION</span></div>
    </div>
    <div className="nd-orbit-stage" aria-label="Abstract NODUS business intelligence network illustration">
     <div className="nd-orbit nd-orbit-a"></div><div className="nd-orbit nd-orbit-b"></div><div className="nd-orbit nd-orbit-c"></div>
     <div className="nd-orbit-core"><div className="nd-core-mark"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M50 10 86 34 73 78 50 90 14 66 14 34 50 10Z"/><path d="m14 34 36 21 36-21M50 55v35M27 73l23-18 23 18M27 26l23 29 23-29"/></g><g fill="currentColor"><circle cx="50" cy="10" r="4"/><circle cx="86" cy="34" r="4"/><circle cx="73" cy="78" r="4"/><circle cx="50" cy="90" r="4"/><circle cx="14" cy="66" r="4"/><circle cx="14" cy="34" r="4"/></g></svg></div><span>NODUS</span><small>BUSINESS INTELLIGENCE</small></div>
     <div className="nd-orbit-label nd-label-one"><b>01</b><span>FINANCE</span></div><div className="nd-orbit-label nd-label-two"><b>02</b><span>OPERATIONS</span></div><div className="nd-orbit-label nd-label-three"><b>03</b><span>GROWTH</span></div><div className="nd-orbit-label nd-label-four"><b>04</b><span>STRATEGY</span></div>
     <div className="nd-orbit-caption">ONE CONNECTED BUSINESS MODEL <span>·</span> MANY SPECIALIST ENGINES</div>
    </div>
   </section>

   <section className="nd-manifesto">
    <div><span className="nd-index">01 / THE IDEA</span><h2>Not another dashboard.<br/><em>A system that moves work forward.</em></h2></div>
    <p>Dashboards report what happened. NODUS is designed to understand why it happened, decide what deserves attention, prepare the work and verify whether the business improved. Every conclusion must remain tied to its evidence.</p>
   </section>

   <section className="nd-command" id="platform">
    <div className="nd-section-head"><div><span className="nd-index">02 / THE OPERATING SYSTEM</span><h2>One business.<br/><em>One connected intelligence.</em></h2></div><p>Specialist capabilities share one business model, one objective system and one controlled execution layer. No isolated module guessing at the rest of the company.</p></div>
    <div className="nd-domain-grid">{domains.map(([n,title,desc,tag])=><article key={n}><span className="nd-domain-no">{n}</span><div className="nd-domain-glyph"><i></i><i></i><i></i></div><h3>{title}</h3><p>{desc}</p><small>{tag}</small></article>)}</div>
    <div className="nd-domain-foot"><span>THE ARCHITECTURE EXTENDS BEYOND THESE FIRST DOMAINS</span><Link to="/product">VIEW PRODUCT ARCHITECTURE ↗</Link></div>
   </section>

   <section className="nd-loop">
    <div className="nd-section-head"><div><span className="nd-index">03 / THE OPERATING LOOP</span><h2>From signal<br/><em>to measurable outcome.</em></h2></div><p>NODUS should not stop at a recommendation. It should carry a bounded objective through evidence, planning, authorised action and verification.</p></div>
    <div className="nd-loop-grid">{loop.map(([step,title,desc],i)=><article key={step}><div className="nd-loop-top"><span>0{i+1}</span><i>{i===5?"↻":"→"}</i></div><small>{step}</small><h3>{title}</h3><p>{desc}</p></article>)}</div>
    <div className="nd-loop-note"><span className="nd-loop-pulse"></span> CONTINUOUS MONITORING · HUMAN AUTHORITY PRESERVED · OUTCOMES RECORDED</div>
   </section>

   <section className="nd-console">
    <div className="nd-console-copy"><span className="nd-index">04 / THE COMMAND CENTRE</span><h2>See the whole business.<br/><em>Know what happens next.</em></h2><p>The intended workspace is an operating command centre: current business state, important changes, diagnosed issues, ranked opportunities, work in progress and decisions that need the owner's authority.</p><ul><li>What changed, and why?</li><li>Where is value leaking or opportunity being missed?</li><li>What is NODUS investigating or preparing?</li><li>What needs approval, and what was verified?</li></ul><Link to="/demo" className="nd-text-link">INSPECT THE CURRENT EVIDENCE WALKTHROUGH ↗</Link></div>
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
    <div className="nd-section-head"><div><span className="nd-index">05 / WHAT EXISTS TODAY</span><h2>Ambition is not<br/><em>a release note.</em></h2></div><p>We will not pretend every division is already autonomous. The first working product wedge is Shopify shipping economics. The wider operating system is the architecture being built around it.</p></div>
    <div className="nd-release-grid">
     <article className="nd-release-live"><span className="nd-release-status">CURRENT IMPLEMENTATION</span><h3>Shipping economics intelligence</h3><p>Working repository capabilities include Shopify order ingestion, carrier-cost CSV imports, evidence review, deterministic reconciliation, diagnostics, historical shipping-policy replay, exports and an economic value ledger.</p><ul><li>Shopify order data sync</li><li>Carrier-cost CSV evidence intake</li><li>Reviewable reconciliation and decision packs</li><li>Historical policy scenarios</li></ul><Link to="/shipping-cost-reconciliation">EXPLORE THE LIVE PRODUCT WEDGE ↗</Link></article>
     <article className="nd-release-next"><span className="nd-release-status">SYSTEM EXPANSION</span><h3>The wider NODUS operating system</h3><p>Finance, marketing, customers, inventory, strategy, workflow execution and cross-business diagnosis require additional integrations, engines, permissions and verification. They are not represented here as completed features.</p><ul><li>Unified business state and knowledge graph</li><li>Specialist analysis and diagnosis engines</li><li>Objective planning and durable execution</li><li>Permissioned actions and outcome learning</li></ul><Link to="/product">READ THE ARCHITECTURE & BOUNDARIES ↗</Link></article>
    </div>
   </section>

   <section className="nd-trust">
    <div className="nd-trust-intro"><span className="nd-index">06 / THE TRUST CONTRACT</span><h2>Control is not<br/><em>an afterthought.</em></h2><p>Business software earns authority by being inspectable, predictable and honest about its limits.</p></div>
    <div className="nd-trust-grid"><article><b>01</b><h3>Evidence provenance</h3><p>Source, freshness, calculation and uncertainty remain visible.</p></article><article><b>02</b><h3>Tenant boundaries</h3><p>Merchant records and permissions must remain isolated.</p></article><article><b>03</b><h3>Approval by impact</h3><p>Consequential external changes require explicit authority.</p></article><article><b>04</b><h3>Verified execution</h3><p>A request is not success. External state must be checked.</p></article></div>
    <div className="nd-trust-links"><Link to="/security">SECURITY & DATA HANDLING ↗</Link><Link to="/privacy">PRIVACY NOTICE ↗</Link><Link to="/methodology">METHOD & LIMITATIONS ↗</Link></div>
   </section>

   <section className="nd-commercial">
    <div className="nd-commercial-copy"><span className="nd-index">07 / THE FOUNDING MERCHANT PROGRAMME</span><h2>Prove the value.<br/><em>Then decide to pay.</em></h2><p>Start with a scoped assessment of one Shopify store and the supported data it can provide. Receive a traceable evidence review, exception register and decision pack. An ongoing paid engagement is discussed only if the work reveals a credible recurring need.</p><div className="nd-actions"><Link to="/pricing" className="nd-button nd-button-primary">REQUEST AN ASSESSMENT ↗</Link><Link to="/buyer-evaluation" className="nd-button nd-button-quiet">CHECK MERCHANT FIT ↗</Link></div></div>
    <div className="nd-commercial-aside"><span>NO FABRICATED RESULTS</span><b>01</b><p>One defined store and data scope.</p><b>02</b><p>Findings tied to actual source records.</p><b>03</b><p>Clear limits and human review.</p><b>04</b><p>Recurring pricing only after value is established.</p></div>
   </section>

   <section className="nd-final">
    <div className="nd-final-mark"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M50 10 86 34 73 78 50 90 14 66 14 34 50 10Z"/><path d="m14 34 36 21 36-21M50 55v35M27 73l23-18 23 18M27 26l23 29 23-29"/></g><g fill="currentColor"><circle cx="50" cy="10" r="4"/><circle cx="86" cy="34" r="4"/><circle cx="73" cy="78" r="4"/><circle cx="50" cy="90" r="4"/><circle cx="14" cy="66" r="4"/><circle cx="14" cy="34" r="4"/></g></svg></div>
    <span className="nd-index">NODUS / THE NEXT OPERATING LAYER</span><h2>Understand everything.<br/><em>Operate intelligently.</em></h2><p>Begin with the business data you have. Build from evidence. Expand only where the product can deliver and verify real work.</p><div className="nd-actions"><Link to="/pricing" className="nd-button nd-button-primary">BEGIN A FOUNDING ASSESSMENT ↗</Link><Link to="/install" className="nd-button nd-button-quiet">INSTALL THE NODUS APP ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
