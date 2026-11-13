import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { getShippingSnapshot } from "../services/shipping-snapshot.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  try {
    const snapshot = await getShippingSnapshot(admin);
    return {
      ...snapshot,
      shippingRevenueMinor: snapshot.shippingRevenueMinor.toString(),
      syncError: null as string | null,
    };
  } catch (error) {
    const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true, shopName: true } });
    if (!merchant) {
      return {
        shopName: session.shop, shopDomain: session.shop, sampledOrders: 0, persistedOrders: 0,
        shippingRevenueMinor: "0", currency: null, mixedCurrencies: false, sampleWindowStart: null,
        paginationComplete: false, pagesThisRun: 0, totalPagesProcessed: 0, lastCompletedAt: null,
        syncError: error instanceof Error ? error.message : "Shopify sync failed.",
      };
    }
    const [aggregates, syncState] = await Promise.all([
      prisma.shippingOrder.groupBy({
        by: ["currency"],
        where: { merchantId: merchant.id },
        _count: { _all: true },
        _sum: { shippingRevenueMinor: true },
        _min: { orderedAt: true },
      }),
      prisma.shopifySyncState.findUnique({ where: { merchantId: merchant.id } }),
    ]);
    const currency = aggregates.length === 1 ? aggregates[0]!.currency : null;
    const persistedOrders = aggregates.reduce((sum, item) => sum + item._count._all, 0);
    const sampleWindowStart = aggregates.map((item) => item._min.orderedAt)
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime())[0]?.toISOString() ?? null;
    return {
      shopName: merchant.shopName ?? session.shop,
      shopDomain: session.shop,
      sampledOrders: persistedOrders,
      persistedOrders,
      shippingRevenueMinor: currency ? (aggregates[0]!._sum.shippingRevenueMinor ?? 0n).toString() : "0",
      currency,
      mixedCurrencies: aggregates.length > 1,
      sampleWindowStart,
      paginationComplete: !syncState?.hasMore,
      pagesThisRun: 0,
      totalPagesProcessed: syncState?.pagesProcessed ?? 0,
      lastCompletedAt: syncState?.lastCompletedAt?.toISOString() ?? null,
      syncError: error instanceof Error ? error.message : "Shopify sync failed.",
    };
  }
}

function formatMoney(minor: string, currency: string | null) {
  if (!currency) return "Mixed currencies";
  const zero = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
  const precision = zero.has(currency) ? 0 : 2;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: precision })
    .format(Number(BigInt(minor)) / 10 ** precision);
}

export default function Overview() {
  const d = useLoaderData<typeof loader>();
  return <div className="page-wrap">
    <header className="topbar">
      <div><p className="eyebrow">WORKSPACE / OVERVIEW</p><h1>Shipping intelligence</h1><p className="muted">A source-backed view of your store's shipping economics.</p></div>
      <span className="connection-pill"><i/> Connected to Shopify</span>
    </header>
    {d.syncError ? <p className="import-error" role="alert">Latest Shopify sync failed: {d.syncError}. Previously stored order data remains available below.</p> : null}
    <section className="welcome-panel">
      <div><p className="eyebrow">MERCHANT WORKSPACE</p><h2>{d.shopName}</h2><p>{d.shopDomain}</p></div>
      <div className="welcome-note"><span className="status-dot"/> Shopify connection authenticated</div>
    </section>
    <section className="metric-grid">
      <article className="metric-card"><span>Orders stored</span><strong>{d.sampledOrders.toLocaleString()}</strong><small>Persisted order history · up to 2,500 orders processed per visit</small></article>
      <article className="metric-card"><span>Shipping collected</span><strong>{formatMoney(d.shippingRevenueMinor, d.currency)}</strong><small>{d.mixedCurrencies ? "Mixed currencies; aggregate withheld" : "Persisted Shopify orders only"}</small></article>
      <article className="metric-card"><span>Cost evidence</span><strong className="metric-pending">Review required</strong><small>Carrier and 3PL cost evidence must be imported and reviewed</small></article>
    </section>
    <section className="content-grid">
      <article className="surface-card">
        <div className="card-heading"><div><p className="eyebrow">01 / RECONCILIATION</p><h3>Shipping cost coverage</h3></div><span className="tag">Awaiting review</span></div>
        <p className="body-copy">NODUS has stored Shopify order shipping charges. It will not calculate a cost gap until supported label, carrier or 3PL cost evidence is connected and its coverage is reviewed.</p>
        <div className="progress-caption"><span>Store connection</span><strong>Connected</strong></div>
        <div className="progress-caption"><span>Cost evidence</span><strong>Review required</strong></div>
        <div className="progress-caption"><span>Reconciliation</span><strong>Pending evidence review</strong></div>
      </article>
      <article className="surface-card">
        <p className="eyebrow">02 / NEXT ACTION</p><h3>Review cost evidence</h3>
        <p className="body-copy">Import carrier cost records, inspect the order matches, then attest coverage per order. NODUS does not infer zero cost from missing evidence.</p>
        <span className="tag tag-warning">No savings estimate available</span>
      </article>
    </section>
    <p className="footnote">
      Persisted history currently contains {d.sampledOrders.toLocaleString()} orders. {d.sampleWindowStart ? "Oldest stored order: " + new Date(d.sampleWindowStart).toLocaleDateString() + ". " : ""}
      This visit processed {d.pagesThisRun} pages; {d.totalPagesProcessed} pages have been processed in the current sync.
      {d.paginationComplete ? " The current sync is complete." : " Historical sync is checkpointed. Reopen Overview to continue from the saved cursor."}
      {d.lastCompletedAt ? " Last completed sync: " + new Date(d.lastCompletedAt).toLocaleString() + "." : ""}
      {" "}Shopify exposes only the most recent 60 days under the current read_orders grant. Older history requires Shopify approval for read_all_orders; NODUS does not claim that access. Shipping revenue is not profit.
    </p>
  </div>;
}
