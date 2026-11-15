import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const vercel = JSON.parse(await read("../vercel.json"));
const pkg = JSON.parse(await read("../package.json"));
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

// Shopify embedded apps must remain frameable by Shopify Admin.
assert.equal(headers.has("x-frame-options"), false, "Do not block Shopify's embedded app frame.");

assert.equal(vercel.crons?.length ?? 0, 0, "Vercel Hobby does not support the five-minute sync schedule; use the GitHub scheduled runner.");

const syncWorkflow = await read("../.github/workflows/scheduled-sync.yml");
assert.ok(syncWorkflow.includes('cron: "*/5 * * * *"'), "The five-minute sync schedule must be configured in GitHub Actions.");
assert.match(syncWorkflow, /NODUS_BASE_URL/);
assert.match(syncWorkflow, /NODUS_CRON_SECRET/);
assert.equal(pkg.scripts?.["smoke:launch"], "node scripts/launch-smoke.mjs");
assert.equal(pkg.scripts?.["verify:decision-pack"], "node scripts/verify-decision-pack.mjs");

const cronSource = await read("../app/routes/api.cron.sync.ts");
assert.match(cronSource, /authorization.*Bearer/);
assert.match(cronSource, /status:\s*401/);

const workflowSource = await read("../.github/workflows/ci.yml");
assert.match(workflowSource, /DIRECT_URL:\s*postgresql:\/\//);

const entrySource = await read("../app/entry.server.tsx");
assert.match(entrySource, /addDocumentResponseHeaders/);
assert.match(entrySource, /addDocumentResponseHeaders\(request, responseHeaders\)/);

const prismaSchema = await read("../prisma/schema.prisma");
assert.match(prismaSchema, /url\s*=\s*env\("DATABASE_URL"\)/);
assert.match(prismaSchema, /directUrl\s*=\s*env\("DIRECT_URL"\)/);

const healthSource = await read("../app/routes/healthz.ts");
assert.match(healthSource, /Cache-Control.*no-store/);
assert.match(healthSource, /prisma\.\$queryRaw/);
assert.match(healthSource, /PUBLIC_CONTACT_EMAIL/);
assert.match(healthSource, /CRON_SECRET/);
assert.match(healthSource, /minimum 32 characters/);

console.log("NODUS deployment configuration checks passed.");
