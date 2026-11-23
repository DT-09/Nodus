import { parseCarrierCostCsv } from "../../../app/domain/carrier-csv";
import { currencyPrecision } from "../../../app/domain/money";
import { json, merchantSession, type PagesContext } from "../../_lib/shopify";

function decimalFromMinor(minor: bigint, currency: string): string {
  const precision = currencyPrecision(currency);
  const negative = minor < 0n;
  const absolute = negative ? -minor : minor;
  const scale = 10n ** BigInt(precision);
  const whole = (absolute / scale).toString();
  const fraction = precision ? (absolute % scale).toString().padStart(precision, "0") : "";
  return (negative ? "-" : "") + whole + (fraction ? "." + fraction : "");
}

export async function onRequestPost({ request, env }: PagesContext) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return json({ error: "Origin rejected." }, 403);
    } catch {
      return json({ error: "Origin rejected." }, 403);
    }
  }

  const merchant = await merchantSession(request, env);
  if (!merchant) return json({ error: "Connect a Shopify store first." }, 401);

  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("text/csv") && !type.toLowerCase().includes("text/plain")) {
    return json({ error: "Send a CSV file as text/csv." }, 415);
  }

  const raw = await request.text();
  if (raw.length > 1_000_000) return json({ error: "CSV exceeds the 1 MB import limit." }, 413);

  let parsed;
  try {
    parsed = parseCarrierCostCsv(raw);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid carrier CSV." }, 400);
  }
  if (parsed.length > 5_000) {
    return json({ error: "The connected-store import is limited to 5,000 charge rows per file." }, 413);
  }

  const importedAt = new Date().toISOString();
  let imported = 0;
  for (let offset = 0; offset < parsed.length; offset += 100) {
    const chunk = parsed.slice(offset, offset + 100);
    const statements = chunk.map((row) =>
      env.NODUS_DB.prepare(
        "INSERT INTO shopify_costs(shop,source_system,source_record_id,invoice_id,order_reference,tracking_number,currency,amount,cost_type,occurred_at,imported_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(shop,source_system,source_record_id) DO UPDATE SET invoice_id=excluded.invoice_id,order_reference=excluded.order_reference,tracking_number=excluded.tracking_number,currency=excluded.currency,amount=excluded.amount,cost_type=excluded.cost_type,occurred_at=excluded.occurred_at,imported_at=excluded.imported_at",
      ).bind(
        merchant.shop,
        row.sourceSystem,
        row.sourceRecordId,
        row.sourceReference,
        row.orderReference,
        row.trackingNumber,
        row.currency,
        decimalFromMinor(row.amountMinor, row.currency),
        row.costType,
        row.occurredAt?.toISOString() ?? null,
        importedAt,
      ),
    );
    await env.NODUS_DB.batch(statements);
    imported += chunk.length;
  }

  return json({
    ok: true,
    rows: parsed.length,
    imported,
    sourceSystems: [...new Set(parsed.map((row) => row.sourceSystem))],
    message: "Carrier cost records are stored in this Shopify merchant workspace. Invoice and charge identity is preserved; matching remains limited to supported references and identical currency.",
  }, 201);
}
