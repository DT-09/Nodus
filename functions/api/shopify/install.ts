import { cleanShop, configured, json, oauthStateCookie, randomToken, sha256, type PagesContext } from "../../_lib/shopify";
export async function onRequestGet({request,env}:PagesContext){
 if(!configured(env))return json({error:"Shopify installation is not configured. Add SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL and a 32-character TOKEN_ENCRYPTION_KEY to the Cloudflare Pages production environment."},503);
 const shop=cleanShop(new URL(request.url).searchParams.get("shop"));if(!shop)return json({error:"Enter a valid Shopify .myshopify.com store domain."},400);
 const state=randomToken(32),now=Math.floor(Date.now()/1000),stateHash=await sha256(state);
 await env.NODUS_DB.prepare("INSERT INTO shopify_oauth_states(state_hash,shop,expires_at,created_at) VALUES(?,?,?,?)").bind(stateHash,shop,now+600,now).run();
 await env.NODUS_DB.prepare("DELETE FROM shopify_oauth_states WHERE expires_at<?").bind(now).run();
 const appUrl=new URL(env.SHOPIFY_APP_URL!);const redirectUri=new URL("/api/shopify/callback",appUrl).toString();
 const authorize=new URL(`https://${shop}/admin/oauth/authorize`);
 authorize.searchParams.set("client_id",env.SHOPIFY_API_KEY!);authorize.searchParams.set("scope","read_orders");authorize.searchParams.set("redirect_uri",redirectUri);authorize.searchParams.set("state",state);
 const response=Response.redirect(authorize.toString(),302);response.headers.append("Set-Cookie",oauthStateCookie(state));response.headers.set("Cache-Control","no-store");return response;
}
