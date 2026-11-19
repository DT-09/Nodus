import { cleanShop, clearOAuthStateCookie, configured, constantTimeEqual, encryptToken, getCookie, json, randomToken, sessionCookie, sha256, verifyOAuthHmac, type PagesContext } from "../../_lib/shopify";
export async function onRequestGet({request,env}:PagesContext){
 if(!configured(env))return json({error:"Shopify installation is not configured. Required app credentials, canonical app URL and token encryption are missing."},503);
 const url=new URL(request.url),appUrl=new URL(env.SHOPIFY_APP_URL!),shop=cleanShop(url.searchParams.get("shop")),state=url.searchParams.get("state"),code=url.searchParams.get("code"),timestamp=Number(url.searchParams.get("timestamp")||0);
 if(url.origin!==appUrl.origin)return json({error:"OAuth callback arrived on an unregistered application host."},400);
 if(!shop||!state||!code||!Number.isFinite(timestamp)||Math.abs(Date.now()/1000-timestamp)>300)return json({error:"Invalid or expired Shopify authorization response."},400);
 const browserState=getCookie(request,"__Host-nodus_oauth_state");
 if(!browserState||!constantTimeEqual(browserState,state))return json({error:"This authorization was not initiated in this browser. Restart the Shopify connection."},403);
 if(!await verifyOAuthHmac(url,env.SHOPIFY_API_SECRET!))return json({error:"Shopify authorization signature could not be verified."},403);
 const stateHash=await sha256(state),now=Math.floor(Date.now()/1000);
 const saved=await env.NODUS_DB.prepare("SELECT shop FROM shopify_oauth_states WHERE state_hash=? AND shop=? AND expires_at>?").bind(stateHash,shop,now).first<{shop:string}>();
 if(!saved)return json({error:"Authorization state expired or did not match this store. Start again from NODUS."},403);
 await env.NODUS_DB.prepare("DELETE FROM shopify_oauth_states WHERE state_hash=?").bind(stateHash).run();
 const tokenResponse=await fetch(`https://${shop}/admin/oauth/access_token`,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({client_id:env.SHOPIFY_API_KEY,client_secret:env.SHOPIFY_API_SECRET,code})});
 if(!tokenResponse.ok)return json({error:"Shopify did not complete the authorization exchange. No store token was saved."},502);
 const tokenBody=await tokenResponse.json() as {access_token?:string;scope?:string};
 if(!tokenBody.access_token||!tokenBody.scope?.split(",").map(x=>x.trim()).includes("read_orders"))return json({error:"Shopify did not grant the required read_orders permission."},403);
 let shopName:string|null=null;
 try{
  const shopResponse=await fetch(`https://${shop}/admin/api/2026-07/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Access-Token":tokenBody.access_token},body:JSON.stringify({query:"{ shop { name } }"})});
  if(shopResponse.ok){const body=await shopResponse.json() as {data?:{shop?:{name?:string}}};shopName=body.data?.shop?.name||null;}
 }catch{/* Store display name is optional; authorization remains valid. */}
 const encrypted=await encryptToken(tokenBody.access_token,env),nowIso=new Date().toISOString();
 await env.NODUS_DB.prepare("INSERT INTO shopify_installs(shop,shop_name,token_ciphertext,token_iv,scopes,installed_at,updated_at,uninstalled_at) VALUES(?,?,?,?,?,?,?,NULL) ON CONFLICT(shop) DO UPDATE SET shop_name=excluded.shop_name,token_ciphertext=excluded.token_ciphertext,token_iv=excluded.token_iv,scopes=excluded.scopes,updated_at=excluded.updated_at,uninstalled_at=NULL").bind(shop,shopName,encrypted.ciphertext,encrypted.iv,tokenBody.scope,nowIso,nowIso).run();
 const session=randomToken(32),sessionHash=await sha256(session),expires=now+604800;
 await env.NODUS_DB.prepare("DELETE FROM shopify_sessions WHERE shop=? AND expires_at<=?").bind(shop,now).run();
 await env.NODUS_DB.prepare("INSERT INTO shopify_sessions(token_hash,shop,expires_at,created_at) VALUES(?,?,?,?)").bind(sessionHash,shop,expires,now).run();
 const response=Response.redirect(new URL("/workspace?connected=1",appUrl),303);response.headers.append("Set-Cookie",sessionCookie(session));response.headers.append("Set-Cookie",clearOAuthStateCookie);response.headers.set("Cache-Control","no-store");return response;
}
