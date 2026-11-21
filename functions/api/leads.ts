interface D1Result<T=unknown>{results:T[];success:boolean;meta?:{changes?:number}}
interface D1Statement{bind(...values:unknown[]):D1Statement;first<T=unknown>():Promise<T|null>;run<T=unknown>():Promise<D1Result<T>>}
interface D1Database{prepare(sql:string):D1Statement}
interface PagesContext<E>{request:Request;env:E;waitUntil(promise:Promise<unknown>):void;passThroughOnException():void}
interface Env{NODUS_DB:D1Database;NODUS_PILOT_CHECKOUT_URL?:string}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
async function digest(value:string){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}
export async function onRequestPost({request,env}:PagesContext<Env>):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const origin=request.headers.get("Origin");
 if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return json({error:"Origin rejected"},403);}catch{return json({error:"Origin rejected"},403);}}
 const type=request.headers.get("Content-Type")||"";
 if(!type.toLowerCase().includes("application/json"))return json({error:"Use the JSON form endpoint."},415);
 const length=Number(request.headers.get("Content-Length")||0);
 if(length>12000)return json({error:"Request too large."},413);
 let body:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>10000)return json({error:"Request too large."},413);body=JSON.parse(raw) as Record<string,unknown>;}catch{return json({error:"Invalid request."},400);}
 if(clean(body.website,200))return json({ok:true},200);
 const name=clean(body.name,100),email=clean(body.email,254).toLowerCase(),store=clean(body.store,300),orders=clean(body.orders,60),shipping=clean(body.shipping,100),objective=clean(body.objective,1500);
 const offer=body.offer_type==="founding_pilot"?"founding_pilot":"evaluation";
 const priceQuote=offer==="founding_pilot"?"USD 49 one-time":null;
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!store||!orders||!shipping||objective.length<20||body.consent!==true)
  return json({error:"Complete each required field and confirm permission to contact you."},400);
 let parsed:URL;try{parsed=new URL(store.startsWith("http")?store:"https://"+store);}catch{return json({error:"Enter a valid store URL."},400);}
 if(parsed.protocol!=="https:"||!parsed.hostname.includes("."))return json({error:"Enter a valid HTTPS store URL."},400);
 const ip=request.headers.get("CF-Connecting-IP")||"unknown";
 const key=await digest(ip+"|nodus-lead-v1"),now=Math.floor(Date.now()/1000),windowStart=now-3600;
 const limit=await env.NODUS_DB.prepare("INSERT INTO lead_rate_limits(key,window_started_at,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN lead_rate_limits.window_started_at < ? THEN 1 ELSE lead_rate_limits.count+1 END, window_started_at=CASE WHEN lead_rate_limits.window_started_at < ? THEN excluded.window_started_at ELSE lead_rate_limits.window_started_at END RETURNING count").bind(key,now,windowStart,windowStart).first<{count:number}>();
 if(!limit||limit.count>3)return json({error:"Too many requests. Please try again later."},429);
 await env.NODUS_DB.prepare("DELETE FROM lead_rate_limits WHERE window_started_at < ?").bind(now-86400).run();
 const id=crypto.randomUUID();
 await env.NODUS_DB.prepare("INSERT INTO merchant_leads(id,created_at,name,email,store_url,monthly_orders,shipping_setup,objective,consent,ip_hash,offer_type,price_quote,payment_status) VALUES(?,?,?,?,?,?,?,?,1,?,?,?,'not_requested')").bind(id,new Date().toISOString(),name,email,parsed.origin,orders,shipping,objective,key,offer,priceQuote).run();
 let checkoutUrl:string|undefined;if(offer==="founding_pilot"&&env.NODUS_PILOT_CHECKOUT_URL){try{const checkout=new URL(env.NODUS_PILOT_CHECKOUT_URL);if(checkout.protocol==="https:")checkoutUrl=checkout.toString();}catch{/* Invalid payment links are never exposed to customers. */}}
 return json({ok:true,reference:id.slice(0,8).toUpperCase(),offer,priceQuote,checkoutUrl,message:offer==="founding_pilot"?(checkoutUrl?"Your founding pilot request is recorded. Continue to the secure payment page; work begins after the authorized operator confirms cleared payment.":"Your founding pilot request has been received. It is not a charge or confirmed order. An authorized NODUS operator will confirm scope and send payment instructions before work begins."):"Your no-fee evaluation request has been received. NODUS will review the information and respond using the email address you supplied."},201);
}
