import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"Shopify Free Shipping Threshold Analysis | NODUS"},
  {name:"description",content:"Learn how to replay Shopify flat-rate and free-shipping threshold policies against historical orders, with clear assumptions and limits."},
  {property:"og:title",content:"Shopify Free Shipping Threshold Analysis"},
  {property:"og:description",content:"An educational guide to the limits of historical shipping-policy analysis. Policy replay is not part of the current NODUS product."},
];

const sequence=[
  ["Record the current rule","Write down the current flat rate, free-shipping threshold, eligible markets and relevant exclusions. Capture the effective date if the policy changed during the sample."],
  ["Choose the historical sample","Use the same order window and reporting currency for every scenario. Disclose missing orders, unavailable markets and Shopify permission limits."],
  ["Replay one proposed change at a time","Apply the proposed flat rate or threshold to the historical baskets. Keep the formula and affected order count visible."],
  ["Compare the outputs","Show current and proposed shipping revenue on the same historical sample. Separate excluded and unsupported orders."],
  ["Review what the model cannot know","Historical replay does not estimate conversion, cart abandonment, demand elasticity, customer lifetime value, fulfillment capacity or net profit."],
];

export default function FreeShippingThresholdGuide(){
  return <MarketingShell><main className="content-page">
    <section className="content-note" role="note"><strong>PRODUCT SCOPE</strong><p>NODUS supports historical flat-rate and free-shipping threshold replay against imported order baskets when the required subtotal, shipping revenue and currency fields are present. The replay uses the observed historical sample; it does not predict conversion, demand response or profit.</p></section>
  <header>
      <p className="page-eyebrow">FIELD GUIDE / SHIPPING POLICY</p>
      <h1>Test a free-shipping threshold against real order history.</h1>
      <p className="page-lede">A free-shipping threshold changes who pays for delivery and which baskets qualify. Before changing the rule, replay the proposed policy against the same historical orders and make every assumption visible.</p>
      <div className="hero-ctas"><Link to="/demo" className="cta-primary">INSPECT THE SAMPLE WORKFLOW <span>↗</span></Link><Link to="/methodology" className="cta-secondary">READ THE METHOD <span>↗</span></Link></div>
    </header>
    <section className="content-note">
      <h2>What a historical replay answers</h2>
      <p>It answers a narrow question: if the proposed rule had applied to these observed baskets, what shipping revenue would the rule have recorded under the stated assumptions?</p>
      <p>It does not answer whether customers would have placed the same orders under the new offer. A historical replay is a scenario calculation, not a demand forecast or profit model.</p>
    </section>
    <section className="method-list">
      {sequence.map(([title,body],i)=><article key={title}><b>{String(i+1).padStart(2,"0")} / POLICY REPLAY</b><div><h2>{title}</h2><p>{body}</p></div></article>)}
    </section>
    <section className="content-note">
      <h2>Use a disciplined comparison</h2>
      <div className="content-grid">
        <article><span>BASELINE</span><h2>Current policy</h2><p>Record the rule, eligible baskets, shipping revenue and sample window.</p></article>
        <article><span>SCENARIO</span><h2>Proposed policy</h2><p>Change one parameter, such as the threshold or flat rate, and preserve the same sample.</p></article>
        <article><span>INTERPRETATION</span><h2>Decision, not prediction</h2><p>Review the affected segments and decide what additional evidence is needed before a live change.</p></article>
      </div>
    </section>
    <section className="content-note">
      <h2>How NODUS handles this</h2>
      <p>NODUS supports historical flat-rate and free-shipping threshold replay against stored Shopify order baskets. It records the sample and assumptions. It does not automatically change Shopify shipping settings, predict conversion lift or calculate profit from shipping revenue alone.</p>
      <p>See the <Link to="/product">current platform capabilities</Link>, the <Link to="/methodology">methodology</Link>, and the <Link to="/buyer-evaluation">merchant evaluation guide</Link>.</p>
    </section>
  </main></MarketingShell>;
}
