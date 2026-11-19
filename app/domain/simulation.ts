import type { Money } from "./money";

export type Basket = Readonly<{
  orderId: string;
  subtotal: Money;
  shippingCollected: Money;
}>;

export function simulateHistoricalShippingRevenue(
  baskets: readonly Basket[],
  policy: { flatRate: Money; freeShippingThreshold?: Money | null },
) {
  if (!baskets.length) throw new Error("At least one basket is required.");
  const currency = policy.flatRate.currency;
  if (policy.flatRate.minor < 0n) throw new Error("Flat shipping rate cannot be negative.");
  if (policy.freeShippingThreshold && policy.freeShippingThreshold.currency !== currency) {
    throw new Error("Policy currency mismatch.");
  }
  if (policy.freeShippingThreshold && policy.freeShippingThreshold.minor < 0n) {
    throw new Error("Free-shipping threshold cannot be negative.");
  }

  let observed = 0n;
  let replayed = 0n;
  for (const basket of baskets) {
    if (basket.subtotal.currency !== currency || basket.shippingCollected.currency !== currency) {
      throw new Error("Basket currency mismatch.");
    }
    observed += basket.shippingCollected.minor;
    replayed += policy.freeShippingThreshold && basket.subtotal.minor >= policy.freeShippingThreshold.minor
      ? 0n
      : policy.flatRate.minor;
  }

  return {
    sampleSize: baskets.length,
    currency,
    observedShippingRevenueMinor: observed.toString(),
    replayedShippingRevenueMinor: replayed.toString(),
    revenueDeltaMinor: (replayed - observed).toString(),
    assumptions: [
      "Historical baskets remain unchanged.",
      "Every sampled order remains placed.",
      "No conversion, abandonment or demand response is modelled.",
      "This compares shipping revenue only, not profit or shipping cost.",
      "The threshold comparison uses Shopify currentSubtotalPriceSet, which includes taxes and discounts and reflects returns/refunds; it is a historical proxy, not a verified reproduction of checkout rate conditions.",
    ],
    warning: "Historical replay, not a forecast. Not expected savings or conversion impact.",
  };
}

export type ContributionBasket = Readonly<{
  orderId: string;
  subtotal: Money | null;
  shippingCollected: Money;
  evidencedCost: Money | null;
  coverage: "complete" | "partial" | "none";
  taxesIncluded: boolean;
}>;

export type ContributionPolicy = Readonly<{
  flatRate: Money;
  freeShippingThreshold?: Money | null;
}>;

/**
 * Replays a proposed shipping policy against historical baskets, but only
 * includes orders whose carrier/3PL cost coverage was explicitly reviewed
 * as complete and whose shipping revenue is tax-exclusive.
 *
 * The historical carrier cost is held constant across scenarios. This is
 * a counterfactual comparison, not a forecast of fulfillment cost or profit.
 */
export function simulateHistoricalShippingContribution(
  baskets: readonly ContributionBasket[],
  policy: ContributionPolicy,
) {
  if (!baskets.length) throw new Error("At least one historical order is required.");
  const currency = policy.flatRate.currency;
  if (policy.flatRate.minor < 0n) throw new Error("Flat shipping rate cannot be negative.");
  if (policy.freeShippingThreshold && policy.freeShippingThreshold.currency !== currency) {
    throw new Error("Policy currency mismatch.");
  }
  if (policy.freeShippingThreshold && policy.freeShippingThreshold.minor < 0n) {
    throw new Error("Free-shipping threshold cannot be negative.");
  }

  const ids = new Set<string>();
  for (const basket of baskets) {
    if (!basket.orderId || ids.has(basket.orderId)) throw new Error("Order IDs must be unique.");
    ids.add(basket.orderId);
    if (basket.shippingCollected.currency !== currency) throw new Error("Basket currency mismatch.");
    if (basket.subtotal && basket.subtotal.currency !== currency) throw new Error("Basket currency mismatch.");
    if (basket.evidencedCost && basket.evidencedCost.currency !== currency) throw new Error("Carrier-cost currency mismatch.");
  }

  const eligible = baskets.filter((basket) =>
    basket.coverage === "complete" &&
    !basket.taxesIncluded &&
    basket.subtotal !== null &&
    basket.evidencedCost !== null,
  );
  const excludedCoverageCount = baskets.filter((basket) =>
    basket.coverage !== "complete" || basket.evidencedCost === null,
  ).length;
  const excludedTaxInclusiveCount = baskets.filter((basket) => basket.taxesIncluded).length;
  const excludedMissingSubtotalCount = baskets.filter((basket) => basket.subtotal === null).length;

  if (!eligible.length) {
    throw new Error("No eligible orders. Review complete carrier-cost coverage and use tax-exclusive orders with a recorded subtotal.");
  }

  let observedShippingRevenue = 0n;
  let replayedShippingRevenue = 0n;
  let evidencedShippingCost = 0n;

  for (const basket of eligible) {
    const subtotal = basket.subtotal!;
    const cost = basket.evidencedCost!;
    observedShippingRevenue += basket.shippingCollected.minor;
    evidencedShippingCost += cost.minor;
    replayedShippingRevenue += policy.freeShippingThreshold && subtotal.minor >= policy.freeShippingThreshold.minor
      ? 0n
      : policy.flatRate.minor;
  }

  const observedContribution = observedShippingRevenue - evidencedShippingCost;
  const replayedContribution = replayedShippingRevenue - evidencedShippingCost;
  const contributionDelta = replayedContribution - observedContribution;

  return {
    sampleSize: eligible.length,
    eligibleOrderCount: eligible.length,
    excludedOrderCount: baskets.length - eligible.length,
    excludedCoverageCount,
    excludedTaxInclusiveCount,
    excludedMissingSubtotalCount,
    coverageRate: eligible.length / baskets.length,
    currency,
    observedShippingRevenueMinor: observedShippingRevenue.toString(),
    replayedShippingRevenueMinor: replayedShippingRevenue.toString(),
    revenueDeltaMinor: (replayedShippingRevenue - observedShippingRevenue).toString(),
    evidencedShippingCostMinor: evidencedShippingCost.toString(),
    observedShippingContributionMinor: observedContribution.toString(),
    replayedShippingContributionMinor: replayedContribution.toString(),
    contributionDeltaMinor: contributionDelta.toString(),
    assumptions: [
      "Only merchant-reviewed complete-coverage orders with tax-exclusive shipping revenue and a recorded subtotal are included.",
      "Carrier and 3PL costs are held constant across policy scenarios; actual fulfillment costs may change with service, parcel, destination or carrier mix.",
      "The threshold comparison uses Shopify currentSubtotalPriceSet as a historical basket proxy, not a verified reproduction of checkout eligibility.",
      "The replay does not model conversion, demand, abandonment, tax, geographic rate selection, discounts or product margin.",
      "Shipping contribution is shipping revenue less imported carrier/3PL cost only. It is not total order profit or recovered cash.",
      "Excluded-order counts by reason may overlap.",
    ],
    warning: "Historical cost-adjusted shipping contribution replay, not a forecast. It does not predict demand, fulfillment-cost changes or profit.",
  };
}
