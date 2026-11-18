import { decryptToken, json, merchantSession, type PagesContext } from "../../_lib/shopify";
type Money={amount:string;currencyCode:string};type ShopifyOrder={id:string;name:string;createdAt:string;currencyCode:string;taxesIncluded:boolean;currentShippingPriceSet:{shopMoney:Money}};type GraphqlResponse={data?:{orders?:{edges:Array<{cursor:string;node:ShopifyOrder}>;pageInfo:{hasNextPage:boolean;endCursor:string|null}}};errors?:Array<{message:string}>};
export async function onRequestPost({request,env}:PagesContext){
 const origin=request.headers.get("Origin");if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return json({error:"Origin rejected."},403);}catch{return json({error:"Origin rejected."},403);}}
 const merchant=await merchantSession(request,env);if(!merchant)return json({error:"Connect a Shopify store first."},401);
 const install=await env.NODUS_DB.prepare("SELECT token_ciphertext,token_iv FROM shopify_installs WHERE shop=? AND uninstalled_at IS NULL").bind(merchant.shop).first<{token_ciphertext:string;token_iv:string}>();
 if(!install)return json({error:"Shopify authorization is no longer active. Reconnect the store."},401);
 const token=await decryptToken(install.token_ciphertext,install.token_iv,env);
 const prior=await env.NODUS_DB.prepare("SELECT cursor,has_more FROM shopify_sync_state WHERE shop=?").bind(merchant.shop).first<{cursor:string|null;has_more:number}>();
 const cursor=prior?.has_more?prior.cursor:null;
 const since=new Date(Date.now()-60*24*60*60*1000).toISOString();
 const query=`query NodusShippingOrders($after:String,$query:String!){orders(first:100,after:$after,sortKey:CREATED_AT,reverse:true,query:$query){edges{cursor node{id name createdAt currencyCode taxesIncluded currentShippingPriceSet{shopMoney{amount currencyCode}}}}pageInfo{hasNextPage endCursor}}}`;
 const api=await fetch(`https://${merchant.shop}/admin/api/2026-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":token},body:JSON.stringify({query,variables:{after:cursor,query:`created_at:>=${since.slice(0,10)}`}})});
 if(!api.ok){await env.NODUS_DB.prepare("INSERT INTO shopify_sync_state(shop,last_error,last_sync_at) VALUES(?,?,?) ON CONFLICT(shop) DO UPDATE SET last_error=excluded.last_error,last_sync_at=excluded.last_sync_at").bind(merchant.shop,`Shopify API returned HTTP ${api.status}`,new Date().toISOString()).run();return json({error:`Shopify order sync failed (HTTP ${api.status}). No new order data was reported as synced.`},502);}
 const body=await api.json() as GraphqlResponse;if(body.errors?.length||!body.data?.orders)return json({error:body.errors?.map(x=>x.message).join("; ")||"Shopify returned no order connection."},502);
 const edges=body.data.orders.edges,now=new Date().toISOString();
 const statements=edges.map(({node})=>env.NODUS_DB.prepare("INSERT INTO shopify_orders(shop,order_gid,order_name,ordered_at,currency,shipping_amount,taxes_included,source_payload,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(shop,order_gid) DO UPDATE SET order_name=excluded.order_name,ordered_at=excluded.ordered_at,currency=excluded.currency,shipping_amount=excluded.shipping_amount,taxes_included=excluded.taxes_included,source_payload=excluded.source_payload,updated_at=excluded.updated_at").bind(merchant.shop,node.id,node.name,node.createdAt,node.currentShippingPriceSet.shopMoney.currencyCode,node.currentShippingPriceSet.shopMoney.amount,node.taxesIncluded?1:0,JSON.stringify({id:node.id,name:node.name,createdAt:node.createdAt}),now));
 if(statements.length)await env.NODUS_DB.batch(statements);
 const page=body.data.orders.pageInfo,processed=(prior?.has_more?0:0)+edges.length;
 await env.NODUS_DB.prepare("INSERT INTO shopify_sync_state(shop,cursor,has_more,orders_processed,last_sync_at,last_error) VALUES(?,?,?,?,?,NULL) ON CONFLICT(shop) DO UPDATE SET cursor=excluded.cursor,has_more=excluded.has_more,orders_processed=shopify_sync_state.orders_processed+excluded.orders_processed,last_sync_at=excluded.last_sync_at,last_error=NULL").bind(merchant.shop,page.hasNextPage?page.endCursor:null,page.hasNextPage?1:0,processed,now).run();
 const count=await env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM shopify_orders WHERE shop=?").bind(merchant.shop).first<{count:number}>();
 return json({ok:true,processed:edges.length,totalStored:count?.count||0,hasMore:page.hasNextPage,nextAction:page.hasNextPage?"Run sync again to continue the saved cursor.":"The available 60-day order window has been synchronised.",lastSyncAt:now,source:"Shopify Admin GraphQL API 2026-07"});
}
