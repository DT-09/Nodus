import { describe, expect, it } from "vitest";
import { simulateHistoricalShippingContribution } from "./simulation";
import type { Money } from "./money";

const usd = (minor: number): Money => ({ minor: BigInt(minor), currency: "USD" });

describe("simulateHistoricalShippingContribution", () => {
  it("compares observed and replayed shipping contribution using only complete, tax-exclusive evidence", () => {
    const result = simulateHistoricalShippingContribution([
      { orderId: "A", subtotal: usd(10_000), shippingCollected: usd(800), evidencedCost: usd(500), coverage: "complete", taxesIncluded: false },
      { orderId: "B", subtotal: usd(5_000), shippingCollected: usd(400), evidencedCost: usd(300), coverage: "complete", taxesIncluded: false },
      { orderId: "C", subtotal: usd(9_000), shippingCollected: usd(600), evidencedCost: usd(450), coverage: "partial", taxesIncluded: false },
      { orderId: "D", subtotal: usd(2_000), shippingCollected: usd(500), evidencedCost: usd(200), coverage: "complete", taxesIncluded: true },
      { orderId: "E", subtotal: null, shippingCollected: usd(500), evidencedCost: usd(200), coverage: "complete", taxesIncluded: false },
    ], { flatRate: usd(600), freeShippingThreshold: usd(8_000) });

    expect(result.sampleSize).toBe(2);
    expect(result.eligibleOrderCount).toBe(2);
    expect(result.excludedOrderCount).toBe(3);
    expect(result.excludedCoverageCount).toBe(1);
    expect(result.excludedTaxInclusiveCount).toBe(1);
    expect(result.excludedMissingSubtotalCount).toBe(1);
    expect(result.coverageRate).toBe(0.4);
    expect(result.observedShippingRevenueMinor).toBe("1200");
    expect(result.evidencedShippingCostMinor).toBe("800");
    expect(result.observedShippingContributionMinor).toBe("400");
    expect(result.replayedShippingRevenueMinor).toBe("600");
    expect(result.replayedShippingContributionMinor).toBe("-200");
    expect(result.contributionDeltaMinor).toBe("-600");
  });

  it("rejects a mixed-currency policy basket", () => {
    expect(() => simulateHistoricalShippingContribution([
      { orderId: "A", subtotal: usd(10_000), shippingCollected: usd(800), evidencedCost: { minor: 500n, currency: "EUR" }, coverage: "complete", taxesIncluded: false },
    ], { flatRate: usd(600) })).toThrow("Carrier-cost currency mismatch.");
  });

  it("refuses a replay when no order has complete eligible evidence", () => {
    expect(() => simulateHistoricalShippingContribution([
      { orderId: "A", subtotal: usd(10_000), shippingCollected: usd(800), evidencedCost: null, coverage: "none", taxesIncluded: false },
      { orderId: "B", subtotal: usd(5_000), shippingCollected: usd(400), evidencedCost: usd(300), coverage: "partial", taxesIncluded: false },
    ], { flatRate: usd(600) })).toThrow("No eligible orders.");
  });

  it("rejects negative policy rates", () => {
    expect(() => simulateHistoricalShippingContribution([
      { orderId: "A", subtotal: usd(10_000), shippingCollected: usd(800), evidencedCost: usd(500), coverage: "complete", taxesIncluded: false },
    ], { flatRate: usd(-1) })).toThrow("Flat shipping rate cannot be negative.");
  });

  it("rejects duplicate order IDs", () => {
    const basket = { orderId: "A", subtotal: usd(10_000), shippingCollected: usd(800), evidencedCost: usd(500), coverage: "complete" as const, taxesIncluded: false };
    expect(() => simulateHistoricalShippingContribution([basket, basket], { flatRate: usd(600) })).toThrow("Order IDs must be unique.");
  });
});
