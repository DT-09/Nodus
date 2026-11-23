import { afterEach, describe, expect, it, vi } from "vitest";
import { createStripeCheckout, verifyStripeSignature } from "./stripe";
afterEach(() => vi.unstubAllGlobals());
describe("NODUS Stripe billing", () => {
 it("creates a one-time audit checkout at the published USD price", async () => {
  const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:"cs_test_audit",url:"https://checkout.stripe.test/audit"}),{status:200,headers:{"Content-Type":"application/json"}}));
  vi.stubGlobal("fetch",fetchMock);
  const result=await createStripeCheckout({secret:"sk_test",appUrl:"https://nodus.example",leadId:"lead-1",email:"buyer@example.com",offer:"paid_audit"});
  const body=fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
  expect(result.url).toContain("checkout.stripe.test");
  expect(body.get("mode")).toBe("payment");
  expect(body.get("line_items[0][price_data][unit_amount]")).toBe("14900");
  expect(body.get("line_items[0][price_data][recurring][interval]")).toBeNull();
 });
 it("creates a monthly recurring subscription checkout", async () => {
  const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:"cs_test_monthly",url:"https://checkout.stripe.test/monthly"}),{status:200,headers:{"Content-Type":"application/json"}}));
  vi.stubGlobal("fetch",fetchMock);
  await createStripeCheckout({secret:"sk_test",appUrl:"https://nodus.example",leadId:"lead-2",email:"buyer@example.com",offer:"monthly_review"});
  const body=fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
  expect(body.get("mode")).toBe("subscription");
  expect(body.get("line_items[0][price_data][unit_amount]")).toBe("9900");
  expect(body.get("line_items[0][price_data][recurring][interval]")).toBe("month");
 });
 it("rejects an invalid checkout provider response", async () => {
  vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(JSON.stringify({error:{message:"invalid API key"}}),{status:401})));
  await expect(createStripeCheckout({secret:"bad",appUrl:"https://nodus.example",leadId:"lead-3",email:"buyer@example.com",offer:"paid_audit"})).rejects.toThrow("invalid API key");
 });
 it("verifies signed webhooks and rejects stale timestamps", async () => {
  const secret="whsec_test",raw="{\"id\":\"evt_test\"}",timestamp=Math.floor(Date.now()/1000).toString();
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signed=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(timestamp+"."+raw));
  const signature=[...new Uint8Array(signed)].map(value=>value.toString(16).padStart(2,"0")).join("");
  expect(await verifyStripeSignature(raw,"t="+timestamp+",v1="+signature,secret)).toBe(true);
  expect(await verifyStripeSignature(raw,"t=1,v1="+signature,secret)).toBe(false);
  expect(await verifyStripeSignature(raw,"t="+timestamp+",v1=bad",secret)).toBe(false);
 });
});
