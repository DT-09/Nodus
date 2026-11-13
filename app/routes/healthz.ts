import { prisma } from "../db.server";

export async function loader() {
  const missing = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "DATABASE_URL"]
    .filter((key) => !process.env[key]?.trim());
  const appUrl = process.env.SHOPIFY_APP_URL?.trim() ?? "";
  const invalidAppUrl = !appUrl.startsWith("https://") || appUrl.includes("example.invalid");
  if (invalidAppUrl && !missing.includes("SHOPIFY_APP_URL")) missing.push("SHOPIFY_APP_URL");

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
