import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"For Shopify merchants — NODUS shipping cost control"},
 {name:"description",content:"A practical shipping-cost review for Shopify merchants. Compare what customers paid with carrier and 3PL costs, then inspect the evidence."}
];

export default function BuyerEvaluation(){
 return <MarketingShell active="evaluation"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / FOR SHOPIFY MERCHANTS</p><h1>Know where the<br/><em>shipping money goes.</em></h1><p className="page-lede">Your checkout report shows shipping revenue. Carrier and 3PL records show delivery costs. NODUS puts the two together so you can see what matches, what is missing and which orders need a closer look.</p><div className="hero-ctas"><Link to="/control-week" className="cta-primary">START THE FREE 7-DAY REVIEW ↗</Link><Link to="/demo" className="cta-secondary">INSPECT SAMPLE DATA ↗</Link></div></header>
  <section className="content-note"><span className="page-eyebrow">THE WORK</span><h2>Not another sales dashboard.</h2><div className="content-grid">
   <article><span>01 / REVENUE</span><h2>What customers paid</h2><p>Order-level shipping charges, currencies, tax treatment and tracking numbers from your Shopify export.</p></article>
   <article><span>02 / COST</span><h2>What delivery cost</h2><p>Carrier or 3PL invoice charges with the identifiers your provider supplied.</p></article>
   <article><span>03 / EVIDENCE</span><h2>What can be matched</h2><p>Exact order references and unique tracking matches. Ambiguous and unmatched costs stay separate.</p></article>
  </div></section>
  <section className="content-note"><span className="page-eyebrow">WHAT YOU CAN DO TODAY</span><h2>Use the working review, not a mock dashboard.</h2><ul><li>Run the sample dataset and inspect the arithmetic.</li><li>Import your own order and carrier CSV files.</li><li>Review incomplete coverage, unmatched charges and order-level shipping balances.</li><li>Replay a flat shipping rate or free-shipping threshold when order subtotals are available.</li><li>Export a CSV register, JSON decision pack and readable report.</li></ul><p>The CSV review runs in your browser. It does not upload source files to NODUS.</p><div className="hero-ctas"><Link to="/manual-data" className="cta-primary">RUN YOUR OWN SHIPPING REVIEW ↗</Link><Link to="/control-week" className="cta-secondary">FOLLOW THE SEVEN-DAY PLAN ↗</Link></div></section>
  <section className="content-note"><span className="page-eyebrow">HONEST LIMITS</span><h2>A gap is a lead to investigate, not a recovery claim.</h2><p>Missing cost evidence is not zero. Unmatched charges are not assigned by guesswork. A negative shipping balance does not prove a carrier error, recoverable money, net profit or total order loss. The current public review is CSV-based; automatic carrier polling and scheduled monitoring are not included.</p></section>
 </main></MarketingShell>;
}
