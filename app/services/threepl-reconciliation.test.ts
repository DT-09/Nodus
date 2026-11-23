import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "../db.server";
import { importThreePLActivity, importThreePLContract, importThreePLInvoice, createThreePLProvider } from "./threepl-import.server";
import { reconcileStoredThreePLInvoice } from "./threepl-reconciliation.server";

const integration = process.env.DATABASE_URL ? describe : describe.skip;
const workspaceIds: string[] = [];

async function workspace(name: string) {
  const record = await prisma.threePLWorkspace.create({
    data: { businessName: name, ownerName: "Test Operator", ownerEmail: name.toLowerCase().replaceAll(" ", ".") + "@example.test", status: "onboarding" },
  });
  workspaceIds.push(record.id);
  return record;
}

afterEach(async () => {
  if (workspaceIds.length) {
    await prisma.threePLWorkspace.deleteMany({ where: { id: { in: workspaceIds.splice(0) } } });
  }
});

integration("persisted 3PL reconciliation", () => {
  it("imports real source rows, reconciles against the effective rate, persists the case and reuses identical runs", async () => {
    const merchant = await workspace("Merchant A");
    const provider = await createThreePLProvider(merchant.id, "Northstar Fulfilment");

    await importThreePLContract({
      workspaceId: merchant.id,
      providerId: provider.id,
      name: "Signed 2026 rate card",
      fileName: "rate-card.csv",
      confirmed: true,
      csv: [
        "charge_code,unit,pricing,rate,currency,effective_from,effective_to",
        "PICK,order,per_unit,0.10,USD,2026-01-01,",
      ].join("\n"),
    });

    const invoice = await importThreePLInvoice({
      workspaceId: merchant.id,
      providerId: provider.id,
      fileName: "invoice-october.csv",
      csv: [
        "invoice_number,invoice_date,service_date,charge_code,quantity,unit,amount,currency,activity_reference",
        "INV-1001,2026-10-31,2026-10-30,PICK,100,order,12.00,USD,SHIP-1001",
      ].join("\n"),
    });

    await importThreePLActivity({
      workspaceId: merchant.id,
      providerId: provider.id,
      fileName: "activity-october.csv",
      csv: [
        "record_id,reference,charge_code,quantity,unit,occurred_at",
        "ACT-1001,SHIP-1001,PICK,100,order,2026-10-30T12:00:00Z",
      ].join("\n"),
    });

    const first = await reconcileStoredThreePLInvoice(merchant.id, invoice.invoiceId);
    expect(first.reused).toBe(false);
    expect(first.summary).toMatchObject({ invoiceLines: 1, findingCount: 1 });
    const exceptions = await prisma.threePLException.findMany({ where: { workspaceId: merchant.id } });
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0]?.findingCode).toBe("contract_rate_variance");
    expect(exceptions[0]?.exposureMinor).toBe(200n);
    expect(exceptions[0]?.evidenceReferences).toEqual(expect.arrayContaining([
      expect.stringContaining("invoice:"),
      expect.stringContaining("contract-rule:"),
    ]));

    const second = await reconcileStoredThreePLInvoice(merchant.id, invoice.invoiceId);
    expect(second.reused).toBe(true);
    expect(second.runId).toBe(first.runId);
    expect(await prisma.threePLReconciliationRun.count({ where: { workspaceId: merchant.id, invoiceId: invoice.invoiceId } })).toBe(1);
  });

  it("rejects an invoice identifier belonging to another workspace", async () => {
    const owner = await workspace("Owner Workspace");
    const other = await workspace("Other Workspace");
    const provider = await createThreePLProvider(owner.id, "Provider");
    await importThreePLContract({
      workspaceId: owner.id, providerId: provider.id, name: "Rates", fileName: "rates.csv", confirmed: true,
      csv: ["charge_code,unit,pricing,rate,currency,effective_from", "PICK,order,per_unit,0.10,USD,2026-01-01"].join("\n"),
    });
    const invoice = await importThreePLInvoice({
      workspaceId: owner.id, providerId: provider.id, fileName: "invoice.csv",
      csv: ["invoice_number,invoice_date,charge_code,quantity,unit,amount,currency", "INV-2,2026-10-31,PICK,1,order,0.10,USD"].join("\n"),
    });
    await expect(reconcileStoredThreePLInvoice(other.id, invoice.invoiceId)).rejects.toThrow("Invoice was not found in this workspace.");
  });
});
