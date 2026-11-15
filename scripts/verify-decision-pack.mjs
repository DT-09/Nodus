import { createHash, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npm run verify:decision-pack -- <decision-pack.json>");
  process.exit(2);
}

try {
  const raw = await readFile(file, "utf8");
  const pack = JSON.parse(raw);
  if (pack?.schema !== "nodus.shipping-economics-decision-pack.v1") {
    throw new Error("Unsupported or missing NODUS decision-pack schema.");
  }
  if (pack?.integrity?.algorithm !== "SHA-256" || typeof pack.integrity.canonicalPayloadDigest !== "string") {
    throw new Error("Missing SHA-256 integrity metadata.");
  }

  const { integrity, ...payload } = pack;
  const actual = createHash("sha256").update(JSON.stringify(payload)).digest();
  const expected = Buffer.from(integrity.canonicalPayloadDigest, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Digest mismatch: the decision pack has changed or is corrupt.");
  }

  console.log("NODUS decision pack integrity: VALID");
  console.log(`Schema: ${pack.schema}`);
  console.log(`Orders: ${pack.scope?.orderCount ?? "unknown"}`);
  console.log(`Cost evidence rows: ${pack.scope?.costEvidenceCount ?? "unknown"}`);
  console.log(`SHA-256: ${integrity.canonicalPayloadDigest}`);
} catch (error) {
  console.error(`NODUS decision pack integrity: INVALID — ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
