import { json, merchantSession, type PagesContext } from "../../_lib/shopify";
type MoneyRow={currency:string;amount:string};
function units(value:string){if(!/^-?\d+(?:\.\d{1,4})?$/.test(value))return 0n;const negative=value.startsWith("-");const raw=negative?value.slice(1):value;const [whole,fraction=""]=raw.split(".");const n=BigInt(whole!)*10000n+BigInt((fraction+"0000").slice(0,4));return negative?-n:n;}
function decimal(value:bigint){const negative=value<0n?"-":"";const n=value<0n?-value:value;const whole=n/10000n;const fraction=(n%10000n).toString().padStart(4,"0").replace(/0+$/,"");return negative+whole.toString()+(fraction?"."+fraction:"");}
function aggregate(rows:MoneyRow[]){const groups=new Map<string,{rows:number;units:bigint}>();for(const row of rows){const current=groups.get(row.currency)||{rows:0,units:0n};current.rows++;current.units+=units(row.amount);groups.set(row.currency,current);}return [...groups.entries()].map(([currency,g])=>({currency,orders:g.rows,shipping_amount:decimal(g.units),rows:g.rows,amount:decimal(g.units)}));}
export async function onRequestGet({request,env}:PagesContext){
 const merchant=await merchantSession(request,env);if(!merchant)return json({connected:false,error:"Connect a Shopify store to open its workspace."},401);
 const [count,orderMoney,orders,state,costCount,costMoney,costRows]=await Promise.all([
  env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM shopify_orders WHERE shop=?").bind(merchant.shop).first<{count:number}>(),
  env.NODUS_DB.prepare("SELECT currency,shipping_amount AS amount FROM shopify_orders WHERE shop=?").bind(merchant.shop).all<MoneyRow>(),
  env.NODUS_DB.prepare("SELECT order_name,ordered_at,currency,shipping_amount,taxes_included FROM shopify_orders WHERE shop=? ORDER BY ordered_at DESC LIMIT 50").bind(merchant.shop).all<{order_name:string;ordered_at:string;currency:string;shipping_amount:string;taxes_included:number}>(),
  env.NODUS_DB.prepare("SELECT has_more,orders_processed,last_sync_at,last_error FROM shopify_sync_state WHERE shop=?").bind(merchant.shop).first<{has_more:number;orders_processed:number;last_sync_at:string|null;last_error:string|null}>(),
  env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM shopify_costs WHERE shop=?").bind(merchant.shop).first<{count:number}>(),
  env.NODUS_DB.prepare("SELECT currency,amount FROM shopify_costs WHERE shop=?").bind(merchant.shop).all<MoneyRow>(),
  env.NODUS_DB.prepare("SELECT invoice_id,source_record_id,order_reference,tracking_number,currency,amount,cost_type,occurred_at FROM shopify_costs WHERE shop=? ORDER BY imported_at DESC LIMIT 50").bind(merchant.shop).all<{invoice_id:string;source_record_id:string;order_reference:string|null;tracking_number:string|null;currency:string;amount:string;cost_type:string;occurred_at:string|null}>()
 ]);
 const totals=aggregate(orderMoney.results).map(x=>({currency:x.currency,orders:x.rows,shipping_amount:x.shipping_amount}));
 const costTotals=aggregate(costMoney.results).map(x=>({currency:x.currency,rows:x.rows,amount:x.amount}));
 return json({connected:true,shop:merchant.shop,shopName:merchant.shop_name||merchant.shop,orderCount:count?.count||0,totals,orders:orders.results,costCount:costCount?.count||0,costTotals,costRows:costRows.results,sync:state||null,scope:"read_orders",window:"Shopify order access is limited to the period permitted by the granted read_orders scope."});
}
