import { createHash } from "node:crypto";
import { prisma } from "../db.server";
import { parseMoney } from "../domain/money";

type Csv = { headers: string[]; rows: string[][] };
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 20000;

function parseCsv(source: string): Csv {
  if (new TextEncoder().encode(source).byteLength > MAX_BYTES) throw new Error("CSV files are limited to 5 MB.");
  const text = source.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const pushField = () => { row.push(field.trim()); field = ""; closed = false; };
  const pushRow = () => { pushField(); if (row.some(cell => cell !== "")) rows.push(row); row = []; if (rows.length > MAX_ROWS + 1) throw new Error("CSV exceeds the 20,000-row limit."); };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else field += ch;
    } else if (closed) {
      if (ch === ",") pushField();
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; pushRow(); }
      else if (ch !== " " && ch !== "\t") throw new Error("Unexpected characters after a quoted CSV field.");
    } else if (ch === '"') {
      if (field.trim()) throw new Error("Quote inside an unquoted CSV field.");
      field = ""; quoted = true;
    } else if (ch === ",") pushField();
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; pushRow(); }
    else field += ch;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  pushRow();
  if (rows.length < 2) throw new Error("CSV needs a header and at least one data row.");
  const headers = rows[0]!.map(h => h.toLowerCase().replace(/[ -]+/g, "_"));
  if (headers.some(h => !h) || new Set(headers).size !== headers.length) throw new Error("CSV headers must be non-empty and unique.");
  const data = rows.slice(1);
  for (let i = 0; i < data.length; i++) if (data[i]!.length !== headers.length) throw new Error("CSV row " + (i + 2) + " has an inconsistent number of columns.");
  return { headers, rows: data };
}
function value(row: string[], headers: string[], key: string, required = true): string {
  const index = headers.indexOf(key);
  if (index < 0) { if (required) throw new Error("Missing required CSV column: " + key); return ""; }
  const result = row[index] ?? "";
  if (required && !result) throw new Error("Missing " + key + " in a CSV row.");
  return result;
}
function dateOnly(raw: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Dates must use YYYY-MM-DD.");
  const date = new Date(raw + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) throw new Error("Invalid calendar date: " + raw);
  return date;
}
function quantity(raw: string): string {
  if (!/^\d+(\.\d{1,3})?$/.test(raw)) throw new Error("Quantities must be non-negative decimals with at most three places.");
  if (Number(raw) <= 0) throw new Error("Quantities must be greater than zero.");
  return raw;
}
function hash(source: string): string { return createHash("sha256").update(source).digest("hex"); }
function safeName(name: string): string { return name.replace(/[\\/\0-\x1f]/g, "_").slice(0, 180) || "upload.csv"; }

export async function createThreePLProvider(workspaceId: string, name: string) {
  const clean = name.trim().slice(0, 120);
  if (clean.length < 2) throw new Error("Provider name must contain at least two characters.");
  return prisma.threePLProvider.create({ data: { workspaceId, name: clean } });
}

export async function importThreePLContract(input: { workspaceId: string; providerId: string; name: string; fileName: string; csv: string; confirmed: boolean }) {
  if (!input.confirmed) throw new Error("Confirm that the rate rows have been checked against the signed agreement before activating this contract.");
  const provider = await prisma.threePLProvider.findFirst({ where: { id: input.providerId, workspaceId: input.workspaceId }, select: { id: true } });
  if (!provider) throw new Error("Provider does not belong to this workspace.");
  const parsed = parseCsv(input.csv);
  const currencies = new Set<string>();
  const rules = parsed.rows.map((row, i) => {
    const amount = parseMoney(value(row, parsed.headers, "rate"), value(row, parsed.headers, "currency"));
    if (amount.minor < 0n) throw new Error("Contract rates cannot be negative.");
    currencies.add(amount.currency);
    const pricing = value(row, parsed.headers, "pricing");
    if (pricing !== "per_unit" && pricing !== "fixed") throw new Error("pricing must be per_unit or fixed.");
    const from = dateOnly(value(row, parsed.headers, "effective_from"));
    const toRaw = value(row, parsed.headers, "effective_to", false);
    const to = toRaw ? dateOnly(toRaw) : null;
    if (to && to < from) throw new Error("effective_to cannot precede effective_from.");
    return {
      chargeCode: value(row, parsed.headers, "charge_code"),
      unit: value(row, parsed.headers, "unit"),
      pricing, rateMinor: amount.minor, currency: amount.currency,
      effectiveFrom: from, effectiveTo: to,
    };
  });
  if (currencies.size !== 1) throw new Error("A single contract file must use one currency.");
  const starts = rules.map(rule => rule.effectiveFrom.getTime());
  const ends = rules.map(rule => rule.effectiveTo?.getTime() ?? Number.POSITIVE_INFINITY);
  const sourceHash = hash(input.csv);
  const contract = await prisma.$transaction(async tx => {
    return tx.threePLContract.create({
      data: {
        workspaceId: input.workspaceId, providerId: input.providerId,
        name: input.name.trim().slice(0, 160) || "Rate card",
        currency: [...currencies][0]!,
        effectiveFrom: new Date(Math.min(...starts)),
        effectiveTo: ends.every(Number.isFinite) ? new Date(Math.max(...ends)) : null,
        status: "active", sourceFileName: safeName(input.fileName), sourceHash, confirmedAt: new Date(),
        rateRules: { create: rules },
      },
      include: { rateRules: true },
    });
  });
  return { contractId: contract.id, ruleCount: contract.rateRules.length, sourceHash };
}

export async function importThreePLInvoice(input: { workspaceId: string; providerId: string; fileName: string; csv: string }) {
  const provider = await prisma.threePLProvider.findFirst({ where: { id: input.providerId, workspaceId: input.workspaceId }, select: { id: true } });
  if (!provider) throw new Error("Provider does not belong to this workspace.");
  const parsed = parseCsv(input.csv);
  const invoiceNumbers = new Set(parsed.rows.map(row => value(row, parsed.headers, "invoice_number")));
  const invoiceDates = new Set(parsed.rows.map(row => value(row, parsed.headers, "invoice_date")));
  if (invoiceNumbers.size !== 1 || invoiceDates.size !== 1) throw new Error("Upload one invoice per CSV file; invoice_number and invoice_date must be consistent across rows.");
  const invoiceNumber = [...invoiceNumbers][0]!;
  const invoiceDate = dateOnly([...invoiceDates][0]!);
  const lines = parsed.rows.map((row, index) => {
    const amount = parseMoney(value(row, parsed.headers, "amount"), value(row, parsed.headers, "currency"));
    if (amount.minor < 0n) throw new Error("Negative invoice lines are not supported in this first release; upload credits as separate documented outcomes.");
    return {
      chargeCode: value(row, parsed.headers, "charge_code"),
      description: value(row, parsed.headers, "description", false) || null,
      quantity: quantity(value(row, parsed.headers, "quantity")),
      unit: value(row, parsed.headers, "unit"),
      amountMinor: amount.minor, currency: amount.currency,
      activityReference: value(row, parsed.headers, "activity_reference", false) || null,
      sourceRow: index + 2,
    };
  });
  const currencies = new Set(lines.map(line => line.currency));
  if (currencies.size !== 1) throw new Error("An invoice file must use one billing currency.");
  const totalMinor = lines.reduce((sum, line) => sum + line.amountMinor, 0n);
  const sourceHash = hash(input.csv);
  const invoice = await prisma.$transaction(async tx => {
    const existing = await tx.threePLInvoice.findUnique({
      where: { workspaceId_providerId_invoiceNumber: { workspaceId: input.workspaceId, providerId: input.providerId, invoiceNumber } },
      select: { id: true },
    });
    if (existing) {
      await tx.threePLInvoiceLine.deleteMany({ where: { invoiceId: existing.id } });
      return tx.threePLInvoice.update({
        where: { id: existing.id },
        data: {
          invoiceDate, currency: [...currencies][0]!, totalMinor, status: "imported",
          sourceFileName: safeName(input.fileName), sourceHash, importedAt: new Date(),
          lines: { create: lines },
        },
        select: { id: true, invoiceNumber: true, totalMinor: true },
      });
    }
    return tx.threePLInvoice.create({
      data: {
        workspaceId: input.workspaceId, providerId: input.providerId, invoiceNumber,
        invoiceDate, currency: [...currencies][0]!, totalMinor,
        sourceFileName: safeName(input.fileName), sourceHash,
        lines: { create: lines },
      },
      select: { id: true, invoiceNumber: true, totalMinor: true },
    });
  });
  return { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, lineCount: lines.length, totalMinor: invoice.totalMinor.toString(), currency: [...currencies][0], sourceHash };
}

export async function importThreePLActivity(input: { workspaceId: string; providerId: string; fileName: string; csv: string }) {
  const provider = await prisma.threePLProvider.findFirst({ where: { id: input.providerId, workspaceId: input.workspaceId }, select: { id: true } });
  if (!provider) throw new Error("Provider does not belong to this workspace.");
  const parsed = parseCsv(input.csv);
  const sourceSystem = "provider_activity_csv";
  const records = parsed.rows.map((row, index) => {
    const occurredRaw = value(row, parsed.headers, "occurred_at", false);
    return {
      workspaceId: input.workspaceId, providerId: input.providerId, sourceSystem,
      sourceRecordId: value(row, parsed.headers, "record_id"),
      reference: value(row, parsed.headers, "reference"),
      chargeCode: value(row, parsed.headers, "charge_code"),
      quantity: quantity(value(row, parsed.headers, "quantity")),
      unit: value(row, parsed.headers, "unit"),
      occurredAt: occurredRaw ? new Date(occurredRaw) : null,
      sourceRow: index + 2,
    };
  });
  if (records.some(record => record.occurredAt && Number.isNaN(record.occurredAt.getTime()))) throw new Error("Activity file contains an invalid occurred_at timestamp.");
  const unique = new Set(records.map(record => record.sourceRecordId));
  if (unique.size !== records.length) throw new Error("Activity file contains duplicate record_id values.");
  const saved = await prisma.$transaction(async tx => {
    let count = 0;
    for (const record of records) {
      await tx.threePLActivityRecord.upsert({
        where: { workspaceId_sourceSystem_sourceRecordId: { workspaceId: input.workspaceId, sourceSystem, sourceRecordId: record.sourceRecordId } },
        create: record,
        update: { ...record },
      });
      count++;
    }
    return count;
  });
  return { imported: saved, sourceHash: hash(input.csv), sourceFileName: safeName(input.fileName) };
}
