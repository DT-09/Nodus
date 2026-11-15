import type {LoaderFunctionArgs,MetaFunction} from "react-router";
import {useLoaderData} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
export const meta:MetaFunction=()=>[{title:"Pricing — NODUS"},{name:"description",content:"Proposed NODUS subscription structure and merchant evaluation information."}];
export async function loader(_args:LoaderFunctionArgs){return {contactEmail:process.env.PUBLIC_CONTACT_EMAIL?.trim()||null};}
export default function Pricing(){
 const {contactEmail}=useLoaderData<typeof loader>();
 const subject=encodeURIComponent("NODUS merchant evaluation");
 const body=encodeURIComponent("Hello NODUS,\\n\\nI would like to discuss a merchant evaluation.\\n\\nShopify store URL:\\nApproximate monthly order volume:\\nCarrier / 3PL cost CSV available (yes/no):\\nPrimary shipping question:\\n\\n");
 return <MarketingShell><main className="content-page"><header><p className="page-eyebrow">COMMERCIAL / PROPOSED PRICING</p><h1>Pay for better decisions.<br/>Not another dashboard.</h1><p className="page-lede">The proposed NODUS structure separates evidence-led intelligence from controlled policy workflows and multi-store governance. These prices are hypotheses to validate with qualified merchants—not active checkout offers.</p></header>
 <section className="pricing-options">
  <article className="pricing-option"><span>01 / INTELLIGENCE</span><h2>Understand</h2><p>Shopify order context, carrier-cost imports, evidence review, reconciliation, diagnostics and exportable reports.</p><strong>$99 <small>/ month proposed</small></strong></article>
  <article className="pricing-option"><span>02 / CONTROL</span><h2>Evaluate & govern</h2><p>Intelligence capabilities plus historical policy scenarios, approval workflows and supported change verification when available.</p><strong>$199 <small>/ month proposed</small></strong></article>
  <article className="pricing-option"><span>03 / SCALE</span><h2>Operate across stores</h2><p>Control capabilities plus multi-store governance, expanded history, custom mappings and advanced reporting/API access when implemented.</p><strong>$299 <small>/ month proposed</small></strong></article>
 </section>
 <section className="content-note"><h2>Commercial status — no hidden checkout</h2><p>Recurring subscription billing, server-side paid entitlements and a self-serve checkout are not implemented in the current repository build. No payment is due through this page. Final plan limits, availability and prices will be confirmed before any offer is made.</p></section>
 <section className="content-note"><h2>Start with a merchant evaluation</h2><p>The current evaluation workflow is designed around one Shopify store, a defined order sample and a supported carrier-cost CSV. It can establish whether the available evidence is sufficient for a useful analysis. It does not promise savings or recovered charges.</p>{contactEmail?<a className="cta-primary" href={\`mailto:\${contactEmail}?subject=\${subject}&body=\${body}\`}>REQUEST A MERCHANT EVALUATION ↗</a>:<p className="import-error" role="status">Private merchant enquiry intake is not configured. A business-owned contact channel must be set before public launch.</p>}</section>
 </main></MarketingShell>;
}
