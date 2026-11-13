import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

type CustomerRedactionPayload = { orders_to_redact?: unknown };

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
      await prisma.$transaction([
        prisma.session.deleteMany({ where: { shop } }),
        prisma.merchant.deleteMany({ where: { shop } }),
      ]);
      break;
    case "CUSTOMERS_REDACT": {
      const payload = await request.json() as CustomerRedactionPayload;
      const ids = Array.isArray(payload.orders_to_redact)
        ? payload.orders_to_redact.filter((id): id is number => typeof id === "number" && Number.isSafeInteger(id) && id > 0)
        : [];
      if (ids.length) {
        const sourceOrderIds = ids.map((id) => `gid://shopify/Order/${id}`);
        const merchant = await prisma.merchant.findUnique({ where: { shop }, select: { id: true } });
        if (merchant) {
          const orders = await prisma.shippingOrder.findMany({
            where: { merchantId: merchant.id, sourceOrderId: { in: sourceOrderIds } },
            select: { id: true, sourceOrderId: true, orderName: true, trackingNumbers: true },
          });
          const references = orders.flatMap((order) => [order.sourceOrderId, order.orderName]);
          const trackingNumbers = orders.flatMap((order) =>
            Array.isArray(order.trackingNumbers)
              ? order.trackingNumbers.filter((value): value is string => typeof value === "string")
              : [],
          );
          const operations = [];
          if (references.length || trackingNumbers.length) {
            operations.push(prisma.shippingCost.deleteMany({
              where: {
                merchantId: merchant.id,
                OR: [
                  ...(references.length ? [{ orderReference: { in: references } }] : []),
                  ...(trackingNumbers.length ? [{ trackingNumber: { in: trackingNumbers } }] : []),
                ],
              },
            }));
          }
          if (orders.length) operations.push(prisma.shippingOrder.deleteMany({ where: { id: { in: orders.map((order) => order.id) } } }));
          if (operations.length) await prisma.$transaction(operations);
        }
      }
      break;
    }
    case "CUSTOMERS_DATA_REQUEST":
      // NODUS stores merchant-level order and shipping evidence, not customer
      // profiles or customer contact fields. No customer profile export is held.
      break;
    case "APP_SCOPES_UPDATE":
      // Shopify enforces updated grants on subsequent API requests. Reconnect
      // is required before using any permission that is no longer granted.
      break;
    default:
      break;
  }

  await prisma.webhookReceipt.update({
    where: { webhookId },
    data: { status: "processed", processedAt: new Date() },
  });
  if (topic === "SHOP_REDACT") await prisma.webhookReceipt.deleteMany({ where: { shop } });
  return new Response(null, { status: 200 });
}
