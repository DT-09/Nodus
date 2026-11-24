import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS — Monthly 3PL invoice review service"},
 {name:"description",content:"See the scope of a recurring 3PL invoice review: contract-rate checks, evidence-linked exceptions, provider follow-through and monthly reporting."}
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="content-page nd-pricing-page">
  <header className="nd-pricing-hero">
   <p className="page-eyebrow">NODUS / RECURRING SERVICE</p>
   <h1>Pay for the review.<br/><em>Not another dashboard.</em></h1>
   <p className="page-lede">NODUS is designed as an ongoing merchant-side 3PL billing review. Each monthly engagement checks the provider's invoice against the agreed rates and available operating evidence, then carries unresolved questions into the next cycle.</p>
  </header>
  <section className="nd-pricing-grid">
   <article className="nd-plan nd-plan-free">
    <span className="nd-plan-kicker">01 / FIRST LOOK</span><h2>Initial invoice assessment</h2><p className="nd-plan-price">No-fee fit check</p>
    <p className="nd-plan-desc">We first confirm whether the records you already have can support a meaningful review. Do not send confidential invoices until a secure transfer method and scope are agreed.</p>
    <ul><li>Confirm provider and fulfilment setup</li><li>Check which contract and invoice records exist</li><li>Identify whether activity exports are available</li><li>Confirm the scope and limits of a first review</li></ul>
    <Link to="/buyer-evaluation#trial-request" className="cta-secondary">REQUEST A FIT CHECK ↗</Link>
   </article>
   <article className="nd-plan nd-plan-pro nd-plan-monthly">
    <span className="nd-plan-kicker">02 / RECURRING ENGAGEMENT</span><h2>Monthly 3PL billing control</h2><p className="nd-plan-price">Quoted <small>per operation</small></p>
    <p className="nd-plan-desc">A recurring service scoped to the number of providers, invoice volume, source-data quality and follow-through required. A fixed monthly fee is agreed before work starts; there is no invented one-size-fits-all price.</p>
    <ul>
     <li>Monthly invoice-to-contract rate comparison</li>
     <li>Evidence-linked exception register and calculations</li>
     <li>Operational quantity checks where references match</li>
     <li>Prioritised questions for the merchant to raise with the 3PL</li>
     <li>Tracking of provider responses and promised credits</li>
     <li>Verification of posted adjustments when evidence is supplied</li>
     <li>Monthly report with open items, resolved items and limitations</li>
    </ul>
    <Link to="/buyer-evaluation#trial-request" className="cta-primary">SCOPE A MONTHLY ENGAGEMENT ↗</Link>
   </article>
  </section>
  <section className="nd-pricing-process">
   <div><span>HOW THE ENGAGEMENT STARTS</span><h2>Prove the workflow<br/><em>before recurring billing.</em></h2></div>
   <div className="nd-pricing-steps">
    <article><b>01</b><div><h3>Fit check</h3><p>Confirm the merchant uses an external 3PL and receives a contract or rate card, itemised invoices and relevant operational exports.</p></div></article>
    <article><b>02</b><div><h3>Scoped first review</h3><p>Agree the provider, billing period, data transfer method, deliverables and exclusions in writing before confidential files are shared.</p></div></article>
    <article><b>03</b><div><h3>Review and report</h3><p>Deliver calculations with source references, distinguish rate variances from unpriced charges, and list evidence gaps. A variance is not a confirmed recovery.</p></div></article>
    <article><b>04</b><div><h3>Monthly continuation</h3><p>If the first review proves useful, agree a fixed recurring scope and fee. Each cycle updates open cases and records verified outcomes.</p></div></article>
   </div>
  </section>
  <section className="nd-pricing-value">
   <div><span>WHAT THE CLIENT RECEIVES</span><h2>A decision-ready<br/><em>monthly report.</em></h2><p>The report is built for the finance or operations owner who needs to decide which charges to question, what evidence supports the question and which provider responses remain outstanding.</p></div>
   <div className="nd-pricing-deliverables"><p><b>01 / SUMMARY</b> Period reviewed, invoice totals and coverage</p><p><b>02 / EXCEPTIONS</b> Amount, calculation, contract clause and source line</p><p><b>03 / EVIDENCE GAPS</b> Missing or ambiguous records, not guessed values</p><p><b>04 / ACTIONS</b> Suggested provider questions and owner status</p><p><b>05 / OUTCOMES</b> Promised, posted and verified adjustments kept distinct</p><p><b>06 / NEXT CYCLE</b> Open items and checks to repeat next month</p></div>
  </section>
  <section className="nd-pricing-faq">
   <h2>Scope and trust</h2>
   <div><h3>Do you guarantee savings or credits?</h3><p>No. The service identifies evidence-supported differences and documents questions for the merchant. The 3PL decides whether to issue a credit; only a posted and evidenced adjustment is recorded as realised.</p></div>
   <div><h3>Do you negotiate or dispute invoices on the merchant's behalf?</h3><p>The initial scope prepares the evidence and suggested questions. External communications, negotiation and authority to act for the merchant require a separate written agreement and authorised personnel.</p></div>
   <div><h3>What records are needed?</h3><p>At minimum, an itemised 3PL invoice and the applicable agreement or rate card. Operational activity exports improve quantity checks but are not always available. Unsupported conclusions remain out of scope.</p></div>
   <div><h3>How is the fee set?</h3><p>After a fit check, the monthly fee is scoped to provider count, invoice volume, data quality and agreed deliverables. The fee is confirmed in writing before recurring work or billing begins.</p></div>
   <div><h3>Is this service already available for every provider?</h3><p>No universal compatibility is claimed. Each engagement starts with a data and scope check. A provider or file format is accepted only after its records can be reconciled reliably.</p></div>
  </section>
  <section className="nd-pricing-contact">
   <h2>Make the next 3PL invoice accountable.</h2><p>Tell us about your operation and the records you receive. The first step is a fit check—not an automatic subscription.</p>
   <div className="hero-ctas"><Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST A FIT CHECK ↗</Link><Link to="/demo" className="cta-secondary">INSPECT A SAMPLE REVIEW ↗</Link></div>
  </section>
 </main></MarketingShell>;
}
