import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {useState} from "react";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS — Shipping margin control for Shopify"},
  {name:"description",content:"See what shipping costs your store. Reconcile Shopify shipping charges with carrier-cost evidence and test better shipping policies against historical orders."},
  {property:"og:title",content:"NODUS — Shipping margin control for Shopify"},
  {property:"og:description",content:"Shipping costs, matched to evidence. Policy decisions, tested against your orders."},
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
          <p className="eyebrow"><span className="eyebrow-line"></span> SHIPPING MARGIN CONTROL / SHOPIFY</p>
          <h1>Stop guessing what<br/><em>free shipping costs.</em></h1>
          <p className="hero-intro">NODUS compares shipping charges collected at checkout with carrier and 3PL costs you import. Find underfunded shipping policies, inspect unmatched charges, and test flat rates or free-shipping thresholds against your store's historical orders.</p>
          <div className="hero-ctas"><Link to="/connect" className="cta-primary">CONNECT SHOPIFY <span>↗</span></Link><Link to="/install" className="cta-secondary">INSTALL NODUS <span>↗</span></Link><Link to="/manual-data" className="cta-secondary">IMPORT COST DATA <span>↗</span></Link><Link to="/shipping-cost-reconciliation" className="cta-secondary">HOW THE ANALYSIS WORKS <span>↗</span></Link><Link to="/demo" className="cta-secondary">INSPECT THE SAMPLE PACK <span>↗</span></Link><Link to="/pricing" className="cta-secondary">SEE PRICING <span>↗</span></Link></div>
          <div className="hero-proofline"><span>ORDER-LEVEL COST EVIDENCE</span><i></i><span>POLICY SCENARIOS</span><i></i><span>NO ASSUMED ZERO-COSTS</span></div>
        </div>
        <div className="hero-console" aria-label="Illustrative shipping reconciliation workspace">
          <div className="console-top"><div className="console-brand"><span className="console-mark">N</span><span>NODUS / RECONCILIATION</span></div><span className="console-state"><i></i> SAMPLE WORKSPACE</span></div>
          <div className="console-heading"><div><span className="console-kicker">SHIPPING MARGIN / OVERVIEW</span><h2>Policy exposure</h2></div><span className="console-period">ILLUSTRATIVE DATA</span></div>
          <div className="console-stats"><article><span>ORDER SHIPPING</span><strong>$4,820.00</strong><small>Shopify shipping revenue</small></article><article><span>CARRIER CHARGES</span><strong>$3,964.50</strong><small>Imported cost records</small></article><article><span>REVIEW QUEUE</span><strong>12 <small>records</small></strong><small>Require evidence review</small></article></div>
          <div className="console-table-head"><span>RECORD</span><span>REFERENCE</span><span>REVIEW STATUS</span></div>
          <div className="console-row"><span><b>Order #10482</b><small>Shopify order</small></span><span>FUL-8821</span><em className="state-matched">MATCHED</em></div>
          <div className="console-row"><span><b>Carrier invoice</b><small>Imported CSV</small></span><span>INV-24018</span><em className="state-review">REVIEW</em></div>
          <div className="console-row"><span><b>Order #10479</b><small>Shopify order</small></span><span>FUL-8814</span><em className="state-unmatched">UNMATCHED</em></div>
          <div className="console-foot"><span>Source-linked records. No inferred zero-cost rows.</span><span>PREVIEW / 01</span></div>
        </div>
      </section>

      <section className="manifesto-band" data-reveal>
        <div><span className="section-index">01 / THE PRINCIPLE</span><h2>Free shipping isn't free.<br/><em>Know the subsidy before it compounds.</em></h2></div>
        <p>Shipping revenue, carrier invoices and store policies live in separate places. NODUS connects the evidence, shows where shipping is underfunded, and lets you test policy changes before you make them.</p>
      </section>

      <section className="live-system section-light" id="platform" data-reveal>
        <div className="section-heading"><div><span className="section-index">02 / THE SYSTEM</span><h2>One decision workflow.<br/><em>From checkout charge to carrier cost.</em></h2></div><p>Each capability has a defined input, a visible method and an inspectable output.</p></div>
        <div className="system-grid">{live.map(([n,title,body])=><article className="system-cell" key={n}><span className="cell-number">{n}</span><div className="cell-node"><i></i><i></i><i></i></div><h3>{title}</h3><p>{body}</p><span className="cell-rule">NODUS / CORE WORKFLOW</span></article>)}</div>
      </section>


      <section className="merchant-outputs section-light" id="merchant-outputs" data-reveal>
        <div className="section-heading"><div><span className="section-index">03 / WHAT YOUR TEAM GETS</span><h2>Useful work products.<br/><em>Not another dashboard.</em></h2></div><p>Every output is built from the store data and carrier evidence the merchant has actually connected. Unknowns remain visible.</p></div>
        <div className="outputs-grid">
          <article><span>01 / OPERATIONS</span><h3>Exception work queue</h3><p>Keep unmatched charges, incomplete coverage and reconciliation findings in a persistent register. Assign a review status and retain investigation notes.</p><Link to="/product#evidence">HOW EVIDENCE REVIEW WORKS ↗</Link></article>
          <article><span>02 / FINANCE</span><h3>Shipping economics decision pack</h3><p>Export order-level records, evidence coverage, calculations, exceptions, policy replays and stated limitations as merchant-scoped CSV and JSON assets.</p><Link to="/demo">INSPECT A SYNTHETIC SAMPLE ↗</Link></article>
          <article><span>03 / STRATEGY</span><h3>Historical policy scenarios</h3><p>Compare supported flat-rate and free-shipping threshold alternatives against historical orders. See assumptions and exclusions before changing store policy.</p><Link to="/guides/free-shipping-threshold-analysis">READ THE POLICY GUIDE ↗</Link></article>
          <article><span>04 / ACCOUNTABILITY</span><h3>Economic outcome ledger</h3><p>Record identified opportunities, merchant-validated outcomes, posted credits and measured operating time separately. Merchant attestations are not independent verification.</p><Link to="/product#economics">UNDERSTAND THE VALUE MODEL ↗</Link></article>
          <article><span>05 / CONTROL</span><h3>Review history and audit trail</h3><p>Retain case decisions and relevant audit events so the team can explain what was reviewed, changed and recorded.</p><Link to="/security">REVIEW DATA BOUNDARIES ↗</Link></article>
          <article><span>06 / CONTINUITY</span><h3>Store data refresh</h3><p>Refresh Shopify order data on a schedule and resume incomplete history syncs. Carrier billing still requires supported merchant-provided CSV imports.</p><Link to="/product">SEE CURRENT CAPABILITIES ↗</Link></article>
        </div>
      </section>

      <section className="evidence-thread" id="evidence" data-reveal>
        <div className="section-heading"><div><span className="section-index">04 / FOLLOW THE EVIDENCE</span><h2>One shipment.<br/><em>Every relevant connection.</em></h2></div><p>Follow the records from Shopify order to carrier charge and reviewed finding. This is an illustrative workflow, not a live merchant record.</p></div>
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
        <div className="trust-heading"><span className="section-index">05 / TRUST IS A PRODUCT FEATURE</span><h2>We show what is known.<br/><em>And what is not.</em></h2><p>Trust should not depend on a badge or a testimonial. It should be visible in the way the product handles evidence, access, uncertainty and control.</p></div>
        <div className="trust-grid">
          <article><span className="trust-symbol">01</span><h3>Evidence coverage</h3><p>Every analysis must disclose its source window, matched records, unmatched records and missing inputs.</p></article>
          <article><span className="trust-symbol">02</span><h3>Inspectable methods</h3><p>Published methodology explains matching, calculations, assumptions and the limits of historical replay.</p></article>
          <article><span className="trust-symbol">03</span><h3>Merchant authority</h3><p>Store access is authenticated. Policy changes remain read-only until an explicitly supported, approved and verified workflow exists.</p></article>
          <article><span className="trust-symbol">04</span><h3>Honest capability status</h3><p>Live functionality is separated from planned integrations. No invented customer outcomes, certifications or savings claims.</p></article>
        </div>
        <div className="trust-links"><Link to="/methodology">READ THE METHODOLOGY <span>↗</span></Link><Link to="/security">REVIEW SECURITY & DATA BOUNDARIES <span>↗</span></Link></div>
      </section>

      <section className="capability-ledger section-light" data-reveal>
        <div className="section-heading"><div><span className="section-index">06 / RELEASE TRANSPARENCY</span><h2>Know exactly what<br/><em>you are evaluating.</em></h2></div><p>We will not sell a roadmap as a working integration. The current release boundary is explicit. Scheduled Shopify order refresh is available; carrier billing is not automatically polled.</p></div>
        <div className="ledger">
          <div className="ledger-column"><div className="ledger-heading"><span className="ledger-dot live"></span><b>AVAILABLE IN THE CURRENT REPOSITORY BUILD</b></div><ul><li>Shopify order ingestion</li><li>Carrier-cost CSV imports</li><li>Evidence matching and review</li><li>Deterministic reconciliation and diagnostics</li><li>Historical flat-rate and threshold replay</li><li>CSV evidence exports</li><li>Scheduled Shopify order refresh (order data only)</li><li>Merchant-attested economic value ledger</li></ul></div>
          <div className="ledger-column planned"><div className="ledger-heading"><span className="ledger-dot planned-dot"></span><b>NOT YET VERIFIED AS LIVE</b></div><ul><li>UPS, FedEx and USPS direct API integrations</li><li>PDF invoice extraction</li><li>Recurring subscription billing</li><li>Automated carrier invoice feeds and carrier alerts</li><li>Automated Shopify policy writes</li><li>Public App Store approval</li></ul></div>
        </div>
        <p className="ledger-note">This status describes the repository's documented implementation, not a verified production deployment. Live availability must be confirmed in the deployed service before purchase.</p>
      </section>

      <section className="closing-section" data-reveal>
        <span className="section-index">07 / BEGIN WITH THE EVIDENCE</span><h2>Set a shipping policy<br/><em>your evidence can defend.</em></h2><p>If you reconcile Shopify orders against carrier or 3PL bills, start with the sample pack and check whether your export is supported.</p>
        <div className="hero-ctas"><Link to="/connect" className="cta-primary">CONNECT A SHOPIFY STORE <span>↗</span></Link><Link to="/shipping-cost-reconciliation" className="cta-secondary">EXPLORE THE RECONCILIATION WORKFLOW <span>↗</span></Link><Link to="/buyer-evaluation" className="cta-secondary">CHECK MERCHANT FIT <span>↗</span></Link></div>
      </section>
    </main>
  </MarketingShell>;
}
