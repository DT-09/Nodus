import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "../db.server";

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function constantTimeEqual(expected: string, supplied: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function operatorSessionCookie(secret: string, maxAge = 8 * 60 * 60) {
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const signature = createHmac("sha256", secret).update("nodus-operator:" + expires).digest("hex");
  const token = expires + "." + signature;
  return `nodus_operator_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearOperatorSessionCookie() {
  return "nodus_operator_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

export function operatorAuthorized(request: Request): boolean {
  const expected = process.env.NODUS_OPERATOR_SECRET;
  if (!expected) return false;
  const supplied = request.headers.get("x-nodus-operator-secret");
  if (supplied && constantTimeEqual(expected, supplied)) return true;
  const cookie = request.headers.get("cookie") ?? "";
  const session = cookie.split(";").map(part => part.trim()).find(part => part.startsWith("nodus_operator_session="))?.slice("nodus_operator_session=".length);
  if (!session) return false;
  const [expiresText, signature] = session.split(".");
  const expires = Number(expiresText);
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !signature) return false;
  const expectedSignature = createHmac("sha256", expected).update("nodus-operator:" + expires).digest("hex");
  return constantTimeEqual(expectedSignature, signature);
}

export function operatorSecretMatches(supplied: string): boolean {
  const expected = process.env.NODUS_OPERATOR_SECRET;
  return Boolean(expected && supplied && constantTimeEqual(expected, supplied));
}

export async function issueThreePLAccessToken(workspaceId: string, label = "Merchant access") {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.threePLAccessToken.create({
    data: { workspaceId, tokenHash: hashAccessToken(token), label: label.slice(0, 80), expiresAt },
  });
  return { token, expiresAt };
}

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      try { return decodeURIComponent(rest.join("=")); } catch { return null; }
    }
  }
  return null;
}

export async function getThreePLWorkspace(request: Request) {
  const token = cookieValue(request, "nodus_3pl_session");
  if (!token || token.length > 256) return null;
  const access = await prisma.threePLAccessToken.findFirst({
    where: { tokenHash: hashAccessToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
    include: { workspace: true },
  });
  if (!access || ["suspended", "closed"].includes(access.workspace.status)) return null;
  await prisma.threePLAccessToken.update({ where: { id: access.id }, data: { lastUsedAt: new Date() } });
  return { workspace: access.workspace, accessTokenId: access.id };
}

export function threePLSessionCookie(token: string, maxAge = 7 * 24 * 60 * 60) {
  return `nodus_3pl_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function canWriteThreePLWorkspace(workspace: { status: string; trialEndsAt: Date | null; subscriptionStatus: string; subscriptionEndsAt?: Date | null }) {
  const now = new Date();
  if (workspace.status === "onboarding") return true;
  if (workspace.subscriptionStatus === "active") return true;
  if (workspace.subscriptionStatus === "cancelled" && workspace.subscriptionEndsAt && workspace.subscriptionEndsAt > now) return true;
  return workspace.status === "trial" && Boolean(workspace.trialEndsAt && workspace.trialEndsAt > now);
}
