import { parseMoney } from "./money";

export type ParsedCarrierCost = {
  sourceRecordId: string;
  sourceSystem: string;
  orderReference: string | null;
  trackingNumber: string | null;
  currency: string;
  amountMinor: bigint;
  costType: string;
  occurredAt: Date | null;
  sourceReference: string;
};

function parseCsvRows(input: string): string[][] {
  const source = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let quoteClosed = false;

  const pushField = () => {
    row.push(field);
    field = "";
    quoteClosed = false;
  };
  const pushRow = () => {
    pushField();
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    row = [];
    if (rows.length > 20_000) throw new Error("CSV exceeds the 20,000-row import limit.");
  };

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i]!;
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
        quoteClosed = true;
      } else {
        field += char;
      }
      continue;
    }

    if (quoteClosed) {
      if (char === ",") pushField();
      else if (char === "\n" || char === "\r") {
        if (char === "\r" && source[i + 1] === "\n") i += 1;
        pushRow();
      } else if (char !== " " && char !== "\t") {
        throw new Error("CSV contains characters after a closing quote.");
      }
      continue;
    }

    if (char === '"') {
      if (field.trim() !== "") throw new Error("CSV contains a quote inside an unquoted field.");
      field = "";
      quoted = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      pushRow();
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  pushRow();
  return rows;
}

export function parseCarrierCostCsv(input: string): ParsedCarrierCost[] {
  if (!input.trim()) throw new Error("The CSV file is empty.");
  const rows = parseCsvRows(input);
  if (rows.length < 2) throw new Error("The CSV must contain a header and at least one cost row.");
  const rawHeaders = rows[0]!.map((value) => value.trim().toLowerCase());
  const aliases: Record<string, string[]> = {
    invoice_id: ["invoice_id", "invoice number", "invoice no", "invoice #", "billing document number"],
    charge_id: ["charge_id", "charge id", "charge line id", "line item id", "transaction id"],
    amount: ["amount", "net charge", "net charge amount", "billed amount", "total charge", "charge amount"],
    currency: ["currency", "currency code", "billing currency"],
    order_reference: ["order_reference", "order reference", "customer reference", "reference 1", "order number"],
    tracking_number: ["tracking_number", "tracking number", "tracking id", "tracking no", "tracking #"],
    occurred_at: ["occurred_at", "shipment date", "ship date", "transaction date", "invoice date"],
    cost_type: ["cost_type", "charge description", "charge type", "service type", "description"],
    carrier: ["carrier", "carrier name", "provider"],
  };
  const normalize = (value: string) => value.trim().toLowerCase().replace(/[ _-]+/g, " ").replace(/[^a-z0-9 #]/g, "");
  const normalizedHeaders = rawHeaders.map(normalize);
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) throw new Error("CSV contains duplicate column names.");
  const columns = new Map<string, number>();
  for (const [canonical, names] of Object.entries(aliases)) {
    const matches = names.map(normalize).map((name) => normalizedHeaders.indexOf(name)).filter((index) => index >= 0);
    if (matches.length > 1) throw new Error(`CSV has multiple columns that map to ${canonical}; keep only one.`);
    if (matches.length === 1) columns.set(canonical, matches[0]!);
  }
  const required = ["invoice_id", "charge_id", "amount", "currency"];
  for (const name of required) if (!columns.has(name)) throw new Error(`Missing required CSV column: ${name}`);
  const index = (name: string) => columns.get(name) ?? -1;
  const cell = (values: string[], name: string) => index(name) < 0 ? "" : (values[index(name)] ?? "").trim();
  const seen = new Set<string>();

  return rows.slice(1).map((values, rowIndex) => {
    if (values.length !== rawHeaders.length) throw new Error(`CSV row ${rowIndex + 2} has ${values.length} fields; expected ${rawHeaders.length}.`);
    const invoiceId = cell(values, "invoice_id");
    const chargeId = cell(values, "charge_id");
    if (!invoiceId || !chargeId) throw new Error(`CSV row ${rowIndex + 2} requires invoice_id and charge_id.`);
    const sourceRecordId = `${invoiceId}:${chargeId}`;
    const carrierName = cell(values, "carrier").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const sourceSystem = carrierName ? `carrier_${carrierName}_csv` : "carrier_csv";
    if (seen.has(sourceRecordId)) throw new Error(`Duplicate charge identifier in CSV: ${sourceRecordId}`);
    seen.add(sourceRecordId);

    const amount = parseMoney(cell(values, "amount"), cell(values, "currency"));
    const dateValue = cell(values, "occurred_at");
    const occurredAt = dateValue ? new Date(dateValue) : null;
    if (occurredAt && Number.isNaN(occurredAt.getTime())) throw new Error(`Invalid occurred_at date on CSV row ${rowIndex + 2}.`);

    return {
      sourceRecordId,
      sourceSystem,
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
