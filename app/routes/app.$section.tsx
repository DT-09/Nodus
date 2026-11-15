import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { importCarrierCostCsv } from "../services/cost-import.server";
import { reconcileShipping } from "../domain/reconcile";
import { diagnoseReconciliation } from "../domain/diagnostics";
import { parseMoney } from "../domain/money";
import { simulateHistoricalShippingRevenue } from "../domain/simulation";
import { getMarketShippingSnapshot } from "../services/shipping-policy.server";
import { createHash } from "node:crypto";

const pages: Record<string, { title: string; subtitle: string; heading: string; body: string }> = {
  orders: { title: "Order evidence", subtitle: "Order-level shipping revenue and fulfillment evidence.", heading: "Persisted Shopify orders", body: "Orders are stored through a resumable Shopify backfill. Imported costs are matched by exact order reference or an unambiguous tracking number. Cost coverage must be reviewed before contribution is calculated." },
  evidence: { title: "Source evidence", subtitle: "Carrier invoices, labels and 3PL records.", heading: "Import carrier cost evidence", body: "Upload a carrier CSV with invoice_id, charge_id, amount and currency. Optional columns: order_reference, tracking_number, occurred_at and cost_type. Ambiguous records are not auto-allocated." },
  diagnostics: { title: "Diagnostics", subtitle: "Evidence-backed causes, not unexplained alerts.", heading: "Evidence coverage and findings", body: "Findings are generated from stored orders and imported cost records. Missing evidence is a coverage gap, never zero cost or a confirmed loss." },
  simulations: { title: "Policy simulations", subtitle: "Compare proposed policies against historical order scenarios.", heading: "Historical shipping-policy replay", body: "Replay a proposed flat rate and optional free-shipping threshold against stored order history. This compares shipping revenue only; it does not predict demand, conversion, abandonment or profit." },
  policies: { title: "Policy control", subtitle: "Proposed changes, merchant approvals and verification.", heading: "Live policy writes are disabled", body: "NODUS remains read-only until supported Shopify mutations, permissions, baseline checks and read-back verification have passed development-store tests." },
  monitoring: { title: "Shopify sync monitoring", subtitle: "Scheduled order refresh, resumable backfill and failure recovery.", heading: "Scheduled Shopify refresh", body: "NODUS runs a protected, bounded Shopify order refresh through Vercel Cron when CRON_SECRET is configured. This does not monitor carrier billing, adjudicate disputes or verify recovered value." },
  reports: { title: "Reports", subtitle: "Traceable results, coverage and decision history.", heading: "Export your evidence register", body: "Download the stored Shopify orders and imported carrier-cost evidence for independent review. Exports are merchant-scoped and recorded in the audit log." }
};

type OrderRow = {
  orderId: string; orderName: string; currency: string; collectedMinor: string; taxesIncluded: boolean;
  evidencedCostMinor: string | null; evidenceCount: number; coverage: string;
  costCoverageStatus: string; coverageReviewedAt: string | null;
};
type EvidenceRow = {
  id: string; sourceSystem: string; sourceRecordId: string; sourceReference: string | null;
  orderReference: string | null; trackingNumber: string | null; currency: string;
  amountMinor: string; costType: string; occurredAt: string | null;
};
type FindingRow = { ruleId: string; orderId: string; severity: string; title: string; explanation: string; evidenceIds: string[] };
type AuditRow = { id: string; actor: string; action: string; subjectType: string; subjectId: string; createdAt: string };

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const section = params.section ?? "";
  const page = pages[section];
  if (!page) throw new Response("Not found", { status: 404 });

  const empty = {
    page, totalOrders: 0, totalEvidence: 0, totalSimulations: 0, totalValueRecords: 0, valueTotals: [] as Array<{currency:string;category:string;status:string;amountMinor:string;count:number}>, analyzedOrders: 0, analyzedEvidence: 0, analysisTruncated: false, rows: [] as OrderRow[],
    markets: [] as Array<{ id: string; name: string; handle: string; status: string; inheritsShipping: boolean; shippingEnabled: boolean | null; options: Array<{ id: string; name: string; type: string; active: boolean; currency: string; freeThreshold: string | null; flatRates: Array<{ amount: string; currency: string }> }> }>, policyError: null as string | null,
    evidenceRows: [] as EvidenceRow[], orderOptions: [] as Array<{ id: string; name: string }>, findings: [] as FindingRow[], auditEvents: [] as AuditRow[], simulationRows: [] as Array<{ id: string; currency: string; flatRateMinor: string; freeShippingThresholdMinor: string | null; sampleSize: number; observed: string; replayed: string; delta: string; createdAt: string; sampleWindowStart: string | null; sampleWindowEnd: string | null; warning: string }>,
  };
  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return empty;

  if (section === "evidence") {
    const [costs, totalEvidence, orders] = await Promise.all([
      prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "desc" }, take: 250 }),
      prisma.shippingCost.count({ where: { merchantId: merchant.id } }),
      prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "desc" }, take: 250, select: { sourceOrderId: true, orderName: true } }),
    ]);
    return {
      ...empty, totalEvidence,
      orderOptions: orders.map((order) => ({ id: order.sourceOrderId, name: order.orderName })),
      evidenceRows: costs.map((cost) => ({
        id: cost.id, sourceSystem: cost.sourceSystem, sourceRecordId: cost.sourceRecordId,
        sourceReference: cost.sourceReference, orderReference: cost.orderReference,
        trackingNumber: cost.trackingNumber, currency: cost.currency,
        amountMinor: cost.amountMinor.toString(), costType: cost.costType,
        occurredAt: cost.occurredAt?.toISOString() ?? null,
      })),
    };
  }

  if (section === "policies") {
    try {
      const snapshot = await getMarketShippingSnapshot(admin);
      return { ...empty, markets: snapshot.markets };
    } catch (error) {
      return { ...empty, policyError: error instanceof Error ? error.message : "Unable to read Shopify market shipping settings." };
    }
  }

  if (section === "simulations") {
    const simulations = await prisma.policySimulation.findMany({
      where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 25,
    });
    return {
      ...empty,
      simulationRows: simulations.map((simulation) => ({
        id: simulation.id, currency: simulation.currency,
        flatRateMinor: simulation.flatRateMinor.toString(),
        freeShippingThresholdMinor: simulation.freeShippingThresholdMinor?.toString() ?? null,
        sampleSize: simulation.sampleSize,
        observed: simulation.observedShippingRevenueMinor.toString(),
        replayed: simulation.replayedShippingRevenueMinor.toString(),
        delta: simulation.revenueDeltaMinor.toString(),
        createdAt: simulation.createdAt.toISOString(), sampleWindowStart: simulation.sampleWindowStart?.toISOString() ?? null, sampleWindowEnd: simulation.sampleWindowEnd?.toISOString() ?? null, warning: simulation.warning,
      })),
    };
  }

  if (section === "reports") {
    const [totalOrders, totalEvidence, totalSimulations, totalValueRecords, valueGroups, events] = await Promise.all([
      prisma.shippingOrder.count({ where: { merchantId: merchant.id } }),
      prisma.shippingCost.count({ where: { merchantId: merchant.id } }),
      prisma.policySimulation.count({ where: { merchantId: merchant.id } }),
      prisma.economicValueRecord.count({ where: { merchantId: merchant.id } }),
      prisma.economicValueRecord.groupBy({ by: ["currency", "category", "status"], where: { merchantId: merchant.id }, _sum: { amountMinor: true }, _count: { _all: true } }),
      prisma.auditEvent.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    ]);
    return {
      ...empty, totalOrders, totalEvidence, totalSimulations, totalValueRecords,
      valueTotals: valueGroups.map((group) => ({ currency: group.currency, category: group.category, status: group.status, amountMinor: (group._sum.amountMinor ?? 0n).toString(), count: group._count._all })),
      auditEvents: events.map((event) => ({
        id: event.id, actor: event.actor, action: event.action,
        subjectType: event.subjectType, subjectId: event.subjectId,
        createdAt: event.createdAt.toISOString(),
      })),
    };
  }

  if (section !== "orders" && section !== "diagnostics") return empty;

  const [orders, costs, totalOrders, totalEvidence] = await Promise.all([
    prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "desc" }, take: 250 }),
    prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "desc" }, take: 5000 }),
    prisma.shippingOrder.count({ where: { merchantId: merchant.id } }),
    prisma.shippingCost.count({ where: { merchantId: merchant.id } }),
  ]);

  const orderInputs = orders.map((order) => ({
    orderId: order.sourceOrderId,
    orderName: order.orderName,
    shippingRevenue: { minor: order.shippingRevenueMinor, currency: order.currency },
    trackingNumbers: Array.isArray(order.trackingNumbers)
      ? order.trackingNumbers.filter((value): value is string => typeof value === "string")
      : [],
    costCoverage: order.costCoverageStatus === "complete" ? "complete" as const
      : order.costCoverageStatus === "partial" ? "partial" as const : "unknown" as const,
    taxesIncluded: order.taxesIncluded,
  }));
  const costInputs = costs.map((cost) => ({
    evidenceId: `${cost.sourceSystem}:${cost.sourceRecordId}`,
    amount: { minor: cost.amountMinor, currency: cost.currency },
    orderReference: cost.orderReference,
    trackingNumber: cost.trackingNumber,
  }));
  const reconciled = reconcileShipping(orderInputs, costInputs);
  const findings = diagnoseReconciliation(reconciled);

  return {
    ...empty, totalOrders, totalEvidence, analyzedOrders: orders.length, analyzedEvidence: costs.length, analysisTruncated: totalOrders > orders.length || totalEvidence > costs.length,
    rows: reconciled.map((row) => {
      const order = orders.find((item) => item.sourceOrderId === row.orderId)!;
      return {
        orderId: row.orderId, orderName: order.orderName, currency: row.shippingRevenue.currency,
        collectedMinor: row.shippingRevenue.minor.toString(), taxesIncluded: order.taxesIncluded,
        evidencedCostMinor: row.evidencedCost?.minor.toString() ?? null,
        evidenceCount: row.evidenceIds.length, coverage: row.coverage,
        costCoverageStatus: order.costCoverageStatus,
        coverageReviewedAt: order.coverageReviewedAt?.toISOString() ?? null,
      };
    }),
    findings: findings.map((finding) => ({
      ruleId: finding.ruleId, orderId: finding.orderId, severity: finding.severity,
      title: finding.title, explanation: finding.explanation, evidenceIds: [...finding.evidenceIds],
    })),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();

  if (params.section === "reports" && form.get("intent") === "export-report") {
    const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
    if (!merchant) return new Response("No merchant data is available.", { status: 404 });
    const [orders, costs, simulations, valueRecords] = await Promise.all([
      prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "asc" } }),
      prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "asc" } }),
      prisma.policySimulation.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
      prisma.economicValueRecord.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    ]);
    const csvCell = (value: string | number | null) => {
      let text = value === null ? "" : String(value);
      if (/^[ \t\r\n]*[=+@-]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const records = [
      ["record_type","order_id","order_name","date","currency","shipping_revenue_minor","taxes_included","coverage_status","evidence_id","cost_amount_minor","cost_type","order_reference","tracking_number","source_reference","coverage_reviewed_at","coverage_reviewed_by","sample_size","sample_window_start","sample_window_end","assumptions","value_category","value_status","value_amount_minor","value_realization_reference","value_source_reference","value_evidence_note"],
      ...orders.map((order) => ["order", order.sourceOrderId, order.orderName, order.orderedAt.toISOString(), order.currency, order.shippingRevenueMinor.toString(), String(order.taxesIncluded), order.costCoverageStatus, "", "", "", "", "", "", order.coverageReviewedAt?.toISOString() ?? "", order.coverageReviewedBy ?? "", "", "", "", "", "", "", "", "", "", ""]),
      ...costs.map((cost) => ["cost_evidence", "", "", cost.occurredAt?.toISOString() ?? "", cost.currency, "", "", "", `${cost.sourceSystem}:${cost.sourceRecordId}`, cost.amountMinor.toString(), cost.costType, cost.orderReference ?? "", cost.trackingNumber ?? "", cost.sourceReference ?? "", "", "", "", "", "", "", "", "", "", "", "", ""]),
      ...simulations.map((simulation) => ["policy_simulation", simulation.id, "", simulation.createdAt.toISOString(), simulation.currency, simulation.observedShippingRevenueMinor.toString(), "", "historical_replay", "", simulation.replayedShippingRevenueMinor.toString(), `flat_rate_minor=${simulation.flatRateMinor};threshold_minor=${simulation.freeShippingThresholdMinor ?? ""};delta_minor=${simulation.revenueDeltaMinor}`, "", "", simulation.engineVersion, "", "", String(simulation.sampleSize), simulation.sampleWindowStart?.toISOString() ?? "", simulation.sampleWindowEnd?.toISOString() ?? "", JSON.stringify(simulation.assumptions), "", "", "", "", "", ""]),
      ...valueRecords.map((record) => ["economic_value", "", "", record.occurredAt?.toISOString() ?? record.createdAt.toISOString(), record.currency, "", "", record.status, "", record.amountMinor.toString(), record.category, "", "", record.sourceReference, "", record.createdBy, "", "", "", record.evidenceNote, record.category, record.status, record.amountMinor.toString(), record.realizationReference ?? "", record.sourceReference, record.evidenceNote]),
    ];
    const csv = records.map((record) => record.map(csvCell).join(",")).join("\r\n");
    await prisma.auditEvent.create({ data: {
      merchantId: merchant.id, actor: session.id, action: "report_exported",
      subjectType: "merchant", subjectId: session.shop,
      detail: { orderCount: orders.length, evidenceCount: costs.length, simulationCount: simulations.length, valueRecordCount: valueRecords.length, format: "csv" },
    } });
    return new Response(csv, { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nodus-evidence-report-${new Date().toISOString().slice(0,10)}.csv"`,
      "Cache-Control": "no-store",
    } });
  }

  if (params.section === "reports" && form.get("intent") === "export-decision-pack") {
    const merchant = await prisma.merchant.findUnique({
      where: { shop: session.shop },
      select: { id: true, shop: true, shopName: true, installedAt: true },
    });
    if (!merchant) return new Response("No merchant data is available.", { status: 404 });

    const [orders, costs, simulations, valueRecords] = await Promise.all([
      prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: [{ orderedAt: "asc" }, { sourceOrderId: "asc" }] }),
      prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: [{ occurredAt: "asc" }, { sourceSystem: "asc" }, { sourceRecordId: "asc" }] }),
      prisma.policySimulation.findMany({ where: { merchantId: merchant.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
      prisma.economicValueRecord.findMany({ where: { merchantId: merchant.id }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }),
    ]);

    const orderInputs = orders.map((order) => ({
      orderId: order.sourceOrderId,
      orderName: order.orderName,
      shippingRevenue: { minor: order.shippingRevenueMinor, currency: order.currency },
      trackingNumbers: Array.isArray(order.trackingNumbers)
        ? order.trackingNumbers.filter((value): value is string => typeof value === "string")
        : [],
      costCoverage: order.costCoverageStatus === "complete" ? "complete" as const
        : order.costCoverageStatus === "partial" ? "partial" as const : "unknown" as const,
      taxesIncluded: order.taxesIncluded,
    }));
    const costInputs = costs.map((cost) => ({
      evidenceId: `${cost.sourceSystem}:${cost.sourceRecordId}`,
      amount: { minor: cost.amountMinor, currency: cost.currency },
      orderReference: cost.orderReference,
      trackingNumber: cost.trackingNumber,
    }));
    const reconciled = reconcileShipping(orderInputs, costInputs);
    const findings = diagnoseReconciliation(reconciled);
    const matchedEvidence = new Set(reconciled.flatMap((row) => [...row.evidenceIds]));
    const coverage = {
      complete: reconciled.filter((row) => row.coverage === "complete").length,
      partial: reconciled.filter((row) => row.coverage === "partial").length,
      incomplete: reconciled.filter((row) => row.coverage === "none").length,
      matchedEvidenceRows: matchedEvidence.size,
      unmatchedEvidenceRows: costs.length - matchedEvidence.size,
    };
    const currencySummaries = [...new Set(orders.map((order) => order.currency))].sort().map((currency) => {
      const rows = reconciled.filter((row) => row.shippingRevenue.currency === currency);
      const complete = rows.filter((row) => row.coverage === "complete" && !row.taxesIncluded && row.shippingContributionBeforeUnobservedCosts !== null);
      const sum = (values: typeof complete, pick: (row: typeof complete[number]) => bigint) =>
        values.reduce((total, row) => total + pick(row), 0n).toString();
      return {
        currency,
        orderCount: rows.length,
        completeComparableOrderCount: complete.length,
        shippingRevenueMinorCompleteComparable: sum(complete, (row) => row.shippingRevenue.minor),
        evidencedCostMinorCompleteComparable: sum(complete, (row) => row.evidencedCost?.minor ?? 0n),
        shippingContributionBeforeUnobservedCostsMinor: sum(complete, (row) => row.shippingContributionBeforeUnobservedCosts?.minor ?? 0n),
        note: "Only merchant-reviewed complete-coverage orders with tax-exclusive shipping revenue are included. This is not profit.",
      };
    });
    const payload = {
      schema: "nodus.shipping-economics-decision-pack.v1",
      methodology: {
        engine: "NODUS deterministic reconciliation",
        engineVersion: "v1",
        matching: "Exact order ID/name reference; otherwise an unambiguous tracking number. Explicit unmatched order references do not fall back to tracking.",
        money: "Integer minor units with ISO currency codes; currencies are never combined.",
        coverage: "Missing or partial evidence is excluded from complete-coverage calculations. Complete coverage is a merchant attestation.",
        limitations: [
          "A merchant-attested complete coverage state is not independently audited.",
          "Shipping contribution is shipping revenue less imported evidenced cost only; it is not profit.",
          "Tax-inclusive shipping revenue is excluded from contribution calculations.",
          "Historical policy simulations are not demand, conversion or profit forecasts.",
          "Identified or validated opportunities are not realized cash. Realized records remain merchant-attested.",
          "This pack reflects records stored at export time and does not prove that every carrier or 3PL charge was supplied.",
        ],
      },
      scope: {
        shop: merchant.shop,
        shopName: merchant.shopName,
        merchantInstalledAt: merchant.installedAt.toISOString(),
        generatedAt: new Date().toISOString(),
        reportingCurrencies: [...new Set([...orders.map((row) => row.currency), ...costs.map((row) => row.currency)])].sort(),
        orderWindowStart: orders[0]?.orderedAt.toISOString() ?? null,
        orderWindowEnd: orders.at(-1)?.orderedAt.toISOString() ?? null,
        orderCount: orders.length,
        costEvidenceCount: costs.length,
      },
      summary: { coverage, currencySummaries, findingCount: findings.length },
      orders: reconciled.map((row) => {
        const source = orders.find((order) => order.sourceOrderId === row.orderId)!;
        return {
          orderId: row.orderId,
          orderName: source.orderName,
          orderedAt: source.orderedAt.toISOString(),
          currency: row.shippingRevenue.currency,
          shippingRevenueMinor: row.shippingRevenue.minor.toString(),
          taxesIncluded: row.taxesIncluded,
          coverage: row.coverage,
          merchantCoverageStatus: source.costCoverageStatus,
          coverageReviewedAt: source.coverageReviewedAt?.toISOString() ?? null,
          coverageReviewedBy: source.coverageReviewedBy,
          evidencedCostMinor: row.evidencedCost?.minor.toString() ?? null,
          evidenceIds: [...row.evidenceIds],
          shippingContributionBeforeUnobservedCostsMinor: row.shippingContributionBeforeUnobservedCosts?.minor.toString() ?? null,
        };
      }),
      evidence: costs.map((cost) => ({
        evidenceId: `${cost.sourceSystem}:${cost.sourceRecordId}`,
        sourceSystem: cost.sourceSystem,
        sourceRecordId: cost.sourceRecordId,
        sourceReference: cost.sourceReference,
        orderReference: cost.orderReference,
        trackingNumber: cost.trackingNumber,
        occurredAt: cost.occurredAt?.toISOString() ?? null,
        currency: cost.currency,
        amountMinor: cost.amountMinor.toString(),
        costType: cost.costType,
        matched: matchedEvidence.has(`${cost.sourceSystem}:${cost.sourceRecordId}`),
      })),
      findings: findings.map((finding) => ({
        ruleId: finding.ruleId,
        orderId: finding.orderId,
        severity: finding.severity,
        title: finding.title,
        explanation: finding.explanation,
        evidenceIds: [...finding.evidenceIds],
      })),
      policySimulations: simulations.map((simulation) => ({
        id: simulation.id,
        createdAt: simulation.createdAt.toISOString(),
        currency: simulation.currency,
        flatRateMinor: simulation.flatRateMinor.toString(),
        freeShippingThresholdMinor: simulation.freeShippingThresholdMinor?.toString() ?? null,
        sampleSize: simulation.sampleSize,
        sampleWindowStart: simulation.sampleWindowStart?.toISOString() ?? null,
        sampleWindowEnd: simulation.sampleWindowEnd?.toISOString() ?? null,
        observedShippingRevenueMinor: simulation.observedShippingRevenueMinor.toString(),
        replayedShippingRevenueMinor: simulation.replayedShippingRevenueMinor.toString(),
        revenueDeltaMinor: simulation.revenueDeltaMinor.toString(),
        assumptions: simulation.assumptions,
        warning: simulation.warning,
        engineVersion: simulation.engineVersion,
      })),
      economicValueLedger: valueRecords.map((record) => ({
        id: record.id,
        category: record.category,
        status: record.status,
        amountMinor: record.amountMinor.toString(),
        currency: record.currency,
        sourceReference: record.sourceReference,
        realizationReference: record.realizationReference,
        evidenceNote: record.evidenceNote,
        occurredAt: record.occurredAt?.toISOString() ?? null,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        attestation: "Merchant-entered record; not independently verified by NODUS.",
      })),
    };
    const canonical = JSON.stringify(payload);
    const contentSha256 = createHash("sha256").update(canonical).digest("hex");
    const pack = JSON.stringify({ ...payload, integrity: { algorithm: "SHA-256", canonicalPayloadDigest: contentSha256 } }, null, 2);

    await prisma.auditEvent.create({ data: {
      merchantId: merchant.id, actor: session.id, action: "decision_pack_exported",
      subjectType: "merchant", subjectId: session.shop,
      detail: { orderCount: orders.length, evidenceCount: costs.length, findingCount: findings.length, simulationCount: simulations.length, valueRecordCount: valueRecords.length, format: "json", contentSha256 },
    } });
    return new Response(pack, { headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nodus-decision-pack-${new Date().toISOString().slice(0,10)}.json"`,
      "Cache-Control": "no-store",
    } });
  }

  if (params.section === "orders" && form.get("intent") === "review-coverage") {
    const orderId = String(form.get("orderId") ?? "").trim();
    const status = String(form.get("coverageStatus") ?? "");
    if (!orderId || !["unknown", "partial", "complete"].includes(status)) {
      return { kind: "coverage" as const, ok: false, message: "Choose a valid order and coverage status." };
    }
    const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
    if (!merchant) return { kind: "coverage" as const, ok: false, message: "Merchant record not found." };
    const order = await prisma.shippingOrder.findFirst({
      where: { merchantId: merchant.id, sourceOrderId: orderId },
      select: { id: true, sourceOrderId: true, costCoverageStatus: true },
    });
    if (!order) return { kind: "coverage" as const, ok: false, message: "Order not found in this shop." };
    await prisma.$transaction([
      prisma.shippingOrder.update({
        where: { id: order.id },
        data: {
          costCoverageStatus: status,
          coverageReviewedAt: status === "unknown" ? null : new Date(),
          coverageReviewedBy: status === "unknown" ? null : session.id,
        },
      }),
      prisma.auditEvent.create({
        data: {
          merchantId: merchant.id, actor: session.id,
          action: "shipping_cost_coverage_reviewed", subjectType: "shipping_order",
          subjectId: order.sourceOrderId,
          detail: { previousStatus: order.costCoverageStatus, newStatus: status },
        },
      }),
    ]);
    return { kind: "coverage" as const, ok: true, message: "Coverage review saved and recorded in the audit log." };
  }

  if (params.section === "evidence" && form.get("intent") === "assign-evidence") {
    const evidenceId = String(form.get("evidenceId") ?? "").trim();
    const orderId = String(form.get("orderId") ?? "").trim();
    if (!evidenceId || !orderId) return { kind: "evidence" as const, ok: false, message: "Choose an evidence row and a destination order." };
    const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
    if (!merchant) return { kind: "evidence" as const, ok: false, message: "Merchant record not found." };
    const [cost, order] = await Promise.all([
      prisma.shippingCost.findFirst({ where: { id: evidenceId, merchantId: merchant.id }, select: { id: true, orderReference: true } }),
      prisma.shippingOrder.findFirst({ where: { merchantId: merchant.id, sourceOrderId: orderId }, select: { id: true, sourceOrderId: true, orderName: true, costCoverageStatus: true } }),
    ]);
    if (!cost || !order) return { kind: "evidence" as const, ok: false, message: "Evidence or order was not found in this shop." };
    const previousOrder = cost.orderReference ? await prisma.shippingOrder.findFirst({
      where: { merchantId: merchant.id, OR: [{ sourceOrderId: cost.orderReference }, { orderName: cost.orderReference }] },
      select: { id: true, sourceOrderId: true },
    }) : null;
    const affectedOrderIds = [...new Set([order.id, ...(previousOrder ? [previousOrder.id] : [])])];
    await prisma.$transaction([
      prisma.shippingCost.update({ where: { id: cost.id }, data: { orderReference: order.sourceOrderId } }),
      prisma.shippingOrder.updateMany({ where: { id: { in: affectedOrderIds } }, data: { costCoverageStatus: "partial", coverageReviewedAt: null, coverageReviewedBy: null } }),
      prisma.auditEvent.create({
        data: {
          merchantId: merchant.id, actor: session.id, action: "shipping_cost_evidence_manually_matched",
          subjectType: "shipping_cost", subjectId: cost.id,
          detail: { previousReference: cost.orderReference, orderId: order.sourceOrderId, orderName: order.orderName },
        },
      }),
    ]);
    return { kind: "evidence" as const, ok: true, message: `Evidence matched to ${order.orderName}. Coverage review was reset.` };
  }

  if (params.section === "evidence") {
    const file = form.get("file");
    if (!(file instanceof File)) return { kind: "evidence" as const, ok: false, message: "Choose a CSV file." };
    if (file.size < 1 || file.size > 5 * 1024 * 1024) return { kind: "evidence" as const, ok: false, message: "CSV must be between 1 byte and 5 MB." };
    if (!file.name.toLowerCase().endsWith(".csv")) return { kind: "evidence" as const, ok: false, message: "Only .csv files are accepted." };
    try {
      const result = await importCarrierCostCsv(session.shop, await file.text());
      return { kind: "evidence" as const, ok: true, message: `Received ${result.received}; imported ${result.imported}; skipped ${result.duplicates} duplicate rows.` };
    } catch (error) {
      return { kind: "evidence" as const, ok: false, message: error instanceof Error ? error.message : "Import failed." };
    }
  }

  if (params.section === "simulations") {
    try {
      const currency = String(form.get("currency") ?? "").trim().toUpperCase();
      const flatRate = parseMoney(String(form.get("flatRate") ?? ""), currency);
      const thresholdText = String(form.get("freeShippingThreshold") ?? "").trim();
      const threshold = thresholdText ? parseMoney(thresholdText, currency) : null;
      if (flatRate.minor < 0n) throw new Error("Flat shipping rate cannot be negative.");
      if (threshold && threshold.minor < 0n) throw new Error("Free-shipping threshold cannot be negative.");
      const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
      if (!merchant) return { kind: "simulation" as const, ok: false, message: "No Shopify order history is stored yet." };
      const orders = await prisma.shippingOrder.findMany({
        where: { merchantId: merchant.id, subtotalMinor: { not: null }, currency, taxesIncluded: false },
        orderBy: { orderedAt: "desc" }, take: 250,
      });
      if (!orders.length) return { kind: "simulation" as const, ok: false, message: "No non-tax-inclusive orders in this currency with a verified subtotal are available." };
      const result = simulateHistoricalShippingRevenue(orders.map((order) => ({
        orderId: order.sourceOrderId,
        subtotal: { minor: order.subtotalMinor!, currency: order.currency },
        shippingCollected: { minor: order.shippingRevenueMinor, currency: order.currency },
      })), { flatRate, freeShippingThreshold: threshold });
      const merchantOrderDates = orders.map((order) => order.orderedAt.getTime()).sort((a, b) => a - b);
      const saved = await prisma.policySimulation.create({
        data: {
          merchantId: merchant.id, currency,
          flatRateMinor: flatRate.minor,
          freeShippingThresholdMinor: threshold?.minor ?? null,
          sampleSize: result.sampleSize,
          sampleWindowStart: new Date(merchantOrderDates[0]!),
          sampleWindowEnd: new Date(merchantOrderDates[merchantOrderDates.length - 1]!),
          observedShippingRevenueMinor: BigInt(result.observedShippingRevenueMinor),
          replayedShippingRevenueMinor: BigInt(result.replayedShippingRevenueMinor),
          revenueDeltaMinor: BigInt(result.revenueDeltaMinor),
          assumptions: result.assumptions,
          warning: result.warning,
        },
      });
      await prisma.auditEvent.create({
        data: {
          merchantId: merchant.id, actor: session.id, action: "policy_simulation_created",
          subjectType: "policy_simulation", subjectId: saved.id,
          detail: { currency, sampleSize: result.sampleSize, engineVersion: "v1" },
        },
      });
      return { kind: "simulation" as const, ok: true, result: {
        sampleSize: result.sampleSize, currency: result.currency,
        observed: result.observedShippingRevenueMinor.toString(),
        replayed: result.replayedShippingRevenueMinor.toString(),
        delta: result.revenueDeltaMinor.toString(),
        warning: result.warning, assumptions: result.assumptions,
      } };
    } catch (error) {
      return { kind: "simulation" as const, ok: false, message: error instanceof Error ? error.message : "Simulation failed." };
    }
  }

  throw new Response("Not found", { status: 404 });
}

function formatMinor(amount: string | null, currency: string) {
  if (amount === null) return "—";
  const minor = BigInt(amount);
  const zeroDecimal = new Set(["BIF","CLP","DJF","GNF","JPY","KMF","KRW","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"]);
  const threeDecimal = new Set(["BHD","IQD","JOD","KWD","LYD","OMR","TND"]);
  const precision = zeroDecimal.has(currency) ? 0 : threeDecimal.has(currency) ? 3 : 2;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: precision, maximumFractionDigits: precision })
    .format(Number(minor) / 10 ** precision);
}

export default function Section() {
  const data = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const simulationResult = result?.kind === "simulation" && result.ok ? result.result : undefined;
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / WORKSPACE</p><h1>{data.page.title}</h1><p className="muted">{data.page.subtitle}</p></div></header>
    <section className="surface-card">
      <h3>{data.page.heading}</h3><p className="body-copy">{data.page.body}</p>
      {data.page.title === "Source evidence" ? <>
        <Form method="post" encType="multipart/form-data" className="import-form">
          <label htmlFor="cost-file">Carrier cost CSV</label>
          <input id="cost-file" name="file" type="file" accept=".csv,text/csv" required />
          <button type="submit">Import evidence</button>
          {result?.kind === "evidence" ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
        </Form>
        <div className="data-table-wrap"><p className="table-caption">{data.totalEvidence} imported cost records · latest 250 shown</p>{result?.kind === "evidence" ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
          <table className="data-table"><thead><tr><th>Invoice</th><th>Charge ID</th><th>Order reference</th><th>Tracking</th><th>Cost type</th><th>Amount</th><th>Date</th><th>Order match</th></tr></thead>
            <tbody>{data.evidenceRows.map((row) => <tr key={row.id}><td>{row.sourceReference ?? "—"}</td><td>{row.sourceRecordId}</td><td>{row.orderReference ?? "—"}</td><td>{row.trackingNumber ?? "—"}</td><td>{row.costType}</td><td>{formatMinor(row.amountMinor,row.currency)}</td><td>{row.occurredAt ? new Date(row.occurredAt).toLocaleDateString() : "—"}</td><td><Form method="post" className="coverage-review-form"><input type="hidden" name="intent" value="assign-evidence"/><input type="hidden" name="evidenceId" value={row.id}/><select name="orderId" required defaultValue={data.orderOptions.find((order) => order.id === row.orderReference || order.name === row.orderReference)?.id ?? ""} aria-label={`Match ${row.sourceRecordId} to order`}><option value="" disabled>Select order</option>{data.orderOptions.map((order) => <option key={order.id} value={order.id}>{order.name}</option>)}</select><button type="submit">Match</button></Form></td></tr>)}
            {!data.evidenceRows.length ? <tr><td colSpan={8}>No cost evidence imported yet.</td></tr> : null}</tbody>
          </table>
        </div>
      </> : null}
      {data.page.title === "Order evidence" ? <div className="data-table-wrap">
        <p className="table-caption">{data.totalOrders} persisted orders · latest 250 shown</p>
        <p className="body-copy">Mark coverage complete only after all applicable carrier, label and 3PL costs have been imported and checked. This is a merchant attestation, not an automatic inference.</p>
        {result?.kind === "coverage" ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
        <table className="data-table"><thead><tr><th>Order</th><th>Shipping collected</th><th>Evidenced cost</th><th>Evidence rows</th><th>Coverage</th><th>Review</th></tr></thead>
          <tbody>{data.rows.map((row) => <tr key={row.orderId}><td>{row.orderName}</td><td>{formatMinor(row.collectedMinor,row.currency)}{row.taxesIncluded ? <small>Tax included · contribution withheld</small> : null}</td><td>{formatMinor(row.evidencedCostMinor,row.currency)}</td><td>{row.evidenceCount}</td><td>{row.coverage} <small>({row.costCoverageStatus})</small></td><td>
            <Form method="post" className="coverage-review-form"><input type="hidden" name="intent" value="review-coverage"/><input type="hidden" name="orderId" value={row.orderId}/>
              <select name="coverageStatus" defaultValue={row.costCoverageStatus} aria-label={`Cost coverage for ${row.orderName}`}><option value="unknown">Unreviewed</option><option value="partial">Partial</option><option value="complete">Complete</option></select><button type="submit">Save review</button>
            </Form>{row.coverageReviewedAt ? <small>Reviewed {new Date(row.coverageReviewedAt).toLocaleDateString()}</small> : null}
          </td></tr>)}
          {!data.rows.length ? <tr><td colSpan={6}>No persisted orders yet. Open the overview to sync Shopify orders.</td></tr> : null}</tbody>
        </table>
      </div> : null}
      {data.page.title === "Diagnostics" ? <div className="finding-list">
        <p className="table-caption">{data.findings.length} coverage findings · {data.analyzedOrders} of {data.totalOrders} orders analyzed · {data.analyzedEvidence} of {data.totalEvidence} cost records checked</p>{data.analysisTruncated ? <p className="import-error">Analysis is limited to the latest 250 orders and 5,000 cost records. Export the complete evidence register for a full external review.</p> : null}
        {data.findings.map((finding) => <article className="finding-row" key={finding.ruleId + finding.orderId}>
          <span className="tag">{finding.severity}</span><div><strong>{finding.title}</strong><p>{finding.explanation}</p><small>{finding.orderId} · {finding.evidenceIds.length} evidence references</small></div>
        </article>)}
        {!data.findings.length ? <p className="body-copy">No findings in this sample. This is not proof of zero shipping leakage; confirm sample and cost-evidence coverage.</p> : null}
      </div> : null}
      {data.page.title === "Policy control" ? <div className="policy-snapshot">
        <p className="table-caption">Read-only snapshot · {data.markets.length} Shopify markets</p>
        {data.policyError ? <p role="status" className="import-error">{data.policyError}. Reauthorize the app with the requested read_markets scope, then reload this page.</p> : null}
        {data.markets.map((market) => <article className="market-card" key={market.id}>
          <div className="card-heading"><div><h4>{market.name}</h4><p className="muted">{market.handle} · {market.status}</p></div><span className="tag">{market.inheritsShipping ? "Inherits shipping" : market.shippingEnabled ? "Shipping enabled" : "Shipping disabled"}</span></div>
          {market.options.map((option) => <div className="market-option" key={option.id}>
            <div><strong>{option.name}</strong><small>{option.type.replace("Delivery","").replace("OptionDefinition","")} · {option.active ? "Active" : "Inactive"} · {option.currency}</small></div>
            <div>{option.flatRates.length ? option.flatRates.map((rate,index) => <span key={index}>{formatMinor(parseMoney(rate.amount,rate.currency).minor.toString(),rate.currency)}</span>) : <span>Rate details not exposed for this option type</span>}{option.freeThreshold ? <small>Free shipping from {option.freeThreshold}</small> : null}</div>
          </div>)}
          {!market.options.length && !market.inheritsShipping ? <p className="body-copy">No shipping options returned for this market.</p> : null}
        </article>)}
        {!data.markets.length && !data.policyError ? <p className="body-copy">No markets were returned by Shopify for this store.</p> : null}
        <p className="footnote">This is a read-only view of Shopify Markets shipping configuration. NODUS does not write checkout settings. Market-driven shipping is now the current Shopify model; legacy delivery-profile data may be stale or no-op on migrated stores.</p>
      </div> : null}
      {data.page.title === "Policy simulations" ? <Form method="post" className="import-form">
        <label htmlFor="flat-rate">Proposed flat shipping rate</label><input id="flat-rate" name="flatRate" type="number" min="0" step="0.001" placeholder="e.g. 6.50" required />
        <label htmlFor="currency">Currency (ISO 4217)</label><input id="currency" name="currency" type="text" minLength={3} maxLength={3} defaultValue="USD" required />
        <label htmlFor="free-threshold">Optional free-shipping threshold</label><input id="free-threshold" name="freeShippingThreshold" type="number" min="0" step="0.001" placeholder="Leave blank to disable" />
        <button type="submit">Run historical replay</button>
        {result?.kind === "simulation" && !result.ok ? <p role="status" className="import-error">{result.message}</p> : null}
        {simulationResult ? <div className="simulation-result">
          <p className="eyebrow">HISTORICAL REPLAY · {simulationResult.sampleSize} ORDERS</p>
          <div className="simulation-metrics"><div><small>Observed shipping revenue</small><strong>{formatMinor(simulationResult.observed,simulationResult.currency)}</strong></div><div><small>Replayed shipping revenue</small><strong>{formatMinor(simulationResult.replayed,simulationResult.currency)}</strong></div><div><small>Revenue difference</small><strong>{formatMinor(simulationResult.delta,simulationResult.currency)}</strong></div></div>
          <p className="body-copy">{simulationResult.warning}</p><ul>{simulationResult.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        </div> : null}
        <div className="simulation-history"><h4>Saved simulation history</h4><p className="table-caption">{data.simulationRows.length} saved runs · latest 25</p>{data.simulationRows.map((run) => <article className="finding-row" key={run.id}><span className="tag">{run.sampleSize} orders</span><div><strong>{new Date(run.createdAt).toLocaleString()} · {run.currency}</strong><p>Observed {formatMinor(run.observed,run.currency)} · Replayed {formatMinor(run.replayed,run.currency)} · Difference {formatMinor(run.delta,run.currency)}</p><small>Flat rate {formatMinor(run.flatRateMinor,run.currency)}{run.freeShippingThresholdMinor ? " · Free threshold "+formatMinor(run.freeShippingThresholdMinor,run.currency) : ""}{run.sampleWindowStart && run.sampleWindowEnd ? " · Orders "+new Date(run.sampleWindowStart).toLocaleDateString()+"–"+new Date(run.sampleWindowEnd).toLocaleDateString() : ""} · Historical replay, not a forecast</small></div></article>)}{!data.simulationRows.length ? <p className="body-copy">No saved simulations yet.</p> : null}</div>
      </Form> : null}
      {data.page.title === "Reports" ? <div className="report-panel">
        <p className="table-caption">{data.totalOrders} orders · {data.totalEvidence} cost records · {data.totalSimulations} saved simulations · {data.totalValueRecords} value records</p>
        <p className="body-copy">Export the full merchant-scoped evidence register, historical simulations and economic value ledger. The value rows retain identified, validated and realized stages, source references and realization references. Export actions are recorded in the audit log.</p>\n        <div className="value-subtotals">{data.valueTotals.map((group) => <span key={group.currency+group.status}>{group.category.replaceAll("_"," ")} · {group.currency} · {group.status}: {formatMinor(group.amountMinor,group.currency)} ({group.count} records)</span>)}{!data.valueTotals.length?<span>No financial outcomes recorded. No ROI claim is available.</span>:null}</div>
        <Form method="post"><input type="hidden" name="intent" value="export-report"/><button type="submit">Export complete evidence CSV</button></Form>
        <Form method="post"><input type="hidden" name="intent" value="export-decision-pack"/><button type="submit">Export reproducible decision pack (JSON)</button></Form>
        <p className="footnote">The decision pack includes all stored orders and cost evidence, matched/unmatched states, deterministic findings, saved policy replays, value-ledger attestations, scope, limitations and a SHA-256 digest of its canonical payload.</p>
        <h4>Recent audit activity</h4><div className="finding-list">{data.auditEvents.map((event) => <article className="finding-row" key={event.id}><span className="tag">{event.action}</span><div><strong>{event.subjectType}: {event.subjectId}</strong><p>{event.actor}</p><small>{new Date(event.createdAt).toLocaleString()}</small></div></article>)}
          {!data.auditEvents.length ? <p className="body-copy">No audit activity recorded yet.</p> : null}</div>
      </div> : null}
    </section>
  </div>;
}
