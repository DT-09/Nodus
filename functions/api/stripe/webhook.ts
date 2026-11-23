import { verifyStripeSignature } from "../../_lib/stripe";
interface Statement { bind(...values:unknown[]):Statement; first<T=unknown>():Promise<T|null>; }
interface Database { prepare(sql:string):Statement; batch(statements:Statement[]):Promise<unknown[]>; }
interface Env { NODUS_DB:Database; STRIPE_WEBHOOK_SECRET?:string; }
interface Context { request:Request; env:Env; }
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
type StripeEvent={id:string;type:string;data:{object:Record<string,unknown>}};
const idOf=(value:unknown)=>typeof value==="string"?value:value&&typeof value==="object"&&"id" in value?String((value as {id:unknown}).id):null;
export async function onRequestPost({request,env}:Context){
 if(!env.STRIPE_WEBHOOK_SECRET)return json({error:"Payment webhook is not configured."},503);
 const raw=await request.text();
 if(raw.length>256000)return json({error:"Webhook payload too large."},413);
 if(!await verifyStripeSignature(raw,request.headers.get("Stripe-Signature")||"",env.STRIPE_WEBHOOK_SECRET))return json({error:"Invalid payment signature."},401);
 let event:StripeEvent;try{event=JSON.parse(raw) as StripeEvent;}catch{return json({error:"Invalid event payload."},400);}
 if(!event.id||!event.type||!event.data?.object)return json({error:"Incomplete event."},400);
 const prior=await env.NODUS_DB.prepare("SELECT event_id FROM stripe_webhook_events WHERE event_id=?").bind(event.id).first<{event_id:string}>();
 if(prior)return new Response(null,{status:200});
 const object=event.data.object,now=new Date().toISOString();
 const statements=[
  env.NODUS_DB.prepare("INSERT INTO stripe_webhook_events(event_id,event_type,received_at) VALUES(?,?,?)").bind(event.id,event.type,now)
 ];
 if(event.type==="checkout.session.completed"){
  const metadata=object.metadata&&typeof object.metadata==="object"?object.metadata as Record<string,unknown>:{};
  const leadId=typeof object.client_reference_id==="string"?object.client_reference_id:typeof metadata.lead_id==="string"?metadata.lead_id:"";
  if(leadId){
   const mode=String(object.mode||""),paid=object.payment_status==="paid";
   statements.push(env.NODUS_DB.prepare("UPDATE merchant_leads SET payment_status=?,stripe_customer_id=?,stripe_subscription_id=?,stripe_checkout_session_id=?,stripe_payment_intent_id=?,updated_at=? WHERE id=?").bind(paid?"paid":"invoice_pending",idOf(object.customer),idOf(object.subscription),idOf(object.id),idOf(object.payment_intent),now,leadId));
  }
 }else if(event.type==="invoice.paid"||event.type==="invoice.payment_failed"){
  const subscription=idOf(object.subscription);
  if(subscription)statements.push(env.NODUS_DB.prepare("UPDATE merchant_leads SET payment_status=?,updated_at=? WHERE stripe_subscription_id=?").bind(event.type==="invoice.paid"?"paid":"payment_failed",now,subscription));
 }else if(event.type==="customer.subscription.deleted"){
  const subscription=idOf(object.id);
  if(subscription)statements.push(env.NODUS_DB.prepare("UPDATE merchant_leads SET payment_status='cancelled',updated_at=? WHERE stripe_subscription_id=?").bind(now,subscription));
 }else if(event.type==="charge.refunded"){
  const paymentIntent=idOf(object.payment_intent);
  if(paymentIntent)statements.push(env.NODUS_DB.prepare("UPDATE merchant_leads SET payment_status='refunded',updated_at=? WHERE stripe_payment_intent_id=?").bind(now,paymentIntent));
 }
 await env.NODUS_DB.batch(statements);
 return new Response(null,{status:200,headers:{"Cache-Control":"no-store"}});
}
