import { prisma } from "../db.server";
import { parseCarrierCostCsv } from "../domain/carrier-csv";

export { parseCarrierCostCsv };

export async function importCarrierCostCsv(shop: string, csv: string) {
  const costs = parseCarrierCostCsv(csv);
  const merchant = await prisma.merchant.upsert({
    where: { shop },
    create: { shop, shopName: shop },
    update: {},
    select: { id: true },
  });

  const result = await prisma.shippingCost.createMany({
    data: costs.map((cost) => ({
      merchantId: merchant.id,
      sourceSystem: "carrier_csv",
      sourceRecordId: cost.sourceRecordId,
      orderReference: cost.orderReference,
      trackingNumber: cost.trackingNumber,
      currency: cost.currency,
      amountMinor: cost.amountMinor,
      costType: cost.costType,
      occurredAt: cost.occurredAt,
      sourceReference: cost.sourceReference,
    })),
    skipDuplicates: true,
  });

  if (result.count > 0) {
    const invalidated = await prisma.shippingOrder.updateMany({
      where: { merchantId: merchant.id, costCoverageStatus: "complete" },
      data: { costCoverageStatus: "partial", coverageReviewedAt: null, coverageReviewedBy: null },
    });
    await prisma.$transaction([
      prisma.auditEvent.create({
        data: {
          merchantId: merchant.id,
          actor: "system:carrier_csv_import",
          action: "carrier_cost_evidence_imported",
          subjectType: "merchant",
          subjectId: shop,
          detail: {
            receivedRows: costs.length,
            importedRows: result.count,
            duplicateRows: costs.length - result.count,
            previousCompleteReviewsInvalidated: invalidated.count,
          },
        },
      }),
      ...(invalidated.count ? [prisma.auditEvent.create({
        data: {
          merchantId: merchant.id,
          actor: "system:carrier_csv_import",
          action: "coverage_reviews_invalidated_by_new_evidence",
          subjectType: "merchant",
          subjectId: shop,
          detail: { affectedOrders: invalidated.count },
        },
      })] : []),
    ]);
  }

  return { received: costs.length, imported: result.count, duplicates: costs.length - result.count };
}
