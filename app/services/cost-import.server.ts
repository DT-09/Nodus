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
  return { received: costs.length, imported: result.count, duplicates: costs.length - result.count };
}
