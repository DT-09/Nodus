import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {useState} from "react";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS pricing — free shipping review and Pro"},
 {name:"description",content:"Start with a free browser-based shipping review. NODUS Pro is planned at USD 99 per month; paid access is not yet open."}
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
   <h1>Understand shipping costs.<br/><em>Keep the evidence in view.</em></h1>
   <p className="page-lede">Start with the free browser-based shipping review. NODUS Pro is planned at USD 99/month for recurring shipping-cost analysis, exception monitoring, historical comparisons and evidence-backed weekly reviews. Pro is not accepting payments yet. We will open billing only after those recurring capabilities, account access, support and payment verification are working.</p>
  </header>

  <section className="value-calculator">
   <div className="calculator-heading">
    <span>01 / FREE PRODUCT / PRO SUBSCRIPTION</span>
    <h2>Start free.<br/><em>Upgrade when Pro is ready.</em></h2>
    <p>The free product currently runs supported order and carrier-cost CSV analysis locally in the browser. Pro is planned to add recurring analysis, monitoring, historical comparisons and full decision packs. Those Pro capabilities are not yet available.</p>
   </div>
   <div className="proof-grid">
    <article><b>01</b><h3>Scope one store</h3><p>One Shopify store, one reporting currency, a defined historical order sample and one supported carrier-cost export.</p></article>
    <article><b>02</b><h3>Match the evidence</h3><p>Connect order shipping revenue to imported carrier-cost records. Surface matched and unmatched charges, currency mismatches and incomplete coverage.</p></article>
    <article><b>03</b><h3>Flag shortfalls</h3><p>When complete coverage is attested, identify orders where matched carrier costs exceed shipping collected. Keep tax-inclusive orders and incomplete evidence out of the balance.</p></article>
    <article><b>04</b><h3>Review the decision</h3><p>Walk through the source rows, flagged shortfalls, unresolved charges and what still needs carrier or finance confirmation.</p></article>
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
    <h2>NODUS Pro.<br/><em>USD 99 / month.</em></h2>
    <p>Planned recurring service: ongoing shipping-cost reviews, new exception detection, historical comparisons, weekly decision briefs and a persistent evidence history. The precise plan limits will be published before billing opens.</p>
   </div>
   <div className="content-grid">
    <article><span>VALUE / 01</span><h2>Economic value</h2><p>Merchant-confirmed credits and corrections, separated from identified exposure and disputed amounts. No speculative savings forecasts.</p></article>
    <article><span>VALUE / 02</span><h2>Operating value</h2><p>Time spent reconciling invoices, tracing exceptions and preparing finance reviews. Baseline and follow-up effort are recorded rather than guessed.</p></article>
    <article><span>VALUE / 03</span><h2>Decision value</h2><p>Clearer visibility into matched costs, unmatched charges, currency totals and the limits of the supplied evidence.</p></article>
   </div>
   <p className="calculator-verdict">USD 99/month is a proposed subscription price, not a validated market price. Pro is not yet available for purchase. We will activate billing only after recurring monitoring, secure entitlements, support and delivery are working. NODUS does not guarantee savings, carrier recovery or profit improvement.</p>
  </section>

  <section className="proof-method" data-reveal>
   <span>03 / WHAT CONTINUING SERVICE MEANS</span>
   <h2>A defined review.<br/><em>No invented outcomes.</em></h2>
   <div className="proof-grid">
    <article><b>01</b><h3>Review the supplied period</h3><p>Compare the supported Shopify order export with one carrier or 3PL cost export. Matching requires exact order reference or unique tracking reference and identical currency.</p></article>
    <article><b>02</b><h3>Separate every exception</h3><p>Keep unmatched, ambiguous and currency-mismatched charges visible; missing cost evidence is never reported as zero.</p></article>
    <article><b>03</b><h3>Explain the evidence</h3><p>Show matched records, unassigned charges, source references, currency totals and limits of the supplied data.</p></article>
    <article><b>04</b><h3>Deliver the review pack</h3><p>Provide the CSV review register, JSON decision pack and a written findings summary for the defined reporting period.</p></article>
   </div>
   <p className="calculator-caveat">The current free CSV tool runs in the browser. It does not provide automated carrier feeds, recurring monitoring, or live subscription service. The proposed Pro plan will not be sold until its recurring capabilities are live.</p>
  </section>

  <section className="pricing-contact" data-reveal>
   <div>
    <span>04 / START FREE · REQUEST PRO UPDATES</span>
    <h2>Start with the right-sized review.</h2>
    <p>Suitable merchants have recurring parcel or 3PL charges, an authorized Shopify store and access to a carrier invoice or cost export. The free tool lets merchants test their own supported exports locally. Visitors can request updates when the $99/month Pro subscription is ready.</p>
   </div>
   <div className="evaluation-steps">
    <p><b>01</b> Confirm store fit and evaluation scope.</p>
    <p><b>02</b> Use merchant-provided order and carrier-cost CSV exports. No store connection is available.</p>
    <p><b>03</b> Review a supported sample locally; do not send files with the enquiry.</p>
    <p><b>04</b> Receive the evidence-backed assessment and review.</p>
    <p><b>05</b> Choose the no-fee review or request Pro launch updates.</p>
   </div>
   <Link to="/buyer-evaluation" className="primary-cta">REQUEST PRO ACCESS ↗</Link><a className="cta-secondary" href="mailto:dhairytopia@gmail.com?subject=NODUS%20Pro%20enquiry">EMAIL NODUS ↗</a><a className="cta-secondary" href="mailto:dhairytopia@gmail.com?subject=NODUS%20Pro%20enquiry">EMAIL NODUS ↗</a>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">RUN A CSV REVIEW ↗</Link><Link to="/install" className="cta-secondary">INSTALL NODUS ↗</Link></div>
   <p className="pricing-disclaimer">The form records interest only. It does not take payment or create a subscription. For a direct enquiry, email NODUS using the contact link below. No customer results, testimonials or financial outcomes are claimed.</p>
  </section>
  <p className="pricing-footnote"><Link to="/methodology">Read calculation methodology</Link> · <Link to="/security">Review data boundaries</Link> · <Link to="/product">Explore current capabilities</Link></p>
 </main></MarketingShell>;
}
