import type { ActionFunctionArgs } from "react-router";
import { prisma } from "../db.server";

const allowedOrders = new Set(["under_500","500_2000","2000_10000","10000_50000","50000_plus","prefer_to_discuss"]);
const allowedSetup = new Set(["one_3pl","multiple_3pls","in_house_and_3pl","other"]);

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return Response.json({ ok: false, error: "Method not allowed." }, { status: 405 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Cross-origin request rejected." }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }

  // Honeypot: silently discard automated submissions without collecting data.
  if (String(body.website ?? "").trim()) return Response.json({ ok: true, message: "Your request has been received." });
  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().toLowerCase();
  const shopDomain = String(body.store ?? "").trim().toLowerCase().slice(0, 255);
  const monthlyOrders = String(body.orders ?? "");
  const fulfilmentSetup = String(body.shipping ?? "");
  const objective = String(body.objective ?? "").trim().slice(0, 1500);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: "Enter a valid name and work email." }, { status: 400 });
  }
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shopDomain)) {
    return Response.json({ ok: false, error: "Enter the permanent .myshopify.com store domain." }, { status: 400 });
  }
  if (!allowedOrders.has(monthlyOrders) || !allowedSetup.has(fulfilmentSetup) || objective.length < 20 || body.consent !== true) {
    return Response.json({ ok: false, error: "Complete the required business-fit fields and consent." }, { status: 400 });
  }
  const since = new Date(Date.now() - 30 * 60 * 1000);
  const recent = await prisma.threePLLead.count({ where: { email, createdAt: { gte: since } } });
  if (recent >= 3) return Response.json({ ok: false, error: "Too many requests from this email. Please try again later." }, { status: 429 });

  const lead = await prisma.threePLLead.create({
    data: {
      name, email, shopDomain, monthlyOrders, fulfilmentSetup, objective,
      requestedOffer: "seven_day_trial", consentAt: new Date(),
    },
    select: { id: true, createdAt: true },
  });
  return Response.json({
    ok: true,
    reference: lead.id,
    message: "Trial request received. NODUS will review data compatibility and onboarding readiness. Your seven-day trial begins only after your workspace is activated.",
  }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
