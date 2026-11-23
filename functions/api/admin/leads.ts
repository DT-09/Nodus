interface D1Statement{bind(...values:unknown[]):D1Statement;all<T=unknown>():Promise<{results:T[]}>;run():Promise<unknown>}
interface D1Database{prepare(sql:string):D1Statement}
interface Env{NODUS_DB:D1Database;NODUS_ADMIN_TOKEN?:string}
interface Context{request:Request;env:Env}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
function equal(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function authorized(request:Request,env:Env){const expected=env.NODUS_ADMIN_TOKEN||"";const received=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");return expected.length>=32&&equal(received,expected);}
function originAllowed(request:Request){const origin=request.headers.get("Origin");if(origin){try{return new URL(origin).origin===new URL(request.url).origin;}catch{return false;}}return request.headers.get("Sec-Fetch-Site")==="same-origin";}
export async function onRequestGet({request,env}:Context){
 if(!originAllowed(request))return json({error:"Origin rejected."},403);
 if(!authorized(request,env))return json({error:"Operator authentication failed."},401);
 const result=await env.NODUS_DB.prepare("SELECT id,created_at,name,email,store_url,monthly_orders,shipping_setup,objective,status,source,offer_type,price_quote,payment_status FROM merchant_leads ORDER BY created_at DESC LIMIT 200").all();
 return json({ok:true,leads:result.results});
}
export async function onRequestPatch({request,env}:Context){
 if(!originAllowed(request))return json({error:"Origin rejected."},403);
 if(!authorized(request,env))return json({error:"Operator authentication failed."},401);
 let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return json({error:"Invalid JSON."},400);}
 const id=typeof body.id==="string"?body.id.slice(0,64):"";
 const status=body.status, payment=body.payment_status;
 const statuses=["new","reviewing","accepted","declined","completed"];
 const payments=["not_requested","invoice_pending","paid","refunded"];
 if(!id||!statuses.includes(String(status))||!payments.includes(String(payment)))return json({error:"Provide a lead ID and valid lead/payment statuses."},400);
 const result=await env.NODUS_DB.prepare("UPDATE merchant_leads SET status=?,payment_status=? WHERE id=?").bind(status,payment,id).run();
 return json({ok:true,updated:true});
}
