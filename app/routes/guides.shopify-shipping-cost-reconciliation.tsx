import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"How to Reconcile Shopify Shipping Costs | NODUS"},
  {name:"description",content:"A practical method for comparing Shopify checkout shipping charges with carrier and 3PL invoice evidence, matching records and reporting coverage gaps."},
  {property:"og:title",content:"How to Reconcile Shopify Shipping Costs"},
  {property:"og:description",content:"A source-led guide to Shopify shipping revenue, carrier-cost evidence and reconciliation."},
];

const steps=[
  ["01 / DEFINE THE SAMPLE","Choose a bounded period and one reporting currency. Record the Shopify permissions and order window available. Do not imply access to older orders that Shopify has not granted."],
  ["02 / COLLECT THE COST EVIDENCE","Export the final billed carrier or 3PL charges. Prefer stable invoice-line IDs and order or tracking references. A rate quote or label estimate is not the same as the final billed amount."],
  ["03 / MATCH CONSERVATIVELY","Match by exact order reference first. Use tracking references only when the match is unambiguous. Keep split shipments, duplicate rows and uncertain matches visible for review."],
  ["04 / CALCULATE WITH COVERAGE","Compare checkout shipping revenue with supported cost evidence. Keep currencies separate. Missing or partial cost evidence is unknown—not zero."],
  ["05 / REVIEW THE EXCEPTIONS","Trace each material difference to its source row, calculation and review state. A discrepancy is a candidate for investigation, not proof of a carrier error or recovered credit."],
];

export default function ShippingCostReconciliationGuide(){
  return <MarketingShell><main className="content-page">
    <header>
      <p className="page-eyebrow">FIELD GUIDE / SHOPIFY SHIPPING ECONOMICS</p>
      <h1>How to reconcile Shopify shipping costs.</h1>
      <p className="page-lede">Compare what a customer paid at checkout with what your carrier or 3PL records actually support. The difficult part is not subtraction. It is proving that the right cost records belong to the right orders—and showing what is still missing.</p>
      <div className="hero-ctas"><Link to="/demo" className="cta-primary">INSPECT A SYNTHETIC EXAMPLE <span>↗</span></Link><Link to="/buyer-evaluation" className="cta-secondary">CHECK EVALUATION FIT <span>↗</span></Link></div>
    </header>
    <section className="content-note">
      <h2>The basic comparison</h2>
      <p>For an order with complete, comparable evidence, the simple difference is:</p>
      <p><strong>Checkout shipping revenue − evidenced fulfillment cost = observed shipping difference.</strong></p>
      <p>This is not net profit. It excludes other costs unless those are separately captured and correctly treated. Do not combine different currencies or treat missing cost evidence as zero.</p>
      <div className="content-grid">
        <article><span>SYNTHETIC EXAMPLE / NOT CUSTOMER DATA</span><h2>Checkout collected</h2><p>USD 8.95 shipping charge recorded on a sample Shopify order.</p></article>
        <article><span>SYNTHETIC EXAMPLE / NOT CUSTOMER DATA</span><h2>Cost evidence</h2><p>USD 12.40 carrier invoice line matched to that sample order.</p></article>
        <article><span>SYNTHETIC EXAMPLE / NOT CUSTOMER DATA</span><h2>Observed difference</h2><p>USD −3.45 for this sample record, assuming the cost evidence is complete and correctly matched.</p></article>
      </div>
      <p className="calculator-caveat">The example is arithmetic only. It is not a NODUS customer result, a confirmed loss or evidence that a carrier made an error.</p>
    </section>
    <section className="method-list">
      {steps.map(([label,body])=><article key={label}><b>{label}</b><div><h2>{label.split(" / ")[1]}</h2><p>{body}</p></div></article>)}
    </section>
    <section className="content-note">
      <h2>Common reconciliation mistakes</h2>
      <ul>
        <li>Comparing a carrier rate quote with an invoice and treating them as equivalent.</li>
        <li>Counting one label when an order shipped in several parcels.</li>
        <li>Assigning an ambiguous tracking number to the most convenient order.</li>
        <li>Summing USD, EUR and GBP without a documented conversion source and timestamp.</li>
        <li>Calling an unmatched amount a saving or recovery before a credit is posted.</li>
      </ul>
    </section>
    <section className="content-note">
      <h2>Where NODUS fits</h2>
      <p>NODUS reads permitted Shopify order data, imports supported merchant-provided carrier-cost CSV records, applies deterministic matching and exposes incomplete or ambiguous evidence. It can replay supported flat-rate and free-shipping threshold scenarios against stored historical orders. Carrier invoice polling, PDF extraction, direct UPS/FedEx/USPS invoice APIs and automated dispute submission are not current capabilities.</p>
      <p>Read the <Link to="/methodology">reconciliation methodology</Link>, inspect the <Link to="/demo">synthetic Decision Pack walkthrough</Link>, or review the <Link to="/pricing">no-fee founding merchant programme</Link>.</p>
    </section>
  </main></MarketingShell>;
}
