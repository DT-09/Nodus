import { afterEach, describe, expect, it, vi } from "vitest";
import { createWorkspaceSubscriptionCheckout, scheduleWorkspaceSubscriptionCancellation, verifyStripeSignature } from "./stripe";
afterEach(() => vi.unstubAllGlobals());

describe("NODUS Core recurring Stripe billing", () => {
  it("creates a USD 99 monthly checkout tied to one workspace", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "cs_core", url: "https://checkout.stripe.test/core", expires_at: 1893456000
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mock);
    const result = await createWorkspaceSubscriptionCheckout({
      secret: "sk_test", appUrl: "https://nodus.example", workspaceId: "workspace-42",
      email: "owner@example.test", idempotencyKey: "unique-key"
    });
    const body = mock.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(result.id).toBe("cs_core");
    expect(result.expiresAt).toBe(new Date(1893456000 * 1000).toISOString());
    expect(body.get("mode")).toBe("subscription");
    expect(body.get("client_reference_id")).toBe("workspace-42");
    expect(body.get("line_items[0][price_data][unit_amount]")).toBe("9900");
    expect(body.get("line_items[0][price_data][recurring][interval]")).toBe("month");
    expect(body.get("subscription_data[metadata][workspace_id]")).toBe("workspace-42");
  });

  it("rejects a failed checkout creation", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { message: "invalid API key" }
    }), { status: 401 })));
    await expect(createWorkspaceSubscriptionCheckout({
      secret: "bad", appUrl: "https://nodus.example", workspaceId: "w",
      email: "owner@example.test", idempotencyKey: "key"
    })).rejects.toThrow("invalid API key");
  });

  it("schedules cancellation at the paid period end through Stripe", async () => {
    const mock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "sub_123", cancel_at_period_end: true, current_period_end: 1893456000
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", mock);
    const result = await scheduleWorkspaceSubscriptionCancellation({
      secret: "sk_test", subscriptionId: "sub_123", idempotencyKey: "cancel-key"
    });
    expect(result.id).toBe("sub_123");
    expect(result.periodEnd).toBe(new Date(1893456000 * 1000).toISOString());
    expect((mock.mock.calls[0]?.[1]?.body as URLSearchParams).get("cancel_at_period_end")).toBe("true");
  });

  it("verifies signed webhooks and rejects stale or invalid signatures", async () => {
    const secret = "whsec_test", raw = "{\"id\":\"evt_test\"}", timestamp = Math.floor(Date.now() / 1000).toString();
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(timestamp + "." + raw));
    const signature = [...new Uint8Array(signed)].map(value => value.toString(16).padStart(2, "0")).join("");
    expect(await verifyStripeSignature(raw, "t=" + timestamp + ",v1=" + signature, secret)).toBe(true);
    expect(await verifyStripeSignature(raw, "t=1,v1=" + signature, secret)).toBe(false);
    expect(await verifyStripeSignature(raw, "t=" + timestamp + ",v1=bad", secret)).toBe(false);
  });
});
