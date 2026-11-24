import {useState,type FormEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Request a NODUS 3PL invoice review"},
 {name:"description",content:"Request a scoped hourly review of your 3PL invoice, contracted rates and available fulfilment activity."}
];

export default function BuyerEvaluation(){
 const [busy,setBusy]=useState(false);
 const [status,setStatus]=useState<{kind:"success"|"error";text:string}|null>(null);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const form=event.currentTarget;const data=new FormData(form);
  const payload={
   businessName:String(data.get("businessName")||""),
   name:String(data.get("name")||""),
   email:String(data.get("email")||""),
   store:String(data.get("store")||""),
   orders:String(data.get("orders")||""),
   shipping:String(data.get("shipping")||""),
   objective:String(data.get("objective")||""),
   consent:data.get("consent")==="on",
   website:String(data.get("website")||""),
   offerType:"hourly_invoice_review"
  };
  setBusy(true);setStatus(null);
  try{
   const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(payload)});
   const result=await response.json() as {ok?:boolean;error?:string;message?:string;reference?:string};
   if(!response.ok||!result.ok)throw new Error(result.error||"The request could not be submitted.");
   setStatus({kind:"success",text:(result.message||"Request received.")+" Reference: "+(result.reference||"pending")+". This is a request, not a booking or payment."});
   form.reset();
  }catch(error){setStatus({kind:"error",text:error instanceof Error?error.message:"The request could not be submitted. Try again later."});}
  finally{setBusy(false);}
 }
 return <MarketingShell active="evaluation"><main className="nc-form-shell">
  <div className="nc-overline">NODUS / FIRST-HOUR REVIEW</div>
  <h1>One invoice.<br/><em>One clear scope.</em></h1>
  <p className="nc-lede">Tell us what your 3PL bills and what records you can compare it with. We will check whether the current CSV workflow fits, confirm the reviewer and scope, and state the price before any paid work begins.</p>
  <div className="nc-actions"><span className="nc-micro">TARGET OPENING RATE: $100 / HOUR</span><span className="nc-micro">NO PAYMENT ON THIS FORM</span><span className="nc-micro">NO CONFIDENTIAL FILES HERE</span></div>
  <form className="nc-form" onSubmit={submit}>
   <div className="nc-field"><label htmlFor="businessName">Business name</label><input id="businessName" name="businessName" minLength={2} maxLength={160} required placeholder="Company name"/></div>
   <div className="nc-field"><label htmlFor="name">Your name</label><input id="name" name="name" minLength={2} maxLength={100} required placeholder="Contact name"/></div>
   <div className="nc-field"><label htmlFor="email">Business email</label><input id="email" name="email" type="email" maxLength={254} required placeholder="you@company.com"/></div>
   <div className="nc-field"><label htmlFor="store">Store / business website</label><input id="store" name="store" type="url" required placeholder="https://yourstore.com"/></div>
   <div className="nc-field"><label htmlFor="orders">Monthly order volume</label><select id="orders" name="orders" required defaultValue=""><option value="" disabled>Select range</option><option value="under_500">Under 500</option><option value="500_2000">500–2,000</option><option value="2000_10000">2,000–10,000</option><option value="10000_50000">10,000–50,000</option><option value="50000_plus">50,000+</option><option value="prefer_to_discuss">Prefer to discuss</option></select></div>
   <div className="nc-field"><label htmlFor="shipping">Fulfilment setup</label><select id="shipping" name="shipping" required defaultValue=""><option value="" disabled>Select setup</option><option value="one_3pl">One 3PL / warehouse</option><option value="multiple_3pls">Multiple 3PLs</option><option value="in_house_and_3pl">In-house + 3PL</option><option value="other">Other</option></select></div>
   <div className="nc-field full"><label htmlFor="objective">What do you need checked?</label><textarea id="objective" name="objective" minLength={20} maxLength={1500} required placeholder="Example: storage charges changed after the rate-card renewal; we want to compare the last invoice with the effective rates and available warehouse activity."/></div>
   <div className="nc-honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <label className="nc-consent"><input type="checkbox" name="consent" required/><span>I agree that NODUS may contact me about this service request. I will not include passwords, customer personal data, payment details or confidential documents in this form.</span></label>
   {status?<div className={"nc-form-status"+(status.kind==="error"?" error":"")} role={status.kind==="error"?"alert":"status"}>{status.text}</div>:null}
   <button className="nc-btn nc-btn-primary" type="submit" disabled={busy}>{busy?"SENDING REQUEST…":"SUBMIT REVIEW REQUEST ↗"}</button>
   <p className="nc-form-note">Submission does not create a contract, reserve a slot or charge you. A paid engagement starts only after a qualified reviewer, file compatibility, scope, price, delivery terms and adult-owned seller/payment arrangements are confirmed in writing.</p>
  </form>
  <section className="nc-section"><div className="nc-overline">WHAT HAPPENS NEXT</div><div className="nc-steps">
   <article className="nc-step"><b>01 / FIT</b><h3>Request reviewed</h3><p>We check store type, volume, provider setup and the problem you described.</p></article>
   <article className="nc-step"><b>02 / SCOPE</b><h3>Confirm the hour</h3><p>You receive a written scope, reviewer details and total fee before deciding.</p></article>
   <article className="nc-step"><b>03 / WORK</b><h3>Review the evidence</h3><p>The merchant-side workspace handles supported CSVs. Original files stay in the browser workflow.</p></article>
   <article className="nc-step"><b>04 / REPEAT</b><h3>Consider monthly control</h3><p>If invoices recur and the first review is useful, we can propose the $99/month pilot scope.</p></article>
  </div></section>
  <section className="nc-section"><div className="nc-overline">FIT AND LIMITS</div><div className="nc-faq">
   <article><h3>Do you need Shopify access?</h3><p>No. The current workflow uses merchant-provided CSV exports. It is not a native Shopify app or live store integration.</p></article>
   <article><h3>Can you read PDFs?</h3><p>Not in the current public workflow. The current intake supports CSV files only, up to 5 MB and 20,000 data rows per file.</p></article>
   <article><h3>Do you guarantee a refund?</h3><p>No. NODUS documents supported variances and evidence gaps. Your business decides whether to raise a question or dispute with its provider.</p></article>
   <article><h3>Will you charge me now?</h3><p>No. This form only records an enquiry. No payment is collected and no recurring plan starts automatically.</p></article>
  </div></section>
  <div className="nc-actions"><Link to="/demo" className="nc-btn nc-btn-secondary">Inspect sample evidence ↗</Link><Link to="/methodology" className="nc-btn nc-btn-secondary">Read the method ↗</Link></div>
 </main></MarketingShell>;
}
