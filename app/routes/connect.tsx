import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
export const meta:MetaFunction=()=>[
 {title:"Connect Shopify — NODUS"},
 {name:"description",content:"Review the Shopify connection status and start a local shipping-economics assessment with NODUS."}
];
export default function Connect(){
 return <MarketingShell active="connect"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / SHOPIFY CONNECTION</p><h1>Connect your store.<br/><em>Start with evidence.</em></h1><p className="page-lede">The public NODUS release currently supports browser-local shipping-economics analysis and a founding merchant assessment request. Direct Shopify OAuth installation is not yet open.</p></header>
  <section className="content-note"><h2>Shopify installation is not open yet</h2><p>The production Shopify Partner app, OAuth credentials, durable merchant workspace and review process are not configured. We will not ask you to authorize an app before the connection is operational.</p><div className="connect-status" role="status">Shopify OAuth: not enabled · Public installation: closed</div><p>Request a founding assessment first. We will review whether your order and carrier-cost records fit the supported evaluation before asking for any data.</p><Link to="/buyer-evaluation" className="cta-primary">REQUEST A FOUNDING ASSESSMENT ↗</Link></section>
  <section className="content-note"><h2>Run a local data review</h2><p>Upload an order CSV and carrier-cost CSV. Matching and calculations happen in your browser. Files are not uploaded to NODUS; download the resulting CSV register and JSON decision pack.</p><Link to="/manual-data" className="cta-primary">OPEN MANUAL DATA WORKSPACE ↗</Link></section>
  <section className="content-note"><h2>What the local workflow supports</h2><ul><li>Order-level shipping revenue and carrier-cost evidence matching.</li><li>Matched, unmatched and incomplete evidence states.</li><li>Currency-separated calculations and downloadable review packs.</li><li>Historical policy simulation only where supported by supplied data.</li></ul><p>It does not currently provide saved merchant workspaces, recurring sync, direct carrier APIs, invoice OCR, billing or automatic Shopify policy changes.</p></section>
 </main></MarketingShell>;
}
