import type { Money } from "./money";

const QUANTITY_SCALE = 1_000n;

export type ThreePLRateRule = Readonly<{
  id: string;
  chargeCode: string;
  unit: string;
  pricing: "per_unit" | "fixed";
  rate: Money;
  effectiveFrom: string;
  effectiveTo?: string | null;
  sourceRow?: number;
}>;

export type ThreePLInvoiceLine = Readonly<{
  id: string;
  invoiceId: string;
  chargeCode: string;
  billedAt: string;
  quantity: string;
  unit: string;
  amount: Money;
  activityReference?: string | null;
}>;

export type ThreePLActivityRecord = Readonly<{
  id: string;
  reference: string;
  chargeCode: string;
  quantity: string;
  unit: string;
}>;

export type ThreePLFinding = Readonly<{
  code:
    | "contract_rate_variance"
    | "billed_quantity_exceeds_activity"
    | "billed_quantity_below_activity"
    | "activity_evidence_ambiguous"
    | "activity_unit_mismatch"
    | "unpriced_charge"
    | "contract_rule_ambiguous";
  severity: "info" | "warning";
  state: "calculated_variance" | "needs_review";
  invoiceId: string;
  invoiceLineId: string;
  contractRuleId?: string;
  expectedMinor?: string;
  actualMinor?: string;
  varianceMinor?: string;
  currency: string;
  explanation: string;
  evidenceReferences: readonly string[];
}>;

export type ThreePLLineResult = Readonly<{
  invoiceId: string;
  invoiceLineId: string;
  state: "matched" | "needs_review" | "unpriced";
  contractRuleId?: string;
  expectedMinor?: string;
  actualMinor: string;
  varianceMinor?: string;
  currency: string;
  billedQuantity: string;
  activityQuantity?: string;
  findings: readonly ThreePLFinding[];
}>;

export type ThreePLReconciliation = Readonly<{
  lines: readonly ThreePLLineResult[];
  findings: readonly ThreePLFinding[];
  summary: Readonly<{
    invoiceLines: number;
    matchedLines: number;
    needsReviewLines: number;
    unpricedLines: number;
    calculatedVarianceMinorByCurrency: Readonly<Record<string, string>>;
  }>;
}>;

function normalized(value: string): string {
  return value.trim().toUpperCase();
}

function exactReference(value: string): string {
  return value.trim();
}

function validDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Dates must use YYYY-MM-DD.");
  const time = Date.parse(value + "T00:00:00.000Z");
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid calendar date.");
  }
  return time;
}

function quantityMilli(value: string): bigint {
  const text = value.trim();
  if (!/^\d+(\.\d{1,3})?$/.test(text)) throw new Error("Quantity must be a non-negative decimal with at most three places.");
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole) * QUANTITY_SCALE + BigInt((fraction + "000").slice(0, 3));
}

function formatQuantity(value: bigint): string {
  const whole = value / QUANTITY_SCALE;
  const fraction = (value % QUANTITY_SCALE).toString().padStart(3, "0").replace(/0+$/, "");
  return fraction ? whole.toString() + "." + fraction : whole.toString();
}

function roundRatio(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error("Invalid quantity denominator.");
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

function uniqueById<T extends { id: string }>(items: readonly T[], label: string): void {
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || ids.has(item.id)) throw new Error(label + " IDs must be present and unique.");
    ids.add(item.id);
  }
}

/**
 * Deterministic 3PL invoice review.
 *
 * It compares invoice lines only with a single effective contract rule.
 * Billed quantities are compared with activity records only on an exact,
 * explicitly supplied activity reference. Missing activity evidence is not
 * interpreted as zero and never creates a quantity-overbilling finding.
 */
export function reconcileThreePLInvoices(input: Readonly<{
  rules: readonly ThreePLRateRule[];
  invoiceLines: readonly ThreePLInvoiceLine[];
  activity: readonly ThreePLActivityRecord[];
}>): ThreePLReconciliation {
  const { rules, invoiceLines, activity } = input;
  uniqueById(rules, "Contract rule");
  uniqueById(invoiceLines, "Invoice line");
  uniqueById(activity, "Activity record");

  const validatedRules = rules.map(rule => {
    if (!rule.id.trim() || !rule.chargeCode.trim() || !rule.unit.trim()) throw new Error("Contract rules require an ID, charge code and unit.");
    if (rule.rate.minor < 0n) throw new Error("Contract rates cannot be negative.");
    const from = validDate(rule.effectiveFrom);
    const to = rule.effectiveTo ? validDate(rule.effectiveTo) : Number.POSITIVE_INFINITY;
    if (to < from) throw new Error("Contract rule effectiveTo cannot precede effectiveFrom.");
    return { rule, from, to };
  });

  const activityByReference = new Map<string, ThreePLActivityRecord[]>();
  for (const record of activity) {
    if (!record.reference.trim() || !record.chargeCode.trim() || !record.unit.trim()) {
      throw new Error("Activity records require a reference, charge code and unit.");
    }
    quantityMilli(record.quantity);
    const key = exactReference(record.reference) + "|" + normalized(record.chargeCode);
    activityByReference.set(key, [...(activityByReference.get(key) ?? []), record]);
  }

  const lines: ThreePLLineResult[] = [];
  const allFindings: ThreePLFinding[] = [];
  const varianceByCurrency: Record<string, bigint> = {};

  for (const line of invoiceLines) {
    if (!line.invoiceId.trim() || !line.chargeCode.trim() || !line.unit.trim()) {
      throw new Error("Invoice lines require an invoice ID, charge code and unit.");
    }
    if (line.amount.minor < 0n) throw new Error("Invoice line amounts cannot be negative.");
    const billedQty = quantityMilli(line.quantity);
    const date = validDate(line.billedAt);
    const matchingRules = validatedRules.filter(item =>
      normalized(item.rule.chargeCode) === normalized(line.chargeCode) &&
      date >= item.from && date <= item.to
    );
    const findings: ThreePLFinding[] = [];
    const base = {
      invoiceId: line.invoiceId,
      invoiceLineId: line.id,
      currency: line.amount.currency,
      actualMinor: line.amount.minor.toString(),
    };

    if (matchingRules.length === 0) {
      findings.push({
        ...base,
        code: "unpriced_charge",
        severity: "warning",
        state: "needs_review",
        explanation: "No effective contract rule matches this charge code on the service date (or invoice date when no service date was supplied). The charge cannot be assessed against an agreed rate.",
        evidenceReferences: [`invoice:${line.invoiceId}:${line.id}`],
      });
      const result: ThreePLLineResult = {
        invoiceId: line.invoiceId, invoiceLineId: line.id, state: "unpriced",
        actualMinor: line.amount.minor.toString(), currency: line.amount.currency,
        billedQuantity: formatQuantity(billedQty), findings,
      };
      lines.push(result); allFindings.push(...findings); continue;
    }

    if (matchingRules.length > 1) {
      findings.push({
        ...base,
        code: "contract_rule_ambiguous",
        severity: "warning",
        state: "needs_review",
        explanation: "More than one contract rule is effective for this charge code and date. A human must resolve the contract version before calculating a variance.",
        evidenceReferences: [`invoice:${line.invoiceId}:${line.id}`, ...matchingRules.map(item => `contract-rule:${item.rule.id}:row:${item.rule.sourceRow ?? "unknown"}`)],
      });
      const result: ThreePLLineResult = {
        invoiceId: line.invoiceId, invoiceLineId: line.id, state: "needs_review",
        actualMinor: line.amount.minor.toString(), currency: line.amount.currency,
        billedQuantity: formatQuantity(billedQty), findings,
      };
      lines.push(result); allFindings.push(...findings); continue;
    }

    const rule = matchingRules[0]!.rule;
    const evidenceRefs = [`invoice:${line.invoiceId}:${line.id}`, `contract-rule:${rule.id}:row:${rule.sourceRow ?? "unknown"}`];
    if (rule.rate.currency !== line.amount.currency) {
      findings.push({
        ...base,
        contractRuleId: rule.id,
        code: "contract_rule_ambiguous",
        severity: "warning",
        state: "needs_review",
        explanation: "Invoice and contract rule use different currencies. NODUS does not convert currencies or calculate a variance without an approved exchange-rate source.",
        evidenceReferences: evidenceRefs,
      });
      const result: ThreePLLineResult = {
        invoiceId: line.invoiceId, invoiceLineId: line.id, state: "needs_review",
        contractRuleId: rule.id, actualMinor: line.amount.minor.toString(),
        currency: line.amount.currency, billedQuantity: formatQuantity(billedQty), findings,
      };
      lines.push(result); allFindings.push(...findings); continue;
    }

    if (normalized(rule.unit) !== normalized(line.unit)) {
      findings.push({
        ...base,
        contractRuleId: rule.id,
        code: "contract_rule_ambiguous",
        severity: "warning",
        state: "needs_review",
        explanation: "The invoice unit does not match the contract unit. NODUS will not compare rates across unlike units.",
        evidenceReferences: evidenceRefs,
      });
      const result: ThreePLLineResult = {
        invoiceId: line.invoiceId, invoiceLineId: line.id, state: "needs_review",
        contractRuleId: rule.id, actualMinor: line.amount.minor.toString(),
        currency: line.amount.currency, billedQuantity: formatQuantity(billedQty), findings,
      };
      lines.push(result); allFindings.push(...findings); continue;
    }

    const expected = rule.pricing === "fixed"
      ? rule.rate.minor
      : roundRatio(rule.rate.minor * billedQty, QUANTITY_SCALE);
    const variance = line.amount.minor - expected;
    if (variance !== 0n) {
      findings.push({
        ...base,
        contractRuleId: rule.id,
        code: "contract_rate_variance",
        severity: variance > 0n ? "warning" : "info",
        state: "calculated_variance",
        expectedMinor: expected.toString(),
        varianceMinor: variance.toString(),
        explanation: variance > 0n
          ? "The billed line amount exceeds the amount calculated from the effective contract rate and billed quantity. This is a calculated variance, not proof of an invalid invoice or recoverable credit."
          : "The billed line amount is below the amount calculated from the effective contract rate and billed quantity. Review the line and contract terms; this is not treated as a loss.",
        evidenceReferences: evidenceRefs,
      });
      varianceByCurrency[line.amount.currency] = (varianceByCurrency[line.amount.currency] ?? 0n) + variance;
    }

    let activityQuantity: bigint | undefined;
    if (line.activityReference?.trim()) {
      const key = exactReference(line.activityReference) + "|" + normalized(line.chargeCode);
      const records = activityByReference.get(key) ?? [];
      if (records.length > 1) {
        findings.push({
          ...base, contractRuleId: rule.id, code: "activity_evidence_ambiguous",
          severity: "warning", state: "needs_review",
          explanation: "Multiple activity records share the exact reference and charge code. Quantity cannot be independently verified.",
          evidenceReferences: [...evidenceRefs, ...records.map(record => `activity:${record.id}`)],
        });
      } else if (records.length === 1) {
        const record = records[0]!;
        if (normalized(record.unit) !== normalized(line.unit)) {
          findings.push({
            ...base, contractRuleId: rule.id, code: "activity_unit_mismatch",
            severity: "warning", state: "needs_review",
            explanation: "The activity record uses a different unit from the invoice line. Quantity cannot be compared.",
            evidenceReferences: [...evidenceRefs, `activity:${record.id}`],
          });
        } else {
          activityQuantity = quantityMilli(record.quantity);
          if (billedQty !== activityQuantity) {
            const billedAbove = billedQty > activityQuantity;
            findings.push({
              ...base, contractRuleId: rule.id,
              code: billedAbove ? "billed_quantity_exceeds_activity" : "billed_quantity_below_activity",
              severity: billedAbove ? "warning" : "info",
              state: "calculated_variance",
              explanation: billedAbove
                ? "The invoice quantity exceeds the quantity in the exact-reference operational activity record. Confirm that both records cover the same billable scope before disputing."
                : "The invoice quantity is below the quantity in the exact-reference operational activity record. Review the billing scope; no overcharge is implied.",
              evidenceReferences: [...evidenceRefs, `activity:${record.id}`],
            });
          }
        }
      }
    }

    const needsReview = findings.some(finding => finding.state === "needs_review");
    const result: ThreePLLineResult = {
      invoiceId: line.invoiceId, invoiceLineId: line.id,
      state: needsReview ? "needs_review" : "matched",
      contractRuleId: rule.id, expectedMinor: expected.toString(),
      actualMinor: line.amount.minor.toString(), varianceMinor: variance.toString(),
      currency: line.amount.currency, billedQuantity: formatQuantity(billedQty),
      ...(activityQuantity === undefined ? {} : { activityQuantity: formatQuantity(activityQuantity) }),
      findings,
    };
    lines.push(result); allFindings.push(...findings);
  }

  return {
    lines,
    findings: allFindings,
    summary: {
      invoiceLines: lines.length,
      matchedLines: lines.filter(line => line.state === "matched").length,
      needsReviewLines: lines.filter(line => line.state === "needs_review").length,
      unpricedLines: lines.filter(line => line.state === "unpriced").length,
      calculatedVarianceMinorByCurrency: Object.fromEntries(
        Object.entries(varianceByCurrency).map(([currency, amount]) => [currency, amount.toString()])
      ),
    },
  };
}
