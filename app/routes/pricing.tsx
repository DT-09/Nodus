import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Founding Merchant Value Programme — NODUS"},
 {name:"description",content:"Start with a scoped, no-fee shipping economics assessment. NODUS must demonstrate evidence and value before a subscription is proposed."}
];

export default function Pricing(){
 const email=process.env.PUBLIC_CONTACT_EMAIL?.trim();
 const subject=encodeURIComponent("NODUS Founding Merchant Value Programme");
 const body=encodeURIComponent("Hello NODUS,\n\nI would like to be considered for the Founding Merchant Value Programme.\n\nShopify store URL:\nApproximate monthly order volume:\nMonthly carrier spend and currency:\nCarrier / 3PL invoice export available (yes/no):\nPrimary shipping economics question:\n\n");
 return <MarketingShell><main className="content-page pricing-page">
  <header>
   <p className="page-eyebrow">COMMERCIAL / PROOF BEFORE PRICE</p>
   <h1>First, prove the value.<br/>Then decide what it is worth.</h1>
   <p className="page-lede">NODUS does not ask a merchant to trust a pricing page. We begin with a defined shipping-economics assessment, show the source records and calculations, and only discuss an ongoing subscription if the evidence supports it.</p>
  </header>

  <section className="value-calculator">
   <div className="calculator-heading">
    <span>01 / FOUNDING MERCHANT VALUE PROGRAMME</span>
    <h2>Get the work done<br/><em>before the sales pitch.</em></h2>
    <p>The first assessment is offered at no charge to a small founding cohort. No payment details, no automatic conversion and no obligation to subscribe.</p>
   </div>
   <div className="proof-grid">
    <article><b>01</b><h3>Scope one store</h3><p>One Shopify store, one reporting currency, a defined historical order sample and one supported carrier-cost export.</p></article>
    <article><b>02</b><h3>Reconcile the evidence</h3><p>Connect order shipping revenue to imported carrier-cost records. Surface matched, unmatched, duplicate and incomplete evidence.</p></article>
    <article><b>03</b><h3>Deliver the findings</h3><p>Provide an exception register, transparent calculations, evidence coverage, limitations and a historical policy replay where the data supports it.</p></article>
    <article><b>04</b><h3>Review together</h3><p>Walk through what is actionable, what needs carrier or finance confirmation and what cannot yet be concluded.</p></article>
   </div>
   <p className="calculator-caveat">Identified discrepancies are not recovered savings. A value is treated as realized only when the merchant can point to a posted credit, refund or accounting adjustment. NODUS does not independently audit that posting.</p>
  </section>

  <section className="pricing-targets">
   <div className="pricing-target-heading">
    <span>02 / THE VALUE TEST</span>
    <h2>A subscription must<br/><em>leave the merchant better off.</em></h2>
    <p>We will propose a monthly subscription only after the assessment establishes a credible ongoing use case. If the evidence does not support the fee, we do not recommend subscribing.</p>
   </div>
   <div className="content-grid">
    <article><span>VALUE / 01</span><h2>Economic value</h2><p>Merchant-confirmed credits and corrections, separated from identified exposure and disputed amounts. No speculative savings forecasts.</p></article>
    <article><span>VALUE / 02</span><h2>Operating value</h2><p>Time spent reconciling invoices, tracing exceptions and preparing finance reviews. Baseline and follow-up effort are recorded rather than guessed.</p></article>
    <article><span>VALUE / 03</span><h2>Decision value</h2><p>Better visibility into cost coverage, shipping contribution and historical policy trade-offs, with assumptions and exclusions attached.</p></article>
   </div>
   <p className="calculator-verdict">Our proposed pricing rule: the conservative, merchant-accepted monthly value should be at least 3× the proposed monthly fee. This is a decision threshold, not a promised return. If recurring value cannot be demonstrated, there is no subscription recommendation.</p>
  </section>

  <section className="proof-method">
   <span>03 / WHAT CONTINUING SERVICE MEANS</span>
   <h2>Not a one-time report.<br/><em>A continuing control system.</em></h2>
   <div className="proof-grid">
    <article><b>01</b><h3>Keep the record current</h3><p>Refresh Shopify order data and preserve the merchant's evidence history. Carrier invoice intake remains based on supported merchant-provided exports.</p></article>
    <article><b>02</b><h3>Keep exceptions visible</h3><p>Track unresolved, newly imported and reviewed records without silently treating missing evidence as zero cost.</p></article>
    <article><b>03</b><h3>Revisit decisions</h3><p>Compare shipping-policy assumptions against actual historical orders. No live policy changes without a separately implemented and approved workflow.</p></article>
    <article><b>04</b><h3>Report what changed</h3><p>Show new evidence, changed coverage, resolved exceptions and merchant-attested outcomes with an audit trail.</p></article>
   </div>
   <p className="calculator-caveat">The current product supports scheduled Shopify order refresh, but not automated carrier billing feeds or automated policy writes. Carrier evidence is imported by the merchant. The programme will not describe those unsupported functions as live.</p>
  </section>

  <section className="pricing-contact">
   <div>
    <span>04 / APPLY FOR AN ASSESSMENT</span>
    <h2>Let the evidence make the case.</h2>
    <p>Suitable merchants have recurring parcel or 3PL charges, an authorized Shopify store and access to a carrier invoice or cost export. The initial assessment is deliberately narrow so that the result is useful, inspectable and repeatable.</p>
   </div>
   <div className="evaluation-steps">
    <p><b>01</b> Confirm store fit and evaluation scope.</p>
    <p><b>02</b> Connect Shopify through the authorized installation flow.</p>
    <p><b>03</b> Import a supported carrier-cost export.</p>
    <p><b>04</b> Receive the evidence-backed assessment and review.</p>
    <p><b>05</b> Decide whether ongoing monthly service is worth it.</p>
   </div>
   {email?<a className="primary-cta" href={"mailto:"+email+"?subject="+subject+"&body="+body}>Request a founding merchant assessment ↗</a>:<p className="import-error">Business-owned enquiry intake is not configured. Public applications must remain closed until a monitored business contact channel is set.</p>}
   <p className="pricing-disclaimer">No card is collected. No subscription starts automatically. Feedback is welcome but is never a condition of participation, and any testimonial or case study requires separate, explicit permission. We do not publish invented reviews, customer logos or financial outcomes.</p>
  </section>
  <p className="pricing-footnote"><Link to="/methodology">Read calculation methodology</Link> · <Link to="/security">Review data boundaries</Link> · <Link to="/product">Explore current capabilities</Link></p>
 </main></MarketingShell>;
}
