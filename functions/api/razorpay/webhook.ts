import { verifyRazorpayWebhookSignature } from "../../_lib/razorpay";
import type { D1Database } from "../../_lib/shopify";
interface Env { NODUS_DB: D1Database; RAZORPAY_WEBHOOK_SECRET?: string; }
interface Context { request: Request; env: Env; }
type RazorpaySubscription = {
  id?: string;
  status?: string;
  current_end?: number;
  notes?: Record<string, unknown>;
};
type RazorpayEvent = {
  event: string;
  payload?: { subscription?: { entity?: RazorpaySubscription } };
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const iso = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
export async function onRequestPost({ request, env }: Context) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return json({ error: "Razorpay webhook is not configured." }, 503);
  const raw = await request.text();
  if (raw.length > 256000) return json({ error: "Webhook payload too large." }, 413);
  const signature = request.headers.get("X-Razorpay-Signature") || "";
  if (!await verifyRazorpayWebhookSignature(raw, signature, env.RAZORPAY_WEBHOOK_SECRET)) return json({ error: "Invalid payment signature." }, 401);
  const eventId = request.headers.get("x-razorpay-event-id") || "";
  if (!eventId || eventId.length > 180) return json({ error: "Missing payment event ID." }, 400);
  let event: RazorpayEvent;
  try { event = JSON.parse(raw) as RazorpayEvent; } catch { return json({ error: "Invalid event payload." }, 400); }
  if (!event.event) return json({ error: "Incomplete event." }, 400);
  const prior = await env.NODUS_DB.prepare("SELECT event_id FROM razorpay_webhook_events WHERE event_id=?").bind(eventId).first<{ event_id: string }>();
  if (prior) return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
  const sub = event.payload?.subscription?.entity;
  const subscriptionId = sub?.id || "";
  const workspaceId = typeof sub?.notes?.workspace_id === "string" ? sub.notes.workspace_id : "";
  const now = new Date().toISOString();
  const statements = [env.NODUS_DB.prepare("INSERT OR IGNORE INTO razorpay_webhook_events(event_id,event_type,received_at) VALUES(?,?,?)").bind(eventId,event.event,now)];
  if (subscriptionId && workspaceId) {
    if (event.event === "subscription.charged") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='active',subscription_started_at=COALESCE(subscription_started_at,?),subscription_ends_at=COALESCE(?,subscription_ends_at),subscription_cancel_at_period_end=0,plan_code='core_99',status=CASE WHEN status NOT IN ('closed','suspended') THEN 'active' ELSE status END,razorpay_checkout_url=NULL,razorpay_checkout_expires_at=NULL,updated_at=? WHERE id=?")
        .bind(subscriptionId,now,iso(sub.current_end),now,workspaceId));
    } else if (event.event === "subscription.authenticated") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='pending',updated_at=? WHERE id=?")
        .bind(subscriptionId,now,workspaceId));
    } else if (event.event === "subscription.pending" || event.event === "subscription.halted") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='past_due',subscription_ends_at=COALESCE(?,subscription_ends_at),updated_at=? WHERE id=?")
        .bind(subscriptionId,iso(sub.current_end),now,workspaceId));
    } else if (event.event === "subscription.cancelled" || event.event === "subscription.completed") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='cancelled',subscription_cancel_at_period_end=0,subscription_ends_at=COALESCE(?,subscription_ends_at),razorpay_checkout_url=NULL,razorpay_checkout_expires_at=NULL,updated_at=? WHERE id=?")
        .bind(subscriptionId,iso(sub.current_end),now,workspaceId));
    } else if (event.event === "subscription.paused") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='paused',updated_at=? WHERE id=?")
        .bind(subscriptionId,now,workspaceId));
    } else if (event.event === "subscription.resumed") {
      statements.push(env.NODUS_DB.prepare("UPDATE threepl_workspaces SET payment_provider='razorpay',razorpay_subscription_id=?,subscription_status='pending',updated_at=? WHERE id=?")
        .bind(subscriptionId,now,workspaceId));
    }
  }
  await env.NODUS_DB.batch(statements);
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
