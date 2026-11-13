type AdminGraphqlContext = { graphql(query: string): Promise<Response> };

const SNAPSHOT_QUERY = "query NodusShippingSnapshot { shop { name myshopifyDomain } orders(first:100,sortKey:CREATED_AT,reverse:true) { nodes { createdAt totalShippingPriceSet { shopMoney { amount currencyCode } } } } }";

export type ShippingSnapshot = {
  shopName: string;
  shopDomain: string;
  sampledOrders: number;
  shippingRevenueMinor: bigint;
  currency: string | null;
  mixedCurrencies: boolean;
  sampleWindowStart: string | null;
};

function toMinorUnits(amount: string, currency: string): bigint {
  const zeroDecimal = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
  const precision = zeroDecimal.has(currency.toUpperCase()) ? 0 : 2;
  if (!/^-?\\d+(\\.\\d+)?$/.test(amount)) throw new Error("Invalid Shopify monetary amount.");
  const negative = amount.startsWith("-");
  const [whole, fraction = ""] = (negative ? amount.slice(1) : amount).split(".");
  const value = BigInt(whole) * (10n ** BigInt(precision)) + BigInt((fraction + "0".repeat(precision)).slice(0, precision) || "0");
  return negative ? -value : value;
}

export async function getShippingSnapshot(admin: AdminGraphqlContext): Promise<ShippingSnapshot> {
  const response = await admin.graphql(SNAPSHOT_QUERY);
  const body = await response.json() as {
    data?: {
      shop?: { name: string; myshopifyDomain: string };
      orders?: {
        nodes: Array<{
          createdAt: string;
          totalShippingPriceSet?: { shopMoney?: { amount: string; currencyCode: string } } | null;
        }>;
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || body.errors?.length || !body.data?.shop || !body.data.orders) {
    throw new Error(body.errors?.map((error) => error.message).join("; ") || "Unable to retrieve Shopify snapshot.");
  }

  const orders = body.data.orders.nodes;
  const currencies = new Set(orders.map((order) => order.totalShippingPriceSet?.shopMoney?.currencyCode).filter((value): value is string => Boolean(value)));
  const currency = currencies.size === 1 ? [...currencies][0] : null;
  const total = orders.reduce((sum, order) => {
    const money = order.totalShippingPriceSet?.shopMoney;
    if (!money || (currency && money.currencyCode !== currency)) return sum;
    return sum + toMinorUnits(money.amount, money.currencyCode);
  }, 0n);

  return {
    shopName: body.data.shop.name,
    shopDomain: body.data.shop.myshopifyDomain,
    sampledOrders: orders.length,
    shippingRevenueMinor: total,
    currency,
    mixedCurrencies: currencies.size > 1,
    sampleWindowStart: orders.at(-1)?.createdAt ?? null
  };
}
