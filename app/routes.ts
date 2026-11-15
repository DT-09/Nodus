import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("about", "./routes/about.tsx"),
  route("api/cron/sync", "./routes/api.cron.sync.ts"),
  route("app", "./routes/app.tsx", [
    index("./routes/app._index.tsx"),
    route("monitoring", "./routes/app.monitoring.tsx"),
    route("value", "./routes/app.value.tsx"),
    route(":section", "./routes/app.$section.tsx"),
  ]),
  route("auth/*", "./routes/auth.$.tsx"),
  route("healthz", "./routes/healthz.ts"),
  route("methodology", "./routes/methodology.tsx"),
  route("pricing", "./routes/pricing.tsx"),
  route("product", "./routes/product.tsx"),
  route("security", "./routes/security.tsx"),
  route("support", "./routes/support.tsx"),
  route("webhooks", "./routes/webhooks.tsx"),
] satisfies RouteConfig;
