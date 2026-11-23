import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
import {NODUS_MARK} from "../components/nodus-mark";

export const meta:MetaFunction=()=>[
 {title:"NODUS product — 3PL billing and performance control"},
 {name:"description",content:"Persistent merchant workspace for 3PL contracts, invoice reconciliation, operational evidence, exception management and verified provider outcomes."}
];

const modules=[
 ["01","Provider and contract records","Keep each fulfilment provider and its effective-dated rate rules. Confirm imported rate rows against the signed agreement before they become active."],
 ["02","Invoice intake and validation","Import one invoice per CSV. Preserve invoice identity, line amounts, quantities, currencies, source file hash and source row number."],
 ["03","Operational activity evidence","Import provider activity and match quantities only on exact references, matching charge codes and matching units."],
 ["04","Deterministic reconciliation","Calculate per-unit or fixed contract amounts using integer minor-unit money arithmetic. Overlapping rules, currency mismatches and unsupported units remain unresolved."],
 ["05","Exception investigation","Keep findings across periods with status changes, notes, provider responses and an auditable event history."],
 ["06","Outcome and period reporting","Separate identified variances, raised claims, promised credits, posted credits and verified outcomes. Generate period reports from persisted records."]
];

export default function Product(){
 return <MarketingShell active="product"><main className="content-page nd-product-page">
  <header className="nd-product-hero">
   <p className="page-eyebrow">NODUS / PRODUCT</p>
   <div className="nd-product-lockup"><img src={NODUS_MARK} alt="NODUS six-node gold network mark"/><span>3PL BILLING & PERFORMANCE CONTROL</span></div>
   <h1>Control the 3PL bill.<br/><em>With the evidence attached.</em></h1>
   <p className="page-lede">NODUS is a merchant-side operating system for fulfilment billing: contract terms, invoice lines, operational activity, investigation history and provider outcomes in one persistent workspace.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST A SEVEN-DAY TRIAL ↗</Link><Link to="/pricing" className="cta-secondary">VIEW MONTHLY PRICING ↗</Link></div>
  </header>
  <section className="nd-product-principle">
   <div><span>THE CORE PRODUCT</span><h2>Not an audit snapshot.<br/><em>A recurring control record.</em></h2></div>
   <p>Every new invoice can be checked against the terms that applied on its date. Open exceptions remain attached to their source evidence. Provider promises are not counted as credits until posted and verified.</p>
  </section>
  <section className="nd-product-modules">
   <div className="nd-product-heading"><span>THE CAPABILITIES</span><h2>Six connected systems.<br/><em>One evidence trail.</em></h2></div>
   <div className="nd-product-grid">{modules.map(([n,title,body])=><article key={n}><span>{n} / MODULE</span><h3>{title}</h3><p>{body}</p></article>)}</div>
  </section>
  <section className="nd-product-deliverable">
   <div><span>THE MERCHANT KEEPS</span><h2>A live case record<br/><em>for each billing cycle.</em></h2><p>The workspace is designed for an operations or finance owner who must review charges, ask the provider a precise question and verify the response in the next statement.</p></div>
   <ul><li>Provider records and effective-dated rate cards</li><li>Invoice headers, line items and imported source row numbers</li><li>Operational activity matched only on exact references</li><li>Reconciliation runs with input hashes and engine versions</li><li>Persistent exceptions, case events and investigation notes</li><li>Provider outcomes and recurring period reports</li></ul>
  </section>
  <section className="nd-product-boundary">
   <span>INITIAL DATA PATH</span><h2>CSV first. Integrations when justified.</h2><p>The initial onboarding path uses merchant-supplied CSV exports. Shopify OAuth and direct 3PL APIs are deferred until a first customer requires them and the integration can be tested. The first release does not extract PDF rate cards, contact providers automatically, change Shopify records or make payments.</p>
   <div className="hero-ctas"><Link to="/methodology" className="cta-secondary">READ THE METHOD ↗</Link><Link to="/security" className="cta-secondary">READ SECURITY STATUS ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
