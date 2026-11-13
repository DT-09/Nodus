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
    const references = [...new Set(costs.map((cost) => cost.orderReference).filter((value): value is string => Boolean(value)))];
    const trackingNumbers = [...new Set(costs.map((cost) => cost.trackingNumber).filter((value): value is string => Boolean(value)))];
    if (references.length || trackingNumbers.length) {
      const affected = await prisma.shippingOrder.findMany({
        where: {
          merchantId: merchant.id,
          OR: [
            ...references.map((reference) => ({ OR: [{ sourceOrderId: reference }, { orderName: reference }] })),
            ...trackingNumbers.map((trackingNumber) => ({ trackingNumbers: { array_contains: [trackingNumber] } })),
          ],
        },
        select: { id: true, sourceOrderId: true, costCoverageStatus: true },
      });
      if (affected.length) {
        await prisma.$transaction([
          prisma.shippingOrder.updateMany({
            where: { id: { in: affected.map((order) => order.id) } },
            data: { costCoverageStatus: "partial", coverageReviewedAt: null, coverageReviewedBy: null },
          }),
          prisma.auditEvent.create({
            data: {
              merchantId: merchant.id,
              actor: "system:carrier_csv_import",
              action: "coverage_review_invalidated_by_new_evidence",
              subjectType: "shipping_order_batch",
              subjectId: affected.map((order) => order.sourceOrderId).join(",").slice(0, 500),
              detail: { importedRows: result.count, affectedOrders: affected.length },
            },
          }),
        ]);
      }
    }
    await prisma.auditEvent.create({
      data: {
        merchantId: merchant.id,
        actor: "system:carrier_csv_import",
        action: "carrier_cost_evidence_imported",
        subjectType: "merchant",
        subjectId: shop,
        detail: { receivedRows: costs.length, importedRows: result.count, duplicateRows: costs.length - result.count },
      },
    });
  }

  return { received: costs.length, imported: result.count, duplicates: costs.length - result.count };
}
