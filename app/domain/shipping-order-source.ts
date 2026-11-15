export type ShippingOrderSourceState = Readonly<{
  orderName: string;
  currency: string;
  shippingRevenueMinor: bigint;
  taxesIncluded: boolean;
  subtotalMinor: bigint | null;
  trackingNumbers: readonly string[];
}>;

function normalizedTracking(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

/**
 * Coverage is a merchant attestation about a particular order/fulfillment
 * state. If any field used for matching or contribution changes, the old
 * attestation no longer describes the current source record.
 */
export function hasMaterialShippingSourceChange(
  previous: ShippingOrderSourceState,
  next: ShippingOrderSourceState,
): boolean {
  return previous.orderName !== next.orderName
    || previous.currency !== next.currency
    || previous.shippingRevenueMinor !== next.shippingRevenueMinor
    || previous.taxesIncluded !== next.taxesIncluded
    || previous.subtotalMinor !== next.subtotalMinor
    || JSON.stringify(normalizedTracking(previous.trackingNumbers))
      !== JSON.stringify(normalizedTracking(next.trackingNumbers));
}
