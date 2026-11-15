#!/usr/bin/env node
/**
 * NODUS production smoke test.
 *
 * Usage:
 *   NODUS_BASE_URL=https://your-production-domain npm run smoke:launch
 *
 * This is a read-only HTTP check. It does not install an app, mutate a store,
 * run a scheduled sync, or verify billing. Run it only against an environment
 * whose public routes are intended to be reachable.
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
  { path: "/", label: "Public homepage", expected: (r) => r.status === 200, html: true },
  { path: "/product", label: "Product page", expected: (r) => r.status === 200, html: true },
  { path: "/demo", label: "Synthetic reconciliation walkthrough", expected: (r) => r.status === 200, html: true },
  { path: "/methodology", label: "Methodology page", expected: (r) => r.status === 200, html: true },
  { path: "/pricing", label: "Pricing and evaluation page", expected: (r) => r.status === 200, html: true },
  { path: "/security", label: "Security disclosure page", expected: (r) => r.status === 200, html: true },
  { path: "/privacy", label: "Privacy and data-handling notice", expected: (r) => r.status === 200, html: true },
  { path: "/support", label: "Support page", expected: (r) => r.status === 200, html: true },
  { path: "/nodus-carrier-cost-template.csv", label: "Carrier-cost CSV template", expected: (r) => r.status === 200, csv: true },
  { path: "/healthz", label: "Application and database health", expected: (r) => r.status === 200, jsonStatus: "ok" },
  { path: "/api/cron/sync", label: "Cron endpoint rejects unauthenticated requests", expected: (r) => r.status === 401 },
  { path: "/app", label: "Merchant workspace requires Shopify authentication", expected: (r) => r.status >= 300 && r.status < 400 },
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
    let valid = check.expected(response);

    if (check.html) {
      const type = response.headers.get("content-type") ?? "";
      valid &&= type.includes("text/html");
      detail += `; content-type ${type || "missing"}`;
    }

    if (check.csv) {
      const type = response.headers.get("content-type") ?? "";
      const body = await response.text();
      valid &&= body.includes("invoice_id") && body.includes("charge_id") && body.includes("amount") && body.includes("currency");
      valid &&= type.includes("text/csv") || body.includes("invoice_id");
      detail += `; template headers ${body.includes("invoice_id") ? "present" : "missing"}`;
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
