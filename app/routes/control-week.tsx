import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS Control Week — 24 November to 1 December 2026"},
 {name:"description",content:"Seven days of practical 3PL billing control for Shopify and ecommerce merchants. Compare contract rates, invoices, operational activity and provider outcomes."},
 {property:"og:title",content:"NODUS Control Week | 24 Nov — 1 Dec 2026"},
 {property:"og:description",content:"Turn your 3PL billing records into an evidence-led monthly control process."}
];

const days=[
 ["24 NOV","01 / BASELINE","Map the fulfilment spend","Identify the 3PL relationship, billing cadence, charge categories and records available. Establish what can and cannot be verified."],
 ["25 NOV","02 / CONTRACT","Reconstruct the agreed rates","Organise the effective-dated rate card: charge codes, units, fixed fees, per-unit rates, currencies and contract periods."],
 ["26 NOV","03 / INVOICE","Read the bill line by line","Structure invoice rows and compare each supported line with the applicable contract rule. Keep source-row references."],
 ["27 NOV","04 / ACTIVITY","Test billed quantities","Match billed quantities only where operational activity has an exact reference, charge code and unit. Keep gaps visible."],
 ["28 NOV","05 / EXCEPTIONS","Separate signals from findings","Classify rate variances, unsupported charges, ambiguous rules, currency mismatches and missing evidence. Do not label a signal as a proven overcharge."],
 ["29 NOV","06 / CASE HISTORY","Track the provider response","Record investigation status, provider references, responses and promised adjustments. A promise is not a posted credit."],
 ["30 NOV — 1 DEC","07 / MONTHLY CONTROL","Build the next billing cycle","Produce a period review, preserve unresolved cases and define the checks that should recur when the next invoice arrives."]
];

export default function ControlWeek(){
 return <MarketingShell active="evaluation"><main className="content-page nd-control-week">
  <header>
   <p className="page-eyebrow">NODUS / PUBLIC MERCHANT PROGRAMME / 24 NOV — 1 DEC 2026</p>
   <h1>Seven days to put<br/><em>your 3PL bill under control.</em></h1>
   <p className="page-lede">A practical, evidence-led control week for ecommerce operators who outsource fulfilment. We move from the agreement to the invoice, from billed quantities to operational records, and from isolated exceptions to a repeatable monthly review.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST A PRIVATE WORKSPACE ↗</Link><Link to="/guides/3pl-invoice-reconciliation" className="cta-secondary">READ THE RECONCILIATION GUIDE ↗</Link></div>
  </header>
  <section className="content-note">
   <span className="page-eyebrow">THE CONTROL WEEK / DAILY PROGRAMME</span>
   <h2>Seven days. One operating record.</h2>
   <div className="method-list">{days.map(([date,kicker,title,body])=><article key={kicker}><b>{date}</b><div><span className="page-eyebrow">{kicker}</span><h2>{title}</h2><p>{body}</p></div></article>)}</div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">WHO SHOULD TAKE PART</span>
   <h2>Built for merchants with recurring 3PL bills.</h2>
   <div className="content-grid">
    <article><span>FIT / 01</span><h2>External fulfilment</h2><p>Your store uses one or more third-party logistics providers for warehousing, pick/pack or fulfilment.</p></article>
    <article><span>FIT / 02</span><h2>Recurring invoices</h2><p>You receive regular provider invoices and want to check charges against agreed rates and service activity.</p></article>
    <article><span>FIT / 03</span><h2>Usable records</h2><p>You can obtain a rate card or contract schedule, invoice CSVs and operational exports where available.</p></article>
   </div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">WHAT YOU NEED</span>
   <h2>Bring records, not passwords.</h2>
   <ul><li>Your provider's rate card or relevant contract schedule.</li><li>One or more recent 3PL invoice CSV exports.</li><li>Operational activity CSV exports, if the provider supplies them.</li><li>A business contact authorised to review the records.</li></ul>
   <p>Do not send passwords, API keys, payment details or customer personal data. The initial workflow is CSV-based. A private workspace is provisioned only after a fit review. The public request form does not collect source files.</p>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">THE COMMERCIAL TEST</span>
   <h2>Does the control need to continue next month?</h2>
   <p>The point is not to manufacture a discrepancy. It is to establish whether recurring invoices, changing contract rates, operational evidence and open provider cases create a real monthly control requirement. If the records show no recurring need, a subscription should not be recommended.</p>
   <p>NODUS Core is currently listed at $99/month as an initial price hypothesis. It is not a validated market price. Any paid continuation requires a confirmed scope and an authorised seller/payment setup.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">APPLY FOR THE CONTROL WEEK ↗</Link><Link to="/pricing" className="cta-secondary">SEE THE MONTHLY SCOPE ↗</Link></div>
  </section>
  <section className="content-note">
   <span className="page-eyebrow">EVIDENCE STANDARD</span>
   <h2>A variance is not recovered revenue.</h2>
   <p>NODUS distinguishes calculated differences, potential contract discrepancies, missing evidence, provider-acknowledged adjustments, posted credits and verified outcomes. It does not guarantee savings, provider liability or credits.</p>
  </section>
 </main></MarketingShell>;
}
