import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { prisma } from "../db.server";
import { canWriteThreePLWorkspace, getThreePLWorkspace } from "../services/threepl-auth.server";
import { createThreePLProvider, importThreePLActivity, importThreePLContract, importThreePLInvoice } from "../services/threepl-import.server";
import { reconcileStoredThreePLInvoice } from "../services/threepl-reconciliation.server";
import { parseMoney } from "../domain/money";

const caseStatuses = new Set(["open", "investigating", "ready_for_review", "raised_with_provider", "provider_responded", "rejected", "ignored"]);
const outcomeStatuses = new Set(["raised", "promised", "posted", "verified", "rejected"]);

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
function validPeriod(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Reporting dates must use YYYY-MM-DD.");
  const date = new Date(raw + "T00:00:00.000Z");
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) throw new Error("Invalid reporting date.");
  return date;
}
function uploadedCsv(form: FormData) {
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) throw new Error("Choose a CSV file no larger than 5 MB.");
  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") throw new Error("Only CSV files are accepted.");
  return file;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await getThreePLWorkspace(request);
  if (!auth) throw new Response("Merchant access is required.", { status: 401 });
  const workspaceId = auth.workspace.id;
  const [providers, contracts, invoices, activityRecords, exceptions, reports, outcomes, workspaceEvents] = await Promise.all([
    prisma.threePLProvider.findMany({ where: { workspaceId }, orderBy: { name: "asc" }, select: { id: true, name: true, status: true } }),
    prisma.threePLContract.findMany({ where: { workspaceId }, include: { provider: { select: { name: true } }, rateRules: { orderBy: { chargeCode: "asc" } } }, orderBy: { effectiveFrom: "desc" }, take: 50 }),
    prisma.threePLInvoice.findMany({ where: { workspaceId }, include: { provider: { select: { name: true } }, lines: { orderBy: { sourceRow: "asc" } }, _count: { select: { lines: true, runs: true } } }, orderBy: { invoiceDate: "desc" }, take: 100 }),
    prisma.threePLActivityRecord.findMany({ where: { workspaceId }, include: { provider: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.threePLException.findMany({ where: { workspaceId }, include: { invoice: { select: { invoiceNumber: true, provider: { select: { name: true } } } }, events: { orderBy: { createdAt: "desc" }, take: 12 }, _count: { select: { outcomes: true } } }, orderBy: [{ status: "asc" }, { lastSeenAt: "desc" }], take: 250 }),
    prisma.threePLPeriodReport.findMany({ where: { workspaceId }, orderBy: [{ periodEnd: "desc" }, { revision: "desc" }], take: 24 }),
    prisma.threePLOutcome.findMany({ where: { workspaceId }, include: { exception: { select: { findingCode: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.threePLWorkspaceEvent.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  const now = new Date();
  const trialExpired = auth.workspace.status === "trial" && Boolean(auth.workspace.trialEndsAt && auth.workspace.trialEndsAt <= now) && auth.workspace.subscriptionStatus !== "active";
  const subscriptionExpired = auth.workspace.subscriptionStatus === "cancelled" && Boolean(auth.workspace.subscriptionEndsAt && auth.workspace.subscriptionEndsAt <= now);
  return Response.json({
    workspace: {
      id: auth.workspace.id, businessName: auth.workspace.businessName, status: trialExpired ? "trial_expired" : subscriptionExpired ? "subscription_expired" : auth.workspace.status,
      planCode: auth.workspace.planCode, trialActivatedAt: auth.workspace.trialActivatedAt?.toISOString() ?? null,
      trialEndsAt: auth.workspace.trialEndsAt?.toISOString() ?? null, subscriptionStatus: auth.workspace.subscriptionStatus, subscriptionEndsAt: auth.workspace.subscriptionEndsAt?.toISOString() ?? null,
    },
    canWrite: canWriteThreePLWorkspace(auth.workspace) && !trialExpired,
    providers,
    contracts: contracts.map(item => ({ id: item.id, name: item.name, provider: item.provider.name, currency: item.currency, effectiveFrom: item.effectiveFrom.toISOString(), effectiveTo: item.effectiveTo?.toISOString() ?? null, status: item.status, sourceFileName: item.sourceFileName, sourceHash: item.sourceHash, rules: item.rateRules.map(rule => ({ id: rule.id, chargeCode: rule.chargeCode, unit: rule.unit, pricing: rule.pricing, rateMinor: rule.rateMinor.toString(), currency: rule.currency, sourceRow: rule.sourceRow, effectiveFrom: rule.effectiveFrom.toISOString(), effectiveTo: rule.effectiveTo?.toISOString() ?? null })) })),
    invoices: invoices.map(item => ({ id: item.id, number: item.invoiceNumber, provider: item.provider.name, date: item.invoiceDate.toISOString(), currency: item.currency, totalMinor: item.totalMinor.toString(), status: item.status, sourceFileName: item.sourceFileName, sourceHash: item.sourceHash, lineCount: item._count.lines, runCount: item._count.runs, lines: item.lines.map(line => ({ id: line.id, chargeCode: line.chargeCode, description: line.description, serviceDate: line.serviceDate?.toISOString() ?? null, quantity: line.quantity.toString(), unit: line.unit, amountMinor: line.amountMinor.toString(), currency: line.currency, activityReference: line.activityReference, sourceRow: line.sourceRow })) })),
    activityRecords: activityRecords.map(item => ({ id: item.id, provider: item.provider.name, reference: item.reference, chargeCode: item.chargeCode, quantity: item.quantity.toString(), unit: item.unit, occurredAt: item.occurredAt?.toISOString() ?? null, sourceRow: item.sourceRow, sourceFileName: item.sourceFileName, sourceHash: item.sourceHash })),
    exceptions: exceptions.map(item => ({ id: item.id, invoiceNumber: item.invoice.invoiceNumber, provider: item.invoice.provider.name, code: item.findingCode, severity: item.severity, state: item.state, status: item.status, currency: item.currency, exposureMinor: item.exposureMinor?.toString() ?? null, explanation: item.explanation, note: item.note, evidence: Array.isArray(item.evidenceReferences) ? item.evidenceReferences : [], events: item.events.map(event => ({ action: event.action, detail: event.detail, createdAt: event.createdAt.toISOString() })), outcomes: item._count.outcomes, lastSeenAt: item.lastSeenAt.toISOString() })),
    reports: reports.map(item => ({ id: item.id, start: item.periodStart.toISOString(), end: item.periodEnd.toISOString(), revision: item.revision, status: item.status, generatedAt: item.generatedAt.toISOString(), payload: item.payload })),
    outcomes: outcomes.map(item => ({ id: item.id, exceptionId: item.exceptionId, type: item.outcomeType, status: item.status, amountMinor: item.amountMinor.toString(), currency: item.currency, reference: item.externalReference, note: item.evidenceNote, verifiedAt: item.verifiedAt?.toISOString() ?? null, findingCode: item.exception.findingCode })),
    workspaceEvents: workspaceEvents.map(event => ({ action: event.action, detail: event.detail, createdAt: event.createdAt.toISOString() })),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return Response.json({ ok: false, error: "Method not allowed." }, { status: 405 });
  if (!sameOrigin(request)) return Response.json({ ok: false, error: "Cross-origin request rejected." }, { status: 403 });
  const auth = await getThreePLWorkspace(request);
  if (!auth) return Response.json({ ok: false, error: "Merchant access is required." }, { status: 401 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const workspaceId = auth.workspace.id;
  if (!canWriteThreePLWorkspace(auth.workspace)) return Response.json({ ok: false, error: "This workspace is read-only. Activate a trial after onboarding or arrange an active subscription." }, { status: 403 });

  try {
    if (intent === "create_provider") {
      const provider = await createThreePLProvider(workspaceId, String(form.get("name") ?? ""));
      return Response.json({ ok: true, message: "Provider added.", provider: { id: provider.id, name: provider.name } });
    }
    if (intent === "import_contract" || intent === "import_invoice" || intent === "import_activity") {
      const file = uploadedCsv(form);
      const csv = await file.text();
      const providerId = String(form.get("providerId") ?? "");
      if (!providerId) throw new Error("Select a provider.");
      if (intent === "import_contract") {
        const result = await importThreePLContract({ workspaceId, providerId, name: String(form.get("name") ?? "Rate card"), fileName: file.name, csv, confirmed: form.get("confirmed") === "on" });
        return Response.json({ ok: true, message: "Contract rate card imported and activated.", result });
      }
      if (intent === "import_invoice") {
        const result = await importThreePLInvoice({ workspaceId, providerId, fileName: file.name, csv });
        return Response.json({ ok: true, message: "Invoice and source rows saved.", result });
      }
      const result = await importThreePLActivity({ workspaceId, providerId, fileName: file.name, csv });
      return Response.json({ ok: true, message: "Operational activity rows saved.", result });
    }
    if (intent === "reconcile") {
      const invoiceId = String(form.get("invoiceId") ?? "");
      const result = await reconcileStoredThreePLInvoice(workspaceId, invoiceId);
      return Response.json({ ok: true, message: result.reused ? "Existing reconciliation reused; source data has not changed." : "Invoice reconciled and findings saved.", result });
    }
    if (intent === "update_exception") {
      const exceptionId = String(form.get("exceptionId") ?? "");
      const status = String(form.get("status") ?? "");
      const note = String(form.get("note") ?? "").trim().slice(0, 2000);
      if (!caseStatuses.has(status)) throw new Error("Choose a valid investigation status.");
      const record = await prisma.threePLException.findFirst({ where: { id: exceptionId, workspaceId }, select: { id: true, status: true } });
      if (!record) throw new Error("Exception not found in this workspace.");
      await prisma.$transaction([
        prisma.threePLException.update({ where: { id: record.id }, data: { status, note: note || null, resolvedAt: status === "rejected" || status === "ignored" ? new Date() : null } }),
        prisma.threePLCaseEvent.create({ data: { workspaceId, exceptionId: record.id, actorType: "merchant", action: "status_changed", detail: { from: record.status, to: status, note } } }),
      ]);
      return Response.json({ ok: true, message: "Investigation status saved." });
    }
    if (intent === "record_outcome") {
      const exceptionId = String(form.get("exceptionId") ?? "");
      const status = String(form.get("status") ?? "");
      const amount = parseMoney(String(form.get("amount") ?? ""), String(form.get("currency") ?? ""));
      const reference = String(form.get("reference") ?? "").trim().slice(0, 180);
      const note = String(form.get("note") ?? "").trim().slice(0, 2000);
      if (!outcomeStatuses.has(status) || amount.minor <= 0n || note.length < 10) throw new Error("Provide a positive amount, valid outcome status and evidence note.");
      if ((status === "posted" || status === "verified") && !reference) throw new Error("A provider credit or transaction reference is required for posted or verified outcomes.");
      if (status === "verified" && note.length < 20) throw new Error("Verified outcomes require a detailed evidence note.");
      const exception = await prisma.threePLException.findFirst({ where: { id: exceptionId, workspaceId }, select: { id: true, currency: true, status: true } });
      if (!exception) throw new Error("Exception not found in this workspace.");
      if (exception.currency !== amount.currency) throw new Error("Outcome currency must match the exception currency.");
      await prisma.$transaction(async tx => {
        const outcome = await tx.threePLOutcome.create({ data: { workspaceId, exceptionId, outcomeType: "provider_adjustment", status, amountMinor: amount.minor, currency: amount.currency, externalReference: reference || null, evidenceNote: note, verifiedAt: status === "verified" ? new Date() : null } });
        const nextStatus = status === "verified" ? "verified_closed" : status === "posted" ? "credit_posted" : status === "promised" ? "credit_promised" : status === "raised" ? "raised_with_provider" : "rejected";
        await tx.threePLException.update({ where: { id: exception.id }, data: { status: nextStatus, resolvedAt: status === "verified" ? new Date() : null } });
        await tx.threePLCaseEvent.create({ data: { workspaceId, exceptionId, actorType: "merchant", action: "outcome_recorded", detail: { outcomeId: outcome.id, status, amountMinor: amount.minor.toString(), currency: amount.currency, referencePresent: Boolean(reference) } } });
      });
      return Response.json({ ok: true, message: status === "verified" ? "Outcome recorded as verified with the supplied evidence reference." : "Outcome recorded. It is not counted as verified recovery." });
    }
    if (intent === "generate_report") {
      const start = validPeriod(form.get("periodStart"));
      const end = validPeriod(form.get("periodEnd"));
      if (end < start) throw new Error("Period end must not precede period start.");
      const [invoices, exceptions, outcomes, previousCount] = await Promise.all([
        prisma.threePLInvoice.findMany({ where: { workspaceId, invoiceDate: { gte: start, lte: end } }, include: { provider: { select: { name: true } }, _count: { select: { lines: true } } }, orderBy: { invoiceDate: "asc" } }),
        prisma.threePLException.findMany({ where: { workspaceId, invoice: { invoiceDate: { gte: start, lte: end } } }, orderBy: { createdAt: "asc" } }),
        prisma.threePLOutcome.findMany({ where: { workspaceId, exception: { invoice: { invoiceDate: { gte: start, lte: end } } } }, orderBy: { createdAt: "asc" } }),
        prisma.threePLPeriodReport.count({ where: { workspaceId, periodStart: start, periodEnd: end } }),
      ]);
      const totalByCurrency: Record<string, string> = {};
      for (const invoice of invoices) totalByCurrency[invoice.currency] = (BigInt(totalByCurrency[invoice.currency] ?? "0") + invoice.totalMinor).toString();
      const verifiedByCurrency: Record<string, string> = {};
      for (const outcome of outcomes) if (outcome.status === "verified") verifiedByCurrency[outcome.currency] = (BigInt(verifiedByCurrency[outcome.currency] ?? "0") + outcome.amountMinor).toString();
      const payload = {
        scope: { periodStart: start.toISOString(), periodEnd: end.toISOString(), invoiceCount: invoices.length, invoiceLineCount: invoices.reduce((sum, item) => sum + item._count.lines, 0) },
        invoiceTotalsMinorByCurrency: totalByCurrency,
        exceptionSummary: { total: exceptions.length, open: exceptions.filter(x => !["verified_closed", "rejected", "ignored"].includes(x.status)).length, verifiedClosed: exceptions.filter(x => x.status === "verified_closed").length },
        outcomes: { total: outcomes.length, verifiedCount: outcomes.filter(x => x.status === "verified").length, verifiedMinorByCurrency: verifiedByCurrency, statuses: outcomes.map(x => ({ id: x.id, status: x.status, amountMinor: x.amountMinor.toString(), currency: x.currency, referencePresent: Boolean(x.externalReference) })) },
        invoices: invoices.map(x => ({ id: x.id, number: x.invoiceNumber, provider: x.provider.name, invoiceDate: x.invoiceDate.toISOString(), currency: x.currency, totalMinor: x.totalMinor.toString(), lineCount: x._count.lines, status: x.status, sourceHash: x.sourceHash })),
        exceptions: exceptions.map(x => ({ id: x.id, invoiceId: x.invoiceId, findingCode: x.findingCode, status: x.status, severity: x.severity, currency: x.currency, exposureMinor: x.exposureMinor?.toString() ?? null, evidenceReferences: x.evidenceReferences })),
        limitations: ["Calculated contract variances are not proof of provider liability or recoverable credit.", "Only outcomes explicitly marked verified with a reference and evidence note are counted as verified.", "SLA performance is excluded unless contractual definitions and source timestamps are present."],
      };
      const report = await prisma.threePLPeriodReport.create({ data: { workspaceId, periodStart: start, periodEnd: end, revision: previousCount + 1, status: "generated", payload } });
      return Response.json({ ok: true, message: "Period report generated and stored.", reportId: report.id });
    }
    throw new Error("Unsupported workspace action.");
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "The request could not be completed." }, { status: 400 });
  }
}
