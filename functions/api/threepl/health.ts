import { json } from "../../_lib/shopify";
import type { ThreePLEnv } from "../../_lib/threepl";
interface Context{env:ThreePLEnv;}
export async function onRequestGet({env}:Context){
 try{
  const [workspace,lead,operatorReady]=await Promise.all([
   env.NODUS_DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='threepl_workspaces'").first<{name:string}>(),
   env.NODUS_DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='threepl_leads'").first<{name:string}>(),
   Promise.resolve(Boolean(env.NODUS_OPERATOR_SECRET&&env.NODUS_OPERATOR_SECRET.length>=32)),
  ]);
  const ready=Boolean(workspace&&operatorReady);
  return json({ok:ready,status:ready?"ready":"setup_required",service:"NODUS 3PL control"},ready?200:503);
 }catch{return json({ok:false,status:"unavailable",service:"NODUS 3PL control"},503);}
}
