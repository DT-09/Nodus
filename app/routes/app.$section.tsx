import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { importCarrierCostCsv } from "../services/cost-import.server";
import { reconcileShipping } from "../domain/reconcile";
import { diagnoseReconciliation } from "../domain/diagnostics";
import { parseMoney } from "../domain/money";
import { simulateHistoricalShippingRevenue } from "../domain/simulation";

const pages: Record<string, { title: string; subtitle: string; heading: string; body: string }> = {
  orders: { title: "Order evidence", subtitle: "Order-level shipping revenue and fulfillment evidence.", heading: "Persisted Shopify order sample", body: "Orders are stored through a resumable Shopify backfill. Imported cost records are matched by exact order reference or an unambiguous tracking number. A merchant must review and attest cost coverage before NODUS calculates shipping contribution." },
  evidence: { title: "Source evidence", subtitle: "Carrier invoices, labels and 3PL records.", heading: "Import carrier cost evidence", body: "Upload a carrier CSV with invoice_id, charge_id, amount and currency. Optional columns: order_reference, tracking_number, occurred_at and cost_type. Imported costs are stored against your authenticated shop; ambiguous matches are not auto-allocated." },
  diagnostics: { title: "Diagnostics", subtitle: "Evidence-backed causes, not unexplained alerts.", heading: "Evidence coverage and findings", body: "Findings are generated from persisted Shopify orders and imported cost records. Missing evidence is reported as a coverage gap, never as zero cost or a confirmed loss." },
  simulations: { title: "Policy simulations", subtitle: "Compare proposed policies against historical order scenarios.", heading: "Historical shipping-policy replay", body: "Replay a proposed flat rate and optional free-shipping threshold against the latest persisted order sample. This compares shipping revenue only; it does not predict demand, conversion, abandonment or profit." },
  policies: { title: "Policy control", subtitle: "Proposed changes, merchant approvals and verification.", heading: "Write access is disabled", body: "NODUS is read-only until each supported Shopify mutation, permission, baseline check and read-back verification has passed development-store tests. No shipping configuration has been changed." },
  monitoring: { title: "Continuous monitoring", subtitle: "Policy drift, new exceptions and post-change outcomes.", heading: "Monitoring is not active", body: "Scheduled jobs and durable event processing must be configured before NODUS can claim continuous monitoring." },
  reports: { title: "Reports", subtitle: "Traceable results, coverage and decision history.", heading: "No reports generated", body: "Reports will be available after the underlying evidence, reconciliation and review workflows are complete." }
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const page = pages[params.section ?? ""];
  if (!page) throw new Response("Not found", { status: 404 });

  if (params.section !== "orders" && params.section !== "diagnostics" && params.section !== "evidence" && params.section !== "reports") {
    return { page, rows: [], findings: [], totalOrders: 0, totalEvidence: 0, auditEvents: [], evidence: [], evidenceCount: 0 };
  }

  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return { page, rows: [], findings: [], totalOrders: 0, totalEvidence: 0, auditEvents: [], evidence: [], evidenceCount: 0 };

  const [orders, costs, evidenceCount, totalOrders, totalEvidence, auditEvents] = await Promise.all([
    params.section === "evidence" || params.section === "reports" ? Promise.resolve([]) : prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "desc" }, take: 250 }),
    prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "desc" }, take: params.section === "evidence" ? 500 : 10000 }),
    params.section === "evidence" ? prisma.shippingCost.count({ where: { merchantId: merchant.id } }) : Promise.resolve(0),
    prisma.shippingOrder.count({ where: { merchantId: merchant.id } }),
    prisma.shippingCost.count({ where: { merchantId: merchant.id } }),
    prisma.auditEvent.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  if (params.section === "evidence") {
    return {
      page, rows: [], findings: [], totalOrders: 0, evidenceCount,
      evidence: costs.map((cost) => ({
        id: cost.sourceRecordId,
        invoice: cost.sourceReference ?? "—",
        orderReference: cost.orderReference ?? "—",
        trackingNumber: cost.trackingNumber ?? "—",
        costType: cost.costType,
        amountMinor: cost.amountMinor.toString(),
        currency: cost.currency,
        occurredAt: cost.occurredAt?.toISOString() ?? null,
        sourceSystem: cost.sourceSystem,
      })),
    };
  }

  const orderInputs = orders.map((order) => ({
    orderId: order.sourceOrderId,
    orderName: order.orderName,
    shippingRevenue: { minor: order.shippingRevenueMinor, currency: order.currency },
    trackingNumbers: Array.isArray(order.trackingNumbers)
      ? order.trackingNumbers.filter((value): value is string => typeof value === "string")
      : [],
    costCoverage: order.costCoverageStatus === "complete" ? "complete" as const : order.costCoverageStatus === "partial" ? "partial" as const : "unknown" as const,
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
    page,
    totalOrders,
    totalEvidence,
    evidenceRows: params.section === "evidence" ? costs.slice(0, 250).map((cost) => ({
      id: cost.id, sourceSystem: cost.sourceSystem, sourceRecordId: cost.sourceRecordId,
      orderReference: cost.orderReference, trackingNumber: cost.trackingNumber,
      currency: cost.currency, amountMinor: cost.amountMinor.toString(), costType: cost.costType,
      occurredAt: cost.occurredAt?.toISOString() ?? null, sourceReference: cost.sourceReference,
    })) : [],
    auditEvents: auditEvents.map((event) => ({
      id: event.id, actor: event.actor, action: event.action, subjectType: event.subjectType,
      subjectId: event.subjectId, createdAt: event.createdAt.toISOString(),
    })),
    rows: reconciled.map((row) => ({
      orderId: row.orderId,
      orderName: orders.find((order) => order.sourceOrderId === row.orderId)?.orderName ?? row.orderId,
      currency: row.shippingRevenue.currency,
      collectedMinor: row.shippingRevenue.minor.toString(),
      evidencedCostMinor: row.evidencedCost?.minor.toString() ?? null,
      evidenceCount: row.evidenceIds.length,
      coverage: row.coverage,
      costCoverageStatus: orders.find((order) => order.sourceOrderId === row.orderId)?.costCoverageStatus ?? "unknown",
      coverageReviewedAt: orders.find((order) => order.sourceOrderId === row.orderId)?.coverageReviewedAt?.toISOString() ?? null,
    })),
    evidence: [], evidenceCount: 0,
    findings: findings.map((finding) => ({
      ruleId: finding.ruleId,
      orderId: finding.orderId,
      severity: finding.severity,
      title: finding.title,
      explanation: finding.explanation,
      evidenceIds: finding.evidenceIds,
    })),
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();

  if (params.section === "reports" && form.get("intent") === "export-report") {
    const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
    if (!merchant) return new Response("No merchant data is available.", { status: 404 });
    const [orders, costs] = await Promise.all([
      prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "asc" } }),
      prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "asc" } }),
    ]);
    const quote = (value: string | number | null) => {
      const text = value === null ? "" : String(value);
      return `"${text.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["record_type","order_id","order_name","date","currency","shipping_revenue_minor","cost_coverage_status","evidence_id","cost_amount_minor","cost_type","order_reference","tracking_number","source_reference"],
      ...orders.map((order) => ["order", order.sourceOrderId, order.orderName, order.orderedAt.toISOString(), order.currency, order.shippingRevenueMinor.toString(), order.costCoverageStatus, "", "", "", "", "", ""]),
      ...costs.map((cost) => ["cost_evidence", "", "", cost.occurredAt?.toISOString() ?? "", cost.currency, "", "", `${cost.sourceSystem}:${cost.sourceRecordId}`, cost.amountMinor.toString(), cost.costType, cost.orderReference ?? "", cost.trackingNumber ?? "", cost.sourceReference]),
    ];
    const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
    await prisma.auditEvent.create({ data: {
      merchantId: merchant.id, actor: session.id, action: "report_exported",
      subjectType: "merchant", subjectId: session.shop,
      detail: { orderCount: orders.length, evidenceCount: costs.length, format: "csv" },
    } });
    return new Response(csv, { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nodus-evidence-report-${new Date().toISOString().slice(0,10)}.csv"`,
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
    const actor = session.id;
    await prisma.$transaction([
      prisma.shippingOrder.update({
        where: { id: order.id },
        data: {
          costCoverageStatus: status,
          coverageReviewedAt: status === "unknown" ? null : new Date(),
          coverageReviewedBy: status === "unknown" ? null : actor,
        },
      }),
      prisma.auditEvent.create({
        data: {
          merchantId: merchant.id,
          actor,
          action: "shipping_cost_coverage_reviewed",
          subjectType: "shipping_order",
          subjectId: order.sourceOrderId,
          detail: { previousStatus: order.costCoverageStatus, newStatus: status },
        },
      }),
    ]);
    return { kind: "coverage" as const, ok: true, message: "Order coverage review saved and recorded in the audit log." };
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
      const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
      if (!merchant) return { kind: "simulation" as const, ok: false, message: "No Shopify order sample has been stored yet. Refresh the overview first." };
      const orders = await prisma.shippingOrder.findMany({
        where: { merchantId: merchant.id, subtotalMinor: { not: null } },
        orderBy: { orderedAt: "desc" },
        take: 250,
      });
      if (!orders.length) return { kind: "simulation" as const, ok: false, message: "No orders with a verified subtotal are available. Refresh the overview and check Shopify data permissions." };
      const result = simulateHistoricalShippingRevenue(orders.map((order) => ({
        orderId: order.sourceOrderId,
        subtotal: { minor: order.subtotalMinor!, currency: order.currency },
        shippingCollected: { minor: order.shippingRevenueMinor, currency: order.currency },
      })), { flatRate, freeShippingThreshold: threshold });
      return {
        kind: "simulation" as const,
        ok: true,
        result: {
          sampleSize: result.sampleSize,
          currency: result.currency,
          observed: result.observedShippingRevenueMinor,
          replayed: result.replayedShippingRevenueMinor,
          delta: result.revenueDeltaMinor,
          warning: result.warning,
          assumptions: result.assumptions,
        },
      };
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
  const page = data.page;
  const simulationResult = result?.kind === "simulation" && result.ok ? result.result : undefined;
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / WORKSPACE</p><h1>{page.title}</h1><p className="muted">{page.subtitle}</p></div></header>
    <section className="surface-card">
      <h3>{page.heading}</h3><p className="body-copy">{page.body}</p>
      {page.title === "Source evidence" ? <>
        <Form method="post" encType="multipart/form-data" className="import-form">
          <label htmlFor="cost-file">Carrier cost CSV</label>
          <input id="cost-file" name="file" type="file" accept=".csv,text/csv" required />
          <button type="submit">Import evidence</button>
          {result?.kind === "evidence" ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
        </Form>
        <div className="data-table-wrap">
          <p className="table-caption">{data.evidenceCount} imported invoice lines · showing latest {data.evidence.length}</p>
          <p className="body-copy">Imported rows remain source evidence. An order reference or tracking number is a matching candidate, not proof that all fulfillment costs have been captured.</p>
          <table className="data-table"><thead><tr><th>Invoice / line</th><th>Order reference</th><th>Tracking</th><th>Cost type</th><th>Amount</th><th>Charge date</th></tr></thead>
            <tbody>{data.evidence.map((item) => <tr key={item.id}><td>{item.invoice}<small>{item.id}</small></td><td>{item.orderReference}</td><td>{item.trackingNumber}</td><td>{item.costType}</td><td>{formatMinor(item.amountMinor,item.currency)}</td><td>{item.occurredAt ? new Date(item.occurredAt).toLocaleDateString() : "—"}</td></tr>)}
              {!data.evidence.length ? <tr><td colSpan={6}>No carrier cost evidence has been imported yet.</td></tr> : null}</tbody>
          </table>
          {data.evidenceCount > data.evidence.length ? <p className="footnote">Showing the latest 500 records. {data.evidenceCount - data.evidence.length} older records are retained.</p> : null}
        </div>
      </> : null}
      {page.title === "Order evidence" ? <div className="data-table-wrap">
        <p className="table-caption">{data.totalOrders} persisted orders · latest 250</p><p className="body-copy">Mark coverage complete only after all applicable carrier, label and 3PL costs for that order have been imported and checked. This is a merchant attestation, not an automatic inference.</p>{result?.kind === "coverage" ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
        <table className="data-table"><thead><tr><th>Order</th><th>Shipping collected</th><th>Evidenced cost</th><th>Evidence rows</th><th>Coverage</th><th>Review</th></tr></thead>
          <tbody>{data.rows.map((row) => <tr key={row.orderId}><td>{row.orderName}</td><td>{formatMinor(row.collectedMinor,row.currency)}</td><td>{formatMinor(row.evidencedCostMinor,row.currency)}</td><td>{row.evidenceCount}</td><td>{row.coverage} <small>({row.costCoverageStatus})</small></td><td><Form method="post" className="coverage-review-form"><input type="hidden" name="intent" value="review-coverage"/><input type="hidden" name="orderId" value={row.orderId}/><select name="coverageStatus" defaultValue={row.costCoverageStatus} aria-label={`Cost coverage for ${row.orderName}`}><option value="unknown">Unreviewed</option><option value="partial">Partial</option><option value="complete">Complete</option></select><button type="submit">Save review</button></Form>{row.coverageReviewedAt ? <small>Reviewed {new Date(row.coverageReviewedAt).toLocaleDateString()}</small> : null}</td></tr>)}
          {!data.rows.length ? <tr><td colSpan={6}>No persisted orders yet. Open the overview to refresh the latest Shopify sample.</td></tr> : null}</tbody>
        </table>
      </div> : null}
      {page.title === "Reports" ? <div className="report-panel"><p className="table-caption">{data.totalOrders} orders · {data.totalEvidence} cost records</p><p className="body-copy">Export a merchant-scoped CSV containing stored Shopify order records, imported carrier cost evidence and each order's coverage-review status. Export actions are recorded in the audit log.</p><Form method="post"><input type="hidden" name="intent" value="export-report"/><button type="submit">Export complete evidence CSV</button></Form><h4>Recent audit activity</h4><div className="finding-list">{data.auditEvents.map((event) => <article className="finding-row" key={event.id}><span className="tag">{event.action}</span><div><strong>{event.subjectType}: {event.subjectId}</strong><p>{event.actor}</p><small>{new Date(event.createdAt).toLocaleString()}</small></div></article>)}{!data.auditEvents.length ? <p className="body-copy">No audit activity recorded yet.</p> : null}</div></div> : null}
      {page.title === "Diagnostics" ? <div className="finding-list">
        <p className="table-caption">{data.findings.length} coverage findings · {data.totalOrders} orders analyzed</p>
        {data.findings.map((finding) => <article className="finding-row" key={finding.ruleId + finding.orderId}>
          <span className="tag">{finding.severity}</span><div><strong>{finding.title}</strong><p>{finding.explanation}</p><small>{finding.orderId} · {finding.evidenceIds.length} evidence references</small></div>
        </article>)}
        {!data.findings.length ? <p className="body-copy">No findings. This is not proof of zero shipping leakage; confirm that the order sample and cost evidence are complete.</p> : null}
      </div> : null}
      {page.title === "Policy simulations" ? <Form method="post" className="import-form">
        <label htmlFor="flat-rate">Proposed flat shipping rate</label>
        <input id="flat-rate" name="flatRate" type="number" min="0" step="0.001" placeholder="e.g. 6.50" required />
        <label htmlFor="currency">Currency (ISO 4217)</label>
        <input id="currency" name="currency" type="text" minLength={3} maxLength={3} defaultValue="USD" required />
        <label htmlFor="free-threshold">Optional free-shipping threshold</label>
        <input id="free-threshold" name="freeShippingThreshold" type="number" min="0" step="0.001" placeholder="Leave blank to disable" />
        <button type="submit">Run historical replay</button>
        {result?.kind === "simulation" && !result.ok ? <p role="status" className="import-error">{result.message}</p> : null}
        {simulationResult ? <div className="simulation-result">
          <p className="eyebrow">HISTORICAL REPLAY · {simulationResult.sampleSize} ORDERS</p>
          <div className="simulation-metrics">
            <div><small>Observed shipping revenue</small><strong>{formatMinor(simulationResult.observed,simulationResult.currency)}</strong></div>
            <div><small>Replayed shipping revenue</small><strong>{formatMinor(simulationResult.replayed,simulationResult.currency)}</strong></div>
            <div><small>Revenue difference</small><strong>{formatMinor(simulationResult.delta,simulationResult.currency)}</strong></div>
          </div>
          <p className="body-copy">{simulationResult.warning}</p>
          <ul>{simulationResult.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
        </div> : null}
      </Form> : null}
    </section>
  </div>;
}
