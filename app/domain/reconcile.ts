import { addMoney, type Money } from "./money";

export type OrderInput = Readonly<{
  orderId: string;
  orderName?: string;
  shippingRevenue: Money;
  trackingNumbers: readonly string[];
  costCoverage: "complete" | "partial" | "unknown";
}>;
export type CostInput = Readonly<{
  evidenceId: string;
  amount: Money;
  orderReference?: string | null;
  trackingNumber?: string | null;
}>;
export type ReconciliationRow = Readonly<{
  orderId: string;
  shippingRevenue: Money;
  evidencedCost: Money | null;
  evidenceIds: readonly string[];
  coverage: "complete" | "partial" | "none";
  shippingContributionBeforeUnobservedCosts: Money | null;
}>;

export function reconcileShipping(orders: readonly OrderInput[], evidence: readonly CostInput[]): ReconciliationRow[] {
  const ids = new Set<string>();
  const referenceMap = new Map<string, string | null>();
  for (const order of orders) {
    if (!order.orderId || ids.has(order.orderId)) throw new Error("Order IDs must be unique.");
    ids.add(order.orderId);
    for (const reference of [order.orderId, order.orderName].filter((value): value is string => Boolean(value))) {
      const normalized = reference.trim();
      if (!normalized) continue;
      if (referenceMap.has(normalized) && referenceMap.get(normalized) !== order.orderId) referenceMap.set(normalized, null);
      else referenceMap.set(normalized, order.orderId);
    }
  }

  const evidenceIds = new Set<string>();
  for (const item of evidence) {
    if (!item.evidenceId || evidenceIds.has(item.evidenceId)) throw new Error("Evidence IDs must be unique.");
    evidenceIds.add(item.evidenceId);
  }

  const trackingOwners = new Map<string, Set<string>>();
  for (const order of orders) {
    for (const tracking of new Set(order.trackingNumbers.map((value) => value.trim()).filter(Boolean))) {
      const owners = trackingOwners.get(tracking) ?? new Set<string>();
      owners.add(order.orderId);
      trackingOwners.set(tracking, owners);
    }
  }

  const allocated = new Map<string, CostInput[]>();
  const currencyMismatchOrders = new Set<string>();
  for (const item of evidence) {
    let matchedOrderId: string | null = null;
    if (item.orderReference) {
      matchedOrderId = referenceMap.get(item.orderReference.trim()) ?? null;
    } else if (item.trackingNumber) {
      const owners = trackingOwners.get(item.trackingNumber.trim());
      if (owners?.size === 1) matchedOrderId = [...owners][0]!;
    }
    if (!matchedOrderId) continue;
    const order = orders.find((candidate) => candidate.orderId === matchedOrderId)!;
    if (order.shippingRevenue.currency !== item.amount.currency) {
      currencyMismatchOrders.add(matchedOrderId);
      continue;
    }
    allocated.set(matchedOrderId, [...(allocated.get(matchedOrderId) ?? []), item]);
  }

  return orders.map((order) => {
    const items = allocated.get(order.orderId) ?? [];
    if (!items.length && order.costCoverage !== "complete") {
      return {
        orderId: order.orderId,
        shippingRevenue: order.shippingRevenue,
        evidencedCost: null,
        evidenceIds: [],
        coverage: currencyMismatchOrders.has(order.orderId) ? "partial" as const : "none" as const,
        shippingContributionBeforeUnobservedCosts: null,
      };
    }
    const cost = items.reduce((sum, item) => addMoney(sum, item.amount), { minor: 0n, currency: order.shippingRevenue.currency });
    const coverage = order.costCoverage === "complete" && !currencyMismatchOrders.has(order.orderId)
      ? "complete" as const
      : "partial" as const;
    return {
      orderId: order.orderId,
      shippingRevenue: order.shippingRevenue,
      evidencedCost: cost,
      evidenceIds: items.map((item) => item.evidenceId),
      coverage,
      shippingContributionBeforeUnobservedCosts: coverage === "complete"
        ? { minor: order.shippingRevenue.minor - cost.minor, currency: cost.currency }
        : null,
    };
  });
}
