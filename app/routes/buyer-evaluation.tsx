import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"Merchant evaluation guide — NODUS"},
  {name:"description",content:"See whether your Shopify order data and carrier-cost exports are suitable for an evidence-led shipping economics assessment."},
  {property:"og:title",content:"Merchant evaluation guide — NODUS"},
  {property:"og:description",content:"A practical guide to the data, scope and deliverables in a NODUS shipping-margin evaluation."},
];

const requirements=[
  ["A Shopify store","An authorized store administrator who can approve the requested read-only access."],
  ["Shipping cost evidence","A carrier or 3PL invoice export in a supported CSV structure, with stable charge identifiers and order or tracking references where available."],
  ["A real operating question","A recurring need to understand shipping charges, fulfillment costs, unmatched records or policy trade-offs."],
];

const deliverables=[
  ["Evidence coverage statement","The authorized order window, imported source, reporting currency, matched records, exclusions and unresolved gaps."],
  ["Exception register","Matched, unmatched, duplicate, ambiguous and incomplete records with the source references available to the system."],
  ["Reconciliation and replay","Deterministic order-level calculations and a historical flat-rate or free-shipping replay where the stored data supports it."],
  ["Decision pack","A merchant-scoped CSV register and a JSON export with scope, methods, limitations and an integrity digest."],
];

export default function BuyerEvaluation(){
  return <MarketingShell active="evaluation"><main className="content-page">
    <header>
      <p className="page-eyebrow">MERCHANTS / EVALUATION GUIDE</p>
      <h1>Bring the records.<br/><em>Leave with a clearer decision.</em></h1>
      <p className="page-lede">NODUS is built for merchants who need to reconcile Shopify shipping charges with actual carrier or 3PL costs, identify underfunded shipping policies and review evidence-backed alternatives.</p>
      <div className="hero-ctas">
        <Link to="/demo" className="cta-primary">INSPECT THE SAMPLE <span>↗</span></Link>
        <Link to="/pricing" className="cta-secondary">REVIEW PRICING <span>↗</span></Link>
      </div>
    </header>

    <section className="content-note">
      <span className="page-eyebrow">01 / WHO THIS IS FOR</span>
      <h2>Built for operators who already have the evidence.</h2>
      <p>The best fit is a Shopify merchant selling physical goods, using an external carrier or 3PL, and reviewing shipping economics across separate order and billing records. The daily user may work in ecommerce operations, fulfillment or finance. The economic buyer is usually the owner or a lead responsible for operations or finance.</p>
      <div className="content-grid">{requirements.map(([title,body])=><article key={title}><span>FIT / REQUIREMENT</span><h2>{title}</h2><p>{body}</p></article>)}</div>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">02 / THE SCOPE</span>
      <h2>Small enough to verify. Useful enough to judge.</h2>
      <p>The initial release is scoped to one authorized Shopify store, one reporting currency, the order history available under granted permissions, and one supported carrier-cost CSV export. Paid onboarding remains closed until production billing and data-handling controls are verified.</p>
      <p>The current <code>read_orders</code> permission normally covers the most recent 60 days. Older order access requires additional Shopify approval; NODUS does not promise unrestricted historical access.</p>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">03 / WHAT YOU RECEIVE</span>
      <h2>A decision pack, not a vanity dashboard.</h2>
      <div className="content-grid">{deliverables.map(([title,body],i)=><article key={title}><span>{String(i+1).padStart(2,"0")} / DELIVERABLE</span><h2>{title}</h2><p>{body}</p></article>)}</div>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">04 / WHAT WE WILL NOT CLAIM</span>
      <h2>Evidence sets the boundary.</h2>
      <ul>
        <li>Missing carrier cost is not treated as zero.</li>
        <li>A discrepancy is not a recovered credit or confirmed saving.</li>
        <li>Historical shipping-revenue replay is not a profit or conversion forecast.</li>
        <li>Carrier invoice intake is CSV-based. Direct UPS, FedEx and USPS invoice APIs are not represented as live integrations.</li>
        <li>Carrier invoice polling, policy-drift alerts and automatic Shopify shipping-policy changes are not offered as current capabilities.</li>
        <li>Merchant-entered value records are attestations, not independent financial audits.</li>
      </ul>
      <p>See the <Link to="/methodology">methodology</Link> and <Link to="/security">security boundaries</Link> before sharing any store data.</p>
    </section>

    <section className="content-note">
      <span className="page-eyebrow">05 / DECIDE WHETHER TO CONTINUE</span>
      <h2>Repeat use must earn its place.</h2>
      <p>After the assessment, the merchant reviews the source records and decides whether the findings are actionable. A monthly subscription is considered only if a recurring workflow and conservative, merchant-accepted value are demonstrated. If the ongoing value is not credible, no subscription is recommended.</p>
      <p>No payment details are collected for the founding evaluation. Participation does not require a testimonial, review or public case study.</p>
      <div className="hero-ctas">
        <Link to="/pricing" className="cta-primary">VIEW THE FOUNDING PROGRAMME <span>↗</span></Link>
        <Link to="/demo" className="cta-secondary">REVIEW SYNTHETIC EXAMPLE <span>↗</span></Link>
      </div>
    </section>
  </main></MarketingShell>;
}
