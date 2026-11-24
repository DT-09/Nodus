import {useState} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Shipping margin, in view"},
 {name:"description",content:"See what Shopify customers paid for shipping beside the carrier and 3PL costs attached to those orders. Match the evidence, review exceptions and test shipping policies."},
 {property:"og:title",content:"NODUS — Shipping cost control"},
 {property:"og:description",content:"A practical shipping-cost review for Shopify merchants."},
 {name:"theme-color",content:"#191a17"}
];

const orders=[
 {id:"#1042",route:"EWR → BOS",collected:"$8.00",cost:"$7.20",delta:"+$0.80",state:"MATCHED",kind:"good"},
 {id:"#1043",route:"LAX → SFO",collected:"$6.00",cost:"$9.40",delta:"−$3.40",state:"OVER",kind:"warn"},
 {id:"#1044",route:"AUS → DAL",collected:"$0.00",cost:"—",delta:"—",state:"NO COST",kind:"muted"},
 {id:"#1045",route:"ORD → NYC",collected:"$12.00",cost:"$10.30",delta:"+$1.70",state:"MATCHED",kind:"good"}
];

function RouteIllustration(){return <svg className="nd-route-art" viewBox="0 0 520 360" fill="none" aria-label="Illustration of parcel routes and cost records"><defs><linearGradient id="nd-route-gold" x1="50" y1="30" x2="430" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#D8C39D"/><stop offset="1" stopColor="#89907B"/></linearGradient><radialGradient id="nd-route-glow"><stop stopColor="#C5A978" stopOpacity=".24"/><stop offset="1" stopColor="#C5A978" stopOpacity="0"/></radialGradient></defs><circle cx="260" cy="180" r="145" fill="url(#nd-route-glow)"/><circle cx="260" cy="180" r="135" stroke="#D8C39D" strokeOpacity=".18"/><circle cx="260" cy="180" r="100" stroke="#D8C39D" strokeOpacity=".12" strokeDasharray="3 8"/><path d="M70 95C130 40 190 70 260 180S390 300 450 245" stroke="url(#nd-route-gold)" strokeWidth="1.4" strokeDasharray="5 7"/><path d="M80 270C160 315 190 255 260 180S365 60 440 82" stroke="#D8C39D" strokeOpacity=".5" strokeWidth="1.2"/><path d="M70 95L80 270M450 245L440 82" stroke="#D8C39D" strokeOpacity=".18"/><g fill="#191A17" stroke="#D8C39D"><circle cx="70" cy="95" r="5"/><circle cx="80" cy="270" r="5"/><circle cx="450" cy="245" r="5"/><circle cx="440" cy="82" r="5"/></g><circle cx="260" cy="180" r="31" fill="#25251F" stroke="#D8C39D" strokeOpacity=".75"/><path d="M247 180h26M260 167v26" stroke="#D8C39D" strokeWidth="1.2"/><g fill="#BDB29F" fontFamily="monospace" fontSize="9" letterSpacing="1.4"><text x="35" y="78">SHOPIFY</text><text x="32" y="293">ORDER DATA</text><text x="395" y="267">CARRIER</text><text x="406" y="65">3PL COST</text></g><g fill="#D8C39D"><circle cx="165" cy="105" r="2.5"/><circle cx="350" cy="254" r="2.5"/><circle cx="350" cy="105" r="2.5"/></g></svg>}

export default function Home(){
 const [view,setView]=useState<"orders"|"exceptions"|"coverage">("orders");
 const visible=view==="orders"?orders:view==="exceptions"?orders.filter(o=>o.kind!=="good") : orders.filter(o=>o.kind!=="muted");
 return <MarketingShell active="home"><main className="nd-home">
  <section className="nd-hero">
   <div className="nd-hero-copy">
    <div className="nd-kicker"><i/> SHIPPING COST CONTROL / SHOPIFY</div>
    <h1>Shipping revenue<br/>is not the <em>shipping margin.</em></h1>
    <p className="nd-hero-lede">Your store records what customers paid. Your carrier records what delivery cost. NODUS puts those records side by side — order by order — so the gaps stop hiding in separate exports.</p>
    <div className="nd-hero-actions"><Link to="/control-week" className="nd-button nd-button-primary">Start the free week <span>↗</span></Link><Link to="/demo" className="nd-text-link">Explore the sample review <span>↗</span></Link></div>
    <div className="nd-trustline"><span>NO SHOPIFY PASSWORD</span><b>·</b><span>CSV FILES STAY IN YOUR BROWSER</span><b>·</b><span>NO CARD REQUIRED</span></div>
   </div>
   <div className="nd-hero-visual">
    <div className="nd-visual-caption"><span>THE SHIPPING LEDGER</span><span>LIVE PRODUCT PREVIEW / SYNTHETIC DATA</span></div>
    <RouteIllustration/>
    <div className="nd-floating-note nd-note-top"><span className="nd-note-dot"/> COSTS, CONNECTED TO ORDERS</div>
    <div className="nd-floating-note nd-note-bottom">UNMATCHED CHARGES STAY VISIBLE <b>↗</b></div>
   </div>
  </section>
  <section className="nd-workbench" aria-label="Interactive sample shipping review">
   <div className="nd-workbench-head"><div><span className="nd-overline">INSIDE NODUS / SAMPLE WORKSPACE</span><h2>One view. Four orders.<br/><em>No guessed numbers.</em></h2></div><div className="nd-sample-stamp"><i/> SYNTHETIC DATA <span>USD</span></div></div>
   <div className="nd-workbench-body">
    <div className="nd-metrics">
     <div><span>SHIPPING COLLECTED</span><strong>$26.00</strong><small>4 orders in sample</small></div>
     <div><span>MATCHED CARRIER COST</span><strong>$26.90</strong><small>3 orders with evidence</small></div>
     <div><span>SUPPORTED BALANCE</span><strong className="nd-negative">−$0.90</strong><small>Matched orders only</small></div>
     <div><span>UNMATCHED CHARGE</span><strong>$14.60</strong><small>Held outside order totals</small></div>
    </div>
    <div className="nd-ledger">
     <div className="nd-ledger-top"><div><span className="nd-overline">ORDER-LEVEL REVIEW</span><h3>Shipping ledger</h3></div><div className="nd-view-tabs" role="group" aria-label="Choose ledger view"><button className={view==="orders"?"active":""} onClick={()=>setView("orders")}>All orders</button><button className={view==="exceptions"?"active":""} onClick={()=>setView("exceptions")}>Exceptions</button><button className={view==="coverage"?"active":""} onClick={()=>setView("coverage")}>Matched</button></div></div>
     <div className="nd-ledger-table"><div className="nd-ledger-labels"><span>ORDER / ROUTE</span><span>COLLECTED</span><span>CARRIER COST</span><span>BALANCE</span><span>STATUS</span></div>
      {visible.map(o=><div className="nd-ledger-row" key={o.id}><div><b>{o.id}</b><small>{o.route}</small></div><span>{o.collected}</span><span>{o.cost}</span><strong className={o.kind==="warn"?"nd-negative":o.kind==="muted"?"nd-dim":""}>{o.delta}</strong><i className={"nd-state nd-state-"+o.kind}>{o.state}</i></div>)}
     </div>
     <div className="nd-ledger-foot"><span>4 SAMPLE ORDERS · 3 SUPPORTED COST MATCHES · 1 INCOMPLETE ORDER</span><Link to="/demo">Inspect every source row ↗</Link></div>
    </div>
   </div>
   <div className="nd-workbench-footer"><span>EXAMPLE DATA ONLY — NOT A MERCHANT RESULT</span><span>Missing cost evidence is never treated as zero.</span></div>
  </section>
  <section className="nd-friction">
   <div className="nd-friction-art"><RouteIllustration/><div className="nd-art-label">01 / TWO SOURCES<br/>ONE SHIPPING DECISION</div></div>
   <div className="nd-friction-copy"><span className="nd-overline">THE REASON THIS EXISTS</span><h2>Two exports.<br/>One expensive blind spot.</h2><p>Shipping charges are scattered across order exports, carrier invoices and 3PL statements. Split parcels, adjustments and missing references make the headline totals hard to trust.</p><p>NODUS matches only what the records support. The rest stays in an exception list for a person to review.</p><Link to="/methodology" className="nd-text-link">See the matching rules ↗</Link></div>
  </section>
  <section className="nd-capabilities">
   <div className="nd-section-head"><div><span className="nd-overline">A WORKING SHIPPING REVIEW</span><h2>From export files<br/>to <em>clear next steps.</em></h2></div><p>Use the same review each time a new carrier invoice arrives. Keep the evidence, not just the headline number.</p></div>
   <div className="nd-capability-grid">
    <article><span>01</span><div className="nd-cap-icon">↔</div><h3>Match the charges</h3><p>Connect order references and unique tracking numbers to carrier cost lines.</p><small>ORDER ↔ COST RECORD</small></article>
    <article><span>02</span><div className="nd-cap-icon">⌁</div><h3>Surface exceptions</h3><p>See unmatched charges, incomplete coverage and orders where delivery costs more than shipping collected.</p><small>EXCEPTIONS, NOT ASSUMPTIONS</small></article>
    <article><span>03</span><div className="nd-cap-icon">◫</div><h3>Test shipping rules</h3><p>Replay flat-rate and free-shipping thresholds against the historical orders you supply.</p><small>HISTORICAL POLICY REPLAY</small></article>
    <article><span>04</span><div className="nd-cap-icon">↗</div><h3>Keep the evidence</h3><p>Export the review register and decision pack for your operations or finance records.</p><small>PORTABLE REVIEW PACK</small></article>
   </div>
  </section>
  <section className="nd-week-banner">
   <div className="nd-week-copy"><span className="nd-overline">THE FREE 7-DAY CONTROL WEEK</span><h2>Bring last month's<br/><em>shipping bill.</em></h2><p>Over seven days, work through a real shipping review: sample first, your own files next, then exceptions, policy tests and a decision on whether monthly control is worth paying for.</p><Link to="/control-week" className="nd-button nd-button-primary">Enter the free week ↗</Link></div>
   <div className="nd-week-visual"><div className="nd-week-orbit nd-orbit-a"/><div className="nd-week-orbit nd-orbit-b"/><div className="nd-week-center"><img src={NODUS_MARK} alt="NODUS mark"/><b>7</b><small>DAYS OF CONTROL</small></div><div className="nd-week-day nd-week-day-1">01 <span>SEE</span></div><div className="nd-week-day nd-week-day-2">02 <span>IMPORT</span></div><div className="nd-week-day nd-week-day-3">03 <span>MATCH</span></div><div className="nd-week-day nd-week-day-4">04 <span>REVIEW</span></div><div className="nd-week-day nd-week-day-5">05 <span>TEST</span></div><div className="nd-week-day nd-week-day-6">06 <span>EXPORT</span></div><div className="nd-week-day nd-week-day-7">07 <span>DECIDE</span></div></div>
  </section>
  <section className="nd-final">
   <span className="nd-overline">NODUS / SHIPPING COST CONTROL</span><h2>Know what delivery<br/><em>is taking out.</em></h2><p>Start with a sample. Then use your own exports. The review should earn a place in your monthly process before it earns a place in your budget.</p><div className="nd-hero-actions"><Link to="/control-week" className="nd-button nd-button-primary">Start free — no card required ↗</Link><Link to="/pricing" className="nd-text-link">View the proposed monthly plan ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
