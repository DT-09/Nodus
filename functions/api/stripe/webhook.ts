import { verifyStripeSignature } from "../../_lib/stripe";
import type { D1Database } from "../../_lib/shopify";
interface Env { NODUS_DB: D1Database; STRIPE_WEBHOOK_SECRET?: string; }
interface Context { request: Request; env: Env; }
type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const objectId = (value: unknown): string | null => typeof value === "string" ? value : value && typeof value === "object" && "id" in value ? String((value as { id: unknown }).id) : null;
const isoFromEpoch = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
export async function onRequestPost({ request, env }: Context) {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: "Payment webhook is not configured." }, 503);
  const raw = await request.text();
  if (raw.length > 256000) return json({ error: "Webhook payload too large." }, 413);
  if (!await verifyStripeSignature(raw, request.headers.get("Stripe-Signature") || "", env.STRIPE_WEBHOOK_SECRET)) return json({ error: "Invalid payment signature." }, 401);
  let event: StripeEvent;
  try { event = JSON.parse(raw) as StripeEvent; } catch { return json({ error: "Invalid event payload." }, 400); }
  if (!event.id || !event.type || !event.data?.object) return json({ error: "Incomplete event." }, 400);
  const prior = await env.NODUS_DB.prepare("SELECT event_id FROM stripe_webhook_events WHERE event_id=?").bind(event.id).first<{ event_id: string }>();
  if (prior) return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
  const value = event.data.object;
  const now = new Date().toISOString();
  const statements = [env.NODUS_DB.prepare("INSERT OR IGNORE INTO stripe_webhook_events(event_id,event_type,received_at) VALUES(?,?,?)").bind(event.id,event.type,now)];
  if (event.type === "checkout.session.completed") {
    const metadata = value.metadata && typeof value.metadata === "object" ? value.metadata as Record<string, unknown> : {};
    const workspaceId = typeof value.client_reference_id === "string" ? value.client_reference_id : typeof metadata.workspace_id === "string" ? metadata.workspace_id : "";
    const subscriptionId = objectId(value.subscription);
    if (workspaceId && subscriptionId && value.mode === "subscription") {
      const paid = value.payment_status === "paid";
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='stripe',stripe_customer_id=?,stripe_subscription_id=?,stripe_checkout_session_id=?,stripe_checkout_url=NULL,stripe_checkout_expires_at=NULL,plan_code='core_99',subscription_status=?,subscription_started_at=CASE WHEN ?=1 THEN COALESCE(subscription_started_at,?) ELSE subscription_started_at END,status=CASE WHEN ?=1 AND status NOT IN ('closed','suspended') THEN 'active' ELSE status END,updated_at=? WHERE id=?")
        .bind(objectId(value.customer),subscriptionId,objectId(value.id),paid?"active":"pending",paid?1:0,now,paid?1:0,now,workspaceId));
    }
  } else if (event.type === "checkout.session.expired") {
    const metadata = value.metadata && typeof value.metadata === "object" ? value.metadata as Record<string, unknown> : {};
    const workspaceId = typeof value.client_reference_id === "string" ? value.client_reference_id : typeof metadata.workspace_id === "string" ? metadata.workspace_id : "";
    const sessionId = objectId(value.id);
    if (workspaceId && sessionId) {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET stripe_checkout_url=NULL,stripe_checkout_expires_at=NULL,stripe_checkout_session_id=NULL,subscription_status='none',updated_at=? WHERE id=? AND stripe_checkout_session_id=? AND subscription_status='pending'")
        .bind(now,workspaceId,sessionId));
    }
  } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoiceMetadata = value.metadata && typeof value.metadata === "object" ? value.metadata as Record<string, unknown> : {};
    const parent = value.parent && typeof value.parent === "object" ? value.parent as Record<string, unknown> : {};
    const details = parent.subscription_details && typeof parent.subscription_details === "object" ? parent.subscription_details as Record<string, unknown> : {};
    const subscriptionId = objectId(value.subscription) || objectId(details.subscription);
    const detailMetadata = details.metadata && typeof details.metadata === "object" ? details.metadata as Record<string, unknown> : {};
    const workspaceId = typeof invoiceMetadata.workspace_id === "string" ? invoiceMetadata.workspace_id : typeof detailMetadata.workspace_id === "string" ? detailMetadata.workspace_id : "";
    if (subscriptionId) {
      const lineData = (value.lines && typeof value.lines === "object" ? (value.lines as { data?: Array<{ period?: { end?: unknown } }> }).data : undefined);
      const periodEnd = lineData?.[0]?.period?.end;
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='stripe',stripe_subscription_id=COALESCE(stripe_subscription_id,?),stripe_customer_id=COALESCE(stripe_customer_id,?),plan_code='core_99',subscription_status=?,subscription_started_at=CASE WHEN ?='active' THEN COALESCE(subscription_started_at,?) ELSE subscription_started_at END,subscription_ends_at=COALESCE(?,subscription_ends_at),status=CASE WHEN ?='active' AND status NOT IN ('closed','suspended') THEN 'active' ELSE status END,updated_at=? WHERE stripe_subscription_id=? OR id=?")
        .bind(subscriptionId,objectId(value.customer),event.type === "invoice.paid" ? "active" : "past_due",event.type === "invoice.paid" ? "active" : "past_due",now,isoFromEpoch(periodEnd),event.type === "invoice.paid" ? "active" : "past_due",now,subscriptionId,workspaceId));
    }
  } else if (event.type === "customer.subscription.deleted") {
    const subscriptionId = objectId(value.id);
    if (subscriptionId) {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='stripe',subscription_status='cancelled',subscription_cancel_at_period_end=0,subscription_ends_at=COALESCE(?,subscription_ends_at),updated_at=? WHERE stripe_subscription_id=?")
        .bind(isoFromEpoch(value.current_period_end),now,subscriptionId));
    }
  } else if (event.type === "customer.subscription.updated") {
    const subscriptionId = objectId(value.id);
    if (subscriptionId) {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='stripe',subscription_cancel_at_period_end=?,subscription_ends_at=COALESCE(?,subscription_ends_at),updated_at=? WHERE stripe_subscription_id=?")
        .bind(value.cancel_at_period_end===true?1:0,isoFromEpoch(value.current_period_end),now,subscriptionId));
    }
  }
  await env.NODUS_DB.batch(statements);
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
