import { reconcileThreePLInvoices, type ThreePLActivityRecord, type ThreePLInvoiceLine, type ThreePLRateRule } from "../../../app/domain/threepl-control";
import { json } from "../../_lib/shopify";
import {
  canWrite, clean, csvValue, dateOnly, getWorkspace, id, logCaseEvent, moneyMinor,
  nowIso, parseCsv, quantity, sameOrigin, sha256, logWorkspaceEvent, type ThreePLEnv
} from "../../_lib/threepl";

interface Context { request: Request; env: ThreePLEnv; }
type ProviderRow = { id:string;name:string;status:string };
type ContractRow = { id:string;workspace_id:string;provider_id:string;name:string;currency:string;effective_from:string;effective_to:string|null;status:string;source_file_name:string|null;source_hash:string|null;provider_name:string };
type RuleRow = { id:string;contract_id:string;charge_code:string;unit:string;pricing:"per_unit"|"fixed";rate_minor:string;currency:string;source_row:number;effective_from:string;effective_to:string|null };
type InvoiceRow = { id:string;provider_id:string;invoice_number:string;invoice_date:string;period_start:string|null;period_end:string|null;currency:string;total_minor:string;status:string;source_file_name:string|null;source_hash:string|null;provider_name:string };
type LineRow = { id:string;invoice_id:string;external_line_id:string|null;charge_code:string;description:string|null;service_date:string|null;quantity:string;unit:string;amount_minor:string;currency:string;activity_reference:string|null;source_row:number };
type ActivityRow = { id:string;provider_id:string;reference:string;charge_code:string;quantity:string;unit:string;occurred_at:string|null;source_row:number;source_file_name:string;source_hash:string;provider_name:string };
type ExceptionRow = { id:string;invoice_id:string;invoice_number:string;provider_name:string;finding_code:string;severity:string;state:string;status:string;currency:string;exposure_minor:string|null;explanation:string;note:string|null;evidence_json:string;last_seen_at:string };
type CaseEventRow = { exception_id:string;action:string;detail_json:string|null;created_at:string };
type OutcomeRow = { id:string;exception_id:string;outcome_type:string;status:string;amount_minor:string;currency:string;external_reference:string|null;evidence_note:string;verified_at:string|null;finding_code:string };
type ReportRow = { id:string;period_start:string;period_end:string;revision:number;status:string;payload_json:string;generated_at:string };
type WorkspaceEventRow = { action:string;detail_json:string|null;created_at:string };

function bad(message:string,status=400){return json({ok:false,error:message},status);}
function safeName(value:string){return value.replace(/[\\/\0-\x1f]/g,"_").slice(0,180)||"upload.csv";}
function parseJson(value:string|null){if(!value)return null;try{return JSON.parse(value);}catch{return null;}}
function fileFrom(form:FormData){
 const file=form.get("file");
 if(!(file instanceof File)||!file.size||file.size>5*1024*1024)throw new Error("Choose a CSV file no larger than 5 MB.");
 if(!file.name.toLowerCase().endsWith(".csv")&&file.type!=="text/csv")throw new Error("Only CSV files are accepted.");
 return file;
}
async function providerExists(env:ThreePLEnv,workspaceId:string,providerId:string){
 return await env.NODUS_DB.prepare("SELECT id FROM threepl_providers WHERE id=? AND workspace_id=?").bind(providerId,workspaceId).first<{id:string}>();
}
async function chunks(env:ThreePLEnv,statements:ReturnType<ThreePLEnv["NODUS_DB"]["prepare"]>[],size=100){
 for(let i=0;i<statements.length;i+=size)await env.NODUS_DB.batch(statements.slice(i,i+size));
}

async function importContract(env:ThreePLEnv,workspaceId:string,form:FormData){
 const providerId=clean(form.get("providerId"),80),name=clean(form.get("name"),160)||"Rate card";
 if(!providerId||!await providerExists(env,workspaceId,providerId))throw new Error("Select a provider in this workspace.");
 if(form.get("confirmed")!=="on")throw new Error("Confirm that these rate rows have been checked against the signed agreement.");
 const file=fileFrom(form),csv=await file.text(),parsed=parseCsv(csv);
 const currencies=new Set<string>();
 const rules=parsed.rows.map((row,index)=>{
  const amount=moneyMinor(csvValue(row,parsed.headers,"rate"),csvValue(row,parsed.headers,"currency"));
  currencies.add(amount.currency);
  const pricing=csvValue(row,parsed.headers,"pricing");
  if(pricing!=="per_unit"&&pricing!=="fixed")throw new Error("pricing must be per_unit or fixed.");
  const from=dateOnly(csvValue(row,parsed.headers,"effective_from"));
  const toRaw=csvValue(row,parsed.headers,"effective_to",false),to=toRaw?dateOnly(toRaw):null;
  if(to&&to<from)throw new Error("effective_to cannot precede effective_from.");
  return {chargeCode:csvValue(row,parsed.headers,"charge_code"),unit:csvValue(row,parsed.headers,"unit"),pricing,rateMinor:amount.minor.toString(),currency:amount.currency,sourceRow:index+2,effectiveFrom:from,effectiveTo:to};
 });
 if(currencies.size!==1)throw new Error("A single contract file must use one currency.");
 const sourceHash=await sha256(csv),sourceFileName=safeName(file.name),created=nowIso(),contractId=id();
 const starts=rules.map(rule=>rule.effectiveFrom).sort(),ends=rules.map(rule=>rule.effectiveTo);
 const effectiveTo=ends.every(Boolean)?ends.sort().at(-1)??null:null;
 await env.NODUS_DB.prepare("INSERT INTO threepl_contracts(id,workspace_id,provider_id,name,currency,effective_from,effective_to,status,source_file_name,source_hash,confirmed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'draft',?,?,?,?,?)")
  .bind(contractId,workspaceId,providerId,name,[...currencies][0],starts[0],effectiveTo,sourceFileName,sourceHash,null,created,created).run();
 const statements=rules.map(rule=>env.NODUS_DB.prepare("INSERT INTO threepl_rate_rules(id,contract_id,charge_code,unit,pricing,rate_minor,currency,source_row,effective_from,effective_to,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
  .bind(id(),contractId,rule.chargeCode,rule.unit,rule.pricing,rule.rateMinor,rule.currency,rule.sourceRow,rule.effectiveFrom,rule.effectiveTo,created,created));
 await chunks(env,statements);
 await env.NODUS_DB.prepare("UPDATE threepl_contracts SET status='active',confirmed_at=?,updated_at=? WHERE id=? AND workspace_id=?").bind(created,created,contractId,workspaceId).run();
 await logWorkspaceEvent(env,workspaceId,"contract_imported",{contractId,sourceFileName,sourceHash,ruleCount:rules.length},"merchant");
 return {contractId,ruleCount:rules.length,sourceHash};
}

async function importInvoice(env:ThreePLEnv,workspaceId:string,form:FormData){
 const providerId=clean(form.get("providerId"),80);
 if(!providerId||!await providerExists(env,workspaceId,providerId))throw new Error("Select a provider in this workspace.");
 const file=fileFrom(form),csv=await file.text(),parsed=parseCsv(csv);
 const invoiceNumbers=new Set(parsed.rows.map(row=>csvValue(row,parsed.headers,"invoice_number")));
 const invoiceDates=new Set(parsed.rows.map(row=>csvValue(row,parsed.headers,"invoice_date")));
 if(invoiceNumbers.size!==1||invoiceDates.size!==1)throw new Error("Upload one invoice per CSV file; invoice_number and invoice_date must be consistent across rows.");
 const invoiceNumber=[...invoiceNumbers][0]!,invoiceDate=dateOnly([...invoiceDates][0]!);
 const periodStarts=new Set(parsed.rows.map(row=>csvValue(row,parsed.headers,"period_start",false)).filter(Boolean));
 const periodEnds=new Set(parsed.rows.map(row=>csvValue(row,parsed.headers,"period_end",false)).filter(Boolean));
 if(periodStarts.size>1||periodEnds.size>1)throw new Error("Invoice period dates must be consistent across rows.");
 const periodStart=periodStarts.size?dateOnly([...periodStarts][0]!):null,periodEnd=periodEnds.size?dateOnly([...periodEnds][0]!):null;
 const currencies=new Set<string>();
 const lines=parsed.rows.map((row,index)=>{
  const amount=moneyMinor(csvValue(row,parsed.headers,"amount"),csvValue(row,parsed.headers,"currency"),true);
  currencies.add(amount.currency);
  const serviceRaw=csvValue(row,parsed.headers,"service_date",false);
  return {externalLineId:csvValue(row,parsed.headers,"external_line_id",false)||null,chargeCode:csvValue(row,parsed.headers,"charge_code"),description:csvValue(row,parsed.headers,"description",false)||null,serviceDate:serviceRaw?dateOnly(serviceRaw):null,quantity:quantity(csvValue(row,parsed.headers,"quantity")),unit:csvValue(row,parsed.headers,"unit"),amountMinor:amount.minor.toString(),currency:amount.currency,activityReference:csvValue(row,parsed.headers,"activity_reference",false)||null,sourceRow:index+2};
 });
 const externalIds=lines.map(line=>line.externalLineId).filter((value):value is string=>Boolean(value));
 if(new Set(externalIds).size!==externalIds.length)throw new Error("Invoice file contains duplicate external_line_id values.");
 if(currencies.size!==1)throw new Error("An invoice file must use one billing currency.");
 const currency=[...currencies][0]!,totalMinor=lines.reduce((sum,line)=>sum+BigInt(line.amountMinor),0n).toString();
 const sourceHash=await sha256(csv),sourceFileName=safeName(file.name),now=nowIso();
 const existing=await env.NODUS_DB.prepare("SELECT id FROM threepl_invoices WHERE workspace_id=? AND provider_id=? AND invoice_number=?").bind(workspaceId,providerId,invoiceNumber).first<{id:string}>();
 let invoiceId:string;
 if(existing){
  invoiceId=existing.id;
  await env.NODUS_DB.prepare("UPDATE threepl_invoices SET status='importing',updated_at=? WHERE id=? AND workspace_id=?").bind(now,invoiceId,workspaceId).run();
  await env.NODUS_DB.prepare("UPDATE threepl_exceptions SET status='superseded',resolved_at=?,updated_at=? WHERE workspace_id=? AND invoice_id=? AND status NOT IN ('verified_closed','rejected','ignored','superseded')")
   .bind(now,now,workspaceId,invoiceId).run();
  await env.NODUS_DB.prepare("DELETE FROM threepl_invoice_lines WHERE invoice_id=?").bind(invoiceId).run();
  await env.NODUS_DB.prepare("UPDATE threepl_invoices SET invoice_date=?,period_start=?,period_end=?,currency=?,total_minor=?,source_file_name=?,source_hash=?,imported_at=?,updated_at=? WHERE id=? AND workspace_id=?")
   .bind(invoiceDate,periodStart,periodEnd,currency,totalMinor,sourceFileName,sourceHash,now,now,invoiceId,workspaceId).run();
 }else{
  invoiceId=id();
  await env.NODUS_DB.prepare("INSERT INTO threepl_invoices(id,workspace_id,provider_id,invoice_number,invoice_date,period_start,period_end,currency,total_minor,status,source_file_name,source_hash,imported_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'importing',?,?,?,?,?)")
   .bind(invoiceId,workspaceId,providerId,invoiceNumber,invoiceDate,periodStart,periodEnd,currency,totalMinor,sourceFileName,sourceHash,now,now,now).run();
 }
 const statements=lines.map(line=>env.NODUS_DB.prepare("INSERT INTO threepl_invoice_lines(id,invoice_id,external_line_id,charge_code,description,service_date,quantity,unit,amount_minor,currency,activity_reference,source_row,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)")
  .bind(id(),invoiceId,line.externalLineId,line.chargeCode,line.description,line.serviceDate,line.quantity,line.unit,line.amountMinor,line.currency,line.activityReference,line.sourceRow,now));
 await chunks(env,statements);
 await env.NODUS_DB.prepare("UPDATE threepl_invoices SET status='imported',updated_at=? WHERE id=? AND workspace_id=?").bind(now,invoiceId,workspaceId).run();
 await logWorkspaceEvent(env,workspaceId,"invoice_imported",{invoiceId,invoiceNumber,sourceFileName,sourceHash,lineCount:lines.length,totalMinor,currency},"merchant");
 return {invoiceId,invoiceNumber,lineCount:lines.length,totalMinor,currency,sourceHash};
}

async function importActivity(env:ThreePLEnv,workspaceId:string,form:FormData){
 const providerId=clean(form.get("providerId"),80);
 if(!providerId||!await providerExists(env,workspaceId,providerId))throw new Error("Select a provider in this workspace.");
 const file=fileFrom(form),csv=await file.text(),parsed=parseCsv(csv),sourceHash=await sha256(csv),sourceFileName=safeName(file.name),now=nowIso();
 const sourceSystem="provider_activity_csv";
 const records=parsed.rows.map((row,index)=>{
  const occurred=csvValue(row,parsed.headers,"occurred_at",false);
  if(occurred&&Number.isNaN(Date.parse(occurred)))throw new Error("Activity file contains an invalid occurred_at timestamp.");
  return {sourceRecordId:csvValue(row,parsed.headers,"record_id"),reference:csvValue(row,parsed.headers,"reference"),chargeCode:csvValue(row,parsed.headers,"charge_code"),quantity:quantity(csvValue(row,parsed.headers,"quantity")),unit:csvValue(row,parsed.headers,"unit"),occurredAt:occurred?new Date(occurred).toISOString():null,sourceRow:index+2};
 });
 if(new Set(records.map(record=>record.sourceRecordId)).size!==records.length)throw new Error("Activity file contains duplicate record_id values.");
 const statements=records.map(record=>env.NODUS_DB.prepare("INSERT INTO threepl_activity_records(id,workspace_id,provider_id,source_system,source_record_id,reference,charge_code,quantity,unit,occurred_at,source_row,source_file_name,source_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(workspace_id,source_system,source_record_id) DO UPDATE SET provider_id=excluded.provider_id,reference=excluded.reference,charge_code=excluded.charge_code,quantity=excluded.quantity,unit=excluded.unit,occurred_at=excluded.occurred_at,source_row=excluded.source_row,source_file_name=excluded.source_file_name,source_hash=excluded.source_hash,created_at=excluded.created_at")
  .bind(id(),workspaceId,providerId,sourceSystem,record.sourceRecordId,record.reference,record.chargeCode,record.quantity,record.unit,record.occurredAt,record.sourceRow,sourceFileName,sourceHash,now));
 await chunks(env,statements);
 await logWorkspaceEvent(env,workspaceId,"activity_imported",{providerId,sourceFileName,sourceHash,recordCount:records.length},"merchant");
 return {imported:records.length,sourceHash,sourceFileName};
}

async function reconcileInvoice(env:ThreePLEnv,workspaceId:string,invoiceId:string){
 const invoice=await env.NODUS_DB.prepare("SELECT * FROM threepl_invoices WHERE id=? AND workspace_id=?").bind(invoiceId,workspaceId).first<{id:string;provider_id:string;invoice_date:string;currency:string;total_minor:string}>();
 if(!invoice)throw new Error("Invoice was not found in this workspace.");
 const [ruleRows,lineRows,activityRows]=await Promise.all([
  env.NODUS_DB.prepare("SELECT r.* FROM threepl_rate_rules r JOIN threepl_contracts c ON c.id=r.contract_id WHERE c.workspace_id=? AND c.provider_id=? AND c.status='active'").bind(workspaceId,invoice.provider_id).all<RuleRow>(),
  env.NODUS_DB.prepare("SELECT * FROM threepl_invoice_lines WHERE invoice_id=? ORDER BY source_row").bind(invoiceId).all<LineRow>(),
  env.NODUS_DB.prepare("SELECT * FROM threepl_activity_records WHERE workspace_id=? AND provider_id=? ORDER BY occurred_at").bind(workspaceId,invoice.provider_id).all<{id:string;reference:string;charge_code:string;quantity:string;unit:string}>(),
 ]);
 const rules:ThreePLRateRule[]=ruleRows.results.map(rule=>({id:rule.id,chargeCode:rule.charge_code,unit:rule.unit,pricing:rule.pricing,rate:{minor:BigInt(rule.rate_minor),currency:rule.currency},effectiveFrom:rule.effective_from,effectiveTo:rule.effective_to,sourceRow:rule.source_row}));
 const invoiceLines:ThreePLInvoiceLine[]=lineRows.results.map(line=>({id:line.id,invoiceId,billedAt:(line.service_date||invoice.invoice_date).slice(0,10),chargeCode:line.charge_code,quantity:line.quantity,unit:line.unit,amount:{minor:BigInt(line.amount_minor),currency:line.currency},activityReference:line.activity_reference}));
 const activity:ThreePLActivityRecord[]=activityRows.results.map(record=>({id:record.id,reference:record.reference,chargeCode:record.charge_code,quantity:record.quantity,unit:record.unit}));
 const engineVersion="threepl-control.v1";
 const inputHash=await sha256(JSON.stringify({
  engineVersion,invoice:{id:invoice.id,invoiceDate:invoice.invoice_date,currency:invoice.currency,totalMinor:invoice.total_minor},
  rules:rules.map(rule=>({...rule,rate:{minor:rule.rate.minor.toString(),currency:rule.rate.currency}})),
  invoiceLines:invoiceLines.map(line=>({...line,amount:{minor:line.amount.minor.toString(),currency:line.amount.currency}})),activity,
 }));
 const previous=await env.NODUS_DB.prepare("SELECT id,summary_json FROM threepl_reconciliation_runs WHERE workspace_id=? AND invoice_id=? AND input_hash=?").bind(workspaceId,invoiceId,inputHash).first<{id:string;summary_json:string}>();
 if(previous)return {runId:previous.id,summary:JSON.parse(previous.summary_json),reused:true};
 const result=reconcileThreePLInvoices({rules,invoiceLines,activity});
 const summary={...result.summary,findingCount:result.findings.length,engineVersion};
 const runId=id(),now=nowIso();
 try{
  await env.NODUS_DB.prepare("INSERT INTO threepl_reconciliation_runs(id,workspace_id,invoice_id,engine_version,input_hash,status,summary_json,created_at) VALUES(?,?,?, ?,?,'completed',?,?)")
   .bind(runId,workspaceId,invoiceId,engineVersion,inputHash,JSON.stringify(summary),now).run();
 }catch(error){
  const duplicate=await env.NODUS_DB.prepare("SELECT id,summary_json FROM threepl_reconciliation_runs WHERE workspace_id=? AND invoice_id=? AND input_hash=?").bind(workspaceId,invoiceId,inputHash).first<{id:string;summary_json:string}>();
  if(duplicate)return {runId:duplicate.id,summary:JSON.parse(duplicate.summary_json),reused:true};
  throw error;
 }
 for(const finding of result.findings){
  const fingerprint=await sha256(JSON.stringify({inputHash,invoiceLineId:finding.invoiceLineId,findingCode:finding.code,contractRuleId:finding.contractRuleId??null,evidenceReferences:[...finding.evidenceReferences].sort()}));
  const exposure=finding.varianceMinor&&BigInt(finding.varianceMinor)>0n?finding.varianceMinor:null;
  const exceptionId=id();
  await env.NODUS_DB.prepare("INSERT INTO threepl_exceptions(id,workspace_id,invoice_id,run_id,invoice_line_id,fingerprint,finding_code,severity,state,status,exposure_minor,currency,explanation,evidence_json,first_seen_at,last_seen_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'open',?,?,?,?,?,?,?,?) ON CONFLICT(workspace_id,fingerprint) DO UPDATE SET invoice_id=excluded.invoice_id,run_id=excluded.run_id,invoice_line_id=excluded.invoice_line_id,severity=excluded.severity,state=excluded.state,exposure_minor=excluded.exposure_minor,currency=excluded.currency,explanation=excluded.explanation,evidence_json=excluded.evidence_json,last_seen_at=excluded.last_seen_at,updated_at=excluded.updated_at")
   .bind(exceptionId,workspaceId,invoiceId,runId,finding.invoiceLineId,fingerprint,finding.code,finding.severity,finding.state,exposure,finding.currency,finding.explanation,JSON.stringify(finding.evidenceReferences),now,now,now,now).run();
  const saved=await env.NODUS_DB.prepare("SELECT id FROM threepl_exceptions WHERE workspace_id=? AND fingerprint=?").bind(workspaceId,fingerprint).first<{id:string}>();
  if(saved)await logCaseEvent(env,workspaceId,saved.id,"system","finding_observed",{runId,findingCode:finding.code,inputHash});
 }
 const old=await env.NODUS_DB.prepare("SELECT id,status FROM threepl_exceptions WHERE workspace_id=? AND invoice_id=? AND run_id<>? AND status NOT IN ('verified_closed','rejected','ignored','superseded','not_reproduced')").bind(workspaceId,invoiceId,runId).all<{id:string;status:string}>();
 for(const prior of old.results){
  await env.NODUS_DB.prepare("UPDATE threepl_exceptions SET status='not_reproduced',resolved_at=?,updated_at=? WHERE id=? AND workspace_id=?").bind(now,now,prior.id,workspaceId).run();
  await logCaseEvent(env,workspaceId,prior.id,"system","not_reproduced_in_latest_run",{previousStatus:prior.status,latestRunId:runId,inputHash});
 }
 await env.NODUS_DB.prepare("UPDATE threepl_invoices SET status='reconciled',updated_at=? WHERE id=? AND workspace_id=?").bind(now,invoiceId,workspaceId).run();
 await logWorkspaceEvent(env,workspaceId,"invoice_reconciled",{invoiceId,runId,inputHash,findingCount:result.findings.length},"merchant");
 return {runId,summary,reused:false};
}

export async function onRequestGet({request,env}:Context){
 if(!sameOrigin(request))return bad("Origin rejected.",403);
 const auth=await getWorkspace(request,env);if(!auth)return bad("Merchant access is required.",401);
 const workspaceId=auth.workspace.id;
 const [providers,contracts,rules,invoices,lines,activities,exceptions,caseEvents,reports,outcomes,workspaceEvents]=await Promise.all([
  env.NODUS_DB.prepare("SELECT id,name,status FROM threepl_providers WHERE workspace_id=? ORDER BY name").bind(workspaceId).all<ProviderRow>(),
  env.NODUS_DB.prepare("SELECT c.*,p.name AS provider_name FROM threepl_contracts c JOIN threepl_providers p ON p.id=c.provider_id WHERE c.workspace_id=? ORDER BY c.effective_from DESC LIMIT 50").bind(workspaceId).all<ContractRow>(),
  env.NODUS_DB.prepare("SELECT r.* FROM threepl_rate_rules r JOIN threepl_contracts c ON c.id=r.contract_id WHERE c.workspace_id=? ORDER BY r.charge_code,r.source_row").bind(workspaceId).all<RuleRow>(),
  env.NODUS_DB.prepare("SELECT i.*,p.name AS provider_name FROM threepl_invoices i JOIN threepl_providers p ON p.id=i.provider_id WHERE i.workspace_id=? ORDER BY i.invoice_date DESC LIMIT 100").bind(workspaceId).all<InvoiceRow>(),
  env.NODUS_DB.prepare("SELECT l.* FROM threepl_invoice_lines l JOIN threepl_invoices i ON i.id=l.invoice_id WHERE i.workspace_id=? ORDER BY i.invoice_date DESC,l.source_row").bind(workspaceId).all<LineRow>(),
  env.NODUS_DB.prepare("SELECT a.*,p.name AS provider_name FROM threepl_activity_records a JOIN threepl_providers p ON p.id=a.provider_id WHERE a.workspace_id=? ORDER BY a.created_at DESC LIMIT 200").bind(workspaceId).all<ActivityRow>(),
  env.NODUS_DB.prepare("SELECT e.*,i.invoice_number,p.name AS provider_name FROM threepl_exceptions e JOIN threepl_invoices i ON i.id=e.invoice_id JOIN threepl_providers p ON p.id=i.provider_id WHERE e.workspace_id=? ORDER BY e.status,e.last_seen_at DESC LIMIT 250").bind(workspaceId).all<ExceptionRow>(),
  env.NODUS_DB.prepare("SELECT exception_id,action,detail_json,created_at FROM threepl_case_events WHERE workspace_id=? ORDER BY created_at DESC LIMIT 1000").bind(workspaceId).all<CaseEventRow>(),
  env.NODUS_DB.prepare("SELECT * FROM threepl_period_reports WHERE workspace_id=? ORDER BY period_end DESC,revision DESC LIMIT 24").bind(workspaceId).all<ReportRow>(),
  env.NODUS_DB.prepare("SELECT o.*,e.finding_code FROM threepl_outcomes o JOIN threepl_exceptions e ON e.id=o.exception_id WHERE o.workspace_id=? ORDER BY o.created_at DESC LIMIT 100").bind(workspaceId).all<OutcomeRow>(),
  env.NODUS_DB.prepare("SELECT action,detail_json,created_at FROM threepl_workspace_events WHERE workspace_id=? ORDER BY created_at DESC LIMIT 50").bind(workspaceId).all<WorkspaceEventRow>(),
 ]);
 const rulesByContract=new Map<string,RuleRow[]>();for(const rule of rules.results){const parent=contracts.results.find(contract=>contract.id===rule.contract_id);if(!parent)continue;const list=rulesByContract.get(rule.contract_id)||[];list.push(rule);rulesByContract.set(rule.contract_id,list);}
 const linesByInvoice=new Map<string,LineRow[]>();for(const line of lines.results){const list=linesByInvoice.get(line.invoice_id)||[];list.push(line);linesByInvoice.set(line.invoice_id,list);}
 const eventsByException=new Map<string,CaseEventRow[]>();for(const event of caseEvents.results){const list=eventsByException.get(event.exception_id)||[];if(list.length<12)list.push(event);eventsByException.set(event.exception_id,list);}
 const outcomeCounts=new Map<string,number>();for(const outcome of outcomes.results)outcomeCounts.set(outcome.exception_id,(outcomeCounts.get(outcome.exception_id)||0)+1);
 const now=Date.now(),trialExpired=auth.workspace.status==="trial"&&Boolean(auth.workspace.trial_ends_at&&Date.parse(auth.workspace.trial_ends_at)<=now)&&auth.workspace.subscription_status!=="active";
 const subscriptionExpired=["active","cancelled"].includes(auth.workspace.subscription_status)&&Boolean(auth.workspace.subscription_ends_at&&Date.parse(auth.workspace.subscription_ends_at)<=now);
 return json({
  workspace:{id:auth.workspace.id,businessName:auth.workspace.business_name,status:trialExpired?"trial_expired":subscriptionExpired?"subscription_expired":auth.workspace.status,planCode:auth.workspace.plan_code,trialActivatedAt:auth.workspace.trial_activated_at,trialEndsAt:auth.workspace.trial_ends_at,subscriptionStatus:auth.workspace.subscription_status,subscriptionEndsAt:auth.workspace.subscription_ends_at},
  canWrite:canWrite(auth.workspace)&&!trialExpired&&!subscriptionExpired,
  providers:providers.results,
  contracts:contracts.results.map(contract=>({id:contract.id,name:contract.name,provider:contract.provider_name,currency:contract.currency,effectiveFrom:contract.effective_from,effectiveTo:contract.effective_to,status:contract.status,sourceFileName:contract.source_file_name,sourceHash:contract.source_hash,rules:(rulesByContract.get(contract.id)||[]).map(rule=>({id:rule.id,chargeCode:rule.charge_code,unit:rule.unit,pricing:rule.pricing,rateMinor:rule.rate_minor,currency:rule.currency,sourceRow:rule.source_row,effectiveFrom:rule.effective_from,effectiveTo:rule.effective_to}))})),
  invoices:invoices.results.map(invoice=>({id:invoice.id,number:invoice.invoice_number,provider:invoice.provider_name,date:invoice.invoice_date,currency:invoice.currency,totalMinor:invoice.total_minor,status:invoice.status,sourceFileName:invoice.source_file_name,sourceHash:invoice.source_hash,lineCount:(linesByInvoice.get(invoice.id)||[]).length,runCount:0,lines:(linesByInvoice.get(invoice.id)||[]).map(line=>({id:line.id,externalLineId:line.external_line_id,chargeCode:line.charge_code,description:line.description,serviceDate:line.service_date,quantity:line.quantity,unit:line.unit,amountMinor:line.amount_minor,currency:line.currency,activityReference:line.activity_reference,sourceRow:line.source_row}))})),
  activityRecords:activities.results.map(item=>({id:item.id,provider:item.provider_name,reference:item.reference,chargeCode:item.charge_code,quantity:item.quantity,unit:item.unit,occurredAt:item.occurred_at,sourceRow:item.source_row,sourceFileName:item.source_file_name,sourceHash:item.source_hash})),
  exceptions:exceptions.results.map(item=>({id:item.id,invoiceNumber:item.invoice_number,provider:item.provider_name,code:item.finding_code,severity:item.severity,state:item.state,status:item.status,currency:item.currency,exposureMinor:item.exposure_minor,explanation:item.explanation,note:item.note,evidence:parseJson(item.evidence_json)||[],events:(eventsByException.get(item.id)||[]).map(event=>({action:event.action,detail:parseJson(event.detail_json),createdAt:event.created_at})),outcomes:outcomeCounts.get(item.id)||0,lastSeenAt:item.last_seen_at})),
  reports:reports.results.map(item=>({id:item.id,start:item.period_start,end:item.period_end,revision:item.revision,status:item.status,generatedAt:item.generated_at,payload:parseJson(item.payload_json)})),
  outcomes:outcomes.results.map(item=>({id:item.id,exceptionId:item.exception_id,type:item.outcome_type,status:item.status,amountMinor:item.amount_minor,currency:item.currency,reference:item.external_reference,note:item.evidence_note,verifiedAt:item.verified_at,findingCode:item.finding_code})),
  workspaceEvents:workspaceEvents.results.map(event=>({action:event.action,detail:parseJson(event.detail_json),createdAt:event.created_at})),
 },200);
}

export async function onRequestPost({request,env}:Context){
 if(!sameOrigin(request))return bad("Origin rejected.",403);
 const contentLength=Number(request.headers.get("Content-Length")||0);if(contentLength>6*1024*1024)return bad("Upload request exceeds the 6 MB limit.",413);
 if(!(request.headers.get("Content-Type")||"").toLowerCase().includes("multipart/form-data"))return bad("Use multipart form data for workspace actions.",415);
 const auth=await getWorkspace(request,env);if(!auth)return bad("Merchant access is required.",401);
 const form=await request.formData(),intent=clean(form.get("intent"),60),workspaceId=auth.workspace.id;
 if(!canWrite(auth.workspace))return bad("This workspace is read-only. Activate a trial after onboarding or arrange an active subscription.",403);
 try{
  if(intent==="create_provider"){
   const name=clean(form.get("name"),120);if(name.length<2)throw new Error("Provider name must contain at least two characters.");
   const providerId=id(),now=nowIso();
   await env.NODUS_DB.prepare("INSERT INTO threepl_providers(id,workspace_id,name,status,created_at,updated_at) VALUES(?,?,?,'active',?,?)").bind(providerId,workspaceId,name,now,now).run();
   await logWorkspaceEvent(env,workspaceId,"provider_added",{providerId,name},"merchant");
   return json({ok:true,message:"Provider added.",provider:{id:providerId,name}});
  }
  if(intent==="import_contract"||intent==="import_invoice"||intent==="import_activity"){
   const result=intent==="import_contract"?await importContract(env,workspaceId,form):intent==="import_invoice"?await importInvoice(env,workspaceId,form):await importActivity(env,workspaceId,form);
   return json({ok:true,message:intent==="import_contract"?"Contract rate card imported and activated.":intent==="import_invoice"?"Invoice and source rows saved.":"Operational activity rows saved.",result},201);
  }
  if(intent==="reconcile"){
   const invoiceId=clean(form.get("invoiceId"),80),result=await reconcileInvoice(env,workspaceId,invoiceId);
   return json({ok:true,message:result.reused?"Existing reconciliation reused; source data has not changed.":"Invoice reconciled and findings saved.",result});
  }
  if(intent==="update_exception"){
   const exceptionId=clean(form.get("exceptionId"),80),status=clean(form.get("status"),50),note=clean(form.get("note"),2000);
   if(!["open","investigating","ready_for_review","raised_with_provider","provider_responded","rejected","ignored"].includes(status))throw new Error("Choose a valid investigation status.");
   const record=await env.NODUS_DB.prepare("SELECT id,status,note FROM threepl_exceptions WHERE id=? AND workspace_id=?").bind(exceptionId,workspaceId).first<{id:string;status:string}>();
   if(!record)throw new Error("Exception not found in this workspace.");
   const nextNote=note||record.note,now=nowIso();await env.NODUS_DB.prepare("UPDATE threepl_exceptions SET status=?,note=?,resolved_at=?,updated_at=? WHERE id=? AND workspace_id=?")
    .bind(status,nextNote,["rejected","ignored"].includes(status)?now:null,now,exceptionId,workspaceId).run();
   await logCaseEvent(env,workspaceId,exceptionId,"merchant","status_changed",{from:record.status,to:status,noteProvided:Boolean(note)});
   return json({ok:true,message:"Investigation status saved."});
  }
  if(intent==="record_outcome"){
   const exceptionId=clean(form.get("exceptionId"),80),status=clean(form.get("status"),30),amount=moneyMinor(clean(form.get("amount"),40),clean(form.get("currency"),3));
   const reference=clean(form.get("reference"),180),note=clean(form.get("note"),2000);
   if(!["raised","promised","posted","verified","rejected"].includes(status)||amount.minor<=0n||note.length<10)throw new Error("Provide a positive amount, valid outcome status and evidence note.");
   if(["posted","verified"].includes(status)&&!reference)throw new Error("A provider credit or transaction reference is required for posted or verified outcomes.");
   if(status==="verified"&&note.length<20)throw new Error("Verified outcomes require a detailed evidence note.");
   const exception=await env.NODUS_DB.prepare("SELECT id,currency,status FROM threepl_exceptions WHERE id=? AND workspace_id=?").bind(exceptionId,workspaceId).first<{id:string;currency:string;status:string}>();
   if(!exception)throw new Error("Exception not found in this workspace.");
   if(exception.currency!==amount.currency)throw new Error("Outcome currency must match the exception currency.");
   const now=nowIso(),outcomeId=id();
   await env.NODUS_DB.prepare("INSERT INTO threepl_outcomes(id,workspace_id,exception_id,outcome_type,status,amount_minor,currency,external_reference,evidence_note,verified_at,created_at,updated_at) VALUES(?,?,?,'provider_adjustment',?,?,?,?,?,?,?,?)")
    .bind(outcomeId,workspaceId,exceptionId,status,amount.minor.toString(),amount.currency,reference||null,note,status==="verified"?now:null,now,now).run();
   const next=status==="verified"?"verified_closed":status==="posted"?"credit_posted":status==="promised"?"credit_promised":status==="raised"?"raised_with_provider":"rejected";
   await env.NODUS_DB.prepare("UPDATE threepl_exceptions SET status=?,resolved_at=?,updated_at=? WHERE id=? AND workspace_id=?").bind(next,status==="verified"?now:null,now,exceptionId,workspaceId).run();
   await logCaseEvent(env,workspaceId,exceptionId,"merchant","outcome_recorded",{outcomeId,status,amountMinor:amount.minor.toString(),currency:amount.currency,referencePresent:Boolean(reference)});
   return json({ok:true,message:status==="verified"?"Outcome recorded as verified with the supplied evidence reference.":"Outcome recorded. It is not counted as verified recovery."});
  }
  if(intent==="generate_report"){
   const start=dateOnly(clean(form.get("periodStart"),10)),end=dateOnly(clean(form.get("periodEnd"),10));
   if(end<start)throw new Error("Period end must not precede period start.");
   const [invoiceRows,exceptionRows,outcomeRows,revisionRow]=await Promise.all([
    env.NODUS_DB.prepare("SELECT i.*,p.name AS provider_name,(SELECT COUNT(*) FROM threepl_invoice_lines l WHERE l.invoice_id=i.id) AS line_count FROM threepl_invoices i JOIN threepl_providers p ON p.id=i.provider_id WHERE i.workspace_id=? AND i.invoice_date>=? AND i.invoice_date<=? ORDER BY i.invoice_date").bind(workspaceId,start,end).all<{id:string;invoice_number:string;provider_name:string;invoice_date:string;currency:string;total_minor:string;status:string;source_hash:string|null;line_count:number}>(),
    env.NODUS_DB.prepare("SELECT e.* FROM threepl_exceptions e JOIN threepl_invoices i ON i.id=e.invoice_id WHERE e.workspace_id=? AND i.invoice_date>=? AND i.invoice_date<=? ORDER BY e.created_at").bind(workspaceId,start,end).all<{id:string;invoice_id:string;finding_code:string;status:string;severity:string;currency:string;exposure_minor:string|null;evidence_json:string}>(),
    env.NODUS_DB.prepare("SELECT o.* FROM threepl_outcomes o JOIN threepl_exceptions e ON e.id=o.exception_id JOIN threepl_invoices i ON i.id=e.invoice_id WHERE o.workspace_id=? AND i.invoice_date>=? AND i.invoice_date<=? ORDER BY o.created_at").bind(workspaceId,start,end).all<{id:string;status:string;amount_minor:string;currency:string;external_reference:string|null}>(),
    env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM threepl_period_reports WHERE workspace_id=? AND period_start=? AND period_end=?").bind(workspaceId,start,end).first<{count:number}>(),
   ]);
   const invoiceTotals:Record<string,string>={},verifiedTotals:Record<string,string>={};
   for(const invoice of invoiceRows.results)invoiceTotals[invoice.currency]=(BigInt(invoiceTotals[invoice.currency]||"0")+BigInt(invoice.total_minor)).toString();
   for(const outcome of outcomeRows.results)if(outcome.status==="verified")verifiedTotals[outcome.currency]=(BigInt(verifiedTotals[outcome.currency]||"0")+BigInt(outcome.amount_minor)).toString();
   const payload={scope:{periodStart:start,periodEnd:end,invoiceCount:invoiceRows.results.length,invoiceLineCount:invoiceRows.results.reduce((sum,row)=>sum+row.line_count,0)},invoiceTotalsMinorByCurrency:invoiceTotals,exceptionSummary:{total:exceptionRows.results.length,open:exceptionRows.results.filter(x=>!["verified_closed","rejected","ignored","superseded","not_reproduced"].includes(x.status)).length,verifiedClosed:exceptionRows.results.filter(x=>x.status==="verified_closed").length},outcomes:{total:outcomeRows.results.length,verifiedCount:outcomeRows.results.filter(x=>x.status==="verified").length,verifiedMinorByCurrency:verifiedTotals,statuses:outcomeRows.results.map(x=>({id:x.id,status:x.status,amountMinor:x.amount_minor,currency:x.currency,referencePresent:Boolean(x.external_reference)}))},invoices:invoiceRows.results.map(x=>({id:x.id,number:x.invoice_number,provider:x.provider_name,invoiceDate:x.invoice_date,currency:x.currency,totalMinor:x.total_minor,lineCount:x.line_count,status:x.status,sourceHash:x.source_hash})),exceptions:exceptionRows.results.map(x=>({id:x.id,invoiceId:x.invoice_id,findingCode:x.finding_code,status:x.status,severity:x.severity,currency:x.currency,exposureMinor:x.exposure_minor,evidenceReferences:parseJson(x.evidence_json)})),limitations:["Calculated contract variances are not proof of provider liability or recoverable credit.","Only outcomes explicitly marked verified with a reference and evidence note are counted as verified.","SLA performance is excluded unless contractual definitions and source timestamps are present."]};
   const revision=(revisionRow?.count||0)+1,reportId=id(),now=nowIso();
   await env.NODUS_DB.prepare("INSERT INTO threepl_period_reports(id,workspace_id,period_start,period_end,revision,status,payload_json,generated_at,created_at) VALUES(?,?,?,?,?,'generated',?,?,?)").bind(reportId,workspaceId,start,end,revision,JSON.stringify(payload),now,now).run();
   await logWorkspaceEvent(env,workspaceId,"period_report_generated",{reportId,periodStart:start,periodEnd:end,revision},"merchant");
   return json({ok:true,message:"Period report generated and stored.",reportId});
  }
  throw new Error("Unsupported workspace action.");
 }catch(error){return bad(error instanceof Error?error.message:"The request could not be completed.");}
}
