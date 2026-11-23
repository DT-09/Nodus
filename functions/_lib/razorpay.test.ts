import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelRazorpaySubscription, createRazorpayPlan, createRazorpaySubscription, verifyRazorpayWebhookSignature } from "./razorpay";
afterEach(() => vi.unstubAllGlobals());
describe("NODUS Razorpay recurring subscriptions", () => {
  it("creates the monthly USD 99 plan", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "plan_test" }), { status: 200 }));
    vi.stubGlobal("fetch", mock);
    const id = await createRazorpayPlan({ keyId: "rzp_test_id", keySecret: "rzp_test_secret" });
    const request = JSON.parse(mock.mock.calls[0]?.[1]?.body as string);
    expect(id).toBe("plan_test");
    expect(request.period).toBe("monthly");
    expect(request.item.amount).toBe(9900);
    expect(request.item.currency).toBe("USD");
  });
  it("creates a bounded workspace subscription and returns its hosted link", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "sub_test", short_url: "https://rzp.io/i/test", expire_by: 1893456000 }), { status: 200 }));
    vi.stubGlobal("fetch", mock);
    const result = await createRazorpaySubscription({ keyId: "rzp_test_id", keySecret: "rzp_test_secret", planId: "plan_test", workspaceId: "workspace-1", idempotencyNote: "request-1" });
    const request = JSON.parse(mock.mock.calls[0]?.[1]?.body as string);
    expect(result.id).toBe("sub_test");
    expect(result.url).toBe("https://rzp.io/i/test");
    expect(request.total_count).toBe(1200);
    expect(request.notes.workspace_id).toBe("workspace-1");
  });
  it("cancels at the end of the current billing cycle", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "sub_test", current_end: 1893456000, status: "active" }), { status: 200 }));
    vi.stubGlobal("fetch", mock);
    const result = await cancelRazorpaySubscription({ keyId: "rzp_test_id", keySecret: "rzp_test_secret", subscriptionId: "sub_test" });
    expect(result.id).toBe("sub_test");
    expect(JSON.parse(mock.mock.calls[0]?.[1]?.body as string).cancel_at_cycle_end).toBe(true);
  });
  it("validates raw-body HMAC signatures", async () => {
    const secret = "webhook-secret", raw = "{\"event\":\"subscription.charged\"}";
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
    const signature = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
    expect(await verifyRazorpayWebhookSignature(raw, signature, secret)).toBe(true);
    expect(await verifyRazorpayWebhookSignature(raw, "bad", secret)).toBe(false);
  });
});
