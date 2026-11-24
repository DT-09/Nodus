import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS pricing — free shipping review and monthly control"},
 {name:"description",content:"Start with a free seven-day shipping-cost review. Review the proposed NODUS monthly service and its current release limits."}
];

const included=[
 "Order-level shipping revenue and supported carrier-cost matching",
 "Separate unmatched, ambiguous and incomplete records",
 "Currency-separated totals and explicit tax limitations",
 "Historical flat-rate and free-shipping threshold replay",
 "CSV register, JSON decision pack and readable report",
 "A repeatable monthly review of new carrier and 3PL cost records"
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero"><p className="page-eyebrow">NODUS / COMMERCIAL PLAN</p><h1>Check the shipping bill.<br/><em>Then decide if it stays.</em></h1><p className="page-lede">Start with the free working review. If shipping costs change often enough to justify a monthly process, NODUS is being developed as a recurring merchant control service.</p></header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free"><span className="nd-plan-kicker">01 / START HERE</span><h2>Control Week</h2><p className="nd-plan-price">Free</p><p className="nd-plan-desc">Seven days of guided work using sample data or your own CSV exports. No card, store password or sales call required.</p><ul><li>Inspect the sample reconciliation</li><li>Run your own order and carrier CSVs in your browser</li><li>Review matched and unmatched charges</li><li>Test historical shipping policies</li><li>Export your review pack</li><li>No automatic paid conversion</li></ul><Link to="/control-week" className="cta-primary">START THE FREE WEEK ↗</Link></article>
   <article className="nd-plan nd-plan-pro nd-plan-monthly"><span className="nd-plan-kicker">02 / MONTHLY SERVICE</span><h2>NODUS Core</h2><p className="nd-plan-price">$99 <small>/ month · proposed</small></p><p className="nd-plan-desc">A proposed monthly service for merchants who need to review new carrier or 3PL charges, carry open exceptions forward and keep a record of shipping economics.</p><ul>{included.map(item=><li key={item}>{item}</li>)}</ul><p className="pricing-footnote">The $99 price is an unvalidated commercial hypothesis. Self-serve paid checkout and automatic subscription activation are not live. No payment will be taken through this page.</p><Link to="/support" className="cta-secondary">ASK ABOUT A MERCHANT PILOT ↗</Link></article>
  </section>
  <section className="nd-pricing-process"><div><span>WHAT HAPPENS NEXT</span><h2>Try the workflow<br/><em>before you pay.</em></h2></div><div className="nd-pricing-steps">
   <article><b>01</b><div><h3>Run the sample</h3><p>See the exact matching rules and the limits on the result.</p></div></article>
   <article><b>02</b><div><h3>Use your own exports</h3><p>Check whether your records contain enough information for a useful review.</p></div></article>
   <article><b>03</b><div><h3>Keep the decision pack</h3><p>Export the work and decide whether the monthly review solves a real recurring problem.</p></div></article>
   <article><b>04</b><div><h3>Consider a pilot</h3><p>Paid service begins only after scope, seller arrangements and payment terms are confirmed.</p></div></article>
  </div></section>
  <section className="nd-pricing-faq"><h2>What is available now?</h2>
   <div><h3>Does the free review connect to Shopify?</h3><p>The public free experience uses CSV exports. It does not ask for your Shopify password or require an app installation.</p></div>
   <div><h3>Are my files uploaded?</h3><p>No. The manual CSV review processes the selected files in your browser. You can save a local review history and export the results.</p></div>
   <div><h3>Does NODUS guarantee savings?</h3><p>No. It identifies supported differences and missing evidence. A calculated variance is not proof of carrier liability or recovered money.</p></div>
   <div><h3>Can I pay for NODUS Core now?</h3><p>Not through this page. Paid checkout is not live. The displayed monthly price is proposed, not a validated or currently purchasable subscription.</p></div>
  </section>
  <section className="nd-pricing-contact"><h2>Start with the numbers you already have.</h2><p>No pitch deck. No invented savings estimate. Run the review and see whether the result is useful.</p><div className="hero-ctas"><Link to="/control-week" className="cta-primary">START FREE CONTROL WEEK ↗</Link><Link to="/demo" className="cta-secondary">SEE THE SAMPLE ↗</Link></div></section>
 </main></MarketingShell>;
}
