import type { ActionFunctionArgs } from "react-router";
import { prisma } from "../db.server";
import { hashAccessToken, threePLSessionCookie } from "../services/threepl-auth.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "DELETE") {
    return new Response(null, { status: 204, headers: { "Set-Cookie": threePLSessionCookie("", 0), "Cache-Control": "no-store" } });
  }
  if (request.method !== "POST") return Response.json({ ok: false, error: "Method not allowed." }, { status: 405 });
  let body: { inviteToken?: string };
  try { body = await request.json() as { inviteToken?: string }; } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  const token = body.inviteToken?.trim() ?? "";
  if (token.length < 32 || token.length > 256) return Response.json({ ok: false, error: "The access link is invalid or expired." }, { status: 401 });
  const access = await prisma.threePLAccessToken.findFirst({
    where: { tokenHash: hashAccessToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
    include: { workspace: { select: { id: true, status: true, businessName: true } } },
  });
  if (!access || ["suspended", "closed"].includes(access.workspace.status)) {
    return Response.json({ ok: false, error: "The access link is invalid or expired." }, { status: 401 });
  }
  await prisma.threePLAccessToken.update({ where: { id: access.id }, data: { lastUsedAt: new Date() } });
  return Response.json({ ok: true, businessName: access.workspace.businessName }, {
    headers: {
      "Set-Cookie": threePLSessionCookie(token),
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
