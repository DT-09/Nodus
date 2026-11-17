import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Pricing — NODUS Shipping Margin Control"},
 {name:"description",content:"A focused Shopify shipping margin workflow: reconcile carrier costs, review exceptions and test shipping policies against historical orders."}
];

export default function Pricing(){
 const email=process.env.PUBLIC_CONTACT_EMAIL?.trim();
 const subject=encodeURIComponent("NODUS early access — Shopify shipping margin control");
 const body=encodeURIComponent("Hello NODUS,\n\nI would like to discuss early access.\n\nShopify store URL:\nApproximate monthly order volume:\nCarrier / 3PL cost export available (yes/no):\nCurrent shipping policy (flat rate / free-shipping threshold / other):\nMain shipping-cost question:\n");
 return <MarketingShell active="pricing"><main className="content-page pricing-page">
  <header>
   <p className="page-eyebrow">COMMERCIAL / ONE CLEAR OFFER</p>
   <h1>Know what shipping<br/><em>is costing you.</em></h1>
   <p className="page-lede">NODUS is for Shopify merchants who need to reconcile checkout shipping charges with actual carrier or 3PL costs, find unsupported records and test policy changes against their own order history.</p>
  </header>
  <section className="content-note">
   <span className="page-eyebrow">FOUNDING PLAN / PRICING HYPOTHESIS</span>
   <h2>$29 <small>/ month</small></h2>
   <p>One store. One focused shipping-margin workflow. The founding price is a testable offer, not a claim that the product has already earned market acceptance.</p>
   <div className="content-grid">
    <article><span>01 / CONNECT</span><h2>Shopify order context</h2><p>Read authorized order, shipping-line and fulfillment records within the permissions Shopify grants.</p></article>
    <article><span>02 / IMPORT</span><h2>Actual cost evidence</h2><p>Import supported carrier or 3PL CSV exports. Keep source identifiers, currency and duplicate checks.</p></article>
    <article><span>03 / RECONCILE</span><h2>Shipping exceptions</h2><p>Review matched, unmatched, duplicate and incomplete evidence. Missing cost is never silently treated as zero.</p></article>
    <article><span>04 / DECIDE</span><h2>Policy scenarios</h2><p>Replay flat-rate and free-shipping threshold alternatives against the stored historical order sample.</p></article>
    <article><span>05 / EXPORT</span><h2>Decision pack</h2><p>Export the evidence register and reproducible JSON pack for finance and operations review.</p></article>
    <article><span>06 / REPEAT</span><h2>Monthly review</h2><p>Import the next carrier-cost export, revisit unresolved exceptions and compare the next reporting period.</p></article>
   </div>
   <p className="calculator-caveat">Not included: direct carrier API feeds, automatic carrier invoice polling, automatic Shopify shipping-policy changes, guaranteed savings, or full accounting profit. Carrier cost data is merchant-provided CSV evidence.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">WHY PAY?</span>
   <h2>Because a chart is not a decision.</h2>
   <p>The paid job is to replace a recurring spreadsheet investigation with a traceable record of what customers paid, what carriers billed, which records remain uncertain and what alternative shipping policies would have done on the same historical orders.</p>
   <p>The $29/month price is a launch hypothesis. NODUS will keep it only if merchants use the workflow again and confirm that the time or decision value exceeds the fee. No savings or recovery amount is promised.</p>
  </section>
  <section className="pricing-contact">
   <div><span>EARLY ACCESS</span><h2>Bring one store and one cost export.</h2><p>The first release is intended for merchants with recurring physical shipments, an authorized Shopify store and a carrier or 3PL CSV export. The production app, support contact and subscription billing must pass their release checks before paid onboarding opens.</p></div>
   {email?<a className="primary-cta" href={"mailto:"+email+"?subject="+subject+"&body="+body}>REQUEST EARLY ACCESS ↗</a>:<p className="import-error">Early-access intake is not active yet. The production support contact and monitored enquiry path have not been configured.</p>}
   <div className="hero-ctas"><Link to="/demo" className="cta-primary">INSPECT THE SAMPLE PACK ↗</Link><Link to="/buyer-evaluation" className="cta-secondary">CHECK STORE FIT ↗</Link></div>
  </section>
  <p className="pricing-footnote"><Link to="/methodology">Calculation methodology</Link> · <Link to="/security">Security and data boundaries</Link> · <Link to="/product">Current product capabilities</Link></p>
 </main></MarketingShell>;
}
