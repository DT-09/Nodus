interface D1Statement{bind(...values:unknown[]):D1Statement;all<T=unknown>():Promise<{results:T[]}>;first<T=unknown>():Promise<T|null>;run<T=unknown>():Promise<{meta?:{changes?:number}}>}
interface D1Database{prepare(sql:string):D1Statement}
interface Env{NODUS_DB:D1Database;NODUS_ADMIN_TOKEN?:string}
interface Context{request:Request;env:Env}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
function equal(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function authorized(request:Request,env:Env){const expected=env.NODUS_ADMIN_TOKEN||"";const received=(request.headers.get("Authorization")||"").replace(/^Bearer\\s+/i,"");return expected.length>=32&&equal(received,expected);}
function originAllowed(request:Request){const origin=request.headers.get("Origin");if(origin){try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}}return request.headers.get("Sec-Fetch-Site")==="same-origin";}
function guard(request:Request,env:Env){if(!originAllowed(request))return json({error:"Origin rejected."},403);if(!authorized(request,env))return json({error:"Operator authentication failed."},401);return null;}
export async function onRequestGet({request,env}:Context){
 const denied=guard(request,env);if(denied)return denied;
 const result=await env.NODUS_DB.prepare("SELECT id,created_at,name,email,store_url,monthly_orders,shipping_setup,objective,status,source,offer_type,price_quote,payment_status FROM merchant_leads ORDER BY created_at DESC LIMIT 200").all();
 return json({ok:true,leads:result.results});
}
export async function onRequestPatch({request,env}:Context){
 const denied=guard(request,env);if(denied)return denied;
 if(request.method!=="PATCH")return json({error:"Method not allowed."},405);
 let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return json({error:"Invalid JSON."},400);}
 const id=typeof body.id==="string"?body.id.trim().slice(0,64):"";
 const status=typeof body.status==="string"?body.status:"";
 const payment=typeof body.payment_status==="string"?body.payment_status:"";
 const statuses=["new","reviewing","accepted","declined","completed"];
 const payments=["not_requested","invoice_pending","paid","refunded"];
 if(!id||!statuses.includes(status)||!payments.includes(payment))return json({error:"Provide a lead ID and valid lead/payment statuses."},400);
 const existing=await env.NODUS_DB.prepare("SELECT status,payment_status FROM merchant_leads WHERE id=?").bind(id).first<{status:string;payment_status:string}>();
 if(!existing)return json({error:"Lead not found."},404);
 if(existing.payment_status==="refunded"&&payment!=="refunded")return json({error:"A refunded payment state is terminal; create a new engagement record instead."},409);
 if(existing.status==="completed"&&status!=="completed")return json({error:"A completed lead state is terminal."},409);
 const now=new Date().toISOString();
 const update=await env.NODUS_DB.prepare("UPDATE merchant_leads SET status=?,payment_status=? WHERE id=? AND status=? AND payment_status=?").bind(status,payment,id,existing.status,existing.payment_status).run();
 if((update.meta?.changes??0)!==1)return json({error:"Lead changed during this request. Reload and retry."},409);
 const actor="operator:"+await digestToken((request.headers.get("Authorization")||""));
 const events=[] as Array<{id:string;lead_id:string;actor:string;event_type:string;previous_value:string;new_value:string;created_at:string}>;
 if(existing.status!==status)events.push({id:crypto.randomUUID(),lead_id:id,actor,event_type:"lead_status_changed",previous_value:existing.status,new_value:status,created_at:now});
 if(existing.payment_status!==payment)events.push({id:crypto.randomUUID(),lead_id:id,actor,event_type:"payment_status_changed",previous_value:existing.payment_status,new_value:payment,created_at:now});
 for(const event of events)await env.NODUS_DB.prepare("INSERT INTO merchant_lead_events(id,lead_id,actor,event_type,previous_value,new_value,created_at) VALUES(?,?,?,?,?,?,?)").bind(event.id,event.lead_id,event.actor,event.event_type,event.previous_value,event.new_value,event.created_at).run();
 return json({ok:true,updated:true,eventsRecorded:events.length});
}
async function digestToken(value:string){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}
