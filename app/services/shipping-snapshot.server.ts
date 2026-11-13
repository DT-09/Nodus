import { parseMoney } from "../domain/money";
import { prisma } from "../db.server";

type AdminGraphqlContext = { graphql(query: string): Promise<Response> };

const SNAPSHOT_QUERY = `query NodusShippingSnapshot {
  shop { name myshopifyDomain }
  orders(first: 100, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id
      name
      createdAt
      totalShippingPriceSet { shopMoney { amount currencyCode } }
      currentSubtotalPriceSet { shopMoney { amount currencyCode } }
      fulfillments(first: 10) { trackingInfo { number } }
    }
  }
}`;

export type ShippingSnapshot = {
  shopName: string;
  shopDomain: string;
  sampledOrders: number;
  persistedOrders: number;
  shippingRevenueMinor: bigint;
  currency: string | null;
  mixedCurrencies: boolean;
  sampleWindowStart: string | null;
};

export async function getShippingSnapshot(admin: AdminGraphqlContext): Promise<ShippingSnapshot> {
  const response = await admin.graphql(SNAPSHOT_QUERY);
  const body = await response.json() as {
    data?: {
      shop?: { name: string; myshopifyDomain: string };
      orders?: {
        nodes: Array<{
          id: string;
          name: string;
          createdAt: string;
          totalShippingPriceSet?: { shopMoney?: { amount: string; currencyCode: string } } | null;
          currentSubtotalPriceSet?: { shopMoney?: { amount: string; currencyCode: string } } | null;
          fulfillments?: Array<{ trackingInfo?: Array<{ number?: string | null }> }>;
        }>;
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || body.errors?.length || !body.data?.shop || !body.data.orders) {
    throw new Error(body.errors?.map((error) => error.message).join("; ") || "Unable to retrieve Shopify snapshot.");
  }

  const shop = body.data.shop;
  const orders = body.data.orders.nodes;
  const merchant = await prisma.merchant.upsert({
    where: { shop: shop.myshopifyDomain },
    create: { shop: shop.myshopifyDomain, shopName: shop.name },
    update: { shopName: shop.name },
    select: { id: true },
  });

  const persistable = orders.flatMap((order) => {
    const money = order.totalShippingPriceSet?.shopMoney;
    if (!money) return [];
    const parsed = parseMoney(money.amount, money.currencyCode);
    const trackingNumbers = [...new Set((order.fulfillments ?? [])
      .flatMap((fulfillment) => fulfillment.trackingInfo ?? [])
      .map((tracking) => tracking.number?.trim() ?? "")
      .filter(Boolean))];
    const orderedAt = new Date(order.createdAt);
    if (Number.isNaN(orderedAt.getTime())) throw new Error("Shopify returned an invalid order timestamp.");
    const subtotal = order.currentSubtotalPriceSet?.shopMoney;
    const subtotalMinor = subtotal && subtotal.currencyCode === money.currencyCode
      ? parseMoney(subtotal.amount, subtotal.currencyCode).minor
      : null;
    return [{ order, money, parsed, subtotalMinor, trackingNumbers, orderedAt }];
  });

  await prisma.$transaction(persistable.map(({ order, money, parsed, subtotalMinor, trackingNumbers, orderedAt }) =>
    prisma.shippingOrder.upsert({
      where: { merchantId_sourceOrderId: { merchantId: merchant.id, sourceOrderId: order.id } },
      create: {
        merchantId: merchant.id,
        sourceOrderId: order.id,
        orderName: order.name,
        orderedAt,
        currency: money.currencyCode,
        shippingRevenueMinor: parsed.minor,
        subtotalMinor,
        trackingNumbers,
      },
      update: {
        orderName: order.name,
        orderedAt,
        currency: money.currencyCode,
        shippingRevenueMinor: parsed.minor,
        subtotalMinor,
        trackingNumbers,
      },
    }),
  ));

  const currencies = new Set(persistable.map((entry) => entry.money.currencyCode));
  const currency = currencies.size === 1 ? [...currencies][0]! : null;
  const shippingRevenueMinor = currency
    ? persistable.reduce((sum, entry) => sum + entry.parsed.minor, 0n)
    : 0n;

  return {
    shopName: shop.name,
    shopDomain: shop.myshopifyDomain,
    sampledOrders: persistable.length,
    persistedOrders: persistable.length,
    shippingRevenueMinor,
    currency,
    mixedCurrencies: currencies.size > 1,
    sampleWindowStart: orders.at(-1)?.createdAt ?? null,
  };
}
