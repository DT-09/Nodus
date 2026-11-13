import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  const { shop, topic, webhookId } = await authenticate.webhook(request);
  if (!webhookId) return new Response("Missing webhook identifier", { status: 400 });

  const receipt = await prisma.webhookReceipt.upsert({
    where: { webhookId },
    create: { shop, webhookId, topic, status: "received" },
    update: {},
  });
  if (receipt.status === "processed") return new Response(null, { status: 200 });

  switch (topic) {
    case "APP_UNINSTALLED":
      await prisma.$transaction([
        prisma.merchant.updateMany({ where: { shop }, data: { uninstalledAt: new Date() } }),
        prisma.session.deleteMany({ where: { shop } }),
      ]);
      break;
    case "SHOP_REDACT":
      // Shopify's mandatory shop-redact request: remove the tenant and all
      // merchant-owned records. Keep only the minimal webhook receipt for replay safety.
      await prisma.$transaction([
        prisma.session.deleteMany({ where: { shop } }),
        prisma.merchant.deleteMany({ where: { shop } }),
      ]);
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      // NODUS does not ingest customer profiles or customer-level personal data.
      // Order data is retained only as merchant operational data; no customer export
      // or customer-specific deletion is possible because no customer entity is stored.
      break;
    case "APP_SCOPES_UPDATE":
      // Permission changes are enforced by Shopify on subsequent API requests.
      // Do not attempt to reuse stale grants; the merchant must reconnect if needed.
      break;
    default:
      // Acknowledge only authenticated topics registered by this application.
      break;
  }

  await prisma.webhookReceipt.update({
    where: { webhookId },
    data: { status: "processed", processedAt: new Date() },
  });
  return new Response(null, { status: 200 });
}
