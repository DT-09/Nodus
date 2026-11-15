import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {useState} from "react";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS — Shipping economics, with the evidence attached"},
  {name:"description",content:"Connect Shopify shipping revenue with carrier-cost evidence. Review coverage, reconcile supported records and replay shipping policies against historical orders."},
  {property:"og:title",content:"NODUS — Shipping economics, with the evidence attached"},
  {property:"og:description",content:"Evidence before recommendation. Approval before execution. Verification after."},
  {name:"theme-color",content:"#101820"},
];

const thread=[
  {label:"ORDER",number:"01",title:"A customer order",detail:"Shopify provides the order, destination, shipping line and the order context available under the merchant's granted permissions.",record:"Source: Shopify order",state:"SOURCE RECORD"},
  {label:"FULFILLMENT",number:"02",title:"A shipment is fulfilled",detail:"Available fulfillment and tracking references establish the operational link. Split shipments remain separate rather than being collapsed into one assumed parcel.",record:"Source: Shopify fulfillment",state:"OPERATIONAL RECORD"},
  {label:"CARRIER COST",number:"03",title:"A carrier charge arrives",detail:"A supported carrier-cost CSV import contributes an invoice or charge record. Original identifiers and currency remain visible; ambiguous rows stay unmatched.",record:"Source: merchant-provided CSV",state:"IMPORTED EVIDENCE"},
  {label:"RECONCILIATION",number:"04",title:"The records are evaluated",detail:"NODUS uses supported references to match records. Duplicate, unmatched, incomplete and currency-mismatched evidence is kept explicit.",record:"Method: deterministic matching",state:"REVIEWABLE RESULT"},
  {label:"DECISION",number:"05",title:"A finding can be inspected",detail:"A conclusion should link to its source records, calculation, coverage and limitations. Historical replay describes observed baskets; it is not a conversion forecast.",record:"Output: traceable analysis",state:"EVIDENCE-QUALIFIED"},
];

const live=[
  ["01","Shopify order ingestion","Read-only order synchronisation with persisted merchant-scoped records."],
  ["02","Carrier-cost CSV intake","Import records with source identity, duplicate protection and currency checks."],
  ["03","Evidence review","Inspect candidate matches and keep ambiguous or incomplete records visible."],
  ["04","Reconciliation & diagnostics","Deterministic results that do not treat missing cost evidence as zero."],
  ["05","Historical policy replay","Evaluate supported flat-rate and free-shipping threshold scenarios against stored orders."],
  ["06","Evidence exports","Download merchant-scoped records and review history for independent analysis."],
];

export default function Home(){
  const [active,setActive]=useState(0);
  const current=thread[active]!;
  return <MarketingShell active="home">
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy-column">
          <p className="eyebrow"><span className="eyebrow-line"></span> SHIPPING ECONOMICS INTELLIGENCE / SHOPIFY</p>
          <h1>What did shipping<br/><em>actually cost?</em></h1>
          <p className="hero-intro">NODUS connects Shopify order shipping revenue with carrier and 3PL cost exports. Review matched, unmatched and incomplete evidence, then produce a decision pack your operations or finance team can inspect.</p>
          <div className="hero-ctas"><Link to="/shipping-cost-reconciliation" className="cta-primary">SEE SHIPPING COST RECONCILIATION <span>↗</span></Link><Link to="/demo" className="cta-secondary">INSPECT THE SAMPLE PACK <span>↗</span></Link><Link to="/pricing" className="cta-secondary">REQUEST A FOUNDING ASSESSMENT <span>↗</span></Link></div>
          <div className="hero-proofline"><span>READ-ONLY BY DEFAULT</span><i></i><span>SOURCE-LINKED RESULTS</span><i></i><span>MERCHANT CONTROL</span></div>
        </div>
        <div className="hero-network" aria-label="Illustration of connected Shopify, fulfillment, carrier evidence, reconciliation and decision nodes">
          <div className="network-orbit orbit-one"></div><div className="network-orbit orbit-two"></div>
          <svg viewBox="0 0 560 500" role="img" aria-hidden="true">
            <defs><linearGradient id="nodeLine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B79A69" stopOpacity=".18"/><stop offset=".52" stopColor="#D5C29B" stopOpacity=".9"/><stop offset="1" stopColor="#6C8794" stopOpacity=".3"/></linearGradient><radialGradient id="nodeGlow"><stop offset="0" stopColor="#D5C29B" stopOpacity=".3"/><stop offset="1" stopColor="#D5C29B" stopOpacity="0"/></radialGradient></defs>
            <g className="network-links" fill="none" stroke="url(#nodeLine)" strokeWidth="1.15"><path d="M90 102 L248 78 L420 155 L355 330 L170 390 L90 102"/><path d="M90 102 L170 250 L355 330 L420 155"/><path d="M248 78 L170 250 L170 390"/><path d="M248 78 L355 330"/><path d="M170 250 L420 155"/></g>
            <g fill="url(#nodeGlow)"><circle cx="90" cy="102" r="44"/><circle cx="248" cy="78" r="44"/><circle cx="420" cy="155" r="44"/><circle cx="355" cy="330" r="44"/><circle cx="170" cy="390" r="44"/><circle cx="170" cy="250" r="54"/></g>
            <g className="network-points"><circle cx="90" cy="102" r="5"/><circle cx="248" cy="78" r="5"/><circle cx="420" cy="155" r="5"/><circle cx="355" cy="330" r="5"/><circle cx="170" cy="390" r="5"/><circle cx="170" cy="250" r="7"/></g>
          </svg>
          <span className="network-label label-shopify">SHOPIFY / ORDERS</span><span className="network-label label-fulfil">FULFILMENT</span><span className="network-label label-carrier">CARRIER COSTS</span><span className="network-label label-evidence">EVIDENCE</span><span className="network-label label-policy">POLICY</span>
          <div className="network-core"><span className="core-ring"></span><b>NODUS</b><small>INTELLIGENCE LAYER</small></div>
          <div className="network-caption"><span>FIG. 01</span><span>CONNECTED SHIPPING ECONOMICS</span></div>
        </div>
      </section>

      <section className="manifesto-band" data-reveal>
        <div><span className="section-index">01 / THE PRINCIPLE</span><h2>A number is not an answer<br/><em>until you can inspect its origin.</em></h2></div>
        <p>Shipping costs are distributed across orders, fulfillments, carrier statements and store policy. NODUS is built to connect those records, expose missing evidence and keep the reasoning visible.</p>
      </section>

      <section className="live-system section-light" id="platform" data-reveal>
        <div className="section-heading"><div><span className="section-index">02 / THE SYSTEM</span><h2>One reviewable workflow.<br/><em>From Shopify orders to billed costs.</em></h2></div><p>Each capability has a defined input, a visible method and an inspectable output.</p></div>
        <div className="system-grid">{live.map(([n,title,body])=><article className="system-cell" key={n}><span className="cell-number">{n}</span><div className="cell-node"><i></i><i></i><i></i></div><h3>{title}</h3><p>{body}</p><span className="cell-rule">NODUS / CORE WORKFLOW</span></article>)}</div>
      </section>

      <section className="evidence-thread" id="evidence" data-reveal>
        <div className="section-heading"><div><span className="section-index">03 / FOLLOW THE EVIDENCE</span><h2>One shipment.<br/><em>Every relevant connection.</em></h2></div><p>Follow the records from Shopify order to carrier charge and reviewed finding. This is an illustrative workflow, not a live merchant record.</p></div>
        <div className="thread-layout">
          <div className="thread-steps" role="tablist" aria-label="Evidence workflow stages">{thread.map((item,i)=><button type="button" role="tab" aria-selected={active===i} className={"thread-step"+(active===i?" is-active":"")} key={item.number} onClick={()=>setActive(i)}><span>{item.number}</span><b>{item.label}</b><i>{active===i?"SELECTED":"VIEW STEP"}</i></button>)}</div>
          <article className="thread-detail" role="tabpanel">
            <div className="detail-top"><span>ILLUSTRATIVE RECORD / NOT LIVE DATA</span><span>{current.state}</span></div>
            <span className="detail-number">{current.number}</span><h3>{current.title}</h3><p>{current.detail}</p>
            <div className="detail-source"><span>PROVENANCE</span><b>{current.record}</b></div>
            <div className="detail-path">{thread.map((item,i)=><span className={i<=active?"path-done":""} key={item.number}></span>)}</div>
            <div className="detail-foot"><span>TRACEABLE BY DESIGN</span><span>{String(active+1).padStart(2,"0")} / 05</span></div>
          </article>
        </div>
      </section>

      <section className="trust-section" data-reveal>
        <div className="trust-heading"><span className="section-index">04 / TRUST IS A PRODUCT FEATURE</span><h2>We show what is known.<br/><em>And what is not.</em></h2><p>Trust should not depend on a badge or a testimonial. It should be visible in the way the product handles evidence, access, uncertainty and control.</p></div>
        <div className="trust-grid">
          <article><span className="trust-symbol">01</span><h3>Evidence coverage</h3><p>Every analysis must disclose its source window, matched records, unmatched records and missing inputs.</p></article>
          <article><span className="trust-symbol">02</span><h3>Inspectable methods</h3><p>Published methodology explains matching, calculations, assumptions and the limits of historical replay.</p></article>
          <article><span className="trust-symbol">03</span><h3>Merchant authority</h3><p>Store access is authenticated. Policy changes remain read-only until an explicitly supported, approved and verified workflow exists.</p></article>
          <article><span className="trust-symbol">04</span><h3>Honest capability status</h3><p>Live functionality is separated from planned integrations. No invented customer outcomes, certifications or savings claims.</p></article>
        </div>
        <div className="trust-links"><Link to="/methodology">READ THE METHODOLOGY <span>↗</span></Link><Link to="/security">REVIEW SECURITY & DATA BOUNDARIES <span>↗</span></Link></div>
      </section>

      <section className="capability-ledger section-light" data-reveal>
        <div className="section-heading"><div><span className="section-index">05 / RELEASE TRANSPARENCY</span><h2>Know exactly what<br/><em>you are evaluating.</em></h2></div><p>We will not sell a roadmap as a working integration. The current release boundary is explicit. Scheduled Shopify order refresh is available; carrier billing is not automatically polled.</p></div>
        <div className="ledger">
          <div className="ledger-column"><div className="ledger-heading"><span className="ledger-dot live"></span><b>AVAILABLE IN THE CURRENT REPOSITORY BUILD</b></div><ul><li>Shopify order ingestion</li><li>Carrier-cost CSV imports</li><li>Evidence matching and review</li><li>Deterministic reconciliation and diagnostics</li><li>Historical flat-rate and threshold replay</li><li>CSV evidence exports</li><li>Scheduled Shopify order refresh (order data only)</li><li>Merchant-attested economic value ledger</li></ul></div>
          <div className="ledger-column planned"><div className="ledger-heading"><span className="ledger-dot planned-dot"></span><b>NOT YET VERIFIED AS LIVE</b></div><ul><li>UPS, FedEx and USPS direct API integrations</li><li>PDF invoice extraction</li><li>Recurring subscription billing</li><li>Automated carrier invoice feeds and carrier alerts</li><li>Automated Shopify policy writes</li><li>Public App Store approval</li></ul></div>
        </div>
        <p className="ledger-note">This status describes the repository's documented implementation, not a verified production deployment. Live availability must be confirmed in the deployed service before purchase.</p>
      </section>

      <section className="closing-section" data-reveal>
        <span className="section-index">06 / BEGIN WITH THE EVIDENCE</span><h2>Make the next shipping decision<br/><em>one you can explain.</em></h2><p>If you reconcile Shopify orders against carrier or 3PL bills, start with the sample pack and check whether your export is supported.</p>
        <div className="hero-ctas"><Link to="/shipping-cost-reconciliation" className="cta-primary">EXPLORE THE RECONCILIATION WORKFLOW <span>↗</span></Link><Link to="/buyer-evaluation" className="cta-secondary">CHECK MERCHANT FIT <span>↗</span></Link></div>
      </section>
    </main>
  </MarketingShell>;
}
