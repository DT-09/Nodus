import { json, merchantSession, type PagesContext } from "../../_lib/shopify";
export async function onRequestGet({request,env}:PagesContext){
 const merchant=await merchantSession(request,env);if(!merchant)return json({connected:false,error:"Connect a Shopify store to open its workspace."},401);
 const [count,totals,orders,state]=await Promise.all([
  env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM shopify_orders WHERE shop=?").bind(merchant.shop).first<{count:number}>(),
  env.NODUS_DB.prepare("SELECT currency,COUNT(*) AS orders,SUM(CAST(shipping_amount AS REAL)) AS shipping_amount FROM shopify_orders WHERE shop=? GROUP BY currency ORDER BY currency").bind(merchant.shop).all<{currency:string;orders:number;shipping_amount:number|null}>(),
  env.NODUS_DB.prepare("SELECT order_name,ordered_at,currency,shipping_amount,taxes_included FROM shopify_orders WHERE shop=? ORDER BY ordered_at DESC LIMIT 50").bind(merchant.shop).all<{order_name:string;ordered_at:string;currency:string;shipping_amount:string;taxes_included:number}>(),
  env.NODUS_DB.prepare("SELECT has_more,orders_processed,last_sync_at,last_error FROM shopify_sync_state WHERE shop=?").bind(merchant.shop).first<{has_more:number;orders_processed:number;last_sync_at:string|null;last_error:string|null}>()
 ]);
 return json({connected:true,shop:merchant.shop,shopName:merchant.shop_name||merchant.shop,orderCount:count?.count||0,totals:totals.results,orders:orders.results,sync:state||null,scope:"read_orders",window:"Shopify order access is limited to the period permitted by the granted read_orders scope."});
}
