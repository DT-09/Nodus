#!/usr/bin/env node
/**
 * NODUS production smoke test.
 *
 * Usage:
 *   NODUS_BASE_URL=https://your-production-domain npm run smoke:launch
 *
 * Read-only HTTP checks. This does not install an app, mutate a store,
 * run a scheduled sync, or verify billing.
 */

const rawBase = process.env.NODUS_BASE_URL?.trim();
if (!rawBase) {
  console.error("FAIL  NODUS_BASE_URL is required.");
  process.exit(2);
}

let base;
try {
  base = new URL(rawBase);
} catch {
  console.error("FAIL  NODUS_BASE_URL must be a valid absolute URL.");
  process.exit(2);
}

if (base.protocol !== "https:" && base.hostname !== "localhost") {
  console.error("FAIL  Production smoke tests require HTTPS.");
  process.exit(2);
}

const checks = [
  { path: "/", label: "Public homepage", html: true },
  { path: "/product", label: "Product page", html: true },
  { path: "/demo", label: "Synthetic reconciliation walkthrough", html: true },
  { path: "/methodology", label: "Methodology page", html: true },
  { path: "/pricing", label: "Pricing and evaluation page", html: true },
  { path: "/connect", label: "Shopify connection gate", html: true },
  { path: "/install", label: "Cross-device app installation guide", html: true },
  { path: "/manual-data", label: "Manual data analysis workflow", html: true },
  { path: "/manifest.webmanifest", label: "PWA installation manifest", manifest: true },
  { path: "/sw.js", label: "PWA service worker", serviceWorker: true },
  { path: "/offline.html", label: "PWA offline fallback", html: true },
  { path: "/templates/nodus-orders-template.csv", label: "Order CSV template", csvHeaders: ["order_id", "order_name", "currency", "shipping_revenue"] },
  { path: "/templates/nodus-carrier-cost-template.csv", label: "Carrier-cost CSV template", csvHeaders: ["invoice_id", "charge_id", "amount", "currency"] },
  { path: "/security", label: "Security disclosure page", html: true },
  { path: "/privacy", label: "Privacy and data-handling notice", html: true },
  { path: "/support", label: "Support page", html: true },
  { path: "/healthz", label: "Application and database health", jsonStatus: "ok" },
  { path: "/api/cron/sync", label: "Cron endpoint rejects unauthenticated requests", status: 401 },
  { path: "/app", label: "Merchant workspace requires Shopify authentication", redirect: true },
];

let failed = 0;

for (const check of checks) {
  try {
    const response = await fetch(new URL(check.path, base), {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: { "User-Agent": "NODUS-launch-smoke/1.0" },
    });

    let detail = `HTTP ${response.status}`;
    let valid = check.status !== undefined
      ? response.status === check.status
      : check.redirect
        ? response.status >= 300 && response.status < 400
        : response.status === 200;

    if (check.html) {
      const type = response.headers.get("content-type") ?? "";
      valid &&= type.includes("text/html");
      detail += `; content-type ${type || "missing"}`;
    }

    if (check.manifest) {
      const body = await response.json().catch(() => null);
      valid &&= body?.name === "NODUS — Shipping Intelligence"
        && body?.display === "standalone"
        && Array.isArray(body?.icons)
        && body.icons.length > 0;
      detail += `; manifest ${body?.name ?? "invalid"}`;
    }

    if (check.serviceWorker) {
      const body = await response.text();
      valid &&= body.includes("self.addEventListener")
        && body.includes("/offline.html")
        && body.includes("/app");
      detail += `; install/offline/privacy handlers ${valid ? "present" : "missing"}`;
    }

    if (check.csvHeaders) {
      const body = await response.text();
      const header = body.split(/\\r?\\n/, 1)[0] ?? "";
      valid &&= check.csvHeaders.every((column) => header.includes(column));
      detail += `; template headers ${check.csvHeaders.every((column) => header.includes(column)) ? "present" : "missing"}`;
    }

    if (check.jsonStatus) {
      const body = await response.json().catch(() => null);
      valid &&= body?.status === check.jsonStatus && body?.service === "nodus";
      detail += `; status ${body?.status ?? "invalid JSON"}`;
      valid &&= response.headers.get("cache-control")?.includes("no-store") ?? false;
    }

    if (valid) {
      console.log(`PASS  ${check.label} — ${detail}`);
    } else {
      failed += 1;
      console.error(`FAIL  ${check.label} — ${detail}`);
    }
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${check.label} — ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`\\nNODUS smoke test: ${checks.length - failed}/${checks.length} passed.`);
if (failed > 0) {
  console.error("Release blocked. Resolve every failed check and rerun against the intended deployment.");
  process.exit(1);
}

console.log("HTTP smoke checks passed. This does not replace Shopify install, tenant-isolation, webhook, backup-restore, billing, legal, or App Store verification.");
