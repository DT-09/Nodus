import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {useState} from "react";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Founding Merchant Value Programme — NODUS"},
 {name:"description",content:"NODUS currently offers a no-fee founding enquiry and browser-local shipping economics CSV analysis. No paid plan or subscription checkout is live."}
];

export default function Pricing(){
 const [baseline,setBaseline]=useState("");
 const [assisted,setAssisted]=useState("");
 const [hourlyRate,setHourlyRate]=useState("");
 const [currency,setCurrency]=useState("USD");
 const baseMinutes=Number(baseline);
 const assistedMinutes=Number(assisted);
 const rate=Number(hourlyRate);
 const valid=baseline!==""&&assisted!==""&&hourlyRate!==""&&Number.isInteger(baseMinutes)&&Number.isInteger(assistedMinutes)&&baseMinutes>assistedMinutes&&baseMinutes<=100000&&assistedMinutes>=0&&rate>0&&Number.isFinite(rate);
 const minutesSaved=valid?baseMinutes-assistedMinutes:0;
 const cycleValue=valid?(minutesSaved/60)*rate:0;
 const formattedValue=valid?new Intl.NumberFormat("en",{style:"currency",currency,maximumFractionDigits:3}).format(cycleValue):"";
 return <MarketingShell><main className="content-page pricing-page">
  <header>
   <p className="page-eyebrow">COMMERCIAL / PROOF BEFORE PRICE</p>
   <h1>Start with a review.<br/>Continue only if it pays.</h1>
   <p className="page-lede">There is no paid plan to buy today. The public release is an installable web app with browser-local shipping economics CSV analysis and a no-fee founding enquiry form. No recurring monitoring, subscription billing or paid checkout is live.</p>
  </header>

  <section className="value-calculator">
   <div className="calculator-heading">
    <span>01 / FOUNDING MERCHANT VALUE PROGRAMME</span>
    <h2>Get the work done<br/><em>before the sales pitch.</em></h2>
    <p>The current programme is an enquiry route, not a paid diagnostic service. The form lets a merchant describe their store and operating question. It does not connect to Shopify, accept source files, promise an assessment or create a service agreement.</p>
   </div>
   <div className="proof-grid">
    <article><b>01</b><h3>Scope one store</h3><p>One Shopify store, one reporting currency, a defined historical order sample and one supported carrier-cost export.</p></article>
    <article><b>02</b><h3>Reconcile the evidence</h3><p>Connect order shipping revenue to imported carrier-cost records. Surface matched, unmatched, duplicate and incomplete evidence.</p></article>
    <article><b>03</b><h3>Deliver the findings</h3><p>Review the matches, unmatched charges, currency-separated totals, source references and limitations produced by the CSV tool.</p></article>
    <article><b>04</b><h3>Review together</h3><p>Walk through what is actionable, what needs carrier or finance confirmation and what cannot yet be concluded.</p></article>
   </div>
   <p className="calculator-caveat">Identified discrepancies are not recovered savings. A value is treated as realized only when the merchant can point to a posted credit, refund or accounting adjustment. NODUS does not independently audit that posting.</p>
  </section>

  <section className="operating-value-lab" data-reveal aria-labelledby="operating-value-title">
   <div className="lab-intro"><span>INTERACTIVE / MEASURED OPERATING VALUE</span><h2 id="operating-value-title">Measure the work.<br/><em>Do not guess the return.</em></h2><p>Enter a timed reconciliation task before and after using NODUS, plus the merchant-approved loaded hourly rate. The calculator reports the value of time saved for that one observed cycle only.</p></div>
   <div className="lab-inputs">
    <label>BASELINE TASK TIME / MINUTES<input inputMode="numeric" type="number" min="1" max="100000" step="1" value={baseline} onChange={e=>setBaseline(e.target.value)} placeholder="Enter observed minutes"/></label>
    <label>NODUS-ASSISTED TIME / MINUTES<input inputMode="numeric" type="number" min="0" max="100000" step="1" value={assisted} onChange={e=>setAssisted(e.target.value)} placeholder="Enter observed minutes"/></label>
    <label>LOADED HOURLY RATE<input inputMode="decimal" type="number" min="0.01" step="0.01" value={hourlyRate} onChange={e=>setHourlyRate(e.target.value)} placeholder="Merchant-approved rate"/></label>
    <label>REPORTING CURRENCY<select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="USD">USD — US dollar</option><option value="GBP">GBP — Pound sterling</option><option value="EUR">EUR — Euro</option><option value="CAD">CAD — Canadian dollar</option><option value="AUD">AUD — Australian dollar</option><option value="INR">INR — Indian rupee</option></select></label>
   </div>
   <div className="lab-result" aria-live="polite">
    {valid?<><div><span>OBSERVED TIME REDUCTION</span><strong>{minutesSaved.toLocaleString("en")} min</strong></div><div><span>OPERATING VALUE / ONE CYCLE</span><strong>{formattedValue}</strong></div><p>Calculated from the values entered. This is measured operating-time value, not recovered cash, carrier credits, profit or a monthly forecast.</p></>:<div className="lab-empty"><span>AWAITING OBSERVED INPUTS</span><p>Enter a baseline greater than the assisted time and a positive hourly rate. No sample figures are preloaded.</p></div>}
   </div>
   <p className="lab-method">FORMULA / (BASELINE MINUTES − ASSISTED MINUTES) ÷ 60 × LOADED HOURLY RATE. Use comparable tasks and record the measurement method before relying on the result.</p>
  </section>

  <section className="pricing-targets" data-reveal>
   <div className="pricing-target-heading">
    <span>02 / THE VALUE TEST</span>
    <h2>There is no subscription<br/><em>in the current release.</em></h2>
    <p>Recurring monitoring, paid billing and self-serve checkout are not implemented. Any future commercial offer would require separate product verification and an authorized adult business operator to approve the terms.</p>
   </div>
   <div className="content-grid">
    <article><span>VALUE / 01</span><h2>Economic value</h2><p>Merchant-confirmed credits and corrections, separated from identified exposure and disputed amounts. No speculative savings forecasts.</p></article>
    <article><span>VALUE / 02</span><h2>Operating value</h2><p>Time spent reconciling invoices, tracing exceptions and preparing finance reviews. Baseline and follow-up effort are recorded rather than guessed.</p></article>
    <article><span>VALUE / 03</span><h2>Decision value</h2><p>Clearer visibility into matched costs, unmatched charges, currency totals and the limits of the supplied evidence.</p></article>
   </div>
   <p className="calculator-verdict">No NODUS price, recurring plan or return on investment is published in this release. Any value estimate must be measured by the merchant against comparable work; the calculator does not establish NODUS performance.</p>
  </section>

  <section className="proof-method" data-reveal>
   <span>03 / WHAT CONTINUING SERVICE MEANS</span>
   <h2>Not a one-time report.<br/><em>A continuing control system.</em></h2>
   <div className="proof-grid">
    <article><b>01</b><h3>Keep the record current</h3><p>Refresh Shopify order data and preserve the merchant's evidence history. Carrier invoice intake remains based on supported merchant-provided exports.</p></article>
    <article><b>02</b><h3>Keep exceptions visible</h3><p>Track unresolved, newly imported and reviewed records without silently treating missing evidence as zero cost.</p></article>
    <article><b>03</b><h3>Revisit decisions</h3><p>Compare shipping-policy assumptions against actual historical orders. No live policy changes without a separately implemented and approved workflow.</p></article>
    <article><b>04</b><h3>Report what changed</h3><p>Show new evidence, changed coverage, resolved exceptions and merchant-attested outcomes with an audit trail.</p></article>
   </div>
   <p className="calculator-caveat">The calculator is a manual estimate based only on values entered by the visitor. It does not measure NODUS performance. The current release does not include Shopify connection, saved merchant workspaces, scheduled monitoring, carrier API feeds, paid billing or automatic business actions.</p>
  </section>

  <section className="pricing-contact" data-reveal>
   <div>
    <span>04 / REQUEST A REVIEW</span>
    <h2>Let the evidence make the case.</h2>
    <p>Suitable merchants have recurring parcel or 3PL charges, an authorized Shopify store and access to a carrier invoice or cost export. The initial assessment is deliberately narrow so that the result is useful, inspectable and repeatable.</p>
   </div>
   <div className="evaluation-steps">
    <p><b>01</b> Confirm store fit and evaluation scope.</p>
    <p><b>02</b> Use merchant-provided order and carrier-cost CSV exports. No store connection is available.</p>
    <p><b>03</b> Review a supported sample locally; do not send files with the enquiry.</p>
    <p><b>04</b> Receive the evidence-backed assessment and review.</p>
    <p><b>05</b> Decide whether ongoing monthly service is worth it.</p>
   </div>
   <Link to="/buyer-evaluation" className="primary-cta">REQUEST A FOUNDING ASSESSMENT ↗</Link>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">RUN A CSV REVIEW ↗</Link><Link to="/install" className="cta-secondary">INSTALL NODUS ↗</Link></div>
   <p className="pricing-disclaimer">No payments are accepted and no subscription is available in this release. The founding form is an enquiry only. No customer results, testimonials or financial outcomes are claimed.</p>
  </section>
  <p className="pricing-footnote"><Link to="/methodology">Read calculation methodology</Link> · <Link to="/security">Review data boundaries</Link> · <Link to="/product">Explore current capabilities</Link></p>
 </main></MarketingShell>;
}
