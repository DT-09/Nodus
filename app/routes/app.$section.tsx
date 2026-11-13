import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { importCarrierCostCsv } from "../services/cost-import.server";
import { reconcileShipping } from "../domain/reconcile";
import { diagnoseReconciliation } from "../domain/diagnostics";

const pages: Record<string, { title: string; subtitle: string; heading: string; body: string }> = {
  orders: { title: "Order evidence", subtitle: "Order-level shipping revenue and fulfillment evidence.", heading: "Persisted Shopify order sample", body: "Orders are refreshed from the latest bounded Shopify sample. Imported cost records are matched only by an exact order reference or an unambiguous tracking number. Cost coverage remains partial until independently reviewed." },
  evidence: { title: "Source evidence", subtitle: "Carrier invoices, labels and 3PL records.", heading: "Import carrier cost evidence", body: "Upload a carrier CSV with invoice_id, charge_id, amount and currency. Optional columns: order_reference, tracking_number, occurred_at and cost_type. Imported costs are stored against your authenticated shop; ambiguous matches are not auto-allocated." },
  diagnostics: { title: "Diagnostics", subtitle: "Evidence-backed causes, not unexplained alerts.", heading: "Evidence coverage and findings", body: "Findings are generated from persisted Shopify orders and imported cost records. Missing evidence is reported as a coverage gap, never as zero cost or a confirmed loss." },
  simulations: { title: "Policy simulations", subtitle: "Compare proposed policies against historical order scenarios.", heading: "Historical replay engine available", body: "Simulation compares shipping revenue for a supplied historical sample. It does not predict conversion, abandonment, order volume or profit." },
  policies: { title: "Policy control", subtitle: "Proposed changes, merchant approvals and verification.", heading: "Write access is disabled", body: "NODUS is read-only until each supported Shopify mutation, permission, baseline check and read-back verification has passed development-store tests. No shipping configuration has been changed." },
  monitoring: { title: "Continuous monitoring", subtitle: "Policy drift, new exceptions and post-change outcomes.", heading: "Monitoring is not active", body: "Scheduled jobs and durable event processing must be configured before NODUS can claim continuous monitoring." },
  reports: { title: "Reports", subtitle: "Traceable results, coverage and decision history.", heading: "No reports generated", body: "Reports will be available after the underlying evidence, reconciliation and review workflows are complete." }
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const page = pages[params.section ?? ""];
  if (!page) throw new Response("Not found", { status: 404 });

  if (params.section !== "orders" && params.section !== "diagnostics") {
    return { page, rows: [], findings: [], totalOrders: 0 };
  }

  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return { page, rows: [], findings: [], totalOrders: 0 };

  const [orders, costs] = await Promise.all([
    prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "desc" }, take: 250 }),
    prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "desc" } }),
  ]);

  const orderInputs = orders.map((order) => ({
    orderId: order.sourceOrderId,
    orderName: order.orderName,
    shippingRevenue: { minor: order.shippingRevenueMinor, currency: order.currency },
    trackingNumbers: Array.isArray(order.trackingNumbers)
      ? order.trackingNumbers.filter((value): value is string => typeof value === "string")
      : [],
    costCoverage: "partial" as const,
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
    totalOrders: orders.length,
    rows: reconciled.map((row) => ({
      orderId: row.orderId,
      orderName: orders.find((order) => order.sourceOrderId === row.orderId)?.orderName ?? row.orderId,
      currency: row.shippingRevenue.currency,
      collectedMinor: row.shippingRevenue.minor.toString(),
      evidencedCostMinor: row.evidencedCost?.minor.toString() ?? null,
      evidenceCount: row.evidenceIds.length,
      coverage: row.coverage,
    })),
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
  if (params.section !== "evidence") throw new Response("Not found", { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Choose a CSV file." };
  if (file.size < 1 || file.size > 5 * 1024 * 1024) return { ok: false, message: "CSV must be between 1 byte and 5 MB." };
  if (!file.name.toLowerCase().endsWith(".csv")) return { ok: false, message: "Only .csv files are accepted." };
  try {
    const result = await importCarrierCostCsv(session.shop, await file.text());
    return { ok: true, message: `Received ${result.received}; imported ${result.imported}; skipped ${result.duplicates} duplicate rows.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Import failed." };
  }
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
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / WORKSPACE</p><h1>{page.title}</h1><p className="muted">{page.subtitle}</p></div></header>
    <section className="surface-card">
      <h3>{page.heading}</h3><p className="body-copy">{page.body}</p>
      {page.title === "Source evidence" ? <Form method="post" encType="multipart/form-data" className="import-form">
        <label htmlFor="cost-file">Carrier cost CSV</label>
        <input id="cost-file" name="file" type="file" accept=".csv,text/csv" required />
        <button type="submit">Import evidence</button>
        {result ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
      </Form> : null}
      {page.title === "Order evidence" ? <div className="data-table-wrap">
        <p className="table-caption">{data.totalOrders} persisted orders · latest 250</p>
        <table className="data-table"><thead><tr><th>Order</th><th>Shipping collected</th><th>Evidenced cost</th><th>Evidence rows</th><th>Coverage</th></tr></thead>
          <tbody>{data.rows.map((row) => <tr key={row.orderId}><td>{row.orderName}</td><td>{formatMinor(row.collectedMinor,row.currency)}</td><td>{formatMinor(row.evidencedCostMinor,row.currency)}</td><td>{row.evidenceCount}</td><td>{row.coverage}</td></tr>)}
          {!data.rows.length ? <tr><td colSpan={5}>No persisted orders yet. Open the overview to refresh the latest Shopify sample.</td></tr> : null}</tbody>
        </table>
      </div> : null}
      {page.title === "Diagnostics" ? <div className="finding-list">
        <p className="table-caption">{data.findings.length} coverage findings · {data.totalOrders} orders analyzed</p>
        {data.findings.map((finding) => <article className="finding-row" key={finding.ruleId + finding.orderId}>
          <span className="tag">{finding.severity}</span><div><strong>{finding.title}</strong><p>{finding.explanation}</p><small>{finding.orderId} · {finding.evidenceIds.length} evidence references</small></div>
        </article>)}
        {!data.findings.length ? <p className="body-copy">No findings. This is not proof of zero shipping leakage; confirm that the order sample and cost evidence are complete.</p> : null}
      </div> : null}
    </section>
  </div>;
}
