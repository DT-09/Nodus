import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS pricing — 3PL billing and performance control"},
 {name:"description",content:"Request a free seven-day NODUS trial. Continue with the merchant 3PL control workspace at the initial $99/month price, subject to pilot confirmation."}
];

const included=[
 "Merchant-specific workspace with revocable private access",
 "Provider and effective-dated contract rate records",
 "CSV invoice intake with source-row lineage",
 "Operational activity intake for exact-reference quantity checks",
 "Deterministic rate and quantity reconciliation",
 "Persistent exception investigation and case history",
 "Provider outcome ledger: raised, promised, posted and verified",
 "Recurring period reports with evidence coverage and limitations"
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero">
   <p className="page-eyebrow">NODUS / COMMERCIAL SERVICE</p>
   <h1>Control the fulfilment bill.<br/><em>Every month.</em></h1>
   <p className="page-lede">A recurring merchant-side control record for 3PL contract rates, invoice charges, operational evidence, exceptions and verified provider outcomes.</p>
  </header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free">
    <span className="nd-plan-kicker">01 / EVALUATION</span><h2>Seven-day trial</h2><p className="nd-plan-price">Free</p>
    <p className="nd-plan-desc">A real private workspace using your own contract, invoice and available operational exports. No card details are collected on the request form.</p>
    <ul><li>Data compatibility review before activation</li><li>Private merchant workspace</li><li>Import and reconcile supported source records</li><li>Investigate exceptions and record outcomes</li><li>Generate a period report during the trial</li></ul>
    <Link to="/buyer-evaluation#trial-request" className="cta-secondary">REQUEST THE TRIAL ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro nd-plan-monthly">
    <span className="nd-plan-kicker">02 / CONTINUOUS CONTROL</span><h2>NODUS Core</h2><p className="nd-plan-price">$99 <small>/ month</small></p>
    <p className="nd-plan-desc">For a merchant that reviews recurring 3PL invoices and needs the evidence, investigations and outcomes to carry forward each billing period.</p>
    <ul>{included.map(item=><li key={item}>{item}</li>)}</ul>
    <Link to="/buyer-evaluation#trial-request" className="cta-primary">START WITH THE FREE TRIAL ↗</Link>
   </article>
  </section>
  <section className="nd-pricing-process">
   <div><span>HOW ACCESS WORKS</span><h2>Start when the workspace<br/><em>is ready to work.</em></h2></div>
   <div className="nd-pricing-steps">
    <article><b>01</b><div><h3>Request access</h3><p>Tell us about your 3PL setup and the records you can export. The request form does not collect source files.</p></div></article>
    <article><b>02</b><div><h3>Confirm compatibility</h3><p>NODUS checks whether the contract rate card, invoice rows and activity exports fit the supported formats. Unsupported or ambiguous terms are identified before activation.</p></div></article>
    <article><b>03</b><div><h3>Activate seven days</h3><p>The trial starts only after your private workspace is provisioned and ready. Waiting for onboarding does not consume trial time.</p></div></article>
    <article><b>04</b><div><h3>Continue monthly</h3><p>Before the trial ends, the recurring scope and subscription are confirmed. Paid access is activated after the subscription is confirmed; self-serve checkout is not yet offered.</p></div></article>
   </div>
  </section>
  <section className="nd-pricing-value">
   <div><span>WHY IT REPEATS</span><h2>The next invoice<br/><em>starts a new review.</em></h2><p>Contracts have effective dates. Invoices recur. Activity changes. Disputes and promised credits can remain open across periods. NODUS keeps those records together so each new review builds on the previous one.</p></div>
   <div className="nd-pricing-deliverables"><p><b>01 / CONTRACT</b> Rate rules and effective periods</p><p><b>02 / INVOICE</b> Charges, quantities, currency and source rows</p><p><b>03 / ACTIVITY</b> Exact-reference operational evidence</p><p><b>04 / CASES</b> Investigation state and provider responses</p><p><b>05 / OUTCOMES</b> Promised, posted and verified adjustments</p><p><b>06 / REPORT</b> Period scope, exceptions and next actions</p></div>
  </section>
  <section className="nd-pricing-faq">
   <h2>Scope and trust</h2>
   <div><h3>Does NODUS guarantee savings or credits?</h3><p>No. It calculates supported variances and preserves evidence for investigation. A calculated variance is not proof of provider liability or recoverable money.</p></div>
   <div><h3>Does it connect to Shopify automatically?</h3><p>The first onboarding path uses merchant-supplied CSV exports. platform APIs and direct 3PL integrations are deferred until a customer requires them and the integration is tested.</p></div>
   <div><h3>Which files are supported?</h3><p>Structured CSV rate cards, one invoice per CSV and operational activity CSVs. Each upload is limited to 5 MB and 20,000 data rows. PDF extraction is not included.</p></div>
   <div><h3>Are source files stored?</h3><p>CSV files are processed in memory. NODUS stores normalized source rows, file names, file hashes and source-row references for auditability; it does not retain the original uploaded file in this release.</p></div>
   <div><h3>Is the subscription self-serve?</h3><p>Not yet. Trial requests are reviewed, workspaces are activated after onboarding, and paid access is enabled after the subscription is confirmed. No automated checkout is claimed.</p></div>
  </section>
  <section className="nd-pricing-contact">
   <h2>Make your 3PL relationship auditable.</h2><p>Start with your actual rate card, invoice and activity exports. Decide whether the recurring control is worth keeping after the trial.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST SEVEN-DAY TRIAL ↗</Link><Link to="/product" className="cta-secondary">EXPLORE THE PRODUCT ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
