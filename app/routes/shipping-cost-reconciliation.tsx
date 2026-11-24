import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"Shopify Shipping Cost Reconciliation | NODUS"},
  {name:"description",content:"Reconcile Shopify shipping revenue with carrier and 3PL cost exports. Review matched, unmatched and incomplete evidence before making shipping decisions."},
  {name:"keywords",content:"Shopify shipping cost reconciliation, Shopify carrier cost analysis, 3PL invoice reconciliation, shipping revenue vs cost"},
  {property:"og:title",content:"Shopify Shipping Cost Reconciliation — NODUS"},
  {property:"og:description",content:"Compare merchant-provided order and carrier-cost CSV files in the browser. Inspect matches, unmatched charges and currency-separated totals."},
  {name:"robots",content:"noindex, nofollow"},
];

const stages=[
  ["01","Bring the order record","NODUS reads the Shopify order and shipping fields available under the store's granted permissions."],
  ["02","Import billed-cost evidence","Upload a supported carrier or 3PL CSV export. Each charge retains the identifiers available in the source."],
  ["03","Review the match","Exact order references and unambiguous tracking references can be matched. Ambiguous, duplicate and unmatched records remain visible."],
  ["04","Inspect the economics","Review only calculations supported by complete evidence and the declared currency and tax treatment."],
  ["05","Export a review record","Download the CSV register and JSON decision pack, including scope and limitations."],
];

export default function ShippingCostReconciliation(){
  return <MarketingShell><main className="content-page">
    <header>
      <p className="page-eyebrow">SHOPIFY / SHIPPING COST RECONCILIATION</p>
      <h1>What did shipping<br/><em>actually cost?</em></h1>
      <p className="page-lede">Shopify records what a customer paid at checkout. Carrier and 3PL statements record what fulfillment cost. NODUS connects those records so an operator can inspect coverage, investigate exceptions and understand the limits of each conclusion.</p>
      <div className="hero-ctas">
        <Link to="/demo" className="cta-primary">INSPECT THE SAMPLE DECISION PACK <span>↗</span></Link>
        <Link to="/buyer-evaluation" className="cta-secondary">CHECK MERCHANT FIT <span>↗</span></Link>
      </div>
    </header>

    <section className="content-note">
      <span className="page-eyebrow">THE OPERATING PROBLEM</span>
      <h2>Checkout revenue and billed fulfillment cost live in different records.</h2>
      <p>A merchant may collect a shipping charge, subsidize delivery, offer free shipping or absorb a carrier adjustment. The answer is not a simple subtraction when the invoice is incomplete, an order has multiple tracking references or a charge cannot be allocated with confidence.</p>
      <p>NODUS is designed to keep those gaps visible instead of turning unknown costs into zero or presenting an unsupported margin number.</p>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">THE WORKFLOW</span>
      <h2>From separate exports to a reviewable record.</h2>
      <div className="content-grid">{stages.map(([n,title,body])=><article key={n}><span>{n} / WORKFLOW</span><h2>{title}</h2><p>{body}</p></article>)}</div>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">THE DELIVERABLE</span>
      <h2>A shipping economics decision pack.</h2>
      <ul>
        <li>Data scope, order window, currency and evidence coverage.</li>
        <li>Order-level shipping revenue and supported carrier/3PL cost evidence.</li>
        <li>Matched, unmatched, duplicate, ambiguous and incomplete records.</li>
        <li>Deterministic calculations with source references and explicit limitations.</li>
        <li>Historical flat-rate or free-shipping threshold replay when the stored data supports it.</li>
        <li>Merchant-scoped CSV register and JSON export for independent inspection.</li>
      </ul>
      <p>The pack does not certify that a carrier charge is correct, prove that a credit was recovered, or forecast conversion, profit or savings.</p>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">WHO SHOULD EVALUATE NODUS</span>
      <h2>For Shopify operators with recurring carrier or 3PL evidence.</h2>
      <p>The strongest fit is a physical-goods merchant that has recurring parcel charges, exports invoice-level cost records and needs to reconcile those records with Shopify orders. A finance, fulfillment or ecommerce operator should own the review.</p>
      <p>NODUS is not a fit when cost records are unavailable, charge identifiers cannot support reliable matching, shipping activity is too infrequent to justify the workflow, or the existing carrier/3PL platform already solves the problem well.</p>
      <div className="hero-ctas">
        <Link to="/pricing" className="cta-primary">REQUEST A FOUNDING ASSESSMENT <span>↗</span></Link>
        <Link to="/methodology" className="cta-secondary">READ THE METHOD <span>↗</span></Link>
      </div>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">CURRENT RELEASE BOUNDARY</span>
      <h2>CSV evidence in. No invented integrations.</h2>
      <p>The current public workflow uses merchant-provided order CSV and carrier-cost CSV files. Both files are processed in the browser. Direct Shopify connection, carrier APIs, PDF extraction, automated invoice polling, scheduled monitoring and paid billing are not available in this release.</p>
      <p>See the <Link to="/product">current product scope</Link>, <Link to="/security">security boundaries</Link> and <Link to="/buyer-evaluation">merchant evaluation guide</Link> before sharing data.</p>
    </section>
  </main></MarketingShell>;
}
