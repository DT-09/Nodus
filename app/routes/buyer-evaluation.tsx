import {useState} from "react";
import type {FormEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"NODUS shipping margin control pilot"},
  {name:"description",content:"Request a no-fee data-fit review or a fixed-scope USD 49 NODUS founding pilot. No source files are collected by the public form."},
  {property:"og:title",content:"Merchant evaluation guide — NODUS"},
  {property:"og:description",content:"A practical guide to the data, scope and deliverables in a NODUS shipping-economics pilot."},
];
const requirements=[
 ["Order export","A merchant-provided order CSV with order references, shipping revenue and currency."],
 ["Carrier-cost export","A carrier or 3PL CSV with charge IDs, amounts, currency and available order or tracking references."],
 ["A defined question","A need to compare recorded shipping revenue with carrier costs and identify charges that need review."],
];
const deliverables=[
 ["Evidence coverage statement","The reporting window, source files, reporting currency, matched records, exclusions and unresolved gaps."],
 ["Evidenced shortfall register","Orders where matched carrier costs exceed shipping collected, shown only after complete cost coverage is attested and tax-inclusive charges are excluded."],
 ["Exception register","Matched, unmatched, duplicate, ambiguous and incomplete records with the source references available to the system."],
 ["Order-level comparison","Compare recorded shipping revenue with matched carrier-cost rows while keeping currencies separate."],
 ["Decision pack","A CSV register and JSON export with scope, methods and limitations."],
];
function AssessmentForm(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setMessage("");setError(false);
  const form=event.currentTarget;const data=new FormData(form);
  const payload={name:String(data.get("name")||""),email:String(data.get("email")||""),store:String(data.get("store")||""),orders:String(data.get("orders")||""),shipping:String(data.get("shipping")||""),objective:String(data.get("objective")||""),offer_type:String(data.get("offer_type")||"evaluation"),consent:data.get("consent")==="on",website:String(data.get("website")||"")};
  try{const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json() as {ok?:boolean;message?:string;error?:string;reference?:string;priceQuote?:string|null;checkoutUrl?:string};if(!response.ok||!result.ok)throw new Error(result.error||"The request could not be submitted.");if(result.checkoutUrl){window.location.assign(result.checkoutUrl);return;}setMessage((result.message||"Request received.")+" Reference: "+(result.reference||"NODUS")+(result.priceQuote?" · Requested price: "+result.priceQuote:""));form.reset();}
  catch(e){setError(true);setMessage(e instanceof Error?e.message:"Network error. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="nd-assessment-form" onSubmit={submit}>
  <div className="nd-form-intro"><span className="page-eyebrow">NODUS / MERCHANT INTAKE</span><h2>Choose how to begin.</h2><p>Start with a no-fee fit review, or request the fixed-scope founding pilot. A pilot request is not a charge or confirmed order; an authorized operator confirms scope and payment instructions before work begins.</p></div>
  <div className="nd-form-grid">
   <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Name"/></label>
   <label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com"/></label>
   <label>Store domain (for context)<input name="store" type="text" required maxLength={300} placeholder="store.myshopify.com"/></label>
   <label>Approximate monthly orders<select name="orders" required defaultValue=""><option value="" disabled>Select a range</option><option>Under 500</option><option>500–2,000</option><option>2,000–10,000</option><option>10,000–50,000</option><option>50,000+</option><option>Prefer to discuss</option></select></label>
   <label className="nd-form-wide">Shipping setup<select name="shipping" required defaultValue=""><option value="" disabled>Select your setup</option><option>Direct carrier account</option><option>Third-party logistics (3PL)</option><option>Multiple carriers / 3PLs</option><option>Shopify Shipping</option><option>Other / unsure</option></select></label>
   <label className="nd-form-wide">Request type<select name="offer_type" defaultValue="evaluation"><option value="evaluation">No-fee data-fit review — no payment</option><option value="founding_pilot">Founding pilot — USD 49 one-time, subject to scope confirmation</option></select></label>
   <label className="nd-form-wide">What problem should the assessment investigate?<textarea name="objective" required minLength={20} maxLength={1500} rows={4} placeholder="For example: we cannot reliably compare shipping revenue with carrier charges across orders..."/></label>
  </div>
  <label className="nd-form-consent"><input name="consent" type="checkbox" required/><span>I am authorized to submit this business enquiry and agree that NODUS may use these details to review and respond to this request. No store data is requested by this form. <Link to="/privacy">Read the privacy notice.</Link></span></label>
  <div className="nd-form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <button className="cta-primary" type="submit" disabled={busy}>{busy?"SUBMITTING…":"SUBMIT REQUEST ↗"}</button>
  {message?<p className={error?"nd-form-status is-error":"nd-form-status"} role="status">{message}</p>:null}
  <p className="nd-form-footnote">No card details are collected. The USD 49 pilot is a request, not a charge; payment instructions are provided only after scope confirmation by the authorized operator. Do not include passwords, access tokens, customer records or invoice attachments.</p>
 </form>;
}
export default function BuyerEvaluation(){
 return <MarketingShell active="evaluation"><main className="content-page">
  <header><p className="page-eyebrow">MERCHANTS / EVALUATION GUIDE</p><h1>Find the shipping shortfalls<br/><em>your evidence can support.</em></h1><p className="page-lede">NODUS connects Shopify order shipping charges with carrier/3PL invoice rows. With complete cost coverage attested, it flags orders where matched carrier costs exceed shipping collected and produces an evidence-backed review pack. It does not claim carrier overbilling or guaranteed recovery.</p><div className="hero-ctas"><Link to="/demo" className="cta-primary">INSPECT THE SAMPLE <span>↗</span></Link><Link to="/pricing" className="cta-secondary">REVIEW THE PROGRAMME <span>↗</span></Link></div></header>
  <section className="content-note"><span className="page-eyebrow">01 / WHO THIS IS FOR</span><h2>Built for operators who already have the evidence.</h2><p>The initial target is a Shopify merchant selling physical goods, using one or more external carriers or a 3PL, and reconciling separate order and carrier-cost records. The daily user is likely in ecommerce operations, fulfillment or finance. The economic buyer is the owner or a lead accountable for shipping economics. This fit is a market hypothesis until paying customers validate it.</p><div className="content-grid">{requirements.map(([title,body])=><article key={title}><span>FIT / REQUIREMENT</span><h2>{title}</h2><p>{body}</p></article>)}</div></section>
  <section className="content-note"><span className="page-eyebrow">02 / THE SCOPE</span><h2>Small enough to verify. Useful enough to judge.</h2><p>The public product accepts an order CSV and a carrier-cost CSV selected by the user. Analysis runs in the browser. Files are not uploaded to NODUS. A separate Shopify connection is present in source code but is not offered as a live production integration until installation is verified.</p><p>The form below is separate from the CSV tool. It stores only the business enquiry fields needed to review and respond to the request. Do not submit customer records, invoices, credentials or access tokens.</p></section>
  <section className="content-note"><span className="page-eyebrow">03 / WHAT YOU RECEIVE</span><h2>What the paid review is designed to establish.</h2><div className="content-grid">{deliverables.map(([title,body],i)=><article key={title}><span>{String(i+1).padStart(2,"0")} / DELIVERABLE</span><h2>{title}</h2><p>{body}</p></article>)}</div></section>
  <section className="content-note"><span className="page-eyebrow">04 / WHAT WE WILL NOT CLAIM</span><h2>Evidence sets the boundary.</h2><ul><li>Missing carrier cost is not treated as zero.</li><li>A discrepancy is not a recovered credit or confirmed saving.</li><li>Historical shipping-revenue replay is not a profit or conversion forecast.</li><li>Carrier invoice intake is CSV-based. Direct UPS, FedEx and USPS invoice APIs are not represented as live integrations.</li><li>Carrier invoice polling, policy-drift alerts and automatic Shopify shipping-policy changes are not offered as current capabilities.</li><li>Merchant-entered value records are attestations, not independent financial audits.</li></ul><p>See the <Link to="/methodology">methodology</Link> and <Link to="/security">security boundaries</Link> before sharing any store data.</p></section>
  <section className="content-note"><span className="page-eyebrow">05 / DECIDE WHETHER TO CONTINUE</span><h2>Repeat use must earn its place.</h2><p>The no-fee request does not purchase a service. The founding pilot is a USD 49 one-time, fixed-scope request for one store, one reporting period of up to 60 days, up to 2,000 orders and one carrier/3PL CSV. It includes an evidence register, matched/unmatched breakdown, currency-separated totals and a written limitations note. It does not promise recovered credits, savings or profit. Work starts only after scope confirmation and cleared payment through an authorized adult-operated business account.</p><p>No payment details are collected. Participation does not require a testimonial, review or public case study.</p><AssessmentForm/></section>
 </main></MarketingShell>;
}
