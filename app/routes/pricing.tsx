import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS pricing — Free diagnostic and Pro monthly review"},
 {name:"description",content:"Start with a free shipping economics diagnostic. NODUS Pro is a fixed-scope monthly shipping review service for Shopify merchants."}
];

const freeItems=["Run order and carrier CSV analysis in your browser","See matched, unmatched and ambiguous records","Review carrier spend by provider and cost type","Replay a shipping policy against historical baskets","Export the CSV register and JSON decision pack"];

const proItems=["One Shopify store per monthly service period","Up to 2,000 orders and one carrier or 3PL cost export per month","Evidence-backed reconciliation and carrier spend review","Prioritized exception register with source references","Historical flat-rate and free-shipping threshold replay","Monthly executive brief and action register","Comparison with the prior period when prior evidence is supplied"];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero">
   <p className="page-eyebrow">NODUS / COMMERCIAL OFFER</p>
   <h1>Start with evidence.<br/><em>Pay for the ongoing review.</em></h1>
   <p className="page-lede">Use the free workspace with your own exports. When you need a recurring finance and operations review, NODUS Pro provides a fixed monthly scope and a decision-ready deliverable.</p>
  </header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free">
    <span className="nd-plan-kicker">01 / OPEN WORKSPACE</span><h2>Free diagnostic</h2><p className="nd-plan-price">Free</p><p className="nd-plan-desc">Run the analysis yourself. No card and no account required.</p>
    <ul>{freeItems.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/manual-data" className="cta-secondary">RUN THE FREE REVIEW ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro">
    <span className="nd-plan-kicker">02 / MONTHLY SERVICE</span><h2>NODUS Pro</h2><p className="nd-plan-price">$99 <small>/ month</small></p><p className="nd-plan-desc">A recurring, fixed-scope shipping economics review for one Shopify store.</p>
    <ul>{proItems.map(item=><li key={item}>{item}</li>)}</ul>
    <a className="cta-primary" href="mailto:dhairytopia@gmail.com?subject=NODUS%20Pro%20monthly%20service">REQUEST PRO BY EMAIL ↗</a>
   </article>
  </section>
  <section className="nd-pricing-process">
   <div><span>HOW TO START</span><h2>Try it. See the result.<br/><em>Then choose Pro.</em></h2></div>
   <div className="nd-pricing-steps">
    <article><b>01</b><div><h3>Run the free diagnostic</h3><p>Use your order and carrier-cost exports in the browser. Your source files are not uploaded.</p></div></article>
    <article><b>02</b><div><h3>Review the sample output</h3><p>Inspect the exception register, carrier spend profile, policy replay and decision pack.</p></div></article>
    <article><b>03</b><div><h3>Request the monthly service</h3><p>Email NODUS with your store domain and monthly order volume. Do not email raw order or customer files.</p></div></article>
    <article><b>04</b><div><h3>Confirm scope and payment</h3><p>NODUS confirms fit, scope, invoice and approved payment method before the monthly service begins.</p></div></article>
   </div>
  </section>
  <section className="nd-pricing-value">
   <div><span>WHAT YOU ARE PAYING FOR</span><h2>Not another dashboard.<br/><em>A monthly decision record.</em></h2><p>The Pro service is designed to give an operations or finance owner a repeatable view of shipping economics, unresolved exceptions and policy choices—with the evidence and limitations attached.</p></div>
   <div className="nd-pricing-deliverables"><p><b>DELIVERABLE 01</b> Reconciliation and carrier spend summary</p><p><b>DELIVERABLE 02</b> Prioritized evidence-backed exception register</p><p><b>DELIVERABLE 03</b> Historical shipping policy replay</p><p><b>DELIVERABLE 04</b> Monthly executive brief and action register</p></div>
  </section>
  <section className="nd-pricing-faq">
   <h2>Scope and trust</h2>
   <div><h3>Does NODUS guarantee savings or carrier credits?</h3><p>No. It identifies evidence and helps prioritize investigation. A negative shipping balance is not proof of carrier overbilling or recoverable money.</p></div>
   <div><h3>Do you need my customer data?</h3><p>The free workspace runs locally in your browser. For the monthly service, share only the exported review pack and the minimum information needed for the agreed review. Do not send passwords, access tokens or unnecessary customer data.</p></div>
   <div><h3>Can I cancel?</h3><p>The monthly service is billed by agreed monthly periods. Cancellation and refund terms are confirmed before payment and included with the invoice.</p></div>
   <div><h3>Are the reviews public testimonials?</h3><p>No. Feedback is requested honestly and separately. No customer name, logo, quote or result is published without permission.</p></div>
  </section>
  <section className="nd-pricing-contact">
   <img src={NODUS_MARK} alt="NODUS six-node gold network mark"/>
   <h2>Start with the free review.</h2><p>When the output shows a recurring job worth paying for, request the $99/month service.</p>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">OPEN FREE WORKSPACE ↗</Link><a className="cta-secondary" href="mailto:dhairytopia@gmail.com?subject=NODUS%20Pro%20monthly%20service">EMAIL NODUS ↗</a></div>
  </section>
 </main></MarketingShell>;
}
