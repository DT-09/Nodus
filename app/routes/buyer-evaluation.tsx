import {useState} from "react";
import type {FormEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"Merchant evaluation guide — NODUS"},
  {name:"description",content:"See whether your Shopify order data and carrier-cost exports are suitable for an evidence-led shipping economics assessment."},
  {property:"og:title",content:"Merchant evaluation guide — NODUS"},
  {property:"og:description",content:"A practical guide to the data, scope and deliverables in a NODUS founding merchant evaluation."},
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
function AssessmentForm(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setMessage("");setError(false);
  const form=event.currentTarget;const data=new FormData(form);
  const payload={name:String(data.get("name")||""),email:String(data.get("email")||""),store:String(data.get("store")||""),orders:String(data.get("orders")||""),shipping:String(data.get("shipping")||""),objective:String(data.get("objective")||""),consent:data.get("consent")==="on",website:String(data.get("website")||"")};
  try{const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json() as {ok?:boolean;message?:string;error?:string;reference?:string};if(!response.ok||!result.ok)throw new Error(result.error||"The request could not be submitted.");setMessage((result.message||"Request received.")+" Reference: "+(result.reference||"NODUS"));form.reset();}
  catch(e){setError(true);setMessage(e instanceof Error?e.message:"Network error. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="nd-assessment-form" onSubmit={submit}>
  <div className="nd-form-intro"><span className="page-eyebrow">FOUNDING MERCHANT PROGRAMME / NO FEE</span><h2>Request an assessment.</h2><p>Tell us what you operate and what you need to understand. We will review the fit before requesting any data access.</p></div>
  <div className="nd-form-grid">
   <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Name"/></label>
   <label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com"/></label>
   <label>Shopify store URL<input name="store" type="text" required maxLength={300} placeholder="store.myshopify.com"/></label>
   <label>Approximate monthly orders<select name="orders" required defaultValue=""><option value="" disabled>Select a range</option><option>Under 500</option><option>500–2,000</option><option>2,000–10,000</option><option>10,000–50,000</option><option>50,000+</option><option>Prefer to discuss</option></select></label>
   <label className="nd-form-wide">Shipping setup<select name="shipping" required defaultValue=""><option value="" disabled>Select your setup</option><option>Direct carrier account</option><option>Third-party logistics (3PL)</option><option>Multiple carriers / 3PLs</option><option>Shopify Shipping</option><option>Other / unsure</option></select></label>
   <label className="nd-form-wide">What problem should the assessment investigate?<textarea name="objective" required minLength={20} maxLength={1500} rows={4} placeholder="For example: we cannot reliably compare shipping revenue with carrier charges across orders..."/></label>
  </div>
  <label className="nd-form-consent"><input name="consent" type="checkbox" required/><span>I am authorized to submit this business enquiry and agree that NODUS may use these details to review and respond to this request. No store data is requested by this form. <Link to="/privacy">Read the privacy notice.</Link></span></label>
  <div className="nd-form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <button className="cta-primary" type="submit" disabled={busy}>{busy?"SUBMITTING…":"REQUEST FOUNDING ASSESSMENT ↗"}</button>
  {message?<p className={error?"nd-form-status is-error":"nd-form-status"} role="status">{message}</p>:null}
  <p className="nd-form-footnote">No payment details. No automatic subscription. Do not include passwords, access tokens, customer records or invoice attachments.</p>
 </form>;
}
export default function BuyerEvaluation(){
 return <MarketingShell active="evaluation"><main className="content-page">
  <header><p className="page-eyebrow">MERCHANTS / EVALUATION GUIDE</p><h1>Bring the records.<br/><em>Leave with a clearer decision.</em></h1><p className="page-lede">The NODUS founding evaluation tests one narrow question: can your Shopify shipping revenue and your carrier or 3PL cost evidence be connected well enough to support a useful, reviewable shipping-economics decision?</p><div className="hero-ctas"><Link to="/demo" className="cta-primary">INSPECT THE SAMPLE <span>↗</span></Link><Link to="/pricing" className="cta-secondary">REVIEW THE PROGRAMME <span>↗</span></Link></div></header>
  <section className="content-note"><span className="page-eyebrow">01 / WHO THIS IS FOR</span><h2>Built for operators who already have the evidence.</h2><p>The best fit is a Shopify merchant selling physical goods, using an external carrier or 3PL, and reviewing shipping economics across separate order and billing records. The daily user may work in ecommerce operations, fulfillment or finance. The economic buyer is usually the owner or a lead responsible for operations or finance.</p><div className="content-grid">{requirements.map(([title,body])=><article key={title}><span>FIT / REQUIREMENT</span><h2>{title}</h2><p>{body}</p></article>)}</div></section>
  <section className="content-note"><span className="page-eyebrow">02 / THE SCOPE</span><h2>Small enough to verify. Useful enough to judge.</h2><p>The initial programme is no-fee and no-obligation. Each assessment is limited to one authorized Shopify store, one reporting currency, the order history available under granted permissions, and one supported carrier-cost CSV export.</p><p>The current <code>read_orders</code> permission normally covers the most recent 60 days. Older order access requires additional Shopify approval; NODUS does not promise unrestricted historical access.</p></section>
  <section className="content-note"><span className="page-eyebrow">03 / WHAT YOU RECEIVE</span><h2>A decision pack, not a vanity dashboard.</h2><div className="content-grid">{deliverables.map(([title,body],i)=><article key={title}><span>{String(i+1).padStart(2,"0")} / DELIVERABLE</span><h2>{title}</h2><p>{body}</p></article>)}</div></section>
  <section className="content-note"><span className="page-eyebrow">04 / WHAT WE WILL NOT CLAIM</span><h2>Evidence sets the boundary.</h2><ul><li>Missing carrier cost is not treated as zero.</li><li>A discrepancy is not a recovered credit or confirmed saving.</li><li>Historical shipping-revenue replay is not a profit or conversion forecast.</li><li>Carrier invoice intake is CSV-based. Direct UPS, FedEx and USPS invoice APIs are not represented as live integrations.</li><li>Carrier invoice polling, policy-drift alerts and automatic Shopify shipping-policy changes are not offered as current capabilities.</li><li>Merchant-entered value records are attestations, not independent financial audits.</li></ul><p>See the <Link to="/methodology">methodology</Link> and <Link to="/security">security boundaries</Link> before sharing any store data.</p></section>
  <section className="content-note"><span className="page-eyebrow">05 / DECIDE WHETHER TO CONTINUE</span><h2>Repeat use must earn its place.</h2><p>After the assessment, the merchant reviews the source records and decides whether the findings are actionable. A monthly subscription is considered only if a recurring workflow and conservative, merchant-accepted value are demonstrated. If the ongoing value is not credible, no subscription is recommended.</p><p>No payment details are collected for the founding evaluation. Participation does not require a testimonial, review or public case study.</p><AssessmentForm/></section>
 </main></MarketingShell>;
}
