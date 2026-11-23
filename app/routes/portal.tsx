import { useEffect, useState, type FormEvent } from "react";
import type { MetaFunction } from "react-router";
import "./threepl-portal.css";

export const meta: MetaFunction = () => [
  { title: "NODUS 3PL Control — Merchant workspace" },
  { name: "robots", content: "noindex, nofollow" },
  { name: "referrer", content: "no-referrer" },
];

type PortalData = {
  workspace: { id: string; businessName: string; status: string; planCode: string | null; trialActivatedAt: string | null; trialEndsAt: string | null; subscriptionStatus: string; subscriptionEndsAt: string | null };
  canWrite: boolean;
  providers: Array<{ id: string; name: string; status: string }>;
  invoices: Array<{ id: string; number: string; provider: string; date: string; currency: string; totalMinor: string; status: string; lineCount: number; runCount: number }>;
  exceptions: Array<{ id: string; invoiceNumber: string; provider: string; code: string; severity: string; state: string; status: string; currency: string; exposureMinor: string | null; explanation: string; note: string | null; evidence: unknown[]; events: Array<{action:string;detail:unknown;createdAt:string}>; outcomes: number; lastSeenAt: string }>;
  reports: Array<{ id: string; start: string; end: string; revision: number; status: string; generatedAt: string; payload: any }>;
  outcomes: Array<{ id: string; exceptionId: string; type: string; status: string; amountMinor: string; currency: string; reference: string | null; note: string; verifiedAt: string | null; findingCode: string }>;
  workspaceEvents: Array<{ action: string; detail: unknown; createdAt: string }>;
};

function money(minor: string, currency: string) {
  const zero = new Set(["BIF","CLP","DJF","GNF","JPY","KMF","KRW","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"]);
  const three = new Set(["BHD","IQD","JOD","KWD","LYD","OMR","TND"]);
  const precision = zero.has(currency) ? 0 : three.has(currency) ? 3 : 2;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: precision })
    .format(Number(BigInt(minor)) / 10 ** precision);
}
function date(value: string | null) { return value ? new Date(value).toLocaleDateString() : "—"; }

export default function ThreePLPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [invite, setInvite] = useState("");
  const [authRequired, setAuthRequired] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/threepl/data", { cache: "no-store", credentials: "same-origin" });
      if (response.status === 401) { setAuthRequired(true); setData(null); return; }
      const body = await response.json() as PortalData & { error?: string };
      if (!response.ok) throw new Error(body.error || "Unable to load the workspace.");
      setData(body); setAuthRequired(false); setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load the workspace.");
    } finally { setLoading(false); }
  }

  async function exchange(token: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/threepl/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: token }), credentials: "same-origin",
      });
      const body = await response.json() as { ok?: boolean; error?: string; businessName?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || "The access link is invalid or expired.");
      setInvite(""); setMessage("Secure workspace session established for " + (body.businessName || "your business") + ".");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Access could not be established."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("invite");
    if (token) {
      window.history.replaceState({}, "", window.location.pathname);
      void exchange(token);
    } else { void load(); }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>, successMessage?: string) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const form = event.currentTarget;
      const response = await fetch("/api/threepl/data", { method: "POST", body: new FormData(form), credentials: "same-origin" });
      const body = await response.json() as { ok?: boolean; error?: string; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || "The action could not be completed.");
      setMessage(body.message || successMessage || "Saved.");
      form.reset();
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "The action could not be completed."); }
    finally { setBusy(false); }
  }

  function downloadReport(report: PortalData["reports"][number]) {
    const body = JSON.stringify({ schema: "nodus.3pl-period-report.v1", reportId: report.id, revision: report.revision, generatedAt: report.generatedAt, payload: report.payload }, null, 2);
    const blob = new Blob([body], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "nodus-3pl-period-report-" + report.id + ".json";
    anchor.click(); URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/threepl/session", { method: "DELETE", credentials: "same-origin" });
    setData(null); setAuthRequired(true); setMessage("You have signed out.");
  }

  if (loading && !data && !authRequired) return <main className="tp-shell"><p className="tp-kicker">NODUS / MERCHANT CONTROL</p><h1>Loading workspace…</h1></main>;

  if (authRequired || !data) return <main className="tp-shell tp-auth">
    <a className="tp-brand" href="/">NODUS <span>3PL CONTROL</span></a>
    <p className="tp-kicker">PRIVATE MERCHANT ACCESS</p>
    <h1>Your fulfilment.<br/><em>On the record.</em></h1>
    <p className="tp-lede">Enter the private access token supplied by NODUS. Access links expire and can be revoked.</p>
    <form onSubmit={e => { e.preventDefault(); void exchange(invite.trim()); }} className="tp-panel">
      <label>MERCHANT ACCESS TOKEN<input value={invite} onChange={e => setInvite(e.currentTarget.value)} autoComplete="off" required /></label>
      <button disabled={busy || !invite.trim()}>{busy ? "VERIFYING…" : "OPEN SECURE WORKSPACE"}</button>
    </form>
    {message ? <p role="status" className="tp-success">{message}</p> : null}
    {error ? <p role="alert" className="tp-error">{error}</p> : null}
    <p className="tp-footnote">Do not share this token. NODUS will never ask for your Shopify password or payment credentials here.</p>
  </main>;

  const canWrite = data.canWrite;
  return <main className="tp-shell">
    <header className="tp-header">
      <div><a className="tp-brand" href="/">NODUS <span>3PL CONTROL</span></a><p className="tp-kicker">MERCHANT OPERATIONS / PRIVATE WORKSPACE</p><h1>{data.workspace.businessName}</h1><p className="tp-lede">Contract billing, operational evidence and provider outcomes in one merchant-owned record.</p></div>
      <div className="tp-account"><span className={"tp-status tp-" + data.workspace.status}>{data.workspace.status.replaceAll("_", " ")}</span><button className="tp-quiet" onClick={() => void logout()}>Sign out</button></div>
    </header>
    <div className="tp-alerts">{message ? <p role="status" className="tp-success">{message}</p> : null}{error ? <p role="alert" className="tp-error">{error}</p> : null}</div>
    <section className="tp-metrics">
      <article><span>PROVIDERS</span><strong>{data.providers.length}</strong></article>
      <article><span>INVOICES</span><strong>{data.invoices.length}</strong></article>
      <article><span>OPEN EXCEPTIONS</span><strong>{data.exceptions.filter(x => !["verified_closed","rejected","ignored"].includes(x.status)).length}</strong></article>
      <article><span>VERIFIED OUTCOMES</span><strong>{data.outcomes.filter(x => x.status === "verified").length}</strong></article>
    </section>
    {data.workspace.status === "trial" || data.workspace.status === "trial_expired" || data.workspace.status === "subscription_expired" ? <section className="tp-trial"><div><span>SEVEN-DAY TRIAL</span><strong>{data.workspace.status === "trial_expired" ? "Trial period ended" : data.workspace.status === "subscription_expired" ? "Subscription period ended" : "Trial active"}</strong></div><p>{data.workspace.trialEndsAt ? "Trial end: " + new Date(data.workspace.trialEndsAt).toLocaleString() : data.workspace.subscriptionEndsAt ? "Subscription access ended: " + new Date(data.workspace.subscriptionEndsAt).toLocaleString() : "The trial period has not been activated."} {data.workspace.subscriptionStatus === "active" ? "Subscription active." : data.workspace.subscriptionStatus === "cancelled" && data.workspace.subscriptionEndsAt && new Date(data.workspace.subscriptionEndsAt) > new Date() ? "Subscription remains active until its recorded period end." : "Your workspace is read-only until access is reactivated."}</p></section> : null}
    {!canWrite ? <section className="tp-warning">This workspace is read-only. NODUS can still display stored records and reports, but new imports and processing are paused until an active trial or subscription is in place.</section> : null}

    <section className="tp-section">
      <div className="tp-section-heading"><div><p className="tp-kicker">01 / PROVIDER SETUP</p><h2>Fulfilment partners</h2></div></div>
      <div className="tp-panel">
        <form onSubmit={e => void submit(e)} className="tp-inline-form"><input type="hidden" name="intent" value="create_provider"/><label>PROVIDER NAME<input name="name" placeholder="3PL provider" required maxLength={120}/></label><button disabled={!canWrite || busy}>ADD PROVIDER</button></form>
        <div className="tp-provider-list">{data.providers.map(p => <span key={p.id}>{p.name}<small>{p.status}</small></span>)}{!data.providers.length ? <p>No provider has been added yet.</p> : null}</div>
      </div>
    </section>

    <section className="tp-section">
      <div className="tp-section-heading"><div><p className="tp-kicker">02 / SOURCE RECORDS</p><h2>Bring the evidence in</h2><p>CSV imports are validated before records are saved. Source files are processed in memory; NODUS stores normalized rows, source row numbers, file hashes and source names.</p></div></div>
      <div className="tp-grid">
        <form className="tp-panel tp-form" onSubmit={e => void submit(e)}><input type="hidden" name="intent" value="import_contract"/><h3>Contract rate card</h3><label>PROVIDER<select name="providerId" required defaultValue=""><option value="" disabled>Select provider</option>{data.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>CONTRACT NAME<input name="name" required defaultValue="3PL rate card"/></label><label>RATE CARD CSV<input type="file" name="file" accept=".csv,text/csv" required/></label><label className="tp-check"><input type="checkbox" name="confirmed" required/>I checked these rows against the signed agreement.</label><p className="tp-footnote">Required columns: charge_code, unit, pricing, rate, currency, effective_from. Optional: effective_to. pricing: per_unit or fixed.</p><button disabled={!canWrite || busy}>IMPORT VERIFIED RATE CARD</button></form>
        <form className="tp-panel tp-form" onSubmit={e => void submit(e)}><input type="hidden" name="intent" value="import_invoice"/><h3>Provider invoice</h3><label>PROVIDER<select name="providerId" required defaultValue=""><option value="" disabled>Select provider</option>{data.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>INVOICE CSV<input type="file" name="file" accept=".csv,text/csv" required/></label><p className="tp-footnote">One invoice per file. Required columns: invoice_number, invoice_date, charge_code, quantity, unit, amount, currency. Optional: description, activity_reference, service_date, period_start and period_end. Contract rates use service_date when present; otherwise invoice_date.</p><button disabled={!canWrite || busy}>IMPORT INVOICE</button></form>
        <form className="tp-panel tp-form" onSubmit={e => void submit(e)}><input type="hidden" name="intent" value="import_activity"/><h3>Operational activity</h3><label>PROVIDER<select name="providerId" required defaultValue=""><option value="" disabled>Select provider</option>{data.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>ACTIVITY CSV<input type="file" name="file" accept=".csv,text/csv" required/></label><p className="tp-footnote">Required columns: record_id, reference, charge_code, quantity, unit. Optional: occurred_at. References must match invoice activity_reference exactly.</p><button disabled={!canWrite || busy}>IMPORT ACTIVITY</button></form>
      </div>
    </section>

    <section className="tp-section">
      <div className="tp-section-heading"><div><p className="tp-kicker">03 / RECONCILIATION</p><h2>Invoice control</h2><p>Contract rates are matched by charge code and effective date. Quantity checks require exact-reference activity evidence.</p></div></div>
      <div className="tp-table-wrap"><table><thead><tr><th>INVOICE</th><th>PROVIDER</th><th>DATE</th><th>LINES</th><th>AMOUNT</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{data.invoices.map(invoice=><tr key={invoice.id}><td>{invoice.number}</td><td>{invoice.provider}</td><td>{date(invoice.date)}</td><td>{invoice.lineCount}</td><td>{money(invoice.totalMinor,invoice.currency)}</td><td>{invoice.status}</td><td><form onSubmit={e=>void submit(e)}><input type="hidden" name="intent" value="reconcile"/><input type="hidden" name="invoiceId" value={invoice.id}/><button className="tp-small" disabled={!canWrite || busy}>RECONCILE</button></form></td></tr>)}{!data.invoices.length?<tr><td colSpan={7}>No invoice records yet.</td></tr>:null}</tbody></table></div>
    </section>

    <section className="tp-section">
      <div className="tp-section-heading"><div><p className="tp-kicker">04 / INVESTIGATION</p><h2>Exception register</h2><p>Every finding carries its source references, calculation state and investigation history. A calculated variance is not proof of provider liability.</p></div></div>
      <div className="tp-exceptions">{data.exceptions.map(item=><article className="tp-panel tp-exception" key={item.id}><div className="tp-exception-head"><div><span className="tp-code">{item.code.replaceAll("_"," ")}</span><h3>{item.invoiceNumber} / {item.provider}</h3></div><span className={"tp-status tp-"+item.status}>{item.status.replaceAll("_"," ")}</span></div><p>{item.explanation}</p>{item.exposureMinor ? <strong className="tp-exposure">Calculated positive variance: {money(item.exposureMinor,item.currency)}</strong> : null}<p className="tp-evidence">Evidence: {item.evidence.map(String).join(" · ") || "No source references"}</p>{item.note?<p className="tp-evidence">Latest note: {item.note}</p>:null}{item.events.length?<details className="tp-history"><summary>Investigation history ({item.events.length} events)</summary>{item.events.map((event,i)=><p key={i} className="tp-evidence">{date(event.createdAt)} · {event.action}</p>)}</details>:null}<form onSubmit={e=>void submit(e)} className="tp-case-form"><input type="hidden" name="intent" value="update_exception"/><input type="hidden" name="exceptionId" value={item.id}/><label>CASE STATUS<select name="status" defaultValue={item.status}>{!["open","investigating","ready_for_review","raised_with_provider","provider_responded","rejected","ignored"].includes(item.status)?<option value={item.status} disabled>{item.status.replaceAll("_"," ")}</option>:null}{["open","investigating","ready_for_review","raised_with_provider","provider_responded","rejected","ignored"].map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></label><label>INVESTIGATION NOTE<input name="note" maxLength={2000} placeholder="Record what was checked or what the provider said."/></label><button className="tp-small" disabled={!canWrite || busy}>SAVE CASE</button></form><details><summary>Record provider outcome</summary><form onSubmit={e=>void submit(e)} className="tp-outcome-form"><input type="hidden" name="intent" value="record_outcome"/><input type="hidden" name="exceptionId" value={item.id}/><label>STATUS<select name="status" defaultValue="raised"><option value="raised">Raised</option><option value="promised">Credit promised</option><option value="posted">Credit posted</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select></label><label>AMOUNT<input name="amount" inputMode="decimal" required placeholder="0.00"/></label><label>CURRENCY<input name="currency" defaultValue={item.currency} maxLength={3} required/></label><label>PROVIDER REFERENCE<input name="reference" maxLength={180} placeholder="Credit note or transaction reference"/></label><label className="tp-wide">EVIDENCE NOTE<textarea name="note" required minLength={10} maxLength={2000} placeholder="What document or provider confirmation supports this outcome?"/></label><button className="tp-small" disabled={!canWrite || busy}>SAVE OUTCOME</button></form></details></article>)}{!data.exceptions.length?<p className="tp-empty">No exceptions have been generated. Import a rate card and invoice, then reconcile.</p>:null}</div>
    </section>

    <section className="tp-section">
      <div className="tp-section-heading"><div><p className="tp-kicker">05 / PERIOD CONTROL</p><h2>Reports and verified outcomes</h2><p>Reports distinguish calculated exposure, promised adjustments, posted credits and outcomes explicitly marked verified.</p></div></div>
      <form className="tp-panel tp-report-form" onSubmit={e=>void submit(e)}><input type="hidden" name="intent" value="generate_report"/><label>PERIOD START<input type="date" name="periodStart" required/></label><label>PERIOD END<input type="date" name="periodEnd" required/></label><button disabled={!canWrite || busy}>GENERATE PERIOD REPORT</button></form>
      <div className="tp-table-wrap"><table><thead><tr><th>PERIOD</th><th>REVISION</th><th>GENERATED</th><th>INVOICES</th><th>VERIFIED OUTCOMES</th><th>EXPORT</th></tr></thead><tbody>{data.reports.map(report=><tr key={report.id}><td>{date(report.start)} — {date(report.end)}</td><td>{report.revision}</td><td>{date(report.generatedAt)}</td><td>{report.payload?.scope?.invoiceCount ?? 0}</td><td>{report.payload?.outcomes?.verifiedCount ?? 0}</td><td><button type="button" className="tp-small" onClick={()=>downloadReport(report)}>DOWNLOAD JSON</button></td></tr>)}{!data.reports.length?<tr><td colSpan={6}>No period reports generated yet.</td></tr>:null}</tbody></table></div>
      <div className="tp-outcomes">{data.outcomes.map(outcome=><article key={outcome.id}><div><b>{outcome.findingCode.replaceAll("_"," ")}</b><span>{outcome.status}</span></div><strong>{money(outcome.amountMinor,outcome.currency)}</strong><small>{outcome.reference || "No external reference"} · {outcome.note}</small></article>)}{!data.outcomes.length?<p className="tp-empty">No provider outcomes have been recorded.</p>:null}</div>
    </section>
    <section className="tp-section tp-audit"><div className="tp-section-heading"><div><p className="tp-kicker">06 / WORKSPACE AUDIT</p><h2>Account history</h2></div></div><div className="tp-panel">{data.workspaceEvents.map((event,i)=><p key={i} className="tp-evidence">{date(event.createdAt)} · {event.action.replaceAll("_"," ")}</p>)}{!data.workspaceEvents.length?<p className="tp-empty">No workspace lifecycle events recorded yet.</p>:null}</div></section>
    <footer className="tp-footer"><span>NODUS / 3PL BILLING & PERFORMANCE CONTROL</span><span>Source records retained by workspace. Findings remain subject to human review.</span></footer>
  </main>;
}
