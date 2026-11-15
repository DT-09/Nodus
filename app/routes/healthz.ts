import { prisma } from "../db.server";

export async function loader() {
  const production = process.env.NODE_ENV === "production";
  const missing = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "DATABASE_URL"]
    .filter((key) => !process.env[key]?.trim());
  const appUrl = process.env.SHOPIFY_APP_URL?.trim() ?? "";
  let parsedAppUrl: URL | null = null;
  try { parsedAppUrl = new URL(appUrl); } catch { /* validated below */ }
  const invalidAppUrl = !parsedAppUrl || parsedAppUrl.protocol !== "https:" || parsedAppUrl.hostname.endsWith("example.invalid");
  if (invalidAppUrl && !missing.includes("SHOPIFY_APP_URL")) missing.push("SHOPIFY_APP_URL");

  if (production) {
    const contact = process.env.PUBLIC_CONTACT_EMAIL?.trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) missing.push("PUBLIC_CONTACT_EMAIL");
    if ((process.env.CRON_SECRET?.length ?? 0) < 32) missing.push("CRON_SECRET (minimum 32 characters)");
  }

  if (missing.length) {
    return Response.json(
      { status: "not_configured", service: "nodus", missing },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ok", service: "nodus" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable", service: "nodus" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
