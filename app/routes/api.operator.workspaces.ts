import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db.server";
import { issueThreePLAccessToken, operatorAuthorized } from "../services/threepl-auth.server";

async function logWorkspaceEvent(workspaceId: string, action: string, detail: Prisma.InputJsonValue = {}) {
  await prisma.threePLWorkspaceEvent.create({ data: { workspaceId, actorType: "operator", action, detail } });
}


export async function loader({ request }: LoaderFunctionArgs) {
  if (!operatorAuthorized(request)) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const [leads, workspaces] = await Promise.all([
    prisma.threePLLead.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.threePLWorkspace.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, businessName: true, ownerName: true, ownerEmail: true, shopDomain: true, status: true, planCode: true, trialActivatedAt: true, trialEndsAt: true, subscriptionStatus: true, subscriptionStartedAt: true, subscriptionEndsAt: true, createdAt: true, accessTokens: { select: { id: true, label: true, expiresAt: true, revokedAt: true, lastUsedAt: true, createdAt: true }, orderBy: { createdAt: "desc" } } } }),
  ]);
  return Response.json({
    ok: true,
    leads: leads.map(({ id, businessName, name, email, shopDomain, monthlyOrders, fulfilmentSetup, objective, requestedOffer, status, createdAt }) => ({ id, businessName, name, email, shopDomain, monthlyOrders, fulfilmentSetup, objective, requestedOffer, status, createdAt: createdAt.toISOString() })),
    workspaces: workspaces.map(item => ({ ...item, trialActivatedAt: item.trialActivatedAt?.toISOString() ?? null, trialEndsAt: item.trialEndsAt?.toISOString() ?? null, subscriptionStartedAt: item.subscriptionStartedAt?.toISOString() ?? null, subscriptionEndsAt: item.subscriptionEndsAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString(), accessTokens: item.accessTokens.map(token => ({ ...token, expiresAt: token.expiresAt.toISOString(), revokedAt: token.revokedAt?.toISOString() ?? null, lastUsedAt: token.lastUsedAt?.toISOString() ?? null, createdAt: token.createdAt.toISOString() })) })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function action({ request }: ActionFunctionArgs) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Cross-origin request rejected." }, { status: 403 });
  if (!operatorAuthorized(request)) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ ok: false, error: "Invalid JSON request." }, { status: 400 }); }
  const operation = String(body.operation ?? "");

  if (operation === "create_workspace") {
    const businessName = String(body.businessName ?? "").trim().slice(0, 160);
    const ownerName = String(body.ownerName ?? "").trim().slice(0, 100);
    const ownerEmail = String(body.ownerEmail ?? "").trim().toLowerCase();
    const shopDomain = String(body.shopDomain ?? "").trim().toLowerCase().slice(0, 255) || null;
    if (businessName.length < 2 || ownerName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail) || ownerEmail.length > 254) {
      return Response.json({ ok: false, error: "Provide a valid business name, owner name and work email." }, { status: 400 });
    }
    if (shopDomain && !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shopDomain)) {
      return Response.json({ ok: false, error: "Shop domain must be a .myshopify.com domain." }, { status: 400 });
    }
    const workspace = await prisma.threePLWorkspace.create({
      data: { businessName, ownerName, ownerEmail, shopDomain, status: "onboarding" },
      select: { id: true, businessName: true, ownerEmail: true, status: true },
    });
    try {
      const issued = await issueThreePLAccessToken(workspace.id, "Initial merchant invitation");
      await logWorkspaceEvent(workspace.id, "workspace_created", { invitationIssued: true });
      return Response.json({
        ok: true, workspace, inviteToken: issued.token,
        tokenExpiresAt: issued.expiresAt.toISOString(),
        instruction: "Send this one-time-visible token to the merchant through a private channel. It is not stored in plaintext.",
      }, { status: 201, headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
    } catch (error) {
      await prisma.threePLWorkspace.delete({ where: { id: workspace.id } });
      throw error;
    }
  }

  if (operation === "create_workspace_from_lead") {
    const leadId = String(body.leadId ?? "").trim();
    const lead = await prisma.threePLLead.findUnique({ where: { id: leadId } });
    if (!lead || lead.status !== "qualified") return Response.json({ ok: false, error: "Qualify the lead before provisioning a workspace." }, { status: 409 });
    const workspace = await prisma.threePLWorkspace.create({
      data: { businessName: lead.businessName, ownerName: lead.name, ownerEmail: lead.email, shopDomain: lead.shopDomain, status: "onboarding" },
      select: { id: true, businessName: true, ownerEmail: true, status: true },
    });
    try {
      const issued = await issueThreePLAccessToken(workspace.id, "Trial workspace invitation");
      await logWorkspaceEvent(workspace.id, "workspace_created_from_lead", { leadId: lead.id, invitationIssued: true });
      await prisma.threePLLead.update({ where: { id: lead.id }, data: { status: "converted" } });
      return Response.json({ ok: true, workspace, inviteToken: issued.token, tokenExpiresAt: issued.expiresAt.toISOString() }, { status: 201, headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
    } catch (error) {
      await prisma.threePLWorkspace.delete({ where: { id: workspace.id } });
      throw error;
    }
  }

  if (operation === "update_lead_status") {
    const leadId = String(body.leadId ?? "").trim();
    const status = String(body.status ?? "");
    if (!["new", "contacted", "qualified", "rejected"].includes(status)) return Response.json({ ok: false, error: "Invalid lead status." }, { status: 400 });
    const updated = await prisma.threePLLead.updateMany({ where: { id: leadId, status: { not: "converted" } }, data: { status } });
    return Response.json({ ok: updated.count === 1 }, { status: updated.count === 1 ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  }

  const workspaceId = String(body.workspaceId ?? "").trim();
  if (!workspaceId) return Response.json({ ok: false, error: "workspaceId is required." }, { status: 400 });
  const workspace = await prisma.threePLWorkspace.findUnique({ where: { id: workspaceId }, select: { id: true, status: true, subscriptionStatus: true, subscriptionEndsAt: true } });
  if (!workspace) return Response.json({ ok: false, error: "Workspace not found." }, { status: 404 });

  if (operation === "activate_trial") {
    if (workspace.status !== "onboarding") return Response.json({ ok: false, error: "A trial can only be activated from onboarding. Do not restart an expired trial." }, { status: 409 });
    const [providerCount, invoiceCount, activeContractCount] = await Promise.all([
      prisma.threePLProvider.count({ where: { workspaceId } }),
      prisma.threePLInvoice.count({ where: { workspaceId } }),
      prisma.threePLContract.count({ where: { workspaceId, status: "active" } }),
    ]);
    if (providerCount < 1 || invoiceCount < 1 || activeContractCount < 1) return Response.json({ ok: false, error: "Trial activation requires at least one provider, one active confirmed contract and one imported invoice. Prepare the workspace first." }, { status: 409 });
    const now = new Date();
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: "trial", trialActivatedAt: now, trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      select: { id: true, status: true, trialActivatedAt: true, trialEndsAt: true },
    });
    await logWorkspaceEvent(workspaceId, "trial_activated", { trialActivatedAt: updated.trialActivatedAt?.toISOString() ?? null, trialEndsAt: updated.trialEndsAt?.toISOString() ?? null });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "activate_subscription") {
    const planCode = String(body.planCode ?? "").trim().slice(0, 40);
    if (!planCode || body.confirmed !== true) return Response.json({ ok: false, error: "A plan code and explicit confirmation of the paid subscription are required." }, { status: 400 });
    const now = new Date();
    const periodEndsAt = body.periodEndsAt ? new Date(String(body.periodEndsAt)) : null;
    if (periodEndsAt && (Number.isNaN(periodEndsAt.getTime()) || periodEndsAt <= now)) return Response.json({ ok: false, error: "periodEndsAt must be a future date." }, { status: 400 });
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: "active", subscriptionStatus: "active", subscriptionStartedAt: now, subscriptionEndsAt: periodEndsAt, planCode },
      select: { id: true, status: true, subscriptionStatus: true, subscriptionStartedAt: true, planCode: true },
    });
    await logWorkspaceEvent(workspaceId, "subscription_activated", { planCode, periodEndsAt: periodEndsAt?.toISOString() ?? null });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "cancel_subscription") {
    const periodEndsAt = new Date(String(body.periodEndsAt ?? ""));
    if (Number.isNaN(periodEndsAt.getTime()) || periodEndsAt <= new Date()) return Response.json({ ok: false, error: "Provide a future subscription period end date." }, { status: 400 });
    if (workspace.subscriptionStatus !== "active") return Response.json({ ok: false, error: "Only an active subscription can be cancelled." }, { status: 409 });
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { subscriptionStatus: "cancelled", subscriptionEndsAt: periodEndsAt },
      select: { id: true, status: true, subscriptionStatus: true, subscriptionEndsAt: true },
    });
    await logWorkspaceEvent(workspaceId, "subscription_cancelled", { periodEndsAt: periodEndsAt.toISOString() });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "suspend" || operation === "close") {
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: operation === "suspend" ? "suspended" : "closed", subscriptionStatus: operation === "close" ? "cancelled" : workspace.subscriptionStatus },
      select: { id: true, status: true, subscriptionStatus: true },
    });
    await logWorkspaceEvent(workspaceId, operation === "suspend" ? "workspace_suspended" : "workspace_closed");
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "rotate_access") {
    await prisma.threePLAccessToken.updateMany({ where: { workspaceId, revokedAt: null }, data: { revokedAt: new Date() } });
    const issued = await issueThreePLAccessToken(workspaceId, String(body.label ?? "Rotated merchant access"));
    await logWorkspaceEvent(workspaceId, "access_token_rotated", { previousTokensRevoked: true });
    return Response.json({ ok: true, inviteToken: issued.token, tokenExpiresAt: issued.expiresAt.toISOString() }, { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
  }

  if (operation === "revoke_access") {
    const tokenId = String(body.tokenId ?? "");
    const result = await prisma.threePLAccessToken.updateMany({ where: { id: tokenId, workspaceId, revokedAt: null }, data: { revokedAt: new Date() } });
    if (result.count === 1) await logWorkspaceEvent(workspaceId, "access_token_revoked", { tokenId });
    return Response.json({ ok: result.count === 1 }, { status: result.count === 1 ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ ok: false, error: "Unsupported operator operation." }, { status: 400 });
}
