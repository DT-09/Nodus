import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Know what shipping really costs"},
 {name:"description",content:"Compare Shopify shipping revenue with carrier and 3PL cost records. Find unmatched charges, incomplete evidence and orders where delivery costs more than customers paid."},
 {property:"og:title",content:"NODUS — Shipping cost control for Shopify merchants"},
 {property:"og:description",content:"See what customers paid for shipping, what carriers charged and which costs still need an explanation."},
 {name:"theme-color",content:"#11120f"},
];

const checks=[
 {n:"01",title:"What did the customer pay?",body:"Bring Shopify order exports with shipping collected, order currency, tax treatment and tracking numbers."},
 {n:"02",title:"What did delivery cost?",body:"Bring carrier or 3PL charge exports. Keep invoice IDs, charge IDs and tracking references attached."},
 {n:"03",title:"Which numbers actually match?",body:"Match exact order references and unique tracking numbers. Leave ambiguous and unmatched charges out of the totals."},
 {n:"04",title:"Where is the shipping shortfall?",body:"Review order-level balances, carrier spend and historical shipping-policy replays. Export the evidence for your team."},
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nodus-home">
   <section className="nh-hero">
    <div className="nh-copy">
     <p className="nh-eyebrow"><span></span> SHIPPING COST CONTROL / FOR SHOPIFY STORES</p>
     <h1>Shipping looked fine<br/>at checkout.<br/><em>Then the bill arrived.</em></h1>
     <p className="nh-lede">NODUS puts the money customers paid for delivery beside the carrier and 3PL charges that followed. See which orders are covered, which charges cannot be matched and where shipping is costing more than it brings in.</p>
     <div className="nh-actions">
      <Link to="/control-week" className="nh-primary">START THE FREE 7-DAY CONTROL WEEK <span>↗</span></Link>
      <Link to="/demo" className="nh-secondary">SEE A REAL WORKFLOW WITH SAMPLE DATA ↗</Link>
     </div>
     <div className="nh-meta"><span>SHOPIFY ORDER EXPORTS</span><i></i><span>CARRIER / 3PL COSTS</span><i></i><span>ORDER-LEVEL REVIEW</span></div>
    </div>
    <div className="nh-product">
     <div className="nh-product-top"><div className="nh-product-brand"><img src={NODUS_MARK} alt="NODUS network mark"/><div><b>NODUS</b><small>SHIPPING CONTROL</small></div></div><span className="nh-product-state">SAMPLE REVIEW / USD</span></div>
     <div className="nh-product-title"><span>FOUR SAMPLE ORDERS · SYNTHETIC DATA</span><h2>What came in.<br/><em>What went out.</em></h2></div>
     <div className="nh-output nh-commercial-metrics">
      <div><span>SHIPPING COLLECTED</span><b>$26.00</b><small>Across 4 orders</small></div>
      <div><span>MATCHED CARRIER COST</span><b>$26.90</b><small>Across 3 supported orders</small></div>
      <div><span>SHIPPING BALANCE</span><b>−$0.90</b><small>Matched orders only</small></div>
     </div>
     <div className="nh-ledger-preview" aria-label="Illustrative sample shipping cost review">
      <div className="nh-ledger-head"><span>ORDER REVIEW</span><span>EXAMPLE DATA</span></div>
      <div className="nh-ledger-row"><span>#1042 · matched</span><b>$8.00 in / $7.20 out</b><em>+$0.80</em></div>
      <div className="nh-ledger-row"><span>#1043 · matched</span><b>$6.00 in / $9.40 out</b><em>−$3.40</em></div>
      <div className="nh-ledger-row"><span>#1044 · incomplete</span><b>$0.00 in / no cost record</b><em>Not calculated</em></div>
      <div className="nh-ledger-row"><span>#1045 · matched</span><b>$12.00 in / $10.30 out</b><em>+$1.70</em></div>
     </div>
     <div className="nh-sample-warning"><span>!</span><p>One unmatched carrier charge ($14.60) stays outside the order totals. These are synthetic examples, not merchant results.</p></div>
     <p className="nh-product-note">NO STORE CONNECTION REQUIRED FOR THE FREE CSV REVIEW</p>
    </div>
   </section>
   <section className="nh-visual-control" aria-label="Illustrative shipping cost flow">
    <div className="nh-visual-heading"><span>THE SHIPPING MONEY TRAIL</span><p>One order. Two sides of the bill.</p></div>
    <div className="nh-flow">
     <article className="nh-flow-node"><span>01 / CHECKOUT</span><strong>$8.00</strong><small>Shipping collected</small><div className="nh-flow-track"><i style={{width:"78%"}}/></div></article>
     <div className="nh-flow-link"><span>ORDER + TRACKING</span><i/></div>
     <article className="nh-flow-node"><span>02 / CARRIER</span><strong>$11.40</strong><small>Delivery charge</small><div className="nh-flow-track"><i style={{width:"100%"}}/></div></article>
     <div className="nh-flow-link"><span>03 / REVIEW</span><i/></div>
     <article className="nh-flow-result"><span>ORDER BALANCE</span><strong>−$3.40</strong><small>Matched example · needs review</small><div className="nh-result-pulse"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
    </div>
    <div className="nh-visual-foot"><span><i className="nh-dot-match"/> MATCHED RECORD</span><span><i className="nh-dot-open"/> UNMATCHED CHARGES STAY SEPARATE</span><span>ILLUSTRATIVE DATA / USD</span></div>
   </section>
   <section className="nh-statement">
    <div><span>THE PROBLEM</span><h2>Shopify shows what you collected.<br/><em>Your carrier shows what it charged.</em></h2></div>
    <p>Those records do not arrive as one clean report. Split shipments, later adjustments, missing tracking numbers and mixed currencies make a simple total unreliable. NODUS shows what matches and what still needs checking.</p>
   </section>
   <section className="nh-services">
    <div className="nh-section-heading"><span>WHAT YOU CAN CHECK</span><h2>Four questions.<br/><em>One shipping review.</em></h2></div>
    <div className="nh-service-grid">{checks.map(item=><article key={item.n}><span className="nh-service-number">{item.n}</span><small>SHIPPING CONTROL</small><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
   </section>
   <section className="nh-process">
    <div className="nh-section-heading"><span>START WITHOUT A SALES CALL</span><h2>Try the numbers<br/><em>before you decide.</em></h2></div>
    <div className="nh-steps">
     <article><span>01 / SAMPLE</span><h3>See it work</h3><p>Open the sample review. Download the files and inspect every match and exception.</p><Link to="/demo">OPEN SAMPLE REVIEW ↗</Link></article>
     <article><span>02 / YOUR DATA</span><h3>Run your own</h3><p>Import order and carrier CSVs. Files are processed in your browser, not uploaded to NODUS.</p><Link to="/manual-data">OPEN CSV REVIEW ↗</Link></article>
     <article><span>03 / DECISIONS</span><h3>Test a policy</h3><p>Replay a flat shipping rate or free-shipping threshold against the order history you supplied.</p><Link to="/manual-data">TEST SHIPPING POLICIES ↗</Link></article>
     <article><span>04 / REPEAT</span><h3>Keep the record</h3><p>Export the review pack and decide whether a monthly shipping check is worth keeping.</p><Link to="/control-week">FOLLOW THE 7-DAY PLAN ↗</Link></article>
    </div>
   </section>
   <section className="nh-proof">
    <div className="nh-proof-copy"><span>THE POINT OF A REPEAT REVIEW</span><h2>Next month's carrier bill<br/><em>will not explain itself.</em></h2><p>Carrier costs change. Surcharges arrive later. Shipping rules affect what customers pay. A monthly review gives the operator a record to compare, not another dashboard to admire.</p><Link to="/methodology">SEE HOW THE NUMBERS ARE HANDLED ↗</Link></div>
    <div className="nh-proof-list">
     <div><b>01</b><span>Separate totals by currency</span></div><div><b>02</b><span>Keep unmatched charges visible</span></div><div><b>03</b><span>Do not treat missing costs as zero</span></div><div><b>04</b><span>Exclude unsupported tax-inclusive balances</span></div><div><b>05</b><span>Export the rows behind each result</span></div>
    </div>
   </section>
   <section className="nh-close">
    <span>NODUS / FREE SHIPPING CONTROL WEEK</span><h2>Find out what delivery<br/><em>is really costing you.</em></h2>
    <p>Start with sample data or bring your own exports. No card details. No Shopify password. No sales call required to try the CSV review.</p>
    <div className="nh-actions nh-actions-center"><Link to="/control-week" className="nh-primary">START THE FREE 7-DAY EXPERIENCE ↗</Link><Link to="/pricing" className="nh-secondary">SEE THE COMMERCIAL PLAN ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
