import { parseMoney } from "./money";

export type ParsedCarrierCost = {
  sourceRecordId: string;
  orderReference: string | null;
  trackingNumber: string | null;
  currency: string;
  amountMinor: bigint;
  costType: string;
  occurredAt: Date | null;
  sourceReference: string;
};

function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]!;
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field.length === 0) quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

export function parseCarrierCostCsv(input: string): ParsedCarrierCost[] {
  if (!input.trim()) throw new Error("The CSV file is empty.");
  const rows = parseCsvRows(input);
  if (rows.length < 2) throw new Error("The CSV must contain a header and at least one cost row.");
  const headers = rows[0]!.map((value) => value.trim().toLowerCase());
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate column names.");
  const required = ["invoice_id", "charge_id", "amount", "currency"];
  for (const name of required) if (!headers.includes(name)) throw new Error(`Missing required CSV column: ${name}`);
  const index = (name: string) => headers.indexOf(name);
  const cell = (values: string[], name: string) => index(name) < 0 ? "" : (values[index(name)] ?? "").trim();
  const seen = new Set<string>();

  return rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) throw new Error(`CSV row ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}.`);
    const invoiceId = cell(values, "invoice_id");
    const chargeId = cell(values, "charge_id");
    if (!invoiceId || !chargeId) throw new Error(`CSV row ${rowIndex + 2} requires invoice_id and charge_id.`);
    const sourceRecordId = `${invoiceId}:${chargeId}`;
    if (seen.has(sourceRecordId)) throw new Error(`Duplicate charge identifier in CSV: ${sourceRecordId}`);
    seen.add(sourceRecordId);

    const amount = parseMoney(cell(values, "amount"), cell(values, "currency"));
    const dateValue = cell(values, "occurred_at");
    const occurredAt = dateValue ? new Date(dateValue) : null;
    if (occurredAt && Number.isNaN(occurredAt.getTime())) throw new Error(`Invalid occurred_at date on CSV row ${rowIndex + 2}.`);

    return {
      sourceRecordId,
      orderReference: cell(values, "order_reference") || null,
      trackingNumber: cell(values, "tracking_number") || null,
      currency: amount.currency,
      amountMinor: amount.minor,
      costType: cell(values, "cost_type") || "shipping",
      occurredAt,
      sourceReference: invoiceId,
    };
  });
}
