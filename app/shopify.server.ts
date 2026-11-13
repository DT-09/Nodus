import "@shopify/shopify-app-react-router/adapters/node";
import { ApiVersion, AppDistribution, shopifyApp } from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { prisma } from "./db.server";

const key = process.env.SHOPIFY_API_KEY;
const secret = process.env.SHOPIFY_API_SECRET;
const url = process.env.SHOPIFY_APP_URL;

if ((!key || !secret || !url) && process.env.NODE_ENV === "production") {
  throw new Error("Missing Shopify application environment configuration.");
}

const shopify = shopifyApp({
  apiKey: key ?? "development-placeholder",
  apiSecretKey: secret ?? "development-placeholder",
  appUrl: url ?? "http://localhost:3000",
  apiVersion: ApiVersion.July26,
  scopes: (process.env.SCOPES ?? "read_orders,read_products,read_fulfillments,read_shipping,read_markets").split(",").map((scope) => scope.trim()).filter(Boolean),
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: { expiringOfflineAccessTokens: true }
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
