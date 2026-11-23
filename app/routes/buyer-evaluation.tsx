import {useState,type FormEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Request a NODUS seven-day trial — 3PL billing control"},
 {name:"description",content:"Review your 3PL contract rates, invoices and operational activity in one evidence-linked merchant workspace."},
];

function TrialRequestForm(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setMessage("");setError(false);
  const form=event.currentTarget,data=new FormData(form);
  const payload={
   businessName:String(data.get("businessName")||""),name:String(data.get("name")||""),email:String(data.get("email")||""),
   store:String(data.get("store")||""),orders:String(data.get("orders")||""),
   shipping:String(data.get("shipping")||""),objective:String(data.get("objective")||""),
   consent:data.get("consent")==="on",website:String(data.get("website")||""),
  };
  try{
   const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json() as {ok?:boolean;message?:string;error?:string;reference?:string};
   if(!response.ok||!result.ok)throw new Error(result.error||"The request could not be submitted.");
   setMessage((result.message||"Trial request received.")+(result.reference?" Reference: "+result.reference:""));form.reset();
  }catch(e){setError(true);setMessage(e instanceof Error?e.message:"Network error. Please try again.");}
  finally{setBusy(false);}
 }
 return <form className="nd-assessment-form" onSubmit={submit}>
  <div className="nd-form-intro"><span className="page-eyebrow">NODUS / MERCHANT ONBOARDING</span><h2>Request your seven-day trial.</h2><p>Tell us how your fulfilment operation works. We first confirm that your contract, invoice and activity exports can be reviewed. The seven-day clock starts only after your private workspace is ready and activated.</p></div>
  <div className="nd-form-grid">
   <label>Business name<input name="businessName" required minLength={2} maxLength={160} placeholder="Company name"/></label>
   <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Name"/></label>
   <label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com"/></label>
   <label>Shopify store domain<input name="store" required maxLength={255} placeholder="your-store.myshopify.com"/></label>
   <label>Approximate monthly orders<select name="orders" required defaultValue=""><option value="" disabled>Select a range</option><option value="under_500">Under 500</option><option value="500_2000">500–2,000</option><option value="2000_10000">2,000–10,000</option><option value="10000_50000">10,000–50,000</option><option value="50000_plus">50,000+</option><option value="prefer_to_discuss">Prefer to discuss</option></select></label>
   <label className="nd-form-wide">Fulfilment setup<select name="shipping" required defaultValue=""><option value="" disabled>Select your setup</option><option value="one_3pl">One external 3PL</option><option value="multiple_3pls">Multiple 3PL providers</option><option value="in_house_and_3pl">In-house plus external 3PL</option><option value="other">Other / unsure</option></select></label>
   <label className="nd-form-wide">What needs control?<textarea name="objective" required minLength={20} maxLength={1500} rows={4} placeholder="For example: we need to check 3PL invoice rates against our agreement and verify billed pick/pack quantities against warehouse activity..."/></label>
  </div>
  <label className="nd-form-consent"><input name="consent" type="checkbox" required/><span>I am authorised to submit this business enquiry and agree that NODUS may use these details to assess fit and respond. This form does not collect invoices, source files or customer records. <Link to="/privacy">Read the privacy notice.</Link></span></label>
  <div className="nd-form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
  <button className="cta-primary" type="submit" disabled={busy}>{busy?"SUBMITTING…":"REQUEST PRIVATE TRIAL ↗"}</button>
  {message?<p className={error?"nd-form-status is-error":"nd-form-status"} role="status">{message}</p>:null}
  <p className="nd-form-footnote">No card details are collected. A request is not an activated trial or a paid subscription. We confirm data compatibility and scope first. Never submit passwords, access tokens or customer personal data.</p>
 </form>;
}

export default function BuyerEvaluation(){
 return <MarketingShell active="evaluation"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / 3PL BILLING & PERFORMANCE CONTROL</p><h1>Know what your 3PL<br/><em>actually billed.</em></h1><p className="page-lede">NODUS compares fulfilment invoices with the rates in your agreement and the operational activity available to support those charges. It gives your team a persistent exception register, an investigation history and a record of provider outcomes.</p><div className="hero-ctas"><Link to="/pricing" className="cta-primary">VIEW MONTHLY SERVICE ↗</Link><a href="#trial-request" className="cta-secondary">REQUEST SEVEN-DAY TRIAL</a></div></header>
  <section className="content-note"><span className="page-eyebrow">01 / THE OPERATIONAL PROBLEM</span><h2>Three records. One accountable review.</h2><div className="content-grid">
   <article><span>01 / AGREEMENT</span><h2>What was agreed?</h2><p>Effective-dated rate cards, charge codes, units, fixed fees and per-unit terms. Ambiguous terms remain flagged for human confirmation.</p></article>
   <article><span>02 / BILLING</span><h2>What was charged?</h2><p>Invoice headers and line items, quantities, amounts, currency and original source-row references.</p></article>
   <article><span>03 / OPERATIONS</span><h2>What happened?</h2><p>Pick, pack, storage or other provider activity exports where they include a reliable reference and matching unit.</p></article>
  </div></section>
  <section className="content-note"><span className="page-eyebrow">02 / THE WORKFLOW</span><h2>From imported evidence to a closed outcome.</h2><div className="content-grid">
   <article><span>01</span><h2>Import</h2><p>Add your provider, confirmed rate card, invoice CSV and available operational activity.</p></article>
   <article><span>02</span><h2>Reconcile</h2><p>Compare each invoice line with one effective contract rule. Quantity checks require exact-reference activity evidence.</p></article>
   <article><span>03</span><h2>Investigate</h2><p>Assign a status, preserve notes and source references, and record provider responses.</p></article>
   <article><span>04</span><h2>Verify</h2><p>Separate an identified variance from a promised credit, a posted credit and an outcome supported by evidence.</p></article>
   <article><span>05</span><h2>Review again</h2><p>Generate period reports and compare the next invoice cycle with the history already on record.</p></article>
  </div></section>
  <section className="content-note"><span className="page-eyebrow">03 / DATA REQUIREMENTS</span><h2>Start with exports. Connect Shopify later.</h2><p>The first onboarding path uses merchant-supplied CSV exports. Shopify OAuth and direct 3PL integrations are not required for the initial review. The trial workspace supports contract rate cards, one-invoice-per-file CSV imports and operational activity exports with explicit source references.</p><ul><li>Rate card: charge_code, unit, pricing, rate, currency and effective_from.</li><li>Invoice: invoice_number, invoice_date, charge_code, quantity, unit, amount and currency.</li><li>Operational activity: record_id, reference, charge_code, quantity and unit.</li></ul><p>PDF extraction, automatic provider disputes, payments and accounting writes are not part of the first release.</p></section>
  <section className="content-note"><span className="page-eyebrow">04 / EVIDENCE STANDARD</span><h2>A variance is a question, not a verdict.</h2><p>NODUS does not label a calculated difference as recovered money or confirmed provider error. It does not infer missing activity as zero. Currency mismatches, overlapping rate rules, unsupported units and ambiguous references require review. Verified outcomes require a provider reference and an evidence note.</p></section>
  <section className="content-note" id="trial-request"><TrialRequestForm/></section>
 </main></MarketingShell>;
}
