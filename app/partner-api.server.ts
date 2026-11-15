type ActiveSubscription = { items: Array<{ handle: string }> } | null;
type PartnerResponse = { data?: { activeSubscription?: ActiveSubscription }; errors?: Array<{ message: string }> };

const cache = new Map<string, { expiresAt: number; value: ActiveSubscription }>();
const query = `query NodusActiveSubscription($appId: ID!, $shopId: ID!) {
  activeSubscription(appId: $appId, shopId: $shopId) {
    items { handle }
  }
}`;

export async function fetchActiveSubscription(shopId: string): Promise<ActiveSubscription> {
  const orgId = process.env.SHOPIFY_PARTNER_ORG_ID;
  const token = process.env.SHOPIFY_PARTNER_API_ACCESS_TOKEN;
  const appId = process.env.SHOPIFY_APP_GID;
  if (!orgId || !/^\\d+$/.test(orgId) || !token || !appId || !/^gid:\/\/shopify\/App\/\\d+$/.test(appId)) {
    throw new Error("Shopify App Pricing is enabled but Partner API configuration is incomplete.");
  }
  if (!/^gid:\/\/shopify\/Shop\/\\d+$/.test(shopId)) throw new Error("Shopify returned an invalid shop identifier.");
  const cached = cache.get(shopId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const response = await fetch(`https://partners.shopify.com/${orgId}/api/2026-07/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables: { appId, shopId } }),
    cache: "no-store",
  });
  const body = await response.json() as PartnerResponse;
  if (!response.ok || body.errors?.length || body.data === undefined) {
    throw new Error("Shopify Partner API subscription verification failed. Access was not granted.");
  }
  const value = body.data.activeSubscription ?? null;
  cache.set(shopId, { value, expiresAt: Date.now() + 5 * 60 * 1000 });
  return value;
}
