import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate, requireShopifyConfiguration } from "../shopify.server";
import { prisma } from "../db.server";
import { reconcileShipping } from "../domain/reconcile";
import { diagnoseReconciliation } from "../domain/diagnostics";

const validStatuses = new Set(["open", "investigating", "resolved", "ignored"]);

export async function loader({ request }: LoaderFunctionArgs) {
  requireShopifyConfiguration();
  const { session } = await authenticate.admin(request);
  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return { cases: [], totals: { open: 0, investigating: 0, resolved: 0, ignored: 0 }, analyzedAt: new Date().toISOString(), limited: false };

  const [orders, costs] = await Promise.all([
    prisma.shippingOrder.findMany({ where: { merchantId: merchant.id }, orderBy: { orderedAt: "desc" }, take: 500 }),
    prisma.shippingCost.findMany({ where: { merchantId: merchant.id }, orderBy: { occurredAt: "desc" }, take: 10000 }),
  ]);
  const orderInputs = orders.map(order => ({
    orderId: order.sourceOrderId,
    orderName: order.orderName,
    shippingRevenue: { minor: order.shippingRevenueMinor, currency: order.currency },
    trackingNumbers: Array.isArray(order.trackingNumbers) ? order.trackingNumbers.filter((v): v is string => typeof v === "string") : [],
    costCoverage: order.costCoverageStatus === "complete" ? "complete" as const : order.costCoverageStatus === "partial" ? "partial" as const : "unknown" as const,
    taxesIncluded: order.taxesIncluded,
  }));
  const costInputs = costs.map(cost => ({
    evidenceId: `${cost.sourceSystem}:${cost.sourceRecordId}`,
    amount: { minor: cost.amountMinor, currency: cost.currency },
    orderReference: cost.orderReference,
    trackingNumber: cost.trackingNumber,
  }));
  const findings = diagnoseReconciliation(reconcileShipping(orderInputs, costInputs));
  const now = new Date();
  for (const finding of findings) {
    const fingerprint = `${finding.ruleId}:${finding.orderId}`;
    await prisma.shippingReviewCase.upsert({
      where: { merchantId_fingerprint: { merchantId: merchant.id, fingerprint } },
      create: {
        merchantId: merchant.id, fingerprint, orderId: finding.orderId,
        title: finding.title, severity: finding.severity, explanation: finding.explanation,
        lastSeenAt: now,
      },
      update: {
        title: finding.title, severity: finding.severity, explanation: finding.explanation,
        lastSeenAt: now,
      },
    });
  }

  const cases = await prisma.shippingReviewCase.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ status: "asc" }, { lastSeenAt: "desc" }],
    take: 500,
  });
  const totals = { open: 0, investigating: 0, resolved: 0, ignored: 0 };
  for (const item of cases) if (item.status in totals) totals[item.status as keyof typeof totals] += 1;
  return {
    cases: cases.map(item => ({
      id: item.id, orderId: item.orderId, title: item.title, severity: item.severity,
      explanation: item.explanation, status: item.status, note: item.note,
      firstSeenAt: item.firstSeenAt.toISOString(), lastSeenAt: item.lastSeenAt.toISOString(),
    })),
    totals, analyzedAt: now.toISOString(),
    limited: orders.length === 500 || costs.length === 10000,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  requireShopifyConfiguration();
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const caseId = String(form.get("caseId") ?? "");
  const status = String(form.get("status") ?? "");
  const note = String(form.get("note") ?? "").trim().slice(0, 2000);
  if (!caseId || !validStatuses.has(status)) return { ok: false, message: "Choose a valid case and status." };
  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return { ok: false, message: "Merchant record not found." };
  const record = await prisma.shippingReviewCase.findFirst({ where: { id: caseId, merchantId: merchant.id }, select: { id: true, orderId: true, status: true } });
  if (!record) return { ok: false, message: "That review case does not belong to this store." };
  await prisma.$transaction([
    prisma.shippingReviewCase.update({ where: { id: record.id }, data: { status, note: note || null } }),
    prisma.auditEvent.create({
      data: {
        merchantId: merchant.id, actor: session.id, action: "shipping_review_case_updated",
        subjectType: "shipping_review_case", subjectId: record.id,
        detail: { orderId: record.orderId, previousStatus: record.status, status, notePresent: Boolean(note) },
      },
    }),
  ]);
  return { ok: true, message: "Review case updated." };
}

export default function ReviewQueue() {
  const data = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / OPERATIONS</p><h1>Shipping review queue</h1><p className="muted">A persistent worklist of evidence gaps and reconciliation findings for this store.</p></div><span className="connection-pill"><i/> Evidence-linked</span></header>
    {result ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
    <section className="metric-grid">
      <article className="metric-card"><span>Open</span><strong>{data.totals.open}</strong><small>Needs review</small></article>
      <article className="metric-card"><span>Investigating</span><strong>{data.totals.investigating}</strong><small>Being worked</small></article>
      <article className="metric-card"><span>Resolved / ignored</span><strong>{data.totals.resolved + data.totals.ignored}</strong><small>Closed by the merchant</small></article>
    </section>
    <section className="surface-card">
      <div className="card-heading"><div><p className="eyebrow">PERSISTENT EXCEPTION REGISTER</p><h3>What needs attention</h3></div><span className="tag">{data.cases.length} cases</span></div>
      <p className="body-copy">NODUS refreshes this queue from the latest stored orders and imported cost evidence whenever this page loads. Status and notes remain attached to each case. Findings are not proof of carrier error or recoverable money.</p>
      {data.limited ? <p className="footnote">This view is bounded to the latest 500 orders and 10,000 cost records. Review the full Decision Pack for complete stored-scope analysis.</p> : null}
      <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Finding</th><th>Order</th><th>Severity</th><th>Status</th><th>Last observed</th><th>Review action</th></tr></thead>
        <tbody>{data.cases.map(item => <tr key={item.id}>
          <td><b>{item.title}</b><small>{item.explanation}</small>{item.note ? <small>Merchant note: {item.note}</small> : null}</td>
          <td>{item.orderId}</td><td>{item.severity}</td><td>{item.status}</td><td>{new Date(item.lastSeenAt).toLocaleString()}</td>
          <td><Form method="post" className="coverage-review-form"><input type="hidden" name="caseId" value={item.id}/><select name="status" defaultValue={item.status} aria-label={`Status for ${item.title}`}><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="ignored">Ignored</option></select><input name="note" maxLength={2000} defaultValue={item.note ?? ""} placeholder="Investigation note" aria-label="Investigation note"/><button type="submit">Save</button></Form></td>
        </tr>)}
        {!data.cases.length ? <tr><td colSpan={6}>No current findings. Import a carrier-cost file and review order coverage to build a useful exception register.</td></tr> : null}</tbody></table></div>
      <p className="footnote">Last recalculated: {new Date(data.analyzedAt).toLocaleString()}. A resolved case remains in the history; if its underlying finding is still present, it will continue to show as resolved until the merchant changes its status.</p>
    </section>
  </div>;
}
