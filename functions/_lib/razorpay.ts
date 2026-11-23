export type RazorpayCredentials = { keyId: string; keySecret: string };
const authHeader = (credentials: RazorpayCredentials) => "Basic " + btoa(credentials.keyId + ":" + credentials.keySecret);
async function request<T>(credentials: RazorpayCredentials, path: string, body: Record<string, unknown>) {
  const response = await fetch("https://api.razorpay.com/v1" + path, {
    method: "POST",
    headers: { Authorization: authHeader(credentials), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json() as T & { error?: { description?: string; reason?: string } };
  if (!response.ok) throw new Error(result.error?.description || result.error?.reason || "Razorpay request failed.");
  return result;
}
export async function createRazorpayPlan(credentials: RazorpayCredentials) {
  const result = await request<{ id?: string }>(credentials, "/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: "NODUS Core — 3PL Control",
      amount: 9900,
      currency: "USD",
      description: "Monthly merchant workspace for 3PL contract, invoice, activity and exception control.",
    },
    notes: { product: "NODUS", plan_code: "core_99" },
  });
  if (!result.id) throw new Error("Razorpay did not return a plan ID.");
  return result.id;
}
export async function createRazorpaySubscription(input: RazorpayCredentials & {
  planId: string; workspaceId: string; idempotencyNote: string;
}) {
  const expireBy = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const result = await request<{ id?: string; short_url?: string; expire_by?: number; status?: string }>(
    input, "/subscriptions", {
      plan_id: input.planId,
      total_count: 1200,
      quantity: 1,
      customer_notify: false,
      expire_by: expireBy,
      notes: { workspace_id: input.workspaceId, plan_code: "core_99", request_id: input.idempotencyNote },
    }
  );
  if (!result.id || !result.short_url) throw new Error("Razorpay did not return a hosted subscription link.");
  return {
    id: result.id,
    url: result.short_url,
    expiresAt: new Date((result.expire_by || expireBy) * 1000).toISOString(),
    status: result.status || "created",
  };
}
export async function cancelRazorpaySubscription(input: RazorpayCredentials & { subscriptionId: string }) {
  const result = await request<{ id?: string; status?: string; current_end?: number; ended_at?: number }>(
    input, "/subscriptions/" + encodeURIComponent(input.subscriptionId) + "/cancel", {
      cancel_at_cycle_end: true,
    }
  );
  if (!result.id || !result.current_end) throw new Error("Razorpay did not confirm period-end cancellation.");
  return {
    id: result.id,
    periodEnd: new Date(result.current_end * 1000).toISOString(),
    status: result.status || "active",
  };
}
export async function verifyRazorpayWebhookSignature(raw: string, signature: string, secret: string) {
  if (!/^[0-9a-f]{64}$/i.test(signature) || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ signature.toLowerCase().charCodeAt(i);
  return mismatch === 0;
}
