import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS — 3PL invoice control for Shopify & DTC brands"},
 {name:"description",content:"A practical 3PL invoice review desk for e-commerce brands. Compare warehouse charges with your rate card and activity exports, document exceptions and keep a monthly control record."},
 {property:"og:title",content:"NODUS — Fulfilment costs, checked"},
 {property:"og:description",content:"3PL invoice review and recurring fulfilment-cost control for Shopify and DTC brands."},
 {name:"theme-color",content:"#10110f"}
];

const sample=[
 {id:"INV-2048 / PICK-PACK",rate:"$2.10",billed:"$4.20",result:"CHECK",kind:"warn"},
 {id:"INV-2048 / STORAGE",rate:"$84.00",billed:"$84.00",result:"MATCH",kind:"good"},
 {id:"INV-2048 / RECEIVING",rate:"$18.00",billed:"—",result:"NO SOURCE",kind:"muted"},
 {id:"INV-2048 / MONTHLY MIN.",rate:"$250.00",billed:"$250.00",result:"MATCH",kind:"good"}
];

export default function Home(){
 return <MarketingShell active="home"><main className="nc-page">
  <section className="nc-hero">
   <div>
    <div className="nc-kicker">NODUS / E-COMMERCE FULFILMENT CONTROL</div>
    <h1>Your 3PL invoice should match <em>your contract.</em></h1>
    <p className="nc-lede">NODUS reviews fulfilment charges against the rates and activity your business agreed to. We isolate mismatches, duplicate-looking lines and charges without supporting records — then give your team an evidence register to investigate.</p>
    <div className="nc-actions"><Link to="/buyer-evaluation" className="nc-btn nc-btn-primary">Request a paid invoice review <span>↗</span></Link><Link to="/demo" className="nc-btn nc-btn-secondary">Inspect the working sample <span>↗</span></Link></div>
    <div className="nc-micro"><span>SHOPIFY + DTC BRANDS</span><span>·</span><span>CSV-BASED</span><span>·</span><span>NO STORE PASSWORD</span></div>
   </div>
   <div className="nc-console">
    <div className="nc-console-top"><span className="nc-console-title">NODUS / RATE-CARD REVIEW</span><span className="nc-live">SAMPLE DATA</span></div>
    <div className="nc-stat-grid">
     <div className="nc-stat"><span>Invoice lines checked</span><strong>04</strong><small>Illustrative sample</small></div>
     <div className="nc-stat"><span>Rate mismatches</span><strong>01</strong><small>Needs source review</small></div>
     <div className="nc-stat"><span>Supported matches</span><strong>02</strong><small>Rate and unit agree</small></div>
     <div className="nc-stat"><span>Evidence gaps</span><strong>01</strong><small>Not treated as an error</small></div>
    </div>
    <div className="nc-table">
     <div className="nc-table-head"><span>INVOICE LINE</span><span>CONTRACT</span><span>BILLED</span><span>STATUS</span></div>
     {sample.map(row=><div className="nc-table-row" key={row.id}><span>{row.id}</span><span>{row.rate}</span><span>{row.billed}</span><strong className={row.kind==="warn"?"nc-warn":""}>{row.result}</strong></div>)}
    </div>
    <div className="nc-footnote">SYNTHETIC EXAMPLE — NOT A CUSTOMER RESULT. A variance is a review signal, not proof of overbilling or money recovered.</div>
   </div>
  </section>

  <section className="nc-section">
   <div className="nc-section-head"><div><div className="nc-overline">THE FIRST PAID ENGAGEMENT</div><h2>Start with one invoice.<br/><em>Find out what deserves attention.</em></h2></div><p>For e-commerce operators who use a third-party warehouse and want an independent check before the next payment or contract review.</p></div>
   <div className="nc-service-grid">
    <article className="nc-service"><span className="nc-number">01 / RATE CHECK</span><h3>Contract vs. invoice</h3><p>Compare billed storage, pick-and-pack, receiving, returns, minimums and agreed accessorials with the effective rate card you provide.</p><small>DELIVERABLE / LINE-BY-LINE CHECK</small></article>
    <article className="nc-service"><span className="nc-number">02 / ACTIVITY CHECK</span><h3>Charges vs. records</h3><p>Where stable references exist, compare invoice quantities with warehouse or order activity. Missing evidence stays visibly unresolved.</p><small>DELIVERABLE / EXCEPTION REGISTER</small></article>
    <article className="nc-service"><span className="nc-number">03 / ACTION PACK</span><h3>Questions to send</h3><p>Receive a documented list of differences, source references, missing records and precise questions for your 3PL account manager.</p><small>DELIVERABLE / REVIEW PACK</small></article>
   </div>
  </section>

  <section className="nc-section">
   <div className="nc-section-head"><div><div className="nc-overline">HOW THE SERVICE WORKS</div><h2>One paid hour.<br/><em>A decision you can inspect.</em></h2></div><p>No percentage-of-recovery fee. No claim that every variance is an overcharge. The work is limited to what your contract and source records can support.</p></div>
   <div className="nc-steps">
    <article className="nc-step"><b>01 / REQUEST</b><h3>Describe the bill</h3><p>Tell us your store, fulfilment setup, invoice period and what looks wrong. No confidential files in the public form.</p></article>
    <article className="nc-step"><b>02 / SCOPE</b><h3>Confirm fit</h3><p>We check whether your rate card and CSV exports fit the current workflow. You receive the scope and price before any paid work.</p></article>
    <article className="nc-step"><b>03 / REVIEW</b><h3>Work the evidence</h3><p>A one-hour review uses the NODUS workspace to inspect supported rates, quantities, exceptions and gaps.</p></article>
    <article className="nc-step"><b>04 / HANDOVER</b><h3>Keep the record</h3><p>You receive an exportable review pack. You decide whether to raise questions with your provider.</p></article>
   </div>
  </section>

  <section className="nc-section">
   <div className="nc-section-head"><div><div className="nc-overline">THE COMMERCIAL OFFER</div><h2>Pay for the review.<br/><em>Keep control month to month.</em></h2></div><p>The monthly option is offered only after the first review establishes that recurring invoice checks are useful. No automatic conversion.</p></div>
   <div className="nc-price-layout">
    <article className="nc-price-card featured"><span className="nc-overline">01 / HOURLY SERVICE</span><h3>Invoice Review Session</h3><div className="nc-price">$100 <small>/ hour · proposed opening rate</small></div><p>One warehouse, one invoice, one active rate card and up to 25 invoice lines. The 60-minute session starts only after the three CSVs pass a file-fit check.</p><ul><li>10-minute source and scope confirmation</li><li>25-minute exception and rate review</li><li>15-minute evidence and action validation</li><li>10-minute handover and walkthrough</li><li>Exported exception register and written action sheet</li><li>Stop at 60 minutes; extra time needs written approval</li><li>No recovery guarantee or success fee</li></ul><Link to="/buyer-evaluation" className="nc-btn nc-btn-primary">Request the first hour ↗</Link></article>
    <article className="nc-price-card"><span className="nc-overline">02 / MONTHLY CONTINUATION</span><h3>NODUS Monthly Control</h3><div className="nc-price">$99 <small>/ month · proposed pilot scope</small></div><p>For one 3PL, one monthly invoice, one active rate card and one activity export, with open exceptions carried forward.</p><ul><li>Repeat the same reconciliation each month</li><li>Keep a dated exception history</li><li>Track cost-per-order where inputs support it</li><li>Export the monthly review pack</li><li>Cancel before the next billing period</li></ul><Link to="/buyer-evaluation" className="nc-btn nc-btn-secondary">Discuss monthly fit ↗</Link></article>
   </div>
   <p className="nc-footnote">Prices are NODUS's proposed opening offer, not evidence of completed sales or validated willingness to pay. Payment is not collected on this website. Work starts only after scope, qualified delivery, seller arrangements and payment terms are confirmed in writing.</p>
  </section>

  <section className="nc-section nc-proof">
   <div><div className="nc-overline">THE PRODUCT YOU RECEIVE</div><h2>Not a PDF pitch.<br/><em>A working review workspace.</em></h2></div>
   <div className="nc-proof-panel"><h3>NODUS browser workspace</h3><p>Use the existing reconciliation application to import rate-card, invoice and operational-activity CSVs; run supported matching; investigate exceptions; record provider outcomes; and export the review pack. The merchant keeps original source files in the browser workflow.</p><div className="nc-actions"><Link to="/fulfilment-review" className="nc-btn nc-btn-primary">Open the 3PL review workspace ↗</Link><Link to="/methodology" className="nc-btn nc-btn-secondary">Read the matching rules ↗</Link></div><p className="nc-footnote">Current limits: CSV only, up to 5 MB and 20,000 data rows per file. No PDF extraction, direct Shopify OAuth, live 3PL API polling or automatic dispute submission.</p></div>
  </section>

  <section className="nc-section">
   <div className="nc-overline">WHAT NODUS WILL NOT CLAIM</div><h2>Evidence first. <em>Recovery claims never.</em></h2>
   <div className="nc-limits">
    <article className="nc-limit"><b>01 / NO FALSE SAVINGS</b><p>A variance is not proof of provider liability, a credit, recoverable cash or realised savings.</p></article>
    <article className="nc-limit"><b>02 / NO GUESSED MATCHES</b><p>Ambiguous references and missing activity stay separate. Unknown is not silently treated as zero.</p></article>
    <article className="nc-limit"><b>03 / NO STORE ACCESS</b><p>The first review uses merchant-provided exports. NODUS does not need your Shopify password or payment credentials.</p></article>
   </div>
  </section>

  <section className="nc-final"><div><div className="nc-overline">NODUS / FULFILMENT COST CONTROL</div><h2>Bring one invoice.<br/><em>Let's check the evidence.</em></h2><p>Request a scoped first-hour review. If the data cannot support a useful check, the work will not be sold as a completed audit.</p></div><div className="nc-actions"><Link to="/buyer-evaluation" className="nc-btn nc-btn-primary">Request a review ↗</Link><Link to="/demo" className="nc-btn nc-btn-secondary">See the sample ↗</Link></div></section>
 </main></MarketingShell>;
}
