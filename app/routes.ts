import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("demo", "./routes/demo.tsx"),
  route("connect", "./routes/connect.tsx"),
  route("install", "./routes/install.tsx"),
  route("manual-data", "./routes/manual-data.tsx"),
  route("about", "./routes/about.tsx"),
  route("methodology", "./routes/methodology.tsx"),
  route("pricing", "./routes/pricing.tsx"),
  route("privacy", "./routes/privacy.tsx"),
  route("product", "./routes/product.tsx"),
  route("security", "./routes/security.tsx"),
  route("support", "./routes/support.tsx"),
  route("buyer-evaluation", "./routes/buyer-evaluation.tsx"),
  route("guides/shopify-shipping-cost-reconciliation", "./routes/guides.shopify-shipping-cost-reconciliation.tsx"),
  route("guides/free-shipping-threshold-analysis", "./routes/guides.free-shipping-threshold-analysis.tsx"),
  route("shipping-cost-reconciliation", "./routes/shipping-cost-reconciliation.tsx"),
] satisfies RouteConfig;
