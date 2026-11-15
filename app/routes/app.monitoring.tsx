import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const merchant = await prisma.merchant.findUnique({ where: { shop: session.shop }, select: { id: true } });
  if (!merchant) return { state: null, configured: Boolean(process.env.CRON_SECRET) };
  const state = await prisma.scheduledSyncState.findUnique({ where: { merchantId: merchant.id } });
  return {
    configured: Boolean(process.env.CRON_SECRET),
    state: state ? {
      status: state.status, nextRunAt: state.nextRunAt.toISOString(),
      lastRunAt: state.lastRunAt?.toISOString() ?? null,
      lastSuccessAt: state.lastSuccessAt?.toISOString() ?? null,
      failureCount: state.failureCount, lastError: state.lastError,
    } : null,
  };
}

export default function Monitoring() {
  const { state, configured } = useLoaderData<typeof loader>();
  const date = (value: string | null) => value ? new Date(value).toLocaleString() : "Not yet recorded";
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / OPERATIONS</p><h1>Continuous monitoring</h1><p className="muted">Scheduled Shopify order refresh, resumable backfill and failure recovery.</p></div><span className="connection-pill"><i/> {configured ? "CRON SECRET PRESENT" : "SCHEDULER NOT CONFIGURED"}</span></header>
    <section className="metric-grid">
      <article className="metric-card"><span>Scheduler</span><strong className="metric-pending">{configured ? "Configured" : "Awaiting secret"}</strong><small>Vercel Cron must be deployed and authorized.</small></article>
      <article className="metric-card"><span>Last successful sync</span><strong>{date(state?.lastSuccessAt ?? null)}</strong><small>Only successful Shopify refreshes are recorded.</small></article>
      <article className="metric-card"><span>Next scheduled run</span><strong>{date(state?.nextRunAt ?? null)}</strong><small>15-minute cadence; 2-minute continuation while a backfill remains.</small></article>
    </section>
    <section className="surface-card">
      <h3>Operational status</h3>
      <div className="progress-caption"><span>Current state</span><strong>{state?.status ?? "Not initialized"}</strong></div>
      <div className="progress-caption"><span>Last attempt</span><strong>{date(state?.lastRunAt ?? null)}</strong></div>
      <div className="progress-caption"><span>Consecutive failures</span><strong>{state?.failureCount ?? 0}</strong></div>
      {state?.lastError ? <p className="import-error" role="status">{state.lastError}</p> : null}
      {!configured ? <p className="footnote">Set CRON_SECRET in the Vercel Production environment. Vercel Cron sends it as a bearer token. Never expose this value in browser code or source control.</p> : null}
      {!state ? <p className="body-copy">Open the Overview and complete the first Shopify order sync to initialize the scheduled sync state.</p> : null}
      <p className="footnote">The scheduler refreshes Shopify order data and resumes incomplete pagination. It does not yet poll carrier billing systems or automatically validate financial recoveries. Carrier invoice evidence still comes from merchant-authorized imports.</p>
    </section>
  </div>;
}
