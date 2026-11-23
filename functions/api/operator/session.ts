import { json } from "../../_lib/shopify";
import { clearOperatorCookie, operatorSecretMatches, operatorSessionCookie, sameOrigin, type ThreePLEnv } from "../../_lib/threepl";

interface Context { request: Request; env: ThreePLEnv; }
export async function onRequestPost({request,env}:Context) {
  if (!sameOrigin(request)) return json({ok:false,error:"Origin rejected."},403);
  if(Number(request.headers.get("Content-Length")||0)>2000)return json({ok:false,error:"Request too large."},413);
  const type=request.headers.get("Content-Type")||"";
  if(!type.toLowerCase().includes("application/json"))return json({ok:false,error:"Use JSON."},415);
  let body:{secret?:string};try{body=await request.json() as {secret?:string};}catch{return json({ok:false,error:"Invalid JSON."},400);}
  const secret=typeof body.secret==="string"?body.secret:"";
  if(!operatorSecretMatches(secret,env))return json({ok:false,error:"Operator credentials are invalid."},401);
  return new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Set-Cookie":await operatorSessionCookie(secret),"Referrer-Policy":"no-referrer"}});
}
export async function onRequestDelete({request}:Context) {
  if(!sameOrigin(request))return json({ok:false,error:"Origin rejected."},403);
  return new Response(null,{status:204,headers:{"Set-Cookie":clearOperatorCookie,"Cache-Control":"no-store"}});
}
