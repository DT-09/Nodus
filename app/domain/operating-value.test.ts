import { describe, expect, it } from "vitest";
import { parseMoney } from "./money";
import { calculateOperatingValue } from "./operating-value";

describe("measured operating value", () => {
  it("calculates time value from the saved minutes and merchant-approved hourly rate", () => {
    const result = calculateOperatingValue(60, 15, parseMoney("40", "USD"));
    expect(result.minutesSaved).toBe(45);
    expect(result.value).toEqual(parseMoney("30", "USD"));
  });

  it("preserves three-decimal currencies", () => {
    const result = calculateOperatingValue(30, 0, parseMoney("12.000", "KWD"));
    expect(result.value).toEqual(parseMoney("6.000", "KWD"));
  });

  it("rejects a baseline that does not exceed assisted time", () => {
    expect(() => calculateOperatingValue(20, 20, parseMoney("40", "USD"))).toThrow();
  });

  it("rejects invalid durations and non-positive labor rates", () => {
    expect(() => calculateOperatingValue(0, 0, parseMoney("40", "USD"))).toThrow();
    expect(() => calculateOperatingValue(30, 10, parseMoney("0", "USD"))).toThrow();
  });
});
