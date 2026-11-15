import { describe, expect, it } from "vitest";
import { hasMaterialShippingSourceChange } from "./shipping-order-source";

const baseline = {
  orderName: "#1001",
  currency: "USD",
  shippingRevenueMinor: 800n,
  taxesIncluded: false,
  subtotalMinor: 5_000n,
  trackingNumbers: ["TRACK-1"],
};

describe("hasMaterialShippingSourceChange", () => {
  it("preserves a review when a sync returns the same source state", () => {
    expect(hasMaterialShippingSourceChange(baseline, { ...baseline })).toBe(false);
  });

  it("preserves a review when tracking order or duplicate values change only in representation", () => {
    expect(hasMaterialShippingSourceChange(baseline, {
      ...baseline,
      trackingNumbers: [" TRACK-1 ", "TRACK-1"],
    })).toBe(false);
  });

  it.each([
    ["order reference", { ...baseline, orderName: "#1001-A" }],
    ["currency", { ...baseline, currency: "CAD" }],
    ["shipping amount", { ...baseline, shippingRevenueMinor: 900n }],
    ["tax treatment", { ...baseline, taxesIncluded: true }],
    ["subtotal", { ...baseline, subtotalMinor: 4_500n }],
    ["tracking number", { ...baseline, trackingNumbers: ["TRACK-2"] }],
  ])("invalidates coverage when %s changes", (_field, next) => {
    expect(hasMaterialShippingSourceChange(baseline, next)).toBe(true);
  });
});
