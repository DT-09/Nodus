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

  const result = await prisma.$transaction(async (tx) => {
    let imported = 0;
    const batchSize = 500;
    for (let offset = 0; offset < costs.length; offset += batchSize) {
      const batch = costs.slice(offset, offset + batchSize);
      const inserted = await tx.shippingCost.createMany({
        data: batch.map((cost) => ({
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
      imported += inserted.count;
    }

    let invalidatedReviews = 0;
    if (imported > 0) {
      const invalidated = await tx.shippingOrder.updateMany({
        where: { merchantId: merchant.id, costCoverageStatus: "complete" },
        data: { costCoverageStatus: "partial", coverageReviewedAt: null, coverageReviewedBy: null },
      });
      invalidatedReviews = invalidated.count;
      await tx.auditEvent.create({
        data: {
          merchantId: merchant.id,
          actor: "system:carrier_csv_import",
          action: "carrier_cost_evidence_imported",
          subjectType: "merchant",
          subjectId: shop,
          detail: {
            receivedRows: costs.length,
            importedRows: imported,
            duplicateRows: costs.length - imported,
            previousCompleteReviewsInvalidated: invalidatedReviews,
          },
        },
      });
      if (invalidatedReviews > 0) {
        await tx.auditEvent.create({
          data: {
            merchantId: merchant.id,
            actor: "system:carrier_csv_import",
            action: "coverage_reviews_invalidated_by_new_evidence",
            subjectType: "merchant",
            subjectId: shop,
            detail: { affectedOrders: invalidatedReviews },
          },
        });
      }
    }
    return { imported, invalidatedReviews };
  });

  return { received: costs.length, imported: result.imported, duplicates: costs.length - result.imported };
}
