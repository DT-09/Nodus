import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const headers = new Map(
  (vercel.headers ?? []).flatMap((entry) =>
    (entry.headers ?? []).map((header) => [header.key.toLowerCase(), header.value]),
  ),
);

const requiredHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000",
};

for (const [name, value] of Object.entries(requiredHeaders)) {
  assert.equal(headers.get(name), value, `Missing or incorrect production header: ${name}`);
}

// Shopify embedded apps must remain frameable by Shopify Admin; do not add a
// blanket X-Frame-Options DENY/SAMEORIGIN policy here.
assert.equal(headers.has("x-frame-options"), false, "Do not block Shopify's embedded app frame.");

assert.ok(
  vercel.crons?.some((cron) => cron.path === "/api/cron/sync" && cron.schedule === "*/5 * * * *"),
  "The expected protected sync cron must be configured.",
);
assert.equal(pkg.scripts?.["smoke:launch"], "node scripts/launch-smoke.mjs");
assert.equal(pkg.scripts?.["verify:decision-pack"], "node scripts/verify-decision-pack.mjs");

const cronSource = await readFile(new URL("../app/routes/api.cron.sync.ts", import.meta.url), "utf8");
assert.match(cronSource, /authorization.*Bearer/);
assert.match(cronSource, /status:\s*401/);

const healthSource = await readFile(new URL("../app/routes/healthz.ts", import.meta.url), "utf8");
assert.match(healthSource, /Cache-Control.*no-store/);
assert.match(healthSource, /prisma\.\$queryRaw/);
assert.match(healthSource, /PUBLIC_CONTACT_EMAIL/);
assert.match(healthSource, /CRON_SECRET/);
assert.match(healthSource, /minimum 32 characters/);

console.log("NODUS deployment configuration checks passed.");
