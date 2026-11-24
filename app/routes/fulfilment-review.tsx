import {useMemo,useState,type ChangeEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

type Row=Record<string,string>;
type Rate={code:string;unit:string;pricing:"per_unit"|"fixed";rate:number;currency:string;from:string;to:string};
type Invoice={invoice:string;date:string;code:string;quantity:number;unit:string;amount:number;currency:string;line:string;description:string;reference:string};
type Activity={id:string;reference:string;code:string;quantity:number;unit:string;date:string};
type Finding={line:string;code:string;description:string;currency:string;billed:number;expected:number|null;variance:number|null;status:string;detail:string;activityQuantity:number|null};

function parseCsv(text:string):string[][]{
 const rows:string[][]=[];let row:string[]=[];let field="";let quoted=false;
 const source=text.replace(/^\uFEFF/,"");
 for(let i=0;i<source.length;i++){const c=source[i]!;
  if(quoted){if(c==='"'&&source[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
  else if(c==='"'){if(field.trim())throw Error("Invalid quote in CSV.");quoted=true;}
  else if(c===","){row.push(field);field="";}
  else if(c==="\n"||c==="\r"){if(c==="\r"&&source[i+1]==="\n")i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field="";}
  else field+=c;
 }
 if(quoted)throw Error("CSV contains an unclosed quoted field.");
 row.push(field);if(row.some(v=>v.trim()))rows.push(row);
 if(rows.length<2)throw Error("Each CSV needs a header and at least one data row.");
 if(rows.length>20001)throw Error("Maximum 20,000 data rows per file.");
 const width=rows[0]!.length;if(rows.some(r=>r.length!==width))throw Error("CSV rows have inconsistent column counts.");
 return rows;
}
function records(text:string,required:string[]):Row[]{
 const rows=parseCsv(text);const headers=rows[0]!.map(v=>v.trim().toLowerCase());
 if(new Set(headers).size!==headers.length)throw Error("CSV headers must be unique.");
 for(const key of required)if(!headers.includes(key))throw Error("CSV is missing required column: "+key);
 return rows.slice(1).map(row=>Object.fromEntries(headers.map((h,i)=>[h,(row[i]??"").trim()])));
}
function number(value:string,label:string){if(!/^-?\d+(?:\.\d{1,4})?$/.test(value))throw Error("Invalid numeric value for "+label+": "+value);const n=Number(value);if(!Number.isFinite(n))throw Error("Invalid number for "+label);return n;}
function date(value:string,label:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(Date.parse(value+"T00:00:00Z")))throw Error("Use YYYY-MM-DD for "+label);return value;}
function parseRates(text:string):Rate[]{return records(text,["charge_code","unit","pricing","rate","currency","effective_from"]).map((r,i)=>{
 const pricing=r.pricing as Rate["pricing"];if(pricing!=="per_unit"&&pricing!=="fixed")throw Error("Rate-card pricing must be per_unit or fixed (row "+(i+2)+").");
 const currency=r.currency.toUpperCase();if(!/^[A-Z]{3}$/.test(currency))throw Error("Invalid ISO currency on rate-card row "+(i+2)+".");
 const from=date(r.effective_from,"effective_from");const to=r.effective_to?date(r.effective_to,"effective_to"):"9999-12-31";if(to<from)throw Error("Rate effective_to precedes effective_from.");
 return {code:r.charge_code,unit:r.unit,pricing,rate:number(r.rate,"rate"),currency,from,to};
 });}
function parseInvoices(text:string):Invoice[]{return records(text,["invoice_number","invoice_date","charge_code","quantity","unit","amount","currency"]).map((r,i)=>{
 const currency=r.currency.toUpperCase();if(!/^[A-Z]{3}$/.test(currency))throw Error("Invalid ISO currency on invoice row "+(i+2)+".");
 return {invoice:r.invoice_number,date:date(r.invoice_date,"invoice_date"),code:r.charge_code,quantity:number(r.quantity,"quantity"),unit:r.unit,amount:number(r.amount,"amount"),currency,line:r.external_line_id||String(i+2),description:r.description||"",reference:r.activity_reference||""};
 });}
function parseActivity(text:string):Activity[]{return records(text,["record_id","reference","charge_code","quantity","unit"]).map((r,i)=>({id:r.record_id||String(i+2),reference:r.reference,code:r.charge_code,quantity:number(r.quantity,"activity quantity"),unit:r.unit,date:r.occurred_at||""}));}
function analyze(rates:Rate[],invoices:Invoice[],activity:Activity[]):Finding[]{
 return invoices.map(line=>{
  const candidates=rates.filter(r=>r.code===line.code&&r.unit===line.unit&&line.date>=r.from&&line.date<=r.to);
  if(candidates.length===0)return {line:line.line,code:line.code,description:line.description,currency:line.currency,billed:line.amount,expected:null,variance:null,status:"NO RATE",detail:"No effective rate-card rule matches this charge code, unit and invoice date.",activityQuantity:null};
  if(candidates.length>1)return {line:line.line,code:line.code,description:line.description,currency:line.currency,billed:line.amount,expected:null,variance:null,status:"AMBIGUOUS RATE",detail:"Multiple effective rate rules match. Resolve the contract version before calculating.",activityQuantity:null};
  const rate=candidates[0]!;
  if(rate.currency!==line.currency)return {line:line.line,code:line.code,description:line.description,currency:line.currency,billed:line.amount,expected:null,variance:null,status:"CURRENCY MISMATCH",detail:"Invoice and rate-card currencies differ; no conversion is assumed.",activityQuantity:null};
  const expected=roundMoney(rate.pricing==="per_unit"?rate.rate*line.quantity:rate.rate);
  const variance=roundMoney(line.amount-expected);
  const matching=line.reference?activity.filter(a=>a.reference===line.reference&&a.code===line.code&&a.unit===line.unit):[];
  const activityQuantity=matching.length?roundQty(matching.reduce((s,a)=>s+a.quantity,0)):null;
  const quantityMismatch=activityQuantity!==null&&Math.abs(activityQuantity-line.quantity)>0.0001;
  const rateMismatch=Math.abs(variance)>0.01;
  let status="MATCH";
  let detail="Billed amount matches the selected rate rule.";
  if(!line.reference){status=rateMismatch?"RATE VARIANCE · NO ACTIVITY REF":"NO ACTIVITY REFERENCE";detail="No activity reference was supplied. Rate comparison is available; quantity evidence is not.";}
  else if(activityQuantity===null){status=rateMismatch?"RATE VARIANCE · ACTIVITY MISSING":"ACTIVITY MISSING";detail="No activity row matches the exact reference, charge code and unit.";}
  else if(quantityMismatch){status="QUANTITY MISMATCH";detail="Invoice quantity differs from summed activity quantity. Rate variance is also shown where present.";}
  else if(rateMismatch){status="RATE VARIANCE";detail="Billed amount differs from the contract calculation by "+variance.toFixed(2)+" "+line.currency+".";}
  else {detail="Rate and referenced activity quantity agree.";}
  return {line:line.line,code:line.code,description:line.description,currency:line.currency,billed:line.amount,expected,variance,status,detail,activityQuantity};
 });
}
function roundMoney(n:number){return Math.round((n+Number.EPSILON)*100)/100;}
function roundQty(n:number){return Math.round((n+Number.EPSILON)*10000)/10000;}
function download(name:string,body:string){const blob=new Blob([body],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function csv(value:string|number|null){const v=String(value??"");return '"'+(/^[\s]*[=+@-]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';}
function template(name:string,rows:string[][]){download(name,rows.map(r=>r.map(csv).join(",")).join("\r\n"));}

export const meta:MetaFunction=()=>[{title:"NODUS fulfilment invoice review workspace"},{name:"description",content:"Compare 3PL invoice charges against effective rate-card rules and referenced warehouse activity using CSV evidence."},{name:"robots",content:"noindex, nofollow"}];

export default function FulfilmentReview(){
 const [rateFile,setRateFile]=useState<Rate[]|null>(null),[invoiceFile,setInvoiceFile]=useState<Invoice[]|null>(null),[activityFile,setActivityFile]=useState<Activity[]|null>(null);
 const [rateName,setRateName]=useState(""),[invoiceName,setInvoiceName]=useState(""),[activityName,setActivityName]=useState("");
 const [error,setError]=useState("");
 async function load(event:ChangeEvent<HTMLInputElement>,kind:"rates"|"invoice"|"activity"){
  const file=event.target.files?.[0];if(!file)return;setError("");
  if(file.size>5*1024*1024){setError("Each file must be 5 MB or smaller.");event.target.value="";return;}
  try{const text=await file.text();if(kind==="rates"){setRateFile(parseRates(text));setRateName(file.name);}else if(kind==="invoice"){setInvoiceFile(parseInvoices(text));setInvoiceName(file.name);}else{setActivityFile(parseActivity(text));setActivityName(file.name);}}
  catch(e){setError(e instanceof Error?e.message:"Could not read CSV.");if(kind==="rates")setRateFile(null);else if(kind==="invoice")setInvoiceFile(null);else setActivityFile(null);}
 }
 const findings=useMemo(()=>rateFile&&invoiceFile?analyze(rateFile,invoiceFile,activityFile??[]):[],[rateFile,invoiceFile,activityFile]);
 const counts=useMemo(()=>({total:findings.length,exceptions:findings.filter(f=>f.status!=="MATCH").length,rate:findings.filter(f=>f.status.includes("RATE VARIANCE")).length,quantity:findings.filter(f=>f.status==="QUANTITY MISMATCH").length,missing:findings.filter(f=>f.status.includes("MISSING")||f.status==="NO ACTIVITY REFERENCE").length}),[findings]);
 function exportRegister(){const rows=[["invoice_line","charge_code","description","currency","billed_amount","contract_calculated_amount","variance","activity_quantity","status","explanation"],...findings.map(f=>[f.line,f.code,f.description,f.currency,f.billed.toFixed(2),f.expected?.toFixed(2)??"",f.variance?.toFixed(2)??"",f.activityQuantity?.toString()??"",f.status,f.detail])];download("nodus-3pl-exception-register.csv",rows.map(r=>r.map(csv).join(",")).join("\r\n"));}
 return <MarketingShell active="workspace"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / 3PL CONTROL WORKSPACE</p><h1>Check the invoice<br/><em>against the evidence.</em></h1><p className="page-lede">Import an effective rate card, one warehouse invoice and optional activity records. NODUS calculates supported rate differences and separates missing, ambiguous and quantity evidence. Files are processed in this browser and are not uploaded.</p></header>
  <section className="content-note"><span className="page-eyebrow">01 / IMPORT SOURCE RECORDS</span><h2>Three files. One review.</h2><p>CSV only. Maximum 5 MB and 20,000 data rows per file. Use the templates below; do not upload customer personal data or credentials.</p>
   <div className="nd-form-grid">
    <label>RATE CARD CSV<input type="file" accept=".csv,text/csv" onChange={e=>void load(e,"rates")}/><small>{rateFile?rateName+" · "+rateFile.length+" rules":"Required · effective-dated contract rates"}</small></label>
    <label>3PL INVOICE CSV<input type="file" accept=".csv,text/csv" onChange={e=>void load(e,"invoice")}/><small>{invoiceFile?invoiceName+" · "+invoiceFile.length+" lines":"Required · one invoice per file"}</small></label>
    <label>WAREHOUSE ACTIVITY CSV<input type="file" accept=".csv,text/csv" onChange={e=>void load(e,"activity")}/><small>{activityFile?activityName+" · "+activityFile.length+" records":"Optional · exact reference matching"}</small></label>
   </div>
   <div className="hero-ctas">
    <button className="cta-secondary" type="button" onClick={()=>template("nodus-rate-card-template.csv",[["charge_code","unit","pricing","rate","currency","effective_from","effective_to"],["PICK_SINGLE","order","per_unit","2.10","USD","2026-01-01",""],["STORAGE_BIN","bin_day","per_unit","0.45","USD","2026-01-01",""],["MONTHLY_MIN","month","fixed","250.00","USD","2026-01-01",""]])}>DOWNLOAD RATE-CARD TEMPLATE</button>
    <button className="cta-secondary" type="button" onClick={()=>template("nodus-3pl-invoice-template.csv",[["invoice_number","invoice_date","charge_code","quantity","unit","amount","currency","external_line_id","description","activity_reference"],["INV-2048","2026-11-01","PICK_SINGLE","100","order","210.00","USD","L-001","Single-item picks","PICK-BATCH-01"]])}>DOWNLOAD INVOICE TEMPLATE</button>
    <button className="cta-secondary" type="button" onClick={()=>template("nodus-warehouse-activity-template.csv",[["record_id","reference","charge_code","quantity","unit","occurred_at"],["ACT-001","PICK-BATCH-01","PICK_SINGLE","100","order","2026-10-31"]])}>DOWNLOAD ACTIVITY TEMPLATE</button>
   </div>
  </section>
  {error?<p className="import-error" role="alert">{error}</p>:null}
  {findings.length?<>
   <section className="content-grid" aria-label="Review summary">
    <article><span>INVOICE LINES</span><h2>{counts.total}</h2><p>Imported and compared.</p></article>
    <article><span>NEEDS REVIEW</span><h2>{counts.exceptions}</h2><p>Not classified as a supported match.</p></article>
    <article><span>RATE VARIANCES</span><h2>{counts.rate}</h2><p>Difference from effective rate rule.</p></article>
    <article><span>QUANTITY / EVIDENCE</span><h2>{counts.quantity+counts.missing}</h2><p>Activity differences or evidence gaps.</p></article>
   </section>
   <section className="content-note"><div className="section-heading"><div><span className="section-index">02 / EXCEPTION REGISTER</span><h2>What the records support.</h2></div><p>{findings.length} lines reviewed</p></div>
    <div className="manual-table-wrap"><table><thead><tr><th>LINE</th><th>CHARGE</th><th>BILLED</th><th>EXPECTED</th><th>VARIANCE</th><th>ACTIVITY QTY</th><th>STATUS</th></tr></thead><tbody>{findings.map((f,i)=><tr key={f.line+"-"+i}><td>{f.line}</td><td>{f.code}<small>{f.description}</small></td><td>{f.billed.toFixed(2)} {f.currency}</td><td>{f.expected===null?"—":f.expected.toFixed(2)+" "+f.currency}</td><td>{f.variance===null?"—":f.variance.toFixed(2)+" "+f.currency}</td><td>{f.activityQuantity??"—"}</td><td><strong>{f.status}</strong><small>{f.detail}</small></td></tr>)}</tbody></table></div>
    <button type="button" className="cta-primary" onClick={exportRegister}>EXPORT EXCEPTION REGISTER ↗</button>
   </section>
  </>:<section className="content-note"><h2>Waiting for source records.</h2><p>Import a rate card and invoice to calculate a review. Activity data adds a separate quantity check. No finding is generated from a missing file or an assumed zero.</p></section>}
  <section className="content-note"><span className="page-eyebrow">03 / METHOD AND LIMITS</span><h2>Calculation, not accusation.</h2><ul><li>Rate rules match by charge code, unit and invoice date.</li><li>Multiple effective rules are flagged as ambiguous; NODUS does not guess which contract applies.</li><li>Per-unit rates multiply by billed quantity; fixed rates are compared as fixed charges.</li><li>Activity checks require an exact activity reference, charge code and unit.</li><li>Amounts are compared in the invoice currency. No currency conversion is assumed.</li><li>Taxes, surcharges, minimum commitments, tiered pricing, credits, contract interpretation and provider liability require human review unless explicitly represented in the supplied rate-card rules.</li><li>A variance is not proof of overbilling, recoverable cash, a credit or realised savings.</li></ul>
  </section>
  <section className="content-note"><h2>Need a human review?</h2><p>The workspace performs deterministic checks on supported CSV structures. A qualified reviewer must validate the applicable contract, interpret exceptions and approve the customer-facing report. NODUS does not currently submit disputes or contact warehouses on your behalf.</p><Link to="/buyer-evaluation">REQUEST A SCOPED REVIEW ↗</Link></section>
  <p className="footnote">Local processing: source files are read in this browser only. Do not use a shared device for confidential commercial records. Review outputs are preliminary and must be checked against the signed agreement and original source documents.</p>
 </main></MarketingShell>;
}
