interface D1Statement{first<T=unknown>():Promise<T|null>}
interface D1Database{prepare(sql:string):D1Statement}
interface Context{env:{NODUS_DB:D1Database}}
export async function onRequestGet({env}:Context):Promise<Response>{
 try{await env.NODUS_DB.prepare("SELECT 1 AS ok").first();return Response.json({status:"ok",service:"nodus-public-intake",database:"connected"},{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
 catch{return Response.json({status:"unavailable",service:"nodus-public-intake"},{status:503,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
}
