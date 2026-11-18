import { json, verifyWebhookHmac, type PagesContext } from "../../_lib/shopify";
export async function onRequestPost({request,env}:PagesContext){
 if(!env.SHOPIFY_API_SECRET)return json({error:"Webhook verification is not configured."},503);
 const raw=await request.text(),signature=request.headers.get("X-Shopify-Hmac-Sha256")||"",shop=(request.headers.get("X-Shopify-Shop-Domain")||"").toLowerCase(),topic=(request.headers.get("X-Shopify-Topic")||"").toLowerCase(),webhookId=request.headers.get("X-Shopify-Webhook-Id")||"";
 if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)||!webhookId||!await verifyWebhookHmac(raw,signature,env.SHOPIFY_API_SECRET))return json({error:"Webhook signature or headers are invalid."},401);
 const exists=await env.NODUS_DB.prepare("SELECT webhook_id FROM shopify_webhook_receipts WHERE webhook_id=?").bind(webhookId).first<{webhook_id:string}>();
 if(exists)return new Response(null,{status:200});
 await env.NODUS_DB.prepare("INSERT INTO shopify_webhook_receipts(webhook_id,shop,topic,received_at) VALUES(?,?,?,?)").bind(webhookId,shop,topic,new Date().toISOString()).run();
 if(topic==="app/uninstalled"||topic==="shop/redact"){
  await env.NODUS_DB.batch([
   env.NODUS_DB.prepare("DELETE FROM shopify_sessions WHERE shop=?").bind(shop),
   env.NODUS_DB.prepare("DELETE FROM shopify_orders WHERE shop=?").bind(shop),
   env.NODUS_DB.prepare("DELETE FROM shopify_sync_state WHERE shop=?").bind(shop),
   env.NODUS_DB.prepare("DELETE FROM shopify_installs WHERE shop=?").bind(shop)
  ]);
 }else if(topic==="customers/redact"||topic==="customers/data_request"){
  // NODUS stores no customer names, addresses, emails or customer IDs in this integration.
  // Order-level financial and operational data remains merchant-scoped and is not customer-profile data.
 }
 return new Response(null,{status:200,headers:{"Cache-Control":"no-store"}});
}
