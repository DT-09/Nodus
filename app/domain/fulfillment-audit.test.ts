import { describe, expect, it } from "vitest";
import { auditFulfillmentInvoice, type AuditInvoiceLine, type AuditRate } from "./fulfillment-audit";

const rates: AuditRate[] = [
  { chargeCode: "PICK_FIRST", unit: "ORDER", currency: "USD", rateMinor: 250n, effectiveFrom: "2026-01-01" },
  { chargeCode: "STORAGE_PALLET_DAY", unit: "PALLET_DAY", currency: "USD", rateMinor: 35n, effectiveFrom: "2026-01-01" },
];

function line(overrides: Partial<AuditInvoiceLine> = {}): AuditInvoiceLine {
  return {
    invoiceId: "INV-100",
    chargeId: "LINE-1",
    serviceDate: "2026-10-01",
    chargeCode: "PICK_FIRST",
    unit: "ORDER",
    quantity: "10",
    currency: "USD",
    amountMinor: 2500n,
    billedUnitRateMinor: 250n,
    ...overrides,
  };
}

describe("auditFulfillmentInvoice", () => {
  it("recalculates a line at the effective contracted rate", () => {
    const result = auditFulfillmentInvoice([line()], rates);
    expect(result.summary.rateMatchedLines).toBe(1);
    expect(result.summary.linesNeedingReview).toBe(0);
    expect(result.lines[0]?.expectedMinor).toBe("2500");
    expect(result.lines[0]?.varianceMinor).toBe("0");
    expect(result.findings).toHaveLength(0);
  });

  it("flags a billed unit rate and line amount above the rate card", () => {
    const result = auditFulfillmentInvoice([
      line({ amountMinor: 3000n, billedUnitRateMinor: 300n }),
    ], rates);
    expect(result.findings.map(item => item.code)).toEqual([
      "billed_rate_variance",
      "line_amount_variance",
    ]);
    expect(result.summary.positiveVariancesMinor.USD).toBe("500");
  });

  it("keeps unknown charge codes as unmapped review items", () => {
    const result = auditFulfillmentInvoice([
      line({ chargeCode: "MYSTERY_FEE", amountMinor: 9900n }),
    ], rates);
    expect(result.findings[0]?.code).toBe("unknown_charge_code");
    expect(result.lines[0]?.expectedMinor).toBeNull();
  });

  it("uses the rate version effective on the service date", () => {
    const versioned: AuditRate[] = [
      { chargeCode: "PICK_FIRST", unit: "ORDER", currency: "USD", rateMinor: 200n, effectiveFrom: "2026-01-01", effectiveTo: "2026-06-30" },
      { chargeCode: "PICK_FIRST", unit: "ORDER", currency: "USD", rateMinor: 250n, effectiveFrom: "2026-07-01" },
    ];
    const result = auditFulfillmentInvoice([
      line({ serviceDate: "2026-05-01", amountMinor: 2000n, billedUnitRateMinor: 200n }),
      line({ chargeId: "LINE-2", serviceDate: "2026-10-01", amountMinor: 2500n, billedUnitRateMinor: 250n }),
    ], versioned);
    expect(result.summary.linesNeedingReview).toBe(0);
    expect(result.lines.map(item => item.expectedMinor)).toEqual(["2000", "2500"]);
  });

  it("does not compare unlike currencies or units", () => {
    const result = auditFulfillmentInvoice([
      line({ currency: "EUR" }),
      line({ chargeId: "LINE-2", unit: "PALLET" }),
    ], rates);
    expect(result.findings.map(item => item.code)).toEqual([
      "currency_mismatch",
      "unit_mismatch",
    ]);
    expect(result.lines.every(item => item.expectedMinor === null)).toBe(true);
  });

  it("flags repeated invoice charge identifiers", () => {
    const result = auditFulfillmentInvoice([
      line(),
      line(),
    ], rates);
    expect(result.findings.filter(item => item.code === "duplicate_charge_id")).toHaveLength(1);
  });

  it("rounds fractional quantities using integer arithmetic", () => {
    const result = auditFulfillmentInvoice([
      line({ quantity: "1.5000", amountMinor: 375n }),
    ], rates);
    expect(result.lines[0]?.expectedMinor).toBe("375");
    expect(result.findings).toHaveLength(0);
  });

  it("rejects invalid dates and duplicate rate-card versions", () => {
    expect(() => auditFulfillmentInvoice([line({ serviceDate: "2026-02-30" })], rates)).toThrow();
    expect(() => auditFulfillmentInvoice([line()], [...rates, rates[0]!])).toThrow();
  });
});
