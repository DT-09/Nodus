/**
 * Deterministic 3PL invoice-to-rate-card audit.
 *
 * This engine verifies contractual unit rates and invoice arithmetic only.
 * It does not infer warehouse activity, prove that billed quantities occurred,
 * or label a variance as a recoverable overcharge.
 */
export type AuditRate = Readonly<{
  chargeCode: string;
  unit: string;
  currency: string;
  rateMinor: bigint;
  effectiveFrom: string;
  effectiveTo?: string | null;
}>;

export type AuditInvoiceLine = Readonly<{
  invoiceId: string;
  chargeId: string;
  serviceDate: string;
  chargeCode: string;
  unit: string;
  quantity: string;
  currency: string;
  amountMinor: bigint;
  billedUnitRateMinor?: bigint | null;
  orderReference?: string | null;
  sku?: string | null;
}>;

export type AuditFindingCode =
  | "duplicate_charge_id"
  | "unknown_charge_code"
  | "no_effective_rate"
  | "ambiguous_rate_version"
  | "currency_mismatch"
  | "unit_mismatch"
  | "billed_rate_variance"
  | "line_amount_variance";

export type AuditFinding = Readonly<{
  code: AuditFindingCode;
  severity: "warning" | "review";
  invoiceId: string;
  chargeId: string;
  chargeCode: string;
  title: string;
  explanation: string;
  billedMinor: string | null;
  expectedMinor: string | null;
  varianceMinor: string | null;
  currency: string;
}>;

export type AuditedLine = Readonly<{
  invoiceId: string;
  chargeId: string;
  chargeCode: string;
  currency: string;
  billedMinor: string;
  expectedMinor: string | null;
  varianceMinor: string | null;
  matchedRate: boolean;
  findings: readonly AuditFindingCode[];
}>;

export type FulfillmentAudit = Readonly<{
  lines: readonly AuditedLine[];
  findings: readonly AuditFinding[];
  summary: Readonly<{
    invoiceLines: number;
    rateMatchedLines: number;
    linesNeedingReview: number;
    billedTotalsMinor: Readonly<Record<string, string>>;
    expectedTotalsMinor: Readonly<Record<string, string>>;
    positiveVariancesMinor: Readonly<Record<string, string>>;
  }>;
}>;

const QUANTITY_SCALE = 10_000n;

function normalize(value: string): string {
  return value.trim().toUpperCase();
}

function assertDate(value: string, field: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(field + " must use YYYY-MM-DD.");
  }
  const parsed = new Date(value + "T00:00:00.000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(field + " is not a valid calendar date.");
  }
}

function parseQuantity(value: string): bigint {
  const raw = value.trim();
  if (!/^\d+(?:\.\d{1,4})?$/.test(raw)) {
    throw new Error("Quantity must be a non-negative decimal with up to four places.");
  }
  const [whole, fraction = ""] = raw.split(".");
  return BigInt(whole!) * QUANTITY_SCALE + BigInt((fraction + "0000").slice(0, 4));
}

function multiplyRate(rateMinor: bigint, quantity: bigint): bigint {
  const product = rateMinor * quantity;
  const negative = product < 0n;
  const absolute = negative ? -product : product;
  const rounded = (absolute + QUANTITY_SCALE / 2n) / QUANTITY_SCALE;
  return negative ? -rounded : rounded;
}

function pushFinding(
  findings: AuditFinding[],
  line: AuditInvoiceLine,
  code: AuditFindingCode,
  title: string,
  explanation: string,
  expectedMinor: bigint | null = null,
  varianceMinor: bigint | null = null,
): void {
  findings.push({
    code,
    severity: code === "unknown_charge_code" || code === "no_effective_rate" || code === "ambiguous_rate_version" ? "review" : "warning",
    invoiceId: line.invoiceId,
    chargeId: line.chargeId,
    chargeCode: line.chargeCode,
    title,
    explanation,
    billedMinor: line.amountMinor.toString(),
    expectedMinor: expectedMinor?.toString() ?? null,
    varianceMinor: varianceMinor?.toString() ?? null,
    currency: normalize(line.currency),
  });
}

export function auditFulfillmentInvoice(
  invoiceLines: readonly AuditInvoiceLine[],
  rateCard: readonly AuditRate[],
): FulfillmentAudit {
  const rateKeys = new Set<string>();
  for (const rate of rateCard) {
    const code = normalize(rate.chargeCode);
    const unit = normalize(rate.unit);
    const currency = normalize(rate.currency);
    if (!code || !unit || !/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Every rate-card row needs a charge code, unit and ISO currency.");
    }
    if (rate.rateMinor < 0n) {
      throw new Error("Rate-card rates cannot be negative.");
    }
    assertDate(rate.effectiveFrom, "Rate effectiveFrom");
    if (rate.effectiveTo) {
      assertDate(rate.effectiveTo, "Rate effectiveTo");
      if (rate.effectiveTo < rate.effectiveFrom) {
        throw new Error("Rate effectiveTo cannot precede effectiveFrom.");
      }
    }
    const key = [code, unit, currency, rate.effectiveFrom, rate.effectiveTo ?? ""].join("|");
    if (rateKeys.has(key)) throw new Error("Duplicate rate-card version: " + key);
    rateKeys.add(key);
  }

  const seenChargeIds = new Set<string>();
  const findings: AuditFinding[] = [];
  const lines: AuditedLine[] = [];
  const billedTotals = new Map<string, bigint>();
  const expectedTotals = new Map<string, bigint>();
  const positiveVariances = new Map<string, bigint>();
  let rateMatchedLines = 0;
  let linesNeedingReview = 0;

  for (const line of invoiceLines) {
    if (!line.invoiceId.trim() || !line.chargeId.trim() || !line.chargeCode.trim()) {
      throw new Error("Every invoice line needs invoiceId, chargeId and chargeCode.");
    }
    if (!/^[A-Z]{3}$/.test(normalize(line.currency))) {
      throw new Error("Invoice currency must be an ISO 4217 code.");
    }
    assertDate(line.serviceDate, "Invoice serviceDate");
    const quantity = parseQuantity(line.quantity);
    const currency = normalize(line.currency);
    const code = normalize(line.chargeCode);
    const unit = normalize(line.unit);
    const lineKey = line.invoiceId.trim() + "|" + line.chargeId.trim();
    const lineFindings: AuditFindingCode[] = [];
    billedTotals.set(currency, (billedTotals.get(currency) ?? 0n) + line.amountMinor);

    if (seenChargeIds.has(lineKey)) {
      pushFinding(
        findings, line, "duplicate_charge_id", "Repeated invoice charge identifier",
        "The same invoice and charge identifier appears more than once. Confirm whether this is a duplicate import or a legitimate repeated line before counting it twice.",
      );
      lineFindings.push("duplicate_charge_id");
    } else {
      seenChargeIds.add(lineKey);
    }

    const candidates = rateCard.filter(rate => normalize(rate.chargeCode) === code);
    if (!candidates.length) {
      pushFinding(
        findings, line, "unknown_charge_code", "Charge code is not in the rate card",
        "No contracted rate was supplied for this charge code. This is an unmapped item, not proof that the charge is invalid.",
      );
      lineFindings.push("unknown_charge_code");
    } else {
      const sameCurrency = candidates.filter(rate => normalize(rate.currency) === currency);
      if (!sameCurrency.length) {
        pushFinding(
          findings, line, "currency_mismatch", "Rate-card currency does not match invoice currency",
          "The invoice line and available rate-card entries use different currencies. NODUS will not convert currencies or compare unlike amounts.",
        );
        lineFindings.push("currency_mismatch");
      } else {
        const sameUnit = sameCurrency.filter(rate => normalize(rate.unit) === unit);
        if (!sameUnit.length) {
          pushFinding(
            findings, line, "unit_mismatch", "Billed unit does not match the contracted unit",
            "The invoice unit differs from the unit defined in the rate card. The expected charge cannot be calculated safely.",
          );
          lineFindings.push("unit_mismatch");
        } else {
          const active = sameUnit.filter(rate =>
            rate.effectiveFrom <= line.serviceDate &&
            (!rate.effectiveTo || line.serviceDate <= rate.effectiveTo),
          ).sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

          if (!active.length) {
            pushFinding(
              findings, line, "no_effective_rate", "No rate-card version covers this service date",
              "A rate exists for this charge code, currency and unit, but none is effective on the invoice service date.",
            );
            lineFindings.push("no_effective_rate");
          } else if (active.length > 1) {
            pushFinding(
              findings, line, "ambiguous_rate_version", "More than one rate-card version is effective",
              "Overlapping effective dates make the contracted rate ambiguous. Resolve the rate-card history before calculating a variance.",
            );
            lineFindings.push("ambiguous_rate_version");
          } else {
            const rate = active[0]!;
            const expected = multiplyRate(rate.rateMinor, quantity);
            const variance = line.amountMinor - expected;
            rateMatchedLines += 1;
            expectedTotals.set(currency, (expectedTotals.get(currency) ?? 0n) + expected);

            if (line.billedUnitRateMinor !== undefined && line.billedUnitRateMinor !== null &&
                line.billedUnitRateMinor !== rate.rateMinor) {
              const rateVariance = line.billedUnitRateMinor - rate.rateMinor;
              pushFinding(
                findings, line, "billed_rate_variance", "Billed unit rate differs from the contracted rate",
                "The billed unit rate does not equal the rate-card version effective on the service date. Verify amendments, negotiated exceptions and invoice coding.",
                expected, variance,
              );
              lineFindings.push("billed_rate_variance");
            }
            if (variance !== 0n) {
              pushFinding(
                findings, line, "line_amount_variance", "Invoice line total differs from the rate-card calculation",
                "The billed line amount differs from quantity multiplied by the effective contracted unit rate. Quantity itself has not been independently verified.",
                expected, variance,
              );
              lineFindings.push("line_amount_variance");
              if (variance > 0n) positiveVariances.set(currency, (positiveVariances.get(currency) ?? 0n) + variance);
            }
          }
        }
      }
    }

    if (lineFindings.length) linesNeedingReview += 1;
    const matched = lineFindings.every(codeItem =>
      codeItem !== "unknown_charge_code" &&
      codeItem !== "currency_mismatch" &&
      codeItem !== "unit_mismatch" &&
      codeItem !== "no_effective_rate" &&
      codeItem !== "ambiguous_rate_version",
    ) && candidates.length > 0;
    const expected = matched
      ? (() => {
          const active = candidates
            .filter(rate => normalize(rate.currency) === currency && normalize(rate.unit) === unit &&
              rate.effectiveFrom <= line.serviceDate && (!rate.effectiveTo || line.serviceDate <= rate.effectiveTo))
            .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
          return active.length === 1 ? multiplyRate(active[0]!.rateMinor, quantity) : null;
        })()
      : null;

    lines.push({
      invoiceId: line.invoiceId,
      chargeId: line.chargeId,
      chargeCode: line.chargeCode,
      currency,
      billedMinor: line.amountMinor.toString(),
      expectedMinor: expected?.toString() ?? null,
      varianceMinor: expected === null ? null : (line.amountMinor - expected).toString(),
      matchedRate: expected !== null,
      findings: lineFindings,
    });
  }

  const record = (source: Map<string, bigint>) =>
    Object.fromEntries([...source.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, value.toString()]));

  return {
    lines,
    findings,
    summary: {
      invoiceLines: invoiceLines.length,
      rateMatchedLines,
      linesNeedingReview,
      billedTotalsMinor: record(billedTotals),
      expectedTotalsMinor: record(expectedTotals),
      positiveVariancesMinor: record(positiveVariances),
    },
  };
}
