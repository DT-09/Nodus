import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS pricing — hourly 3PL invoice review and monthly control"},
 {name:"description",content:"A scoped hourly 3PL invoice review, followed by an optional monthly fulfilment-cost control workspace."}
];

export default function Pricing(){
 return <MarketingShell active="pricing"><main className="nc-form-shell">
  <div className="nc-overline">NODUS / SERVICE PRICING</div>
  <h1>Start with the invoice.<br/><em>Continue only if it helps.</em></h1>
  <p className="nc-lede">NODUS is structured around a paid first review and an optional monthly workflow. No automatic subscription, no recovery percentage and no payment before the scope is confirmed.</p>
  <section className="nc-section">
   <div className="nc-price-layout">
    <article className="nc-price-card featured"><span className="nc-overline">01 / FIRST ENGAGEMENT</span><h3>Hourly Invoice Review</h3><div className="nc-price">$100 <small>/ hour · proposed opening rate</small></div><p>One warehouse, one invoice, one active rate card and up to 25 invoice lines. The 60-minute session begins only after CSV compatibility is confirmed.</p><ul><li>10 min: confirm source coverage and scope</li><li>25 min: review rate and invoice exceptions</li><li>15 min: validate activity evidence and priorities</li><li>10 min: walkthrough and handover</li><li>Exported exception register and written action sheet</li><li>Hard 60-minute cap; extra time requires approval</li><li>No promise of credits or recovered money</li></ul><Link to="/buyer-evaluation" className="nc-btn nc-btn-primary">Request an hourly review ↗</Link></article>
    <article className="nc-price-card"><span className="nc-overline">02 / OPTIONAL CONTINUATION</span><h3>Monthly Control</h3><div className="nc-price">Scoped <small>/ monthly service · not yet orderable</small></div><p>Planned scope: one 3PL, one monthly invoice, one active rate card and one activity export. Persistent exception history and payment are not yet enabled.</p><ul><li>Planned recurring invoice review</li><li>Planned exception and credit history</li><li>Planned month-over-month cost trend</li><li>Not available until persistence and reviewer workflow are built</li><li>No subscription or payment is active</li></ul><Link to="/buyer-evaluation" className="nc-btn nc-btn-secondary">Discuss monthly continuation ↗</Link></article>
   </div>
   <p className="nc-footnote">These are proposed NODUS opening prices, not evidence of completed sales or validated willingness to pay. No checkout is active on this page. A paid engagement requires a qualified reviewer, an agreed scope, an authorized adult seller, and confirmed payment/refund/tax arrangements. The $100 hourly rate is a price to test, not a proven market-clearing rate.</p>
  </section>
  <section className="nc-section"><div className="nc-overline">THE BUYER GETS</div><h2>A real working asset. <em>Not a pitch deck.</em></h2><div className="nc-service-grid">
   <article className="nc-service"><span className="nc-number">01</span><h3>Review workspace</h3><p>A browser-based reconciliation workflow for rate cards, invoice lines and available operational activity.</p><small>CSV INPUT / SOURCE-ROW REFERENCES</small></article>
   <article className="nc-service"><span className="nc-number">02</span><h3>Evidence register</h3><p>Supported matches, unmatched charges, ambiguous references and missing records kept separate.</p><small>NO GUESSED MATCHES</small></article>
   <article className="nc-service"><span className="nc-number">03</span><h3>Decision pack</h3><p>Exportable findings and a clear record of what needs checking with the fulfilment provider.</p><small>MERCHANT-OWNED HANDOVER</small></article>
  </div></section>
  <section className="nc-section"><div className="nc-overline">IMPORTANT LIMITS</div><div className="nc-faq">
   <article><h3>Is the $100/hour rate proven?</h3><p>No. It is the proposed opening price. Public market evidence includes experienced 3PL consultants advertising around $75/hour and fixed-price invoice audits. NODUS must prove its own price with paid pilots.</p></article>
   <article><h3>Can I pay online today?</h3><p>No. The enquiry form does not collect money. Payment activation requires an authorized adult seller to complete provider onboarding and test the billing lifecycle.</p></article>
   <article><h3>What files are supported?</h3><p>CSV only, up to 5 MB and 20,000 data rows per file. PDF extraction and direct provider integrations are not included.</p></article>
   <article><h3>Does monthly control guarantee savings?</h3><p>No. It provides recurring reconciliation and evidence tracking. A flagged difference is not proof of overbilling or a credit.</p></article>
  </div></section>
  <div className="nc-actions"><Link to="/buyer-evaluation" className="nc-btn nc-btn-primary">Request the first review ↗</Link><Link to="/demo" className="nc-btn nc-btn-secondary">Inspect sample data ↗</Link></div>
 </main></MarketingShell>;
}
