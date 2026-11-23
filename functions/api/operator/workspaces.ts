import { json } from "../../_lib/shopify";
import { clean, id, issueAccessToken, nowIso, operatorAuthorized, sameOrigin, type ThreePLEnv } from "../../_lib/threepl";

interface Context { request: Request; env: ThreePLEnv; }
type LeadRow = { id:string;business_name:string;name:string;email:string;store_url:string;monthly_orders:string;shipping_setup:string;objective:string;status:string;created_at:string };
type WorkspaceRow = { id:string;business_name:string;owner_name:string;owner_email:string;shop_domain:string|null;status:string;plan_code:string|null;trial_activated_at:string|null;trial_ends_at:string|null;subscription_status:string;subscription_started_at:string|null;subscription_ends_at:string|null;created_at:string };

async function audit(env:ThreePLEnv,workspaceId:string,action:string,detail:unknown={}) {
  await env.NODUS_DB.prepare("INSERT INTO threepl_workspace_events(id,workspace_id,actor_type,action,detail_json,created_at) VALUES(?,?,'operator',?,?,?)")
    .bind(id(),workspaceId,action,JSON.stringify(detail),nowIso()).run();
}
function bad(message:string,status=400){return json({ok:false,error:message},status);}

export async function onRequestGet({request,env}:Context) {
  if(!sameOrigin(request))return bad("Origin rejected.",403);
  if(!await operatorAuthorized(request,env))return bad("Operator authentication failed.",401);
  const [leadResult,workspaceResult]=await Promise.all([
    env.NODUS_DB.prepare("SELECT id,business_name,name,email,store_url,monthly_orders,shipping_setup,objective,status,created_at FROM merchant_leads WHERE offer_type='seven_day_trial' ORDER BY created_at DESC LIMIT 200").all<LeadRow>(),
    env.NODUS_DB.prepare("SELECT id,business_name,owner_name,owner_email,shop_domain,status,plan_code,trial_activated_at,trial_ends_at,subscription_status,subscription_started_at,subscription_ends_at,created_at FROM threepl_workspaces ORDER BY created_at DESC LIMIT 200").all<WorkspaceRow>(),
  ]);
  const tokens=await env.NODUS_DB.prepare("SELECT id,workspace_id,label,expires_at,used_at,revoked_at,last_used_at,created_at FROM threepl_access_tokens ORDER BY created_at DESC LIMIT 500").all<{id:string;workspace_id:string;label:string;expires_at:number;used_at:number|null;revoked_at:number|null;last_used_at:number|null;created_at:number}>();
  const tokenMap=new Map<string,unknown[]>();
  for(const token of tokens.results){const list=tokenMap.get(token.workspace_id)||[];list.push({id:token.id,label:token.label,expiresAt:new Date(token.expires_at*1000).toISOString(),usedAt:token.used_at?new Date(token.used_at*1000).toISOString():null,revokedAt:token.revoked_at?new Date(token.revoked_at*1000).toISOString():null,lastUsedAt:token.last_used_at?new Date(token.last_used_at*1000).toISOString():null,createdAt:new Date(token.created_at*1000).toISOString()});tokenMap.set(token.workspace_id,list);}
  return json({
    ok:true,
    leads:leadResult.results.map(lead=>({id:lead.id,businessName:lead.business_name,name:lead.name,email:lead.email,shopDomain:lead.store_url,monthlyOrders:lead.monthly_orders,fulfilmentSetup:lead.shipping_setup,objective:lead.objective,status:lead.status,createdAt:lead.created_at})),
    workspaces:workspaceResult.results.map(workspace=>({id:workspace.id,businessName:workspace.business_name,ownerName:workspace.owner_name,ownerEmail:workspace.owner_email,shopDomain:workspace.shop_domain,status:workspace.status,planCode:workspace.plan_code,trialActivatedAt:workspace.trial_activated_at,trialEndsAt:workspace.trial_ends_at,subscriptionStatus:workspace.subscription_status,subscriptionStartedAt:workspace.subscription_started_at,subscriptionEndsAt:workspace.subscription_ends_at,createdAt:workspace.created_at,accessTokens:tokenMap.get(workspace.id)||[]})),
  });
}

export async function onRequestPost({request,env}:Context) {
  if(!sameOrigin(request))return bad("Origin rejected.",403);
  if(!await operatorAuthorized(request,env))return bad("Operator authentication failed.",401);
  const length=Number(request.headers.get("Content-Length")||0);if(length>12000)return bad("Request too large.",413);
  let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return bad("Invalid JSON.",400);}
  const operation=clean(body.operation,60);

  if(operation==="update_lead_status"){
    const leadId=clean(body.leadId,80),status=clean(body.status,40);
    if(!["new","contacted","qualified","rejected"].includes(status))return bad("Invalid lead status.");
    const result=await env.NODUS_DB.prepare("UPDATE merchant_leads SET status=? WHERE id=? AND offer_type='seven_day_trial' AND status<>'converted'").bind(status,leadId).run() as {meta?:{changes?:number}};
    if(result.meta?.changes!==1)return bad("Trial request was not found or has already been converted.",409);
    return json({ok:true,message:"Lead status updated."});
  }

  if(operation==="create_workspace_from_lead"){
    const leadId=clean(body.leadId,80);
    const lead=await env.NODUS_DB.prepare("SELECT id,business_name,name,email,store_url,status FROM merchant_leads WHERE id=? AND offer_type='seven_day_trial'").bind(leadId).first<LeadRow>();
    if(!lead||lead.status!=="qualified")return bad("Qualify the lead before provisioning a workspace.",409);
    const workspaceId=id(),created=nowIso();
    const shopDomain=(()=>{try{return new URL(lead.store_url).hostname;}catch{return null;}})();
    await env.NODUS_DB.prepare("INSERT INTO threepl_workspaces(id,business_name,owner_name,owner_email,shop_domain,status,subscription_status,created_at,updated_at) VALUES(?,?,?,?,?,'onboarding','none',?,?)")
      .bind(workspaceId,lead.business_name,lead.name,lead.email,shopDomain,created,created).run();
    try{
      const issued=await issueAccessToken(workspaceId,"Initial merchant invitation",env);
      await audit(env,workspaceId,"workspace_created_from_lead",{leadId,invitationIssued:true});
      const converted=await env.NODUS_DB.prepare("UPDATE merchant_leads SET status='converted' WHERE id=? AND offer_type='seven_day_trial' AND status='qualified'").bind(leadId).run() as {meta?:{changes?:number}};
      if(converted.meta?.changes!==1)throw new Error("Lead status changed during provisioning; refresh and retry.");
      const workspace=await env.NODUS_DB.prepare("SELECT id,business_name,owner_email,status FROM threepl_workspaces WHERE id=?").bind(workspaceId).first();
      return json({ok:true,workspace,inviteToken:issued.token,tokenExpiresAt:new Date(issued.expiresAt*1000).toISOString()},201);
    }catch(error){
      await env.NODUS_DB.prepare("DELETE FROM threepl_workspaces WHERE id=?").bind(workspaceId).run();
      throw error;
    }
  }

  const workspaceId=clean(body.workspaceId,80);
  if(!workspaceId)return bad("workspaceId is required.");
  const workspace=await env.NODUS_DB.prepare("SELECT * FROM threepl_workspaces WHERE id=?").bind(workspaceId).first<WorkspaceRow>();
  if(!workspace)return bad("Workspace not found.",404);

  if(operation==="activate_trial"){
    if(workspace.status!=="onboarding")return bad("A trial can only be activated from onboarding. Do not restart an expired trial.",409);
    const [providers,matchedInvoices]=await Promise.all([
      env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM threepl_providers WHERE workspace_id=?").bind(workspaceId).first<{count:number}>(),
      env.NODUS_DB.prepare("SELECT COUNT(*) AS count FROM threepl_invoices i WHERE i.workspace_id=? AND i.status IN ('imported','reconciled') AND EXISTS (SELECT 1 FROM threepl_contracts c WHERE c.workspace_id=i.workspace_id AND c.provider_id=i.provider_id AND c.status='active')").bind(workspaceId).first<{count:number}>(),
    ]);
    if((providers?.count||0)<1||(matchedInvoices?.count||0)<1)return bad("Trial activation requires a provider with both an active confirmed contract and a completed invoice import.",409);
    const start=new Date(),end=new Date(start.getTime()+7*24*60*60*1000),now=start.toISOString();
    await env.NODUS_DB.prepare("UPDATE threepl_workspaces SET status='trial',trial_activated_at=?,trial_ends_at=?,updated_at=? WHERE id=?").bind(now,end.toISOString(),now,workspaceId).run();
    await audit(env,workspaceId,"trial_activated",{trialActivatedAt:now,trialEndsAt:end.toISOString()});
    return json({ok:true,workspace:{id:workspaceId,status:"trial",trialActivatedAt:now,trialEndsAt:end.toISOString()}});
  }

  if(operation==="activate_subscription"){
    const planCode=clean(body.planCode,40),confirmed=body.confirmed===true;
    if(planCode!=="core_99"||!confirmed)return bad("Core pricing and explicit confirmation of the subscription are required.");
    if(["closed","suspended"].includes(workspace.status))return bad("A closed or suspended workspace cannot be activated.",409);
    if(workspace.status!=="trial"&&workspace.status!=="active")return bad("Complete onboarding and activate the seven-day trial before starting a subscription.",409);
    const now=new Date(),periodEndsAt=new Date(String(body.periodEndsAt??""));
    if(!Number.isFinite(periodEndsAt.getTime())||periodEndsAt<=now)return bad("A future subscription period end date is required.");
    await env.NODUS_DB.prepare("UPDATE threepl_workspaces SET status='active',subscription_status='active',subscription_started_at=?,subscription_ends_at=?,plan_code=?,updated_at=? WHERE id=?")
      .bind(now.toISOString(),periodEndsAt?.toISOString()??null,planCode,now.toISOString(),workspaceId).run();
    await audit(env,workspaceId,"subscription_activated",{planCode,periodEndsAt:periodEndsAt?.toISOString()??null});
    return json({ok:true,message:"Subscription state activated."});
  }

  if(operation==="cancel_subscription"){
    const periodEndsAt=new Date(String(body.periodEndsAt??""));
    if(!Number.isFinite(periodEndsAt.getTime())||periodEndsAt<=new Date())return bad("Provide a future subscription period end date.");
    if(workspace.subscription_status!=="active")return bad("Only an active subscription can be cancelled.",409);
    await env.NODUS_DB.prepare("UPDATE threepl_workspaces SET subscription_status='cancelled',subscription_ends_at=?,updated_at=? WHERE id=?")
      .bind(periodEndsAt.toISOString(),nowIso(),workspaceId).run();
    await audit(env,workspaceId,"subscription_cancelled",{periodEndsAt:periodEndsAt.toISOString()});
    return json({ok:true,message:"Subscription cancellation scheduled for the recorded period end."});
  }

  if(operation==="suspend"||operation==="close"){
    const status=operation==="suspend"?"suspended":"closed";
    await env.NODUS_DB.prepare("UPDATE threepl_workspaces SET status=?,subscription_status=CASE WHEN ?='closed' THEN 'cancelled' ELSE subscription_status END,updated_at=? WHERE id=?")
      .bind(status,status,nowIso(),workspaceId).run();
    await audit(env,workspaceId,operation==="suspend"?"workspace_suspended":"workspace_closed");
    return json({ok:true,message:"Workspace status updated."});
  }

  if(operation==="rotate_access"){
    if(["closed","suspended"].includes(workspace.status))return bad("A closed or suspended workspace cannot receive new access.",409);
    const now=Math.floor(Date.now()/1000);
    await env.NODUS_DB.prepare("UPDATE threepl_access_tokens SET revoked_at=? WHERE workspace_id=? AND revoked_at IS NULL").bind(now,workspaceId).run();
    const issued=await issueAccessToken(workspaceId,clean(body.label,80)||"Rotated merchant access",env);
    await audit(env,workspaceId,"access_token_rotated",{previousTokensRevoked:true});
    return json({ok:true,inviteToken:issued.token,tokenExpiresAt:new Date(issued.expiresAt*1000).toISOString()});
  }

  if(operation==="revoke_access"){
    const tokenId=clean(body.tokenId,80),now=Math.floor(Date.now()/1000);
    const result=await env.NODUS_DB.prepare("UPDATE threepl_access_tokens SET revoked_at=? WHERE id=? AND workspace_id=? AND revoked_at IS NULL").bind(now,tokenId,workspaceId).run();
    await audit(env,workspaceId,"access_token_revoked",{tokenId});
    return json({ok:true,message:"Access token revoked."});
  }

  return bad("Unsupported operator operation.");
}
