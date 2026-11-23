import { createStripeCheckout } from "../_lib/stripe";
interface D1Result<T=unknown>{results:T[];success:boolean;meta?:{changes?:number}}
interface D1Statement{bind(...values:unknown[]):D1Statement;first<T=unknown>():Promise<T|null>;run<T=unknown>():Promise<D1Result<T>>}
interface D1Database{prepare(sql:string):D1Statement}
interface PagesContext<E>{request:Request;env:E;waitUntil(promise:Promise<unknown>):void;passThroughOnException():void}
interface Env{NODUS_DB:D1Database;STRIPE_SECRET_KEY?:string;SHOPIFY_APP_URL?:string}
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
async function digest(value:string){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");}
export async function onRequestPost({request,env}:PagesContext<Env>):Promise<Response>{
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 const origin=request.headers.get("Origin");
 if(origin){try{if(new URL(origin).origin!==new URL(request.url).origin)return json({error:"Origin rejected"},403);}catch{return json({error:"Origin rejected"},403);}}
 else if(request.headers.get("Sec-Fetch-Site")!=="same-origin")return json({error:"Origin could not be verified."},403);
 const type=request.headers.get("Content-Type")||"";
 if(!type.toLowerCase().includes("application/json"))return json({error:"Use the JSON form endpoint."},415);
 const length=Number(request.headers.get("Content-Length")||0);
 if(length>12000)return json({error:"Request too large."},413);
 let body:Record<string,unknown>;
 try{const raw=await request.text();if(raw.length>10000)return json({error:"Request too large."},413);body=JSON.parse(raw) as Record<string,unknown>;}catch{return json({error:"Invalid request."},400);}
 if(clean(body.website,200))return json({ok:true},200);
 const name=clean(body.name,100),email=clean(body.email,254).toLowerCase(),store=clean(body.store,300),orders=clean(body.orders,60),shipping=clean(body.shipping,100),objective=clean(body.objective,1500);
 const requestedOffer=clean(body.offer_type,40);
 const offer=requestedOffer==="monthly_review"?"monthly_review":requestedOffer==="paid_audit"?"paid_audit":"evaluation";
 const priceQuote=offer==="monthly_review"?"USD 99/month — requested":offer==="paid_audit"?"USD 149 one-time — requested":null;
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!store||!orders||!shipping||objective.length<20||body.consent!==true)
  return json({error:"Complete each required field and confirm permission to contact you."},400);
 let parsed:URL;try{parsed=new URL(store.startsWith("http")?store:"https://"+store);}catch{return json({error:"Enter a valid store URL."},400);}
 if(parsed.protocol!=="https:"||!/^([a-z0-9][a-z0-9-]*)\.myshopify\.com$/i.test(parsed.hostname)||parsed.pathname!=="/"||parsed.search||parsed.hash)return json({error:"Enter the permanent .myshopify.com store domain."},400);
 const ip=request.headers.get("CF-Connecting-IP")||"unknown";
 const key=await digest(ip+"|nodus-lead-v1"),now=Math.floor(Date.now()/1000),windowStart=now-3600;
 const limit=await env.NODUS_DB.prepare("INSERT INTO lead_rate_limits(key,window_started_at,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN lead_rate_limits.window_started_at < ? THEN 1 ELSE lead_rate_limits.count+1 END, window_started_at=CASE WHEN lead_rate_limits.window_started_at < ? THEN excluded.window_started_at ELSE lead_rate_limits.window_started_at END RETURNING count").bind(key,now,windowStart,windowStart).first<{count:number}>();
 if(!limit||limit.count>3)return json({error:"Too many requests. Please try again later."},429);
 await env.NODUS_DB.prepare("DELETE FROM lead_rate_limits WHERE window_started_at < ?").bind(now-86400).run();
 const id=crypto.randomUUID();
 const nowIso=new Date().toISOString();
 await env.NODUS_DB.prepare("INSERT INTO merchant_leads(id,created_at,name,email,store_url,monthly_orders,shipping_setup,objective,consent,ip_hash,offer_type,price_quote,payment_status,updated_at) VALUES(?,?,?,?,?,?,?,?,1,?,?,?,'not_requested',?)").bind(id,nowIso,name,email,parsed.origin,orders,shipping,objective,key,offer,priceQuote,nowIso).run();
 if(offer!=="evaluation"){
  if(!env.STRIPE_SECRET_KEY||!env.SHOPIFY_APP_URL?.startsWith("https://"))return json({error:"Paid checkout is not enabled yet. No payment was taken. The business operator must configure the payment account and checkout credentials."},503);
  try{
   const checkout=await createStripeCheckout({secret:env.STRIPE_SECRET_KEY,appUrl:env.SHOPIFY_APP_URL,leadId:id,email,offer});
   await env.NODUS_DB.prepare("UPDATE merchant_leads SET stripe_checkout_session_id=?,payment_status='invoice_pending',updated_at=? WHERE id=?").bind(checkout.id,new Date().toISOString(),id).run();
   return json({ok:true,reference:id.slice(0,8).toUpperCase(),offer,priceQuote,checkoutUrl:checkout.url,message:"Request recorded. Complete secure checkout to place the order."},201);
  }catch(error){
   return json({error:"Checkout could not be created. No payment was taken. "+(error instanceof Error?error.message:"Payment provider error.")},502);
  }
 }
 return json({ok:true,reference:id.slice(0,8).toUpperCase(),offer,priceQuote,message:"Your free diagnostic enquiry has been received. NODUS will review the information and respond using the email address you supplied."},201);
}
