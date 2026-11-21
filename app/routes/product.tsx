import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS product — Shipping economics control"},
 {name:"description",content:"A working Shopify shipping economics workflow: order-to-invoice reconciliation, carrier spend analysis, exceptions, historical policy replay and decision packs."}
];

const modules=[
 ["01","Order and invoice intake","Read Shopify order exports and carrier or 3PL cost files. Validate required fields, currencies, references and duplicate identifiers before analysis."],
 ["02","Deterministic reconciliation","Match by exact order ID, order name or unique tracking reference. Keep ambiguous and currency-mismatched charges outside matched totals."],
 ["03","Carrier spend intelligence","Group imported charges by carrier and cost type. See billed spend and the records behind each total."],
 ["04","Exception investigation","Separate missing evidence, partial coverage, unmatched invoice lines, tax-inclusive charges and evidenced shipping shortfalls."],
 ["05","Shipping policy replay","Compare a proposed flat rate and free-shipping threshold against historical order baskets when order subtotal is supplied."],
 ["06","Decision records","Export a CSV review register and structured JSON pack. Save aggregate period summaries in the browser for later comparison."]
];

export default function Product(){
 return <MarketingShell active="product"><main className="content-page nd-product-page">
  <header className="nd-product-hero">
   <p className="page-eyebrow">NODUS / PRODUCT</p>
   <div className="nd-product-lockup"><img src={NODUS_MARK} alt="NODUS six-node gold network mark"/><span>SHIPPING ECONOMICS CONTROL</span></div>
   <h1>Shipping costs,<br/><em>reconciled to the order.</em></h1>
   <p className="page-lede">NODUS gives Shopify operators one disciplined workflow for order shipping revenue, carrier and 3PL invoice costs, exceptions, historical shipping policy and evidence-backed decisions.</p>
   <div className="hero-ctas"><Link to="/manual-data" className="cta-primary">OPEN THE FREE WORKSPACE ↗</Link><Link to="/demo" className="cta-secondary">INSPECT THE DECISION PACK ↗</Link></div>
  </header>
  <section className="nd-product-principle">
   <div><span>THE CORE PRODUCT</span><h2>One operating record.<br/><em>Not another shipping dashboard.</em></h2></div>
   <p>Shipping revenue is recorded in the order system. Billed delivery costs sit in carrier and 3PL invoices. NODUS links those records, preserves the exceptions and keeps unsupported conclusions out of the report.</p>
  </section>
  <section className="nd-product-modules">
   <div className="nd-product-heading"><span>THE CAPABILITIES</span><h2>Six connected services.<br/><em>One evidence trail.</em></h2></div>
   <div className="nd-product-grid">{modules.map(([n,title,body])=><article key={n}><span>{n} / MODULE</span><h3>{title}</h3><p>{body}</p></article>)}</div>
  </section>
  <section className="nd-product-deliverable">
   <div><span>THE CUSTOMER RECEIVES</span><h2>A report that can be<br/><em>checked and acted on.</em></h2><p>The decision pack is designed for an operations or finance review. It separates observed records from assumptions and preserves source identifiers so a reviewer can trace the result.</p></div>
   <ul><li>Order-level shipping revenue and matched cost rows</li><li>Carrier spend grouped by provider and cost type</li><li>Unmatched, ambiguous and incomplete evidence register</li><li>Coverage-aware shipping balance and shortfall flags</li><li>Historical shipping-policy revenue replay</li><li>CSV register and structured JSON decision pack</li></ul>
  </section>
  <section className="nd-product-boundary">
   <span>DATA HANDLING</span><h2>Your files stay in your browser.</h2><p>The free CSV review reads files locally. It does not upload or retain source order and invoice files. Aggregate period history is saved only in the browser on that device. Do not use a shared device for sensitive exports.</p>
   <div className="hero-ctas"><Link to="/security" className="cta-secondary">READ DATA HANDLING ↗</Link><Link to="/methodology" className="cta-secondary">READ THE METHOD ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
