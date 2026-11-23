import type { ActionFunctionArgs } from "react-router";
import { prisma } from "../db.server";
import { issueThreePLAccessToken, operatorAuthorized } from "../services/threepl-auth.server";

export async function action({ request }: ActionFunctionArgs) {
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

  const workspaceId = String(body.workspaceId ?? "").trim();
  if (!workspaceId) return Response.json({ ok: false, error: "workspaceId is required." }, { status: 400 });
  const workspace = await prisma.threePLWorkspace.findUnique({ where: { id: workspaceId }, select: { id: true, status: true, subscriptionStatus: true } });
  if (!workspace) return Response.json({ ok: false, error: "Workspace not found." }, { status: 404 });

  if (operation === "activate_trial") {
    if (workspace.status !== "onboarding") return Response.json({ ok: false, error: "A trial can only be activated from onboarding. Do not restart an expired trial." }, { status: 409 });
    const now = new Date();
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: "trial", trialActivatedAt: now, trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      select: { id: true, status: true, trialActivatedAt: true, trialEndsAt: true },
    });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "activate_subscription") {
    const planCode = String(body.planCode ?? "").trim().slice(0, 40);
    if (!planCode || body.confirmed !== true) return Response.json({ ok: false, error: "A plan code and explicit confirmation of the paid subscription are required." }, { status: 400 });
    const now = new Date();
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: "active", subscriptionStatus: "active", subscriptionStartedAt: now, subscriptionEndsAt: null, planCode },
      select: { id: true, status: true, subscriptionStatus: true, subscriptionStartedAt: true, planCode: true },
    });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "suspend" || operation === "close") {
    const updated = await prisma.threePLWorkspace.update({
      where: { id: workspaceId },
      data: { status: operation === "suspend" ? "suspended" : "closed", subscriptionStatus: operation === "close" ? "cancelled" : workspace.subscriptionStatus },
      select: { id: true, status: true, subscriptionStatus: true },
    });
    return Response.json({ ok: true, workspace: updated }, { headers: { "Cache-Control": "no-store" } });
  }

  if (operation === "rotate_access") {
    const issued = await issueThreePLAccessToken(workspaceId, String(body.label ?? "Rotated merchant access"));
    return Response.json({ ok: true, inviteToken: issued.token, tokenExpiresAt: issued.expiresAt.toISOString() }, { headers: { "Cache-Control": "no-store", "Pragma": "no-cache" } });
  }

  if (operation === "revoke_access") {
    const tokenId = String(body.tokenId ?? "");
    const result = await prisma.threePLAccessToken.updateMany({ where: { id: tokenId, workspaceId, revokedAt: null }, data: { revokedAt: new Date() } });
    return Response.json({ ok: result.count === 1 }, { status: result.count === 1 ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ ok: false, error: "Unsupported operator operation." }, { status: 400 });
}
