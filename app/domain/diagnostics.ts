import type { ReconciliationRow } from "./reconcile";

export type Finding = Readonly<{
  ruleId: string;
  orderId: string;
  severity: "info" | "warning";
  title: string;
  explanation: string;
  evidenceIds: readonly string[];
  amountMinor: string;
  currency: string;
}>;

export function diagnoseReconciliation(rows: readonly ReconciliationRow[]): Finding[] {
  const out: Finding[] = [];
  for (const row of rows) {
    if (row.taxesIncluded) {
      out.push({
        ruleId: "shipping.tax_inclusive_charge.v1",
        orderId: row.orderId,
        severity: "warning",
        title: "Tax-inclusive shipping charge",
        explanation: "Shopify reports this shipping charge with tax included. NODUS withholds shipping contribution until the tax component can be separated reliably.",
        evidenceIds: row.evidenceIds,
        amountMinor: "0",
        currency: row.shippingRevenue.currency,
      });
    }
    if (row.coverage === "none") {
      out.push({
        ruleId: "shipping.cost_evidence_missing.v1",
        orderId: row.orderId,
        severity: "info",
        title: "Shipping cost evidence missing",
        explanation: "No cost record was matched. This is a coverage gap, not evidence of zero cost or a financial loss.",
        evidenceIds: [],
        amountMinor: "0",
        currency: row.shippingRevenue.currency,
      });
    } else if (row.coverage === "partial") {
      out.push({
        ruleId: "shipping.cost_coverage_partial.v1",
        orderId: row.orderId,
        severity: "warning",
        title: "Shipping cost coverage is partial",
        explanation: "Some evidence may be matched, but complete cost coverage has not been attested. Shipping contribution is withheld until the merchant reviews all applicable carrier, label and 3PL costs.",
        evidenceIds: row.evidenceIds,
        amountMinor: "0",
        currency: row.shippingRevenue.currency,
      });
    } else if (row.coverage === "complete" && row.shippingContributionBeforeUnobservedCosts && row.shippingContributionBeforeUnobservedCosts.minor < 0n) {
      const contribution = row.shippingContributionBeforeUnobservedCosts;
      out.push({
        ruleId: "shipping.under_recovery_evidenced.v1",
        orderId: row.orderId,
        severity: "warning",
        title: "Evidenced shipping cost exceeds shipping collected",
        explanation: "Cost coverage is marked complete and matched cost exceeds the shipping charge. This excludes cost categories absent from the evidence.",
        evidenceIds: row.evidenceIds,
        amountMinor: (-contribution.minor).toString(),
        currency: contribution.currency,
      });
    }
  }
  return out;
}
