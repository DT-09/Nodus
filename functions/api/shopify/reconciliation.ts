import { json, merchantSession, type PagesContext } from "../../_lib/shopify";
type Order={order_gid:string;order_name:string;ordered_at:string;currency:string;shipping_amount:string;taxes_included:number};
type Cost={source_record_id:string;invoice_id:string;order_reference:string|null;currency:string;amount:string;cost_type:string;occurred_at:string|null};
function units(value:string){if(!/^-?\d+(?:\.\d{1,4})?$/.test(value))return null;const negative=value.startsWith("-");const raw=negative?value.slice(1):value;const [whole,fraction=""]=raw.split(".");const n=BigInt(whole!)*10000n+BigInt((fraction+"0000").slice(0,4));return negative?-n:n;}
function decimal(value:bigint){const neg=value<0n?"-":"";const n=value<0n?-value:value;const whole=n/10000n;const fraction=(n%10000n).toString().padStart(4,"0").replace(/0+$/,"");return neg+whole.toString()+(fraction?"."+fraction:"");}
export async function onRequestGet({request,env}:PagesContext){
 const merchant=await merchantSession(request,env);if(!merchant)return json({error:"Connect a Shopify store first."},401);
 const [orderResult,costResult]=await Promise.all([
  env.NODUS_DB.prepare("SELECT order_gid,order_name,ordered_at,currency,shipping_amount,taxes_included FROM shopify_orders WHERE shop=? ORDER BY ordered_at DESC LIMIT 5001").bind(merchant.shop).all<Order>(),
  env.NODUS_DB.prepare("SELECT source_record_id,invoice_id,order_reference,currency,amount,cost_type,occurred_at FROM shopify_costs WHERE shop=? ORDER BY imported_at DESC LIMIT 5001").bind(merchant.shop).all<Cost>()
 ]);
 const truncated=orderResult.results.length>5000||costResult.results.length>5000;const orders=orderResult.results.slice(0,5000),costs=costResult.results.slice(0,5000);
 const byReference=new Map<string,Order>();for(const order of orders){byReference.set(order.order_name,order);byReference.set(order.order_gid,order);}
 const sums=new Map<string,bigint>(),matchedCounts=new Map<string,number>(),matchedRows=new Map<string,number>();
 const unmatched:Array<{invoice:string;charge:string;reference:string|null;amount:string;currency:string;reason:string}>=[];
 let matchedCostRows=0;
 for(const cost of costs){
  const order=cost.order_reference?byReference.get(cost.order_reference):undefined;
  if(!order){unmatched.push({invoice:cost.invoice_id,charge:cost.source_record_id,reference:cost.order_reference,amount:cost.amount,currency:cost.currency,reason:cost.order_reference?"No exact Shopify order reference match":"No order reference supplied"});continue;}
  if(order.currency!==cost.currency){unmatched.push({invoice:cost.invoice_id,charge:cost.source_record_id,reference:cost.order_reference,amount:cost.amount,currency:cost.currency,reason:`Currency mismatch: order is ${order.currency}`});continue;}
  const amount=units(cost.amount);if(amount===null){unmatched.push({invoice:cost.invoice_id,charge:cost.source_record_id,reference:cost.order_reference,amount:cost.amount,currency:cost.currency,reason:"Amount is not a supported decimal value"});continue;}
  sums.set(order.order_gid,(sums.get(order.order_gid)||0n)+amount);
  matchedCounts.set(order.order_gid,(matchedCounts.get(order.order_gid)||0)+1);
  matchedRows.set(cost.currency,(matchedRows.get(cost.currency)||0)+1);matchedCostRows++;
 }
 const grouped=new Map<string,{orders:number;shipping:bigint;matchedOrders:number;matchedCost:bigint;costRows:number}>();
 for(const order of orders){const g=grouped.get(order.currency)||{orders:0,shipping:0n,matchedOrders:0,matchedCost:0n,costRows:0};const revenue=units(order.shipping_amount);g.orders++;if(revenue!==null)g.shipping+=revenue;const matched=sums.get(order.order_gid);if(matched!==undefined){g.matchedOrders++;g.matchedCost+=matched;g.costRows+=matchedCounts.get(order.order_gid)||0;}grouped.set(order.currency,g);}
 const summary=[...grouped.entries()].map(([currency,g])=>({currency,orders:g.orders,shippingRevenue:decimal(g.shipping),ordersWithMatchedCost:g.matchedOrders,matchedCost:decimal(g.matchedCost),matchedCostRows:g.costRows}));
 const recent=orders.map(o=>({order:o.order_name,date:o.ordered_at,currency:o.currency,shippingRevenue:o.shipping_amount,taxesIncluded:Boolean(o.taxes_included),matchedCost:sums.has(o.order_gid)?decimal(sums.get(o.order_gid)!):null,evidenceRows:matchedCounts.get(o.order_gid)||0}));
 return json({ok:true,shop:merchant.shop,summary,orderCount:orders.length,costCount:costs.length,matchedCostRows,unmatchedCostRows:unmatched.length,unmatched,orders:recent,truncated,matchingRule:"Exact order name or Shopify order ID plus identical ISO currency. Tracking-number matching is not claimed because the current Shopify grant does not request fulfillment data.",limitations:["A matched charge is evidence, not proof that all costs are present.","Unmatched and currency-mismatched charges remain excluded from order-level matched cost.","No shared-cost allocation, profit calculation, savings claim or carrier recovery estimate is produced.","Only the first 5,000 stored orders and charges are included in this response."]});
}
