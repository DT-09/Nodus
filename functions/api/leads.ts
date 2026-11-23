interface D1Result<T=unknown>{results:T[];success:boolean;meta?:{changes?:number}}
interface D1Statement{bind(...values:unknown[]):D1Statement;first<T=unknown>():Promise<T|null>;run<T=unknown>():Promise<D1Result<T>>}
interface D1Database{prepare(sql:string):D1Statement}
interface PagesContext<E>{request:Request;env:E;waitUntil(promise:Promise<unknown>):void;passThroughOnException():void}
interface Env{NODUS_DB:D1Database}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
async function digest(value:string){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}

export async function onRequestPost({request,env}:PagesContext<Env>):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed."},405);
 const origin=request.headers.get("Origin");
 if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return json({error:"Origin rejected."},403);}catch{return json({error:"Origin rejected."},403);}}
 const type=request.headers.get("Content-Type")||"";
 if(!type.toLowerCase().includes("application/json"))return json({error:"Use the JSON form endpoint."},415);
 const length=Number(request.headers.get("Content-Length")||0);
 if(length>12000)return json({error:"Request too large."},413);
 let body:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>10000)return json({error:"Request too large."},413);body=JSON.parse(raw) as Record<string,unknown>;}catch{return json({error:"Invalid request."},400);}
 if(clean(body.website,200))return json({ok:true,message:"Your request has been received."},200);
 const businessName=clean(body.businessName,160),name=clean(body.name,100),email=clean(body.email,254).toLowerCase();
 const store=clean(body.store,300),orders=clean(body.orders,60),shipping=clean(body.shipping,100),objective=clean(body.objective,1500);
 if(businessName.length<2||name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!orders||!shipping||objective.length<20||body.consent!==true)
  return json({error:"Complete each required field and confirm permission to contact you."},400);
 if(!["under_500","500_2000","2000_10000","10000_50000","50000_plus","prefer_to_discuss"].includes(orders))
  return json({error:"Choose a valid monthly order range."},400);
 if(!["one_3pl","multiple_3pls","in_house_and_3pl","other"].includes(shipping))
  return json({error:"Choose a valid fulfilment setup."},400);
 let parsed:URL;try{parsed=new URL(store.startsWith("http")?store:"https://"+store);}catch{return json({error:"Enter the permanent .myshopify.com store domain."},400);}
 if(parsed.protocol!=="https:"||!/^([a-z0-9][a-z0-9-]*)\.myshopify\.com$/i.test(parsed.hostname)||parsed.pathname!=="/"||parsed.search||parsed.hash)
  return json({error:"Enter the permanent .myshopify.com store domain."},400);
 const ip=request.headers.get("CF-Connecting-IP")||"unknown";
 const key=await digest(ip+"|nodus-3pl-trial-v1"),now=Math.floor(Date.now()/1000),windowStart=now-3600;
 const limit=await env.NODUS_DB.prepare("INSERT INTO lead_rate_limits(key,window_started_at,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN lead_rate_limits.window_started_at < ? THEN 1 ELSE lead_rate_limits.count+1 END, window_started_at=CASE WHEN lead_rate_limits.window_started_at < ? THEN excluded.window_started_at ELSE lead_rate_limits.window_started_at END RETURNING count").bind(key,now,windowStart,windowStart).first<{count:number}>();
 if(!limit||limit.count>3)return json({error:"Too many requests. Please try again later."},429);
 await env.NODUS_DB.prepare("DELETE FROM lead_rate_limits WHERE window_started_at < ?").bind(now-86400).run();
 const leadId=crypto.randomUUID(),createdAt=new Date().toISOString();
 await env.NODUS_DB.prepare("INSERT INTO merchant_leads(id,created_at,business_name,name,email,store_url,monthly_orders,shipping_setup,objective,consent,ip_hash,status,source,offer_type,price_quote,payment_status) VALUES(?,?,?,?,?,?,?,?,?,1,?,'new','website','seven_day_trial',NULL,'not_requested')")
  .bind(leadId,createdAt,businessName,name,email,parsed.origin,orders,shipping,objective,key).run();
 return json({
  ok:true,reference:leadId.slice(0,8).toUpperCase(),
  message:"Trial request received. NODUS will review data compatibility and onboarding readiness. Your seven-day trial begins only after your merchant workspace is ready and activated.",
 },201);
}
