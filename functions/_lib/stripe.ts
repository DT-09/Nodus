export interface WorkspaceSubscriptionCheckoutInput {
  secret: string;
  appUrl: string;
  workspaceId: string;
  email: string;
  idempotencyKey: string;
}
export async function createWorkspaceSubscriptionCheckout(input: WorkspaceSubscriptionCheckoutInput) {
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("client_reference_id", input.workspaceId);
  form.set("customer_email", input.email);
  form.set("billing_address_collection", "required");
  form.set("allow_promotion_codes", "true");
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", "9900");
  form.set("line_items[0][price_data][product_data][name]", "NODUS Core — 3PL Control");
  form.set("line_items[0][price_data][product_data][description]", "Monthly merchant workspace for 3PL contract, invoice, activity and exception control.");
  form.set("line_items[0][price_data][recurring][interval]", "month");
  form.set("metadata[workspace_id]", input.workspaceId);
  form.set("metadata[plan_code]", "core_99");
  form.set("subscription_data[metadata][workspace_id]", input.workspaceId);
  form.set("subscription_data[metadata][plan_code]", "core_99");
  form.set("success_url", new URL("/portal?billing=processing", input.appUrl).toString());
  form.set("cancel_url", new URL("/pricing?billing=cancelled", input.appUrl).toString());
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + input.secret,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: form,
  });
  const result = await response.json() as { id?: string; url?: string; expires_at?: number; error?: { message?: string } };
  if (!response.ok || !result.id || !result.url) throw new Error(result.error?.message || "Stripe did not create a checkout session.");
  return {
    id: result.id,
    url: result.url,
    expiresAt: result.expires_at ? new Date(result.expires_at * 1000).toISOString() : new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
  };
}

export async function verifyStripeSignature(raw: string, header: string, secret: string) {
  const parts = header.split(",").map(part => part.trim().split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1] || "";
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value || "");
  if (!/^\\d+$/.test(timestamp) || !signatures.length || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + raw));
  const expected = [...new Uint8Array(signed)].map(value => value.toString(16).padStart(2, "0")).join("");
  return signatures.some(signature => {
    if (signature.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return mismatch === 0;
  });
}

export async function scheduleWorkspaceSubscriptionCancellation(input: { secret: string; subscriptionId: string; idempotencyKey: string }) {
  const form = new URLSearchParams();
  form.set("cancel_at_period_end", "true");
  const response = await fetch("https://api.stripe.com/v1/subscriptions/" + encodeURIComponent(input.subscriptionId), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + input.secret,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: form,
  });
  const result = await response.json() as { id?: string; status?: string; cancel_at_period_end?: boolean; current_period_end?: number; error?: { message?: string } };
  if (!response.ok || !result.id || result.cancel_at_period_end !== true || !result.current_period_end) throw new Error(result.error?.message || "Stripe did not schedule subscription cancellation.");
  return { id: result.id, periodEnd: new Date(result.current_period_end * 1000).toISOString(), status: result.status || "active" };
}
