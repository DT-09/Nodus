import { useEffect, useState, type FormEvent } from "react";
import type { MetaFunction } from "react-router";
import "./ops-console.css";

export const meta: MetaFunction = () => [
  { title: "NODUS Operations — private console" },
  { name: "robots", content: "noindex, nofollow" },
  { name: "referrer", content: "no-referrer" },
];

type Lead = { id: string; businessName: string; name: string; email: string; shopDomain: string; monthlyOrders: string; fulfilmentSetup: string; objective: string; status: string; createdAt: string };
type AccessToken = { id: string; label: string; expiresAt: string; usedAt: string | null; revokedAt: string | null; lastUsedAt: string | null; createdAt: string };
type Workspace = { id: string; businessName: string; ownerName: string; ownerEmail: string; shopDomain: string | null; status: string; planCode: string | null; trialActivatedAt: string | null; trialEndsAt: string | null; subscriptionStatus: string; subscriptionStartedAt: string | null; subscriptionEndsAt: string | null; subscriptionCancelAtPeriodEnd: boolean; createdAt: string; accessTokens: AccessToken[] };
type ConsoleData = { ok: boolean; leads: Lead[]; workspaces: Workspace[] };

function stamp(value: string | null) { return value ? new Date(value).toLocaleString() : "—"; }

export default function OpsConsole() {
  const [secret, setSecret] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [data, setData] = useState<ConsoleData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [issuedToken, setIssuedToken] = useState<{ workspace: string; token: string; expiresAt: string } | null>(null);
  const [checkoutLink, setCheckoutLink] = useState<{ workspace: string; url: string } | null>(null);

  async function load() {
    const response = await fetch("/api/operator/workspaces", { credentials: "same-origin", cache: "no-store" });
    if (response.status === 401) { setSignedIn(false); setData(null); return; }
    const body = await response.json() as ConsoleData & { error?: string };
    if (!response.ok || !body.ok) throw new Error(body.error || "Unable to load operations data.");
    setData(body); setSignedIn(true);
  }

  useEffect(() => { void load().catch(e => setError(e instanceof Error ? e.message : "Unable to load operations data.")); }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/operator/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }), credentials: "same-origin",
      });
      const body = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || "Operator sign-in failed.");
      setSecret(""); await load(); setMessage("Private operator session opened.");
    } catch (e) { setError(e instanceof Error ? e.message : "Operator sign-in failed."); }
    finally { setBusy(false); }
  }

  async function runOperation(payload: Record<string, unknown>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/operator/workspaces", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "same-origin",
      });
      const body = await response.json() as { ok?: boolean; error?: string; message?: string; inviteToken?: string; tokenExpiresAt?: string; checkoutUrl?: string; workspace?: { businessName?: string } };
      if (!response.ok || !body.ok) throw new Error(body.error || "Operation failed.");
      if (body.inviteToken) setIssuedToken({ workspace: body.workspace?.businessName || String(payload.workspaceId || "Merchant workspace"), token: body.inviteToken, expiresAt: body.tokenExpiresAt || "" });
      if (body.checkoutUrl) setCheckoutLink({ workspace: String(payload.workspaceId || "Merchant workspace"), url: body.checkoutUrl });
      setMessage(body.message || "Operation completed.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Operation failed."); }
    finally { setBusy(false); }
  }

  async function submitLeadStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    await runOperation({ operation: "update_lead_status", leadId: form.get("leadId"), status: form.get("status") });
  }

  async function createCheckout(workspaceId: string) {
    setCheckoutLink(null);
    await runOperation({ operation: "create_subscription_checkout", workspaceId });
  }

  async function scheduleCancellation(workspaceId: string) {
    await runOperation({ operation: "schedule_subscription_cancellation", workspaceId });
  }

  async function signOut() {
    await fetch("/api/operator/session", { method: "DELETE", credentials: "same-origin" });
    setSignedIn(false); setData(null); setIssuedToken(null); setMessage("Operator session closed.");
  }

  if (!signedIn) return <main className="ops-shell ops-login">
    <a href="/" className="ops-brand">NODUS <span>OPERATIONS</span></a>
    <p className="ops-kicker">PRIVATE OPERATOR ACCESS</p>
    <h1>Run the<br/><em>merchant lifecycle.</em></h1>
    <p className="ops-lede">Lead qualification, workspace provisioning, trial activation, access control and subscription state.</p>
    <form className="ops-panel" onSubmit={login}>
      <label>OPERATOR SECRET<input type="password" value={secret} onChange={e => setSecret(e.currentTarget.value)} autoComplete="current-password" required/></label>
      <button disabled={busy || !secret}>{busy ? "VERIFYING…" : "OPEN OPERATIONS CONSOLE"}</button>
    </form>
    {error ? <p className="ops-error" role="alert">{error}</p> : null}
    {message ? <p className="ops-message" role="status">{message}</p> : null}
    <p className="ops-note">The secret is exchanged for a short-lived HttpOnly session. It is not saved in browser storage.</p>
  </main>;

  return <main className="ops-shell">
    <header className="ops-header"><div><a href="/" className="ops-brand">NODUS <span>OPERATIONS</span></a><p className="ops-kicker">PRIVATE / MERCHANT LIFECYCLE</p><h1>Business operations</h1></div><button className="ops-quiet" onClick={() => void signOut()}>SIGN OUT</button></header>
    {message ? <p className="ops-message" role="status">{message}</p> : null}
    {error ? <p className="ops-error" role="alert">{error}</p> : null}
    {checkoutLink ? <section className="ops-panel ops-token"><div><span className="ops-kicker">HOSTED STRIPE CHECKOUT</span><h2>{checkoutLink.workspace}</h2><p>Share this hosted payment link privately. Access changes only after Stripe confirms payment by signed webhook.</p></div><a href={checkoutLink.url} target="_blank" rel="noreferrer">OPEN CHECKOUT ↗</a><textarea readOnly value={checkoutLink.url}/><button onClick={() => void navigator.clipboard.writeText(checkoutLink.url)}>COPY CHECKOUT LINK</button></section> : null}
    {issuedToken ? <section className="ops-panel ops-token"><div><span className="ops-kicker">ONE-TIME-VISIBLE INVITATION TOKEN</span><h2>{issuedToken.workspace}</h2><p>Expires: {stamp(issuedToken.expiresAt)}</p></div><textarea readOnly value={issuedToken.token}/><button onClick={() => void navigator.clipboard.writeText(issuedToken.token)}>COPY TOKEN</button><p className="ops-note">Send this token privately to the merchant. It is shown here once and is not stored in plaintext.</p></section> : null}

    <section className="ops-section"><div className="ops-heading"><div><span>01 / INBOUND DEMAND</span><h2>Trial requests</h2></div><strong>{data?.leads.length ?? 0}</strong></div>
      <div className="ops-list">{data?.leads.map(lead=><article className="ops-panel" key={lead.id}>
        <div className="ops-card-head"><div><span className="ops-kicker">{lead.shopDomain}</span><h3>{lead.businessName}</h3><p>{lead.name} · {lead.email}</p></div><span className={"ops-status ops-"+lead.status}>{lead.status}</span></div>
        <div className="ops-facts"><span>ORDERS / {lead.monthlyOrders.replaceAll("_"," ")}</span><span>FULFILMENT / {lead.fulfilmentSetup.replaceAll("_"," ")}</span><span>REQUESTED / {stamp(lead.createdAt)}</span></div>
        <p>{lead.objective}</p>
        <div className="ops-actions">
          <form onSubmit={submitLeadStatus}><input type="hidden" name="leadId" value={lead.id}/><select name="status" defaultValue={lead.status}><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="rejected">Rejected</option></select><button className="ops-small" disabled={busy}>UPDATE LEAD</button></form>
          <button className="ops-small" disabled={busy || lead.status !== "qualified"} onClick={() => void runOperation({ operation: "create_workspace_from_lead", leadId: lead.id })}>PROVISION WORKSPACE</button>
        </div>
      </article>)}{!data?.leads.length?<p className="ops-empty">No trial requests have been received.</p>:null}</div>
    </section>

    <section className="ops-section"><div className="ops-heading"><div><span>02 / MERCHANT DELIVERY</span><h2>Workspaces</h2></div><strong>{data?.workspaces.length ?? 0}</strong></div>
      <div className="ops-list">{data?.workspaces.map(workspace=><article className="ops-panel" key={workspace.id}>
        <div className="ops-card-head"><div><span className="ops-kicker">{workspace.shopDomain || "NO STORE DOMAIN"}</span><h3>{workspace.businessName}</h3><p>{workspace.ownerName} · {workspace.ownerEmail}</p></div><span className={"ops-status ops-"+workspace.status}>{workspace.status.replaceAll("_"," ")}</span></div>
        <div className="ops-facts"><span>TRIAL / {stamp(workspace.trialActivatedAt)} → {stamp(workspace.trialEndsAt)}</span><span>PLAN / {workspace.planCode || "—"}</span><span>SUBSCRIPTION / {workspace.subscriptionStatus}</span><span>ENDS / {stamp(workspace.subscriptionEndsAt)}</span></div>
        <div className="ops-actions">
          {workspace.status === "onboarding" ? <button className="ops-small" disabled={busy} onClick={() => void runOperation({ operation: "activate_trial", workspaceId: workspace.id })}>ACTIVATE 7-DAY TRIAL</button> : null}
          {workspace.subscriptionStatus !== "active" && workspace.status !== "closed" && workspace.status !== "suspended" && (workspace.status === "trial" || workspace.status === "active") ? <button className="ops-small" disabled={busy} onClick={() => void createCheckout(workspace.id)}>CREATE $99 / MONTH STRIPE CHECKOUT</button> : null}
          {workspace.subscriptionStatus === "active" && !workspace.subscriptionCancelAtPeriodEnd ? <button className="ops-small ops-danger" disabled={busy} onClick={() => void scheduleCancellation(workspace.id)}>SCHEDULE CANCELLATION AT PERIOD END</button> : null}
          {workspace.subscriptionCancelAtPeriodEnd ? <span className="ops-status ops-active">CANCELLATION SCHEDULED</span> : null}
          <button className="ops-small ops-secondary" disabled={busy || workspace.status === "closed"} onClick={() => void runOperation({ operation: "rotate_access", workspaceId: workspace.id, label: "Rotated merchant invitation" })}>ROTATE ACCESS TOKEN</button>
          <button className="ops-small ops-danger" disabled={busy || workspace.status === "closed"} onClick={() => void runOperation({ operation: "suspend", workspaceId: workspace.id })}>SUSPEND</button>
        </div>
        <details className="ops-tokens"><summary>Access tokens ({workspace.accessTokens.length})</summary>{workspace.accessTokens.map(token=><div className="ops-token-row" key={token.id}><span>{token.label} · expires {stamp(token.expiresAt)} · {token.usedAt ? "redeemed" : "unused"} · {token.revokedAt ? "revoked" : "active"}</span>{!token.revokedAt?<button className="ops-small ops-danger" disabled={busy} onClick={()=>void runOperation({operation:"revoke_access",workspaceId:workspace.id,tokenId:token.id})}>REVOKE</button>:null}</div>)}</details>
      </article>)}{!data?.workspaces.length?<p className="ops-empty">No merchant workspaces have been provisioned.</p>:null}</div>
    </section>
    <footer className="ops-footer">NODUS / PRIVATE OPERATIONS · Do not share operator credentials or merchant invitation tokens.</footer>
  </main>;
}
