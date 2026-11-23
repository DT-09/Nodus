import { json } from "../../_lib/shopify";
import { clearMerchantCookie, clean, merchantSessionCookie, randomToken, sameOrigin, sha256, type ThreePLEnv } from "../../_lib/threepl";
interface Context{request:Request;env:ThreePLEnv;}
export async function onRequestPost({request,env}:Context){
 if(!sameOrigin(request))return json({ok:false,error:"Origin rejected."},403);
 if(Number(request.headers.get("Content-Length")||0)>2000)return json({ok:false,error:"Request too large."},413);
 const type=request.headers.get("Content-Type")||"";if(!type.toLowerCase().includes("application/json"))return json({ok:false,error:"Use JSON."},415);
 let body:{inviteToken?:string};try{body=await request.json() as {inviteToken?:string};}catch{return json({ok:false,error:"Invalid request."},400);}
 const token=clean(body.inviteToken,256);if(token.length<32)return json({ok:false,error:"The access link is invalid or expired."},401);
 const tokenHash=await sha256(token),now=Math.floor(Date.now()/1000);
 const access=await env.NODUS_DB.prepare("SELECT t.id AS token_id,w.id,w.business_name,w.status FROM threepl_access_tokens t JOIN threepl_workspaces w ON w.id=t.workspace_id WHERE t.token_hash=? AND t.used_at IS NULL AND t.revoked_at IS NULL AND t.expires_at>?")
  .bind(tokenHash,now).first<{token_id:string;id:string;business_name:string;status:string}>();
 if(!access||["suspended","closed"].includes(access.status))return json({ok:false,error:"The access link is invalid or expired."},401);
 const sessionToken=randomToken(32),sessionHash=await sha256(sessionToken),sessionExpiresAt=now+7*24*60*60;
 const consumed=await env.NODUS_DB.prepare("UPDATE threepl_access_tokens SET used_at=?,session_hash=?,session_expires_at=?,last_used_at=? WHERE id=? AND used_at IS NULL AND revoked_at IS NULL AND expires_at>? AND EXISTS (SELECT 1 FROM threepl_workspaces w WHERE w.id=threepl_access_tokens.workspace_id AND w.status NOT IN ('suspended','closed'))")
  .bind(now,sessionHash,sessionExpiresAt,now,access.token_id,now).run() as {meta?:{changes?:number}};
 if(consumed.meta?.changes!==1)return json({ok:false,error:"The access link has already been used or revoked."},401);
 return new Response(JSON.stringify({ok:true,businessName:access.business_name}),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Referrer-Policy":"no-referrer","Set-Cookie":merchantSessionCookie(sessionToken)}});
}
export async function onRequestDelete({request}:Context){
 if(!sameOrigin(request))return json({ok:false,error:"Origin rejected."},403);
 return new Response(null,{status:204,headers:{"Set-Cookie":clearMerchantCookie,"Cache-Control":"no-store"}});
}
