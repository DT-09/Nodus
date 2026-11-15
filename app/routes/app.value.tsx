import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { parseMoney } from "../domain/money";

const categories = new Set(["carrier_credit","duplicate_charge","surcharge_dispute","rate_correction","policy_change","operating_time_saved","other"]);
const statuses = new Set(["identified","validated","realized"]);
const labels: Record<string,string> = {carrier_credit:"Carrier credit",duplicate_charge:"Duplicate charge",surcharge_dispute:"Surcharge dispute",rate_correction:"Rate correction",policy_change:"Policy change",operating_time_saved:"Operating time saved",other:"Other"};

export async function loader({request}:LoaderFunctionArgs) {
  const {session}=await authenticate.admin(request);
  const merchant=await prisma.merchant.findUnique({where:{shop:session.shop},select:{id:true}});
  if(!merchant)return {records:[],totals:[] as Array<{currency:string;category:string;identified:string;validated:string;realized:string}>};
  const rows=await prisma.economicValueRecord.findMany({where:{merchantId:merchant.id},orderBy:{createdAt:"desc"},take:500});
  const keys=[...new Set(rows.map(r=>r.currency+"::"+r.category))];
  const totals=keys.map(key=>{
    const [currency,category]=key.split("::");
    const group=rows.filter(r=>r.currency===currency&&r.category===category);
    const sum=(status:string)=>group.filter(r=>r.status===status).reduce((n,r)=>n+r.amountMinor,0n).toString();
    return {currency:currency!,category:category!,identified:sum("identified"),validated:sum("validated"),realized:sum("realized")};
  });
  return {totals,records:rows.map(r=>({...r,amountMinor:r.amountMinor.toString(),occurredAt:r.occurredAt?.toISOString()??null,createdAt:r.createdAt.toISOString()}))};
}

export async function action({request}:ActionFunctionArgs) {
  const {session}=await authenticate.admin(request); const f=await request.formData();
  const category=String(f.get("category")??""), status=String(f.get("status")??"");
  const currency=String(f.get("currency")??"").trim().toUpperCase(), amountText=String(f.get("amount")??"").trim();
  const sourceReference=String(f.get("sourceReference")??"").trim(), realizationReference=String(f.get("realizationReference")??"").trim();
  const evidenceNote=String(f.get("evidenceNote")??"").trim(), dateText=String(f.get("occurredAt")??"").trim();
  const baselineMinutesText=String(f.get("baselineMinutes")??"").trim(), assistedMinutesText=String(f.get("assistedMinutes")??"").trim();
  const hourlyRateText=String(f.get("hourlyRate")??"").trim(), measurementPeriod=String(f.get("measurementPeriod")??"").trim();
  const intent=String(f.get("intent")??"create");
  const merchant=await prisma.merchant.findUnique({where:{shop:session.shop},select:{id:true}});
  if(!merchant)return {ok:false,message:"Open the overview first to initialize this merchant workspace."};

  if(intent==="advance"){
    const recordId=String(f.get("recordId")??"").trim();
    const nextStatus=String(f.get("nextStatus")??"").trim();
    const realizationReference=String(f.get("realizationReference")??"").trim();
    const evidenceNote=String(f.get("evidenceNote")??"").trim();
    if(!recordId||!statuses.has(nextStatus))return {ok:false,message:"Choose a valid record and next status."};
    const existing=await prisma.economicValueRecord.findFirst({where:{id:recordId,merchantId:merchant.id}});
    if(!existing)return {ok:false,message:"Value record not found in this merchant workspace."};
    const allowed=existing.status==="identified"&&nextStatus==="validated"||existing.status==="validated"&&nextStatus==="realized";
    if(!allowed)return {ok:false,message:"Value records must advance one stage at a time: identified → validated → realized."};
    if(existing.category==="operating_time_saved"&&nextStatus==="realized")return {ok:false,message:"Time saved is operating value, not recovered cash. Keep it merchant-validated; do not mark it realized."};
    if(nextStatus==="realized"&&!realizationReference)return {ok:false,message:"A posted credit-note, refund or accounting reference is required for realized value."};
    if(realizationReference.length>180||evidenceNote.length>2000)return {ok:false,message:"References or evidence notes exceed the allowed length."};
    const updated=await prisma.$transaction(async tx=>{
      const result=await tx.economicValueRecord.update({where:{id:existing.id},data:{
        status:nextStatus,
        realizationReference:nextStatus==="realized"?realizationReference:null,
        evidenceNote:evidenceNote||existing.evidenceNote,
      }});
      await tx.auditEvent.create({data:{merchantId:merchant.id,actor:session.id,action:"economic_value_record_advanced",subjectType:"economic_value_record",subjectId:result.id,detail:{from:existing.status,to:nextStatus,realizationReference:nextStatus==="realized"?realizationReference:null}}});
      return result;
    });
    return {ok:true,message:"Record advanced to "+updated.status+". The amount remains merchant-attested, not independently verified."};
  }

  if(!categories.has(category)||!statuses.has(status))return {ok:false,message:"Choose a supported category and status."};
  if(!/^[A-Z]{3}$/.test(currency))return {ok:false,message:"Enter a three-letter ISO currency code."};
  if(!sourceReference||sourceReference.length>180)return {ok:false,message:"A source invoice, order, credit-note or policy reference is required."};
  if(evidenceNote.length<20||evidenceNote.length>2000)return {ok:false,message:"Evidence note must contain 20–2,000 characters."};
  if(status==="realized"&&!realizationReference)return {ok:false,message:"A posted credit-note, refund or accounting reference is required for realized value."};
  if(category==="operating_time_saved"&&status==="realized")return {ok:false,message:"Operating time saved is not recovered cash. Record it as identified or merchant-validated."};
  let amount: ReturnType<typeof parseMoney>;
  let recordedEvidenceNote=evidenceNote;
  try{
    if(category==="operating_time_saved"){
      const baseline=Number(baselineMinutesText), assisted=Number(assistedMinutesText);
      if(!/^\d+$/.test(baselineMinutesText)||!/^\d+$/.test(assistedMinutesText)||!Number.isSafeInteger(baseline)||!Number.isSafeInteger(assisted)||baseline<=assisted||baseline>100000||assisted<0)return {ok:false,message:"Enter valid baseline and NODUS-assisted minutes. Baseline must exceed assisted time."};
      if(measurementPeriod.length<4||measurementPeriod.length>80)return {ok:false,message:"Enter the measurement period (for example, 2026-10-01 to 2026-10-31)."};
      const hourlyRate=parseMoney(hourlyRateText,currency);
      if(hourlyRate.minor<=0n)return {ok:false,message:"Loaded hourly labor rate must be greater than zero."};
      const minutesSaved=baseline-assisted;
      const valueMinor=(BigInt(minutesSaved)*hourlyRate.minor+30n)/60n;
      amount={minor:valueMinor,currency};
      if(amount.minor<=0n)return {ok:false,message:"Measured time value rounds to zero at the selected currency precision."};
      recordedEvidenceNote=evidenceNote+"\nBaseline minutes: "+baseline+"; NODUS-assisted minutes: "+assisted+"; minutes saved: "+minutesSaved+"; merchant-approved loaded hourly rate: "+hourlyRateText+" "+currency+"; measurement period: "+measurementPeriod+".";
    }else{
      amount=parseMoney(amountText,currency);
      if(amount.minor<=0n)return {ok:false,message:"Amount must be greater than zero."};
    }
  }catch(e){return {ok:false,message:e instanceof Error?e.message:"Invalid amount or time measurement."}}
  const occurredAt=dateText?new Date(dateText):null;
  if(occurredAt&&Number.isNaN(occurredAt.getTime()))return {ok:false,message:"Invalid event date."};
  const record=await prisma.$transaction(async tx=>{
    const created=await tx.economicValueRecord.create({data:{merchantId:merchant.id,category,status,amountMinor:amount.minor,currency,sourceReference,realizationReference:realizationReference||null,evidenceNote:recordedEvidenceNote,occurredAt,createdBy:session.id}});
    await tx.auditEvent.create({data:{merchantId:merchant.id,actor:session.id,action:"economic_value_record_created",subjectType:"economic_value_record",subjectId:created.id,detail:{category,status,amountMinor:amount.minor.toString(),currency,sourceReference,realizationReference:realizationReference||null}}});
    return created;
  });
  return {ok:true,message:"Saved. Status is merchant-attested, not independently verified by NODUS."};
}

function money(v:string,c:string){const z=new Set(["BIF","CLP","DJF","GNF","JPY","KMF","KRW","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"]);const t=new Set(["BHD","IQD","JOD","KWD","LYD","OMR","TND"]);const p=z.has(c)?0:t.has(c)?3:2;return new Intl.NumberFormat(undefined,{style:"currency",currency:c,minimumFractionDigits:p,maximumFractionDigits:p}).format(Number(BigInt(v))/10**p)}

export default function EconomicValue(){
 const d=useLoaderData<typeof loader>(), result=useActionData<typeof action>();
 return <div className="page-wrap">
  <header className="topbar"><div><p className="eyebrow">NODUS / ECONOMIC PROOF</p><h1>Value ledger</h1><p className="muted">Separate identified exposure from validated and realized outcomes.</p></div></header>
  <section className="metric-grid">{d.totals.map(t=><article className="metric-card" key={t.currency+t.category}><span>{labels[t.category]??t.category} · {t.currency}</span><strong>{money(t.identified,t.currency)}</strong><small>Merchant-recorded opportunities; not verified savings.</small><div className="value-subtotals"><span>Validated: {money(t.validated,t.currency)}</span><span>Realized: {money(t.realized,t.currency)}</span></div></article>)}{!d.totals.length?<article className="metric-card"><span>Economic outcomes</span><strong>Not established</strong><small>A blank ledger is better than an invented ROI claim.</small></article>:null}</section>
  <section className="surface-card value-ledger-panel"><h3>Record a financial outcome</h3><p className="body-copy">Record a financial outcome or measured operating time saved. Financial opportunities and time value are reported separately. Time value is calculated from the merchant-approved loaded labor rate and before/after task minutes; it remains operating value, never realized cash. Financial realizations require a posted credit or accounting reference.</p>
   <Form method="post" className="value-record-form">
    <input type="hidden" name="intent" value="create"/>
    <label>Category<select name="category" defaultValue="carrier_credit"><option value="carrier_credit">Carrier credit</option><option value="duplicate_charge">Duplicate charge</option><option value="surcharge_dispute">Surcharge dispute</option><option value="rate_correction">Rate correction</option><option value="policy_change">Policy change</option><option value="operating_time_saved">Operating time saved</option><option value="other">Other</option></select></label>
    <label>Status<select name="status" defaultValue="identified"><option value="identified">Identified opportunity</option><option value="validated">Validated by merchant</option><option value="realized">Realized / posted credit</option></select></label>
    <label>Amount<input name="amount" type="number" min="0.001" step="0.001" placeholder="Enter for financial outcomes; auto-calculated for time saved"/></label>
    <label>Currency<input name="currency" defaultValue="USD" minLength={3} maxLength={3} required/></label>
    <label>Source reference<input name="sourceReference" maxLength={180} required placeholder="Invoice / charge / order / policy reference"/></label>
    <label>Realization reference<input name="realizationReference" maxLength={180} placeholder="Required for realized value"/></label>
    <label>Event date<input name="occurredAt" type="date"/></label>
    <label>Baseline task time (minutes)<input name="baselineMinutes" type="number" min="1" max="100000" step="1" placeholder="Required for time saved"/></label>
    <label>NODUS-assisted task time (minutes)<input name="assistedMinutes" type="number" min="0" max="100000" step="1" placeholder="Required for time saved"/></label>
    <label>Loaded labor rate per hour<input name="hourlyRate" type="number" min="0.001" step="0.001" placeholder="Required for time saved"/></label>
    <label>Measurement period<input name="measurementPeriod" maxLength={80} placeholder="e.g. 2026-10-01 to 2026-10-31"/></label>
    <label className="value-note-field">Evidence and calculation note<textarea name="evidenceNote" minLength={20} maxLength={2000} rows={3} required placeholder="Describe the source record, calculation, baseline and why this amount is supported."/></label>
    <button type="submit">Save value record</button>{result?<p role="status" className={result.ok?"import-success":"import-error"}>{result.message}</p>:null}
   </Form>
  </section>
  <section className="surface-card"><div className="card-heading"><div><p className="eyebrow">AUDITABLE OUTCOMES</p><h3>Recorded evidence</h3></div><span className="tag">{d.records.length} records</span></div>
   <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Category</th><th>Status</th><th>Amount</th><th>Source</th><th>Realization proof</th><th>Evidence note</th><th>Date</th><th>Update stage</th></tr></thead><tbody>
    {d.records.map(r=><tr key={r.id}><td>{labels[r.category]??r.category}</td><td>{r.status}</td><td>{money(r.amountMinor,r.currency)}</td><td>{r.sourceReference}</td><td>{r.realizationReference??"—"}</td><td>{r.evidenceNote}</td><td>{r.occurredAt?new Date(r.occurredAt).toLocaleDateString():new Date(r.createdAt).toLocaleDateString()}</td><td>{r.status==="identified"||r.status==="validated"?<Form method="post" className="value-advance-form"><input type="hidden" name="intent" value="advance"/><input type="hidden" name="recordId" value={r.id}/><select name="nextStatus" defaultValue={r.status==="identified"?"validated":"realized"}><option value={r.status==="identified"?"validated":"realized"}>{r.status==="identified"?"Mark validated":"Mark realized / posted"}</option></select><input name="realizationReference" maxLength={180} placeholder="Posted reference (required for realized)"/><input name="evidenceNote" maxLength={2000} placeholder="Updated evidence note (optional)"/><button type="submit">Advance record</button></Form>:<span>Complete</span>}</td></tr>)}
    {!d.records.length?<tr><td colSpan={8}>No value records yet. Do not publish a financial outcome without evidence.</td></tr>:null}
   </tbody></table></div><p className="footnote">Only realized records with a source realization reference may be included in realized-value claims. Merchant-entered statuses are not independently audited by NODUS.</p>
  </section>
 </div>;
}
