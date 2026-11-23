import { createHash } from "node:crypto";
import { prisma } from "../db.server";
import { reconcileThreePLInvoices, type ThreePLActivityRecord, type ThreePLInvoiceLine, type ThreePLRateRule } from "../domain/threepl-control";

const ENGINE_VERSION = "threepl-control.v1";

function day(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

/**
 * Reconciles one persisted invoice against the workspace's effective provider
 * contract rules and exact-reference operational activity. The workspace and
 * invoice are always queried together; caller-supplied IDs never bypass tenant
 * scoping. Findings are persisted with source lineage and a repeatable input hash.
 */
export async function reconcileStoredThreePLInvoice(workspaceId: string, invoiceId: string) {
  if (!workspaceId.trim() || !invoiceId.trim()) throw new Error("Workspace and invoice are required.");

  const invoice = await prisma.threePLInvoice.findFirst({
    where: { id: invoiceId, workspaceId },
    include: { lines: { orderBy: { sourceRow: "asc" } }, provider: true },
  });
  if (!invoice) throw new Error("Invoice was not found in this workspace.");

  const [contracts, activityRows] = await Promise.all([
    prisma.threePLContract.findMany({
      where: { workspaceId, providerId: invoice.providerId, status: "active" },
      include: { rateRules: true },
      orderBy: { effectiveFrom: "asc" },
    }),
    prisma.threePLActivityRecord.findMany({
      where: { workspaceId, providerId: invoice.providerId },
      orderBy: { occurredAt: "asc" },
    }),
  ]);

  const rules: ThreePLRateRule[] = contracts.flatMap(contract => contract.rateRules.map(rule => {
    if (rule.pricing !== "per_unit" && rule.pricing !== "fixed") {
      throw new Error("Unsupported contract pricing method on rule " + rule.id + ".");
    }
    return {
      id: rule.id,
      chargeCode: rule.chargeCode,
      unit: rule.unit,
      pricing: rule.pricing,
      rate: { minor: rule.rateMinor, currency: rule.currency },
      effectiveFrom: day(rule.effectiveFrom),
      effectiveTo: rule.effectiveTo ? day(rule.effectiveTo) : null,
      sourceRow: rule.sourceRow,
    };
  }));

  const invoiceLines: ThreePLInvoiceLine[] = invoice.lines.map(line => ({
    id: line.id,
    invoiceId: invoice.id,
    chargeCode: line.chargeCode,
    billedAt: day(line.serviceDate ?? invoice.invoiceDate),
    quantity: line.quantity.toString(),
    unit: line.unit,
    amount: { minor: line.amountMinor, currency: line.currency },
    activityReference: line.activityReference,
  }));

  const activity: ThreePLActivityRecord[] = activityRows.map(record => ({
    id: record.id,
    reference: record.reference,
    chargeCode: record.chargeCode,
    quantity: record.quantity.toString(),
    unit: record.unit,
  }));

  const inputHash = stableHash({
    engineVersion: ENGINE_VERSION,
    invoice: {
      id: invoice.id, invoiceDate: invoice.invoiceDate.toISOString(),
      currency: invoice.currency, totalMinor: invoice.totalMinor.toString(),
    },
    rules: rules.map(rule => ({
      ...rule, rate: { minor: rule.rate.minor.toString(), currency: rule.rate.currency },
    })),
    invoiceLines: invoiceLines.map(line => ({
      ...line, amount: { minor: line.amount.minor.toString(), currency: line.amount.currency },
    })),
    activity,
  });

  const previous = await prisma.threePLReconciliationRun.findUnique({
    where: { workspaceId_invoiceId_inputHash: { workspaceId, invoiceId, inputHash } },
    select: { id: true, summary: true, createdAt: true },
  });
  if (previous) return { runId: previous.id, summary: previous.summary, reused: true };

  const result = reconcileThreePLInvoices({ rules, invoiceLines, activity });
  const summary = {
    ...result.summary,
    calculatedVarianceMinorByCurrency: result.summary.calculatedVarianceMinorByCurrency,
    findingCount: result.findings.length,
    engineVersion: ENGINE_VERSION,
  };

  const run = await prisma.$transaction(async tx => {
    const createdRun = await tx.threePLReconciliationRun.create({
      data: { workspaceId, invoiceId, engineVersion: ENGINE_VERSION, inputHash, summary },
    });

    for (const finding of result.findings) {
      const fingerprint = stableHash({
        invoiceLineId: finding.invoiceLineId,
        findingCode: finding.code,
        contractRuleId: finding.contractRuleId ?? null,
        evidenceReferences: [...finding.evidenceReferences].sort(),
      });
      const exposure = finding.varianceMinor && BigInt(finding.varianceMinor) > 0n
        ? BigInt(finding.varianceMinor)
        : null;
      const saved = await tx.threePLException.upsert({
        where: { workspaceId_fingerprint: { workspaceId, fingerprint } },
        create: {
          workspaceId, invoiceId, runId: createdRun.id,
          invoiceLineId: finding.invoiceLineId,
          fingerprint, findingCode: finding.code, severity: finding.severity,
          state: finding.state, status: "open", exposureMinor: exposure,
          currency: finding.currency, explanation: finding.explanation,
          evidenceReferences: [...finding.evidenceReferences],
        },
        update: {
          invoiceId, runId: createdRun.id, invoiceLineId: finding.invoiceLineId,
          severity: finding.severity, state: finding.state,
          exposureMinor: exposure, currency: finding.currency,
          explanation: finding.explanation,
          evidenceReferences: [...finding.evidenceReferences],
          lastSeenAt: new Date(),
        },
        select: { id: true },
      });
      await tx.threePLCaseEvent.create({
        data: {
          workspaceId, exceptionId: saved.id, actorType: "system",
          action: "finding_observed",
          detail: { runId: createdRun.id, findingCode: finding.code, inputHash },
        },
      });
    }

    await tx.threePLInvoice.update({
      where: { id: invoice.id },
      data: { status: "reconciled" },
    });
    return createdRun;
  });

  return { runId: run.id, summary, reused: false };
}
