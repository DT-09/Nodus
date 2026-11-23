import { json, merchantSession, type PagesContext } from "../../_lib/shopify";

type Order = {
  order_gid: string;
  order_name: string;
  ordered_at: string;
  currency: string;
  shipping_amount: string;
  taxes_included: number;
};
type Cost = {
  source_record_id: string;
  invoice_id: string;
  order_reference: string | null;
  currency: string;
  amount: string;
  cost_type: string;
  occurred_at: string | null;
};

function units(value: string): bigint | null {
  if (!/^-?\d+(?:\.\d{1,4})?$/.test(value)) return null;
  const negative = value.startsWith("-");
  const raw = negative ? value.slice(1) : value;
  const [whole, fraction = ""] = raw.split(".");
  const amount = BigInt(whole!) * 10000n + BigInt((fraction + "0000").slice(0, 4));
  return negative ? -amount : amount;
}
function decimal(value: bigint): string {
  const negative = value < 0n ? "-" : "";
  const amount = value < 0n ? -value : value;
  const whole = amount / 10000n;
  const fraction = (amount % 10000n).toString().padStart(4, "0").replace(/0+$/, "");
  return negative + whole.toString() + (fraction ? "." + fraction : "");
}

export async function onRequestGet({ request, env }: PagesContext) {
  const merchant = await merchantSession(request, env);
  if (!merchant) return json({ error: "Connect a Shopify store first." }, 401);

  const [orderResult, costResult] = await Promise.all([
    env.NODUS_DB.prepare(
      "SELECT order_gid,order_name,ordered_at,currency,shipping_amount,taxes_included FROM shopify_orders WHERE shop=? ORDER BY ordered_at DESC LIMIT 5001",
    ).bind(merchant.shop).all<Order>(),
    env.NODUS_DB.prepare(
      "SELECT source_record_id,invoice_id,order_reference,currency,amount,cost_type,occurred_at FROM shopify_costs WHERE shop=? ORDER BY imported_at DESC LIMIT 5001",
    ).bind(merchant.shop).all<Cost>(),
  ]);

  const truncated = orderResult.results.length > 5000 || costResult.results.length > 5000;
  const orders = orderResult.results.slice(0, 5000);
  const costs = costResult.results.slice(0, 5000);

  // A reference that points to more than one Shopify order is ambiguous.
  // Never let insertion order silently decide which merchant record receives a charge.
  const referenceOwners = new Map<string, Set<string>>();
  for (const order of orders) {
    for (const reference of [order.order_name, order.order_gid]) {
      const normalized = reference.trim();
      if (!normalized) continue;
      const owners = referenceOwners.get(normalized) ?? new Set<string>();
      owners.add(order.order_gid);
      referenceOwners.set(normalized, owners);
    }
  }

  const sums = new Map<string, bigint>();
  const matchedCounts = new Map<string, number>();
  const unmatched: Array<{
    invoice: string;
    charge: string;
    reference: string | null;
    amount: string;
    currency: string;
    reason: string;
  }> = [];
  let matchedCostRows = 0;

  for (const cost of costs) {
    const reference = cost.order_reference?.trim() ?? "";
    const owners = reference ? referenceOwners.get(reference) : undefined;
    if (!reference) {
      unmatched.push({
        invoice: cost.invoice_id, charge: cost.source_record_id, reference: null,
        amount: cost.amount, currency: cost.currency,
        reason: "No order reference supplied. Tracking-only matching is not enabled in this Shopify connection.",
      });
      continue;
    }
    if (!owners?.size) {
      unmatched.push({
        invoice: cost.invoice_id, charge: cost.source_record_id, reference,
        amount: cost.amount, currency: cost.currency, reason: "No exact Shopify order name or ID match.",
      });
      continue;
    }
    if (owners.size !== 1) {
      unmatched.push({
        invoice: cost.invoice_id, charge: cost.source_record_id, reference,
        amount: cost.amount, currency: cost.currency, reason: "Order reference maps to multiple Shopify orders; manual review required.",
      });
      continue;
    }

    const orderId = [...owners][0]!;
    const order = orders.find((candidate) => candidate.order_gid === orderId)!;
    if (order.currency !== cost.currency) {
      unmatched.push({
        invoice: cost.invoice_id, charge: cost.source_record_id, reference,
        amount: cost.amount, currency: cost.currency,
        reason: `Currency mismatch: order is ${order.currency}.`,
      });
      continue;
    }

    const amount = units(cost.amount);
    if (amount === null) {
      unmatched.push({
        invoice: cost.invoice_id, charge: cost.source_record_id, reference,
        amount: cost.amount, currency: cost.currency, reason: "Amount is not a supported decimal value.",
      });
      continue;
    }

    sums.set(orderId, (sums.get(orderId) ?? 0n) + amount);
    matchedCounts.set(orderId, (matchedCounts.get(orderId) ?? 0) + 1);
    matchedCostRows += 1;
  }

  const grouped = new Map<string, {
    orders: number;
    shipping: bigint;
    matchedOrders: number;
    matchedCost: bigint;
    costRows: number;
  }>();
  for (const order of orders) {
    const group = grouped.get(order.currency) ?? {
      orders: 0, shipping: 0n, matchedOrders: 0, matchedCost: 0n, costRows: 0,
    };
    const revenue = units(order.shipping_amount);
    group.orders += 1;
    if (revenue !== null) group.shipping += revenue;
    const matched = sums.get(order.order_gid);
    if (matched !== undefined) {
      group.matchedOrders += 1;
      group.matchedCost += matched;
      group.costRows += matchedCounts.get(order.order_gid) ?? 0;
    }
    grouped.set(order.currency, group);
  }

  const summary = [...grouped.entries()].map(([currency, group]) => ({
    currency,
    orders: group.orders,
    shippingRevenue: decimal(group.shipping),
    ordersWithMatchedCost: group.matchedOrders,
    matchedCost: decimal(group.matchedCost),
    matchedCostRows: group.costRows,
  }));
  const recent = orders.map((order) => ({
    order: order.order_name,
    date: order.ordered_at,
    currency: order.currency,
    shippingRevenue: order.shipping_amount,
    taxesIncluded: Boolean(order.taxes_included),
    matchedCost: sums.has(order.order_gid) ? decimal(sums.get(order.order_gid)!) : null,
    evidenceRows: matchedCounts.get(order.order_gid) ?? 0,
  }));

  return json({
    ok: true,
    shop: merchant.shop,
    summary,
    orderCount: orders.length,
    costCount: costs.length,
    matchedCostRows,
    unmatchedCostRows: unmatched.length,
    unmatched,
    orders: recent,
    truncated,
    matchingRule: "Exact unique Shopify order name or order ID plus identical ISO currency. Ambiguous references are excluded. Tracking-only matching is not enabled because Shopify fulfillment tracking data is not currently stored by this connection.",
    limitations: [
      "A matched charge is evidence, not proof that all costs are present.",
      "Unmatched, ambiguous and currency-mismatched charges remain excluded from order-level matched cost.",
      "No shared-cost allocation, profit calculation, savings claim or carrier recovery estimate is produced.",
      "Only the first 5,000 stored orders and charges are included in this response.",
      "Tracking-only matching is not performed until fulfillment tracking data is collected with the required Shopify permissions.",
    ],
  });
}
