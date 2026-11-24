import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Monthly 3PL invoice audit service"},
 {name:"description",content:"A recurring merchant-side 3PL invoice review. Check charges against contract rates, document exceptions and track provider responses each billing cycle."},
 {property:"og:title",content:"NODUS — Your monthly 3PL invoice review"},
 {property:"og:description",content:"A managed monthly review of 3PL invoices, agreed rates and available warehouse evidence."},
 {name:"theme-color",content:"#17131c"},
];

export default function Home(){
 return <MarketingShell active="home">
  <main className="nodus-home">
   <section className="nh-hero">
    <div className="nh-copy">
     <p className="nh-eyebrow"><span></span> MONTHLY 3PL INVOICE REVIEW</p>
     <h1>Your 3PL sends<br/>the invoice.<br/><em>We check the bill.</em></h1>
     <p className="nh-lede">NODUS is a recurring billing-control service for e-commerce merchants using external fulfilment providers. Each review compares the invoice with your agreed rates and the operational records available to support the charges. You receive a prioritised exception report and an evidence trail for provider follow-up.</p>
     <div className="nh-actions">
      <Link to="/buyer-evaluation#trial-request" className="nh-primary">REQUEST AN INVOICE REVIEW <span>↗</span></Link>
      <Link to="/pricing" className="nh-secondary">SEE MONTHLY SERVICE SCOPE ↗</Link>
     </div>
     <div className="nh-meta"><span>CONTRACT CHECK</span><i></i><span>INVOICE EXCEPTIONS</span><i></i><span>MONTHLY FOLLOW-THROUGH</span></div>
    </div>
    <div className="nh-product">
     <div className="nh-product-top"><div className="nh-product-brand"><span className="nh-engine-mark">N</span><div><b>NODUS</b><small>MONTHLY BILLING REVIEW</small></div></div><span className="nh-product-state">SERVICE / SCOPE</span></div>
     <div className="nh-product-title"><span>THE MONTHLY DELIVERABLE</span><h2>One clear view of<br/><em>what needs attention.</em></h2></div>
     <div className="nh-sources">
      <article><span>01 / YOUR AGREEMENT</span><b>Agreed 3PL rates</b><small>Rate cards · units · effective dates</small><strong>THE EXPECTED CHARGE</strong></article>
      <div className="nh-connector"><span></span><b>+</b><span></span></div>
      <article><span>02 / PROVIDER BILL</span><b>Invoice and activity</b><small>Line items · quantities · source records</small><strong>THE ACTUAL CHARGE</strong></article>
     </div>
     <div className="nh-engine"><span className="nh-engine-mark" aria-hidden="true">N</span><div><b>Evidence-led monthly review</b><small>Compare · flag · document · follow through</small></div><span className="nh-engine-arrow">↗</span></div>
     <div className="nh-output">
      <div><span>CHECKED</span><b>Rate matches</b></div>
      <div><span>FLAGGED</span><b>Needs review</b></div>
      <div><span>TRACKED</span><b>Provider response</b></div>
     </div>
     <p className="nh-product-note">ILLUSTRATIVE SERVICE OUTPUT · NOT CUSTOMER RESULTS</p>
    </div>
   </section>

   <section className="nh-statement">
    <div><span>THE BUYER'S PROBLEM</span><h2>Your 3PL invoice is not the same thing as proof that every charge is right.<br/><em>Check it before the next payment cycle.</em></h2></div>
    <p>Rate changes, minimums, storage units and surcharges are easy to miss when the agreement, invoice and warehouse exports sit in separate files. NODUS turns those records into a review your finance or operations team can act on.</p>
   </section>

   <section className="nh-services">
    <div className="nh-section-heading"><span>WHAT THE MONTHLY SERVICE COVERS</span><h2>Not another dashboard.<br/><em>A recurring review.</em></h2></div>
    <div className="nh-service-grid">
     <article><span className="nh-service-number">01</span><small>CONTRACT CHECK</small><h3>Check the agreed rates</h3><p>Compare invoice charge codes, units and effective dates with the rate card you provide.</p></article>
     <article><span className="nh-service-number">02</span><small>INVOICE REVIEW</small><h3>Find exceptions worth checking</h3><p>Identify supported rate differences, duplicate-looking lines, unsupported fees and missing evidence. Ambiguity stays flagged.</p></article>
     <article><span className="nh-service-number">03</span><small>ACTIVITY CHECK</small><h3>Test billed quantities</h3><p>Where provider activity has a reliable reference, compare billed quantities with the records available.</p></article>
     <article><span className="nh-service-number">04</span><small>FOLLOW-THROUGH</small><h3>Carry cases forward</h3><p>Keep provider questions, responses and credit evidence attached to the next billing period.</p></article>
    </div>
   </section>

   <section className="nh-process">
    <div className="nh-section-heading"><span>HOW A REVIEW WORKS</span><h2>From invoice received<br/><em>to actions documented.</em></h2></div>
    <div className="nh-steps">
     <article><span>01 / SEND</span><h3>Share the source records</h3><p>Provide the 3PL agreement or rate card, invoice and available activity export through the agreed secure process.</p></article>
     <article><span>02 / CHECK</span><h3>We reconcile the evidence</h3><p>Supported charges are compared with the applicable rate rules and activity records.</p></article>
     <article><span>03 / REPORT</span><h3>Receive the exception register</h3><p>Each finding includes its source, calculation, evidence gap and recommended next question.</p></article>
     <article><span>04 / REPEAT</span><h3>Keep the monthly history</h3><p>Open questions and confirmed outcomes carry into the next invoice review.</p></article>
    </div>
   </section>

   <section className="nh-proof">
    <div className="nh-proof-copy"><span>BUILT FOR RECURRING 3PL SPEND</span><h2>One invoice is a snapshot.<br/><em>Monthly control is the service.</em></h2><p>3PL invoices recur. Rate cards change. Surcharges appear. Open provider questions can outlive the invoice that started them. NODUS keeps the review continuous so the same issue does not have to be rediscovered each month.</p><Link to="/pricing">SEE THE MONTHLY ENGAGEMENT ↗</Link></div>
    <div className="nh-proof-list">
     <div><b>01</b><span>Monthly invoice and rate-card comparison</span></div>
     <div><b>02</b><span>Evidence-linked exception register</span></div>
     <div><b>03</b><span>Activity checks where records support them</span></div>
     <div><b>04</b><span>Provider query and response tracking</span></div>
     <div><b>05</b><span>Monthly outcome and open-item report</span></div>
    </div>
   </section>

   <section className="nh-close">
    <span>NODUS / MONTHLY 3PL INVOICE REVIEW</span>
    <h2>Before you accept<br/><em>the next 3PL bill.</em></h2>
    <p>Start with one recent invoice, the matching rate card and the activity export you already receive. We will assess whether the records support a useful recurring review. No savings or recovery is promised.</p>
    <div className="nh-actions nh-actions-center"><Link to="/buyer-evaluation#trial-request" className="nh-primary">REQUEST A REVIEW ↗</Link><Link to="/demo" className="nh-secondary">SEE A SAMPLE AUDIT ↗</Link></div>
   </section>
  </main>
 </MarketingShell>;
}
