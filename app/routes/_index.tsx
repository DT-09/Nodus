import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {useState} from "react";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Independent fulfilment invoice control"},
 {name:"description",content:"Check 3PL invoices against contracted rates and warehouse activity. Trace every exception to its source."},
 {property:"og:title",content:"NODUS — The invoice is only half the record"},
 {property:"og:description",content:"Independent fulfilment invoice control for Shopify and DTC operators."},
 {name:"theme-color",content:"#11120f"}
];

const checks=[
 {name:"Pick & pack",ref:"PICK / 01",contract:"$2.10",invoice:"$4.20",delta:"+$2.10",status:"RATE VARIANCE",detail:"The billed unit rate is twice the supplied contract rate. Quantity and effective-date checks are still required before treating this as a valid exception."},
 {name:"Storage",ref:"STORAGE / 02",contract:"$84.00",invoice:"$84.00",delta:"$0.00",status:"RATE MATCH",detail:"The billed rate agrees with the supplied rate card. This does not independently verify the stored unit count or storage period."},
 {name:"Receiving",ref:"RECEIVING / 03",contract:"$18.00",invoice:"—",delta:"—",status:"NO INVOICE LINE",detail:"No corresponding invoice line appears in this small sample. Absence is recorded as a source gap, not a saving."}
];

function FulfilmentDrawing(){return <svg className="ndx-drawing" viewBox="0 0 720 520" role="img" aria-label="Technical drawing showing a parcel moving through receiving, storage and pick-pack before charges are reconciled against a contract and invoice">
 <defs><pattern id="ndx-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity=".09" strokeWidth=".7"/></pattern></defs>
 <rect x="16" y="16" width="688" height="488" fill="url(#ndx-grid)" stroke="currentColor" strokeOpacity=".18"/>
 <path d="M72 110H270V238H470V110H646" fill="none" stroke="#c7a977" strokeWidth="1.4"/>
 <path d="M72 110l9 -5v10zM646 110l-9 -5v10z" fill="#c7a977"/>
 <path d="M270 238v142h200V238" fill="none" stroke="currentColor" strokeOpacity=".5" strokeDasharray="4 6"/>
 <g fill="#171914" stroke="#c7a977" strokeWidth="1.2"><rect x="40" y="72" width="64" height="76"/><rect x="238" y="200" width="64" height="76"/><rect x="438" y="72" width="64" height="76"/><rect x="614" y="72" width="64" height="76"/></g>
 <g fill="none" stroke="#c7a977" strokeWidth="1.2"><path d="M40 92l32 18 32-18M72 110v38M238 220l32 18 32-18M270 238v38M438 92l32 18 32-18M470 110v38M614 92l32 18 32-18M646 110v38"/></g>
 <g fill="currentColor" fontFamily="DM Mono,monospace" fontSize="10" letterSpacing="1.2"><text x="40" y="56">01 / RECEIVING</text><text x="238" y="184">02 / STORAGE</text><text x="438" y="56">03 / PICK + PACK</text><text x="614" y="56">04 / BILLING</text></g>
 <g fill="currentColor" fontFamily="DM Mono,monospace" fontSize="9" opacity=".65"><text x="40" y="170">GOODS IN</text><text x="238" y="298">PALLET / BIN</text><text x="438" y="170">ORDER OUT</text><text x="614" y="170">INVOICE</text></g>
 <path d="M72 148V420H646V148" fill="none" stroke="currentColor" strokeOpacity=".3" strokeDasharray="3 7"/>
 <path d="M72 420H646" stroke="#c7a977" strokeWidth="1.4"/>
 <g fill="#c7a977"><circle cx="72" cy="420" r="4"/><circle cx="270" cy="420" r="4"/><circle cx="470" cy="420" r="4"/><circle cx="646" cy="420" r="4"/></g>
 <g fontFamily="DM Mono,monospace" fill="currentColor" fontSize="9"><text x="40" y="450">PHYSICAL EVENT</text><text x="236" y="450">WAREHOUSE RECORD</text><text x="438" y="450">CONTRACT RATE</text><text x="614" y="450" textAnchor="end">BILLED LINE</text></g>
 <g fill="#c7a977" fontFamily="Cormorant Garamond,serif"><text x="360" y="490" textAnchor="middle" fontSize="19">Four records. One traceable charge.</text></g>
 </svg>}

export default function Home(){
 const [selected,setSelected]=useState(0);
 const item=checks[selected];
 return <MarketingShell active="home"><main className="ndx">
  <section className="ndx-hero">
   <div className="ndx-hero-copy">
    <div className="ndx-eyebrow"><span>INDEPENDENT 3PL CONTROL</span><i></i><span>01 — 04</span></div>
    <h1>The invoice<br/>is only half<br/><em>the record.</em></h1>
    <p className="ndx-intro">A warehouse bills for work it says it performed. NODUS checks that bill against the contract and the operational records behind it.</p>
    <div className="ndx-hero-actions"><Link to="/manual-data" className="ndx-primary">Run a review <span>↗</span></Link><Link to="/methodology" className="ndx-text-link">See exactly what is checked <span>↗</span></Link></div>
    <div className="ndx-footline"><span>FOR SHOPIFY + DTC OPERATORS</span><span>CSV INPUT</span><span>NO STORE PASSWORD</span></div>
   </div>
   <div className="ndx-hero-visual"><div className="ndx-visual-meta"><span>FIG. 01</span><span>FULFILMENT → FINANCIAL RECORD</span><span>NOT TO SCALE</span></div><FulfilmentDrawing/><div className="ndx-visual-caption"><span>THE CONTROL GAP</span><p>Movement happens in the warehouse. Charges appear on the invoice. The contract sets the terms. NODUS connects the three.</p></div></div>
  </section>

  <section className="ndx-ledger" aria-labelledby="ndx-ledger-title">
   <div className="ndx-ledger-head"><div><div className="ndx-kicker">A LIVE EXAMPLE / SYNTHETIC DATA</div><h2 id="ndx-ledger-title">Open a charge.<br/><em>Follow the evidence.</em></h2></div><p>Choose a line to see what a review can and cannot establish. This is an illustrative example, not a customer result.</p></div>
   <div className="ndx-inspector">
    <div className="ndx-line-list" role="tablist" aria-label="Sample invoice lines">
     {checks.map((c,i)=><button type="button" role="tab" aria-selected={selected===i} className={"ndx-line"+(selected===i?" is-active":"")} onClick={()=>setSelected(i)} key={c.ref}><span className="ndx-line-index">0{i+1}</span><span className="ndx-line-name">{c.name}</span><span className="ndx-line-ref">{c.ref}</span><span className="ndx-line-arrow">↗</span></button>)}
    </div>
    <div className="ndx-detail" role="tabpanel">
     <div className="ndx-detail-top"><span>{item.ref}</span><span className={selected===0?"ndx-status-warn":"ndx-status"}>{item.status}</span></div>
     <h3>{item.name}</h3>
     <div className="ndx-comparison"><div><span>CONTRACT RATE</span><strong>{item.contract}</strong></div><div className="ndx-compare-mark">/</div><div><span>INVOICE RATE</span><strong>{item.invoice}</strong></div><div className="ndx-delta"><span>DIFFERENCE</span><strong>{item.delta}</strong></div></div>
     <p>{item.detail}</p>
     <div className="ndx-detail-rule"><span>REVIEW STANDARD</span><span>COMPARE · TRACE · QUALIFY</span></div>
    </div>
   </div>
   <div className="ndx-disclaimer">A rate difference is a review signal — not proof of overbilling, provider liability, recoverable cash or realised savings.</div>
  </section>

  <section className="ndx-method">
   <div className="ndx-method-title"><div className="ndx-kicker">THE METHOD</div><h2>Not another<br/><em>analytics dashboard.</em></h2><p>It is a control procedure for the point where warehouse activity becomes a payable bill.</p></div>
   <div className="ndx-method-steps">
    <article><span>01</span><div><h3>Establish the terms</h3><p>Load the effective rate card, minimums and accessorial rules. Keep the source and date visible.</p></div></article>
    <article><span>02</span><div><h3>Trace the charge</h3><p>Match invoice lines to rates and available activity references. Ambiguous joins remain unresolved.</p></div></article>
    <article><span>03</span><div><h3>Record the exception</h3><p>Export the variance, calculation, source rows and exact question to put to the warehouse.</p></div></article>
   </div>
  </section>

  <section className="ndx-offer">
   <div className="ndx-offer-copy"><div className="ndx-kicker">START WITH ONE BILL</div><h2>One invoice.<br/><em>One clear answer:</em><br/>what needs checking?</h2><p>Use the workspace with your own CSV files. If the data cannot support a defensible comparison, NODUS should say so — not manufacture certainty.</p><Link to="/manual-data" className="ndx-primary">Open the review workspace <span>↗</span></Link></div>
   <div className="ndx-offer-spec"><div className="ndx-spec-head"><span>INPUT SPECIFICATION</span><span>01 / CURRENT</span></div><div><span>RATE CARD</span><b>CSV</b></div><div><span>3PL INVOICE</span><b>CSV</b></div><div><span>ACTIVITY EXPORT</span><b>CSV / WHEN AVAILABLE</b></div><div><span>FILE LIMIT</span><b>5 MB · 20,000 ROWS</b></div><div><span>CONNECTIONS</span><b>NO LIVE 3PL API POLLING</b></div><p>Files are processed in the browser workflow. Review the <Link to="/security">security notes</Link> before uploading sensitive records.</p></div>
  </section>

  <section className="ndx-close"><div><span className="ndx-kicker">NODUS / FULFILMENT COST CONTROL</span><h2>Make every charge<br/><em>show its working.</em></h2></div><div><Link to="/manual-data" className="ndx-primary">Start with your own data <span>↗</span></Link><Link to="/methodology" className="ndx-text-link">Read the matching rules ↗</Link></div></section>
 </main></MarketingShell>;
}
