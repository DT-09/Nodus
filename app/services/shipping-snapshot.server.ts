import { parseMoney } from "../domain/money";
import { prisma } from "../db.server";
type AdminGraphqlContext = { graphql(query: string, options?: { variables?: Record<string, unknown> }): Promise<Response> };
const QUERY = `query NodusShippingSnapshot($after: String) {
 shop { name myshopifyDomain }
 orders(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
  nodes { id name createdAt totalShippingPriceSet { shopMoney { amount currencyCode } } currentSubtotalPriceSet { shopMoney { amount currencyCode } } fulfillments(first: 10) { nodes { trackingInfo { number } } } }
  pageInfo { hasNextPage endCursor }
 }
}`;
type ShopifyOrder={id:string;name:string;createdAt:string;totalShippingPriceSet?:{shopMoney?:{amount:string;currencyCode:string}}|null;currentSubtotalPriceSet?:{shopMoney?:{amount:string;currencyCode:string}}|null;fulfillments?:{nodes:Array<{trackingInfo?:Array<{number?:string|null}>}>}};
type ShopifyPage={data?:{shop?:{name:string;myshopifyDomain:string};orders?:{nodes:ShopifyOrder[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}};errors?:Array<{message:string}>};
export type ShippingSnapshot={shopName:string;shopDomain:string;sampledOrders:number;persistedOrders:number;shippingRevenueMinor:bigint;currency:string|null;mixedCurrencies:boolean;sampleWindowStart:string|null;paginationComplete:boolean};
export async function getShippingSnapshot(admin:AdminGraphqlContext):Promise<ShippingSnapshot>{
 const orders:ShopifyOrder[]=[];let shop:{name:string;myshopifyDomain:string}|undefined;let cursor:string|null=null;let hasNextPage=true;const MAX_PAGES_PER_REQUEST=25;
 for(let page=0;page<MAX_PAGES_PER_REQUEST&&hasNextPage;page++){
  const response=await admin.graphql(QUERY,{variables:{after:cursor}});const body=await response.json() as ShopifyPage;
  if(!response.ok||body.errors?.length||!body.data?.shop||!body.data.orders)throw new Error(body.errors?.map(e=>e.message).join("; ")||"Unable to retrieve Shopify orders.");
  shop=body.data.shop;orders.push(...body.data.orders.nodes);hasNextPage=body.data.orders.pageInfo.hasNextPage;cursor=body.data.orders.pageInfo.endCursor;
  if(hasNextPage&&!cursor)throw new Error("Shopify pagination returned no continuation cursor.");
 }
 if(!shop)throw new Error("Shopify did not return merchant identity.");
 const merchant=await prisma.merchant.upsert({where:{shop:shop.myshopifyDomain},create:{shop:shop.myshopifyDomain,shopName:shop.name},update:{shopName:shop.name,uninstalledAt:null},select:{id:true}});
 const rows=orders.flatMap(order=>{const money=order.totalShippingPriceSet?.shopMoney;if(!money)return[];const parsed=parseMoney(money.amount,money.currencyCode);const trackingNumbers=[...new Set((order.fulfillments?.nodes??[]).flatMap(f=>f.trackingInfo??[]).map(t=>t.number?.trim()??"").filter(Boolean))];const orderedAt=new Date(order.createdAt);if(Number.isNaN(orderedAt.getTime()))throw new Error("Shopify returned an invalid order timestamp.");const subtotal=order.currentSubtotalPriceSet?.shopMoney;const subtotalMinor=subtotal&&subtotal.currencyCode===money.currencyCode?parseMoney(subtotal.amount,subtotal.currencyCode).minor:null;return[{order,money,parsed,subtotalMinor,trackingNumbers,orderedAt}]});
 for(let start=0;start<rows.length;start+=100){const batch=rows.slice(start,start+100);await prisma.$transaction(batch.map(({order,money,parsed,subtotalMinor,trackingNumbers,orderedAt})=>prisma.shippingOrder.upsert({where:{merchantId_sourceOrderId:{merchantId:merchant.id,sourceOrderId:order.id}},create:{merchantId:merchant.id,sourceOrderId:order.id,orderName:order.name,orderedAt,currency:money.currencyCode,shippingRevenueMinor:parsed.minor,subtotalMinor,trackingNumbers},update:{orderName:order.name,orderedAt,currency:money.currencyCode,shippingRevenueMinor:parsed.minor,subtotalMinor,trackingNumbers}})))}
 const currencies=new Set(rows.map(r=>r.money.currencyCode));const currency=currencies.size===1?[...currencies][0]!:null;const shippingRevenueMinor=currency?rows.reduce((sum,r)=>sum+r.parsed.minor,0n):0n;
 return{shopName:shop.name,shopDomain:shop.myshopifyDomain,sampledOrders:rows.length,persistedOrders:rows.length,shippingRevenueMinor,currency,mixedCurrencies:currencies.size>1,sampleWindowStart:orders.at(-1)?.createdAt??null,paginationComplete:!hasNextPage};
}