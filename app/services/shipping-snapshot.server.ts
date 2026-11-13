import { parseMoney } from "../domain/money";
import { prisma } from "../db.server";

type AdminGraphqlContext = { graphql(query: string, options?: { variables?: Record<string, unknown> }): Promise<Response> };
const INITIAL_QUERY = `query NodusInitialShippingSnapshot($after: String) {
  shop { name myshopifyDomain }
  orders(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
    nodes {
      id name createdAt
      totalShippingPriceSet { shopMoney { amount currencyCode } }
      currentSubtotalPriceSet { shopMoney { amount currencyCode } }
      fulfillments(first: 10) { nodes { trackingInfo { number } } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
const INCREMENTAL_QUERY = `query NodusIncrementalShippingSnapshot($after: String, $updatedSince: String) {
  shop { name myshopifyDomain }
  orders(first: 100, after: $after, query: $updatedSince, sortKey: UPDATED_AT, reverse: true) {
    nodes {
      id name createdAt
      totalShippingPriceSet { shopMoney { amount currencyCode } }
      currentSubtotalPriceSet { shopMoney { amount currencyCode } }
      fulfillments(first: 10) { nodes { trackingInfo { number } } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;
type ShopifyOrder = {
  id: string;
  name: string;
  createdAt: string;
  totalShippingPriceSet?: { shopMoney?: { amount: string; currencyCode: string } } | null;
  currentSubtotalPriceSet?: { shopMoney?: { amount: string; currencyCode: string } } | null;
  fulfillments?: { nodes: Array<{ trackingInfo?: Array<{ number?: string | null }> }> };
};
type ShopifyPage = {
  data?: {
    shop?: { name: string; myshopifyDomain: string };
    orders?: { nodes: ShopifyOrder[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
  };
  errors?: Array<{ message: string }>;
};
export type ShippingSnapshot = {
  shopName: string;
  shopDomain: string;
  sampledOrders: number;
  persistedOrders: number;
  shippingRevenueMinor: bigint;
  currency: string | null;
  mixedCurrencies: boolean;
  sampleWindowStart: string | null;
  paginationComplete: boolean;
  pagesThisRun: number;
  totalPagesProcessed: number;
  lastCompletedAt: string | null;
};

export async function getShippingSnapshot(admin: AdminGraphqlContext): Promise<ShippingSnapshot> {
  const identityResponse = await admin.graphql(`query NodusShopIdentity { shop { name myshopifyDomain } }`);
  const identityBody = await identityResponse.json() as { data?: { shop?: { name: string; myshopifyDomain: string } }; errors?: Array<{ message: string }> };
  if (!identityResponse.ok || identityBody.errors?.length || !identityBody.data?.shop) {
    throw new Error(identityBody.errors?.map((error) => error.message).join("; ") || "Unable to retrieve Shopify merchant identity.");
  }
  const shop = identityBody.data.shop;
  const merchant = await prisma.merchant.upsert({
    where: { shop: shop.myshopifyDomain },
    create: { shop: shop.myshopifyDomain, shopName: shop.name },
    update: { shopName: shop.name, uninstalledAt: null },
    select: { id: true },
  });

  const previous = await prisma.shopifySyncState.findUnique({ where: { merchantId: merchant.id } });
  const continuing = Boolean(previous?.hasMore && previous.afterCursor);
  let cursor: string | null = continuing ? previous!.afterCursor : null;
  const updatedSince = previous?.lastCompletedAt
    ? `updated_at:>=${new Date(previous.lastCompletedAt.getTime() - 120_000).toISOString()}`
    : null;
  let pagesThisRun = 0;
  let hasNextPage = true;
  const MAX_PAGES_PER_REQUEST = 25;

  if (!continuing) {
    await prisma.shopifySyncState.upsert({
      where: { merchantId: merchant.id },
      create: { merchantId: merchant.id, pagesProcessed: 0, ordersProcessed: 0, hasMore: true },
      update: { afterCursor: null, pagesProcessed: 0, ordersProcessed: 0, hasMore: true, lastError: null },
    });
  }

  try {
    while (pagesThisRun < MAX_PAGES_PER_REQUEST && hasNextPage) {
      const response = previous?.lastCompletedAt
        ? await admin.graphql(INCREMENTAL_QUERY, { variables: { after: cursor, updatedSince } })
        : await admin.graphql(INITIAL_QUERY, { variables: { after: cursor } });
      const body = await response.json() as ShopifyPage;
      if (!response.ok || body.errors?.length || !body.data?.orders) {
        throw new Error(body.errors?.map((error) => error.message).join("; ") || "Unable to retrieve Shopify orders.");
      }

      const page = body.data.orders;
      const rows = page.nodes.flatMap((order) => {
        const money = order.totalShippingPriceSet?.shopMoney;
        if (!money) return [];
        const parsed = parseMoney(money.amount, money.currencyCode);
        const trackingNumbers = [...new Set((order.fulfillments?.nodes ?? [])
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

      for (let start = 0; start < rows.length; start += 100) {
        const batch = rows.slice(start, start + 100);
        await prisma.$transaction(batch.map(({ order, money, parsed, subtotalMinor, trackingNumbers, orderedAt }) =>
          prisma.shippingOrder.upsert({
            where: { merchantId_sourceOrderId: { merchantId: merchant.id, sourceOrderId: order.id } },
            create: {
              merchantId: merchant.id, sourceOrderId: order.id, orderName: order.name, orderedAt,
              currency: money.currencyCode, shippingRevenueMinor: parsed.minor, subtotalMinor, trackingNumbers,
            },
            update: {
              orderName: order.name, orderedAt, currency: money.currencyCode,
              shippingRevenueMinor: parsed.minor, subtotalMinor, trackingNumbers,
            },
          }),
        ));
      }

      cursor = page.pageInfo.endCursor;
      hasNextPage = page.pageInfo.hasNextPage;
      if (hasNextPage && !cursor) throw new Error("Shopify pagination returned no continuation cursor.");
      pagesThisRun += 1;
      await prisma.shopifySyncState.upsert({
        where: { merchantId: merchant.id },
        create: {
          merchantId: merchant.id, afterCursor: hasNextPage ? cursor : null, hasMore: hasNextPage,
          pagesProcessed: pagesThisRun, ordersProcessed: rows.length, lastPageAt: new Date(),
          ...(hasNextPage ? {} : { lastCompletedAt: new Date() }), lastError: null,
        },
        update: {
          afterCursor: hasNextPage ? cursor : null, hasMore: hasNextPage,
          pagesProcessed: { increment: 1 }, ordersProcessed: { increment: rows.length },
          lastPageAt: new Date(), ...(hasNextPage ? {} : { lastCompletedAt: new Date() }), lastError: null,
        },
      });
    }
  } catch (error) {
    await prisma.shopifySyncState.update({
      where: { merchantId: merchant.id },
      data: { lastError: error instanceof Error ? error.message.slice(0, 500) : "Shopify sync failed." },
    }).catch(() => undefined);
    throw error;
  }

  const [aggregates, syncState] = await Promise.all([
    prisma.shippingOrder.groupBy({
      by: ["currency"],
      where: { merchantId: merchant.id },
      _count: { _all: true },
      _sum: { shippingRevenueMinor: true },
      _min: { orderedAt: true },
    }),
    prisma.shopifySyncState.findUnique({ where: { merchantId: merchant.id } }),
  ]);
  const currency = aggregates.length === 1 ? aggregates[0]!.currency : null;
  const shippingRevenueMinor = currency ? aggregates[0]!._sum.shippingRevenueMinor ?? 0n : 0n;
  const persistedOrders = aggregates.reduce((sum, item) => sum + item._count._all, 0);
  const sampleWindowStart = aggregates
    .map((item) => item._min.orderedAt)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0]?.toISOString() ?? null;

  return {
    shopName: shop.name,
    shopDomain: shop.myshopifyDomain,
    sampledOrders: persistedOrders,
    persistedOrders,
    shippingRevenueMinor,
    currency,
    mixedCurrencies: aggregates.length > 1,
    sampleWindowStart,
    paginationComplete: !syncState?.hasMore,
    pagesThisRun,
    totalPagesProcessed: syncState?.pagesProcessed ?? 0,
    lastCompletedAt: syncState?.lastCompletedAt?.toISOString() ?? null,
  };
}
