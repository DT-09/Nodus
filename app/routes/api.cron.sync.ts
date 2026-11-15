import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "../db.server";
import { unauthenticated, requireShopifyConfiguration } from "../shopify.server";
import { getShippingSnapshot } from "../services/shipping-snapshot.server";

const MAX_MERCHANTS_PER_RUN = 3;
const LEASE_MS = 4 * 60 * 1000;

export async function loader({ request }: LoaderFunctionArgs) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Cron is not configured.", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized.", { status: 401 });
  }

  try { requireShopifyConfiguration(); } catch { return new Response("Shopify sync is not configured.", { status: 503 }); }\n\n  const now = new Date();
  const merchants = await prisma.merchant.findMany({
    where: { uninstalledAt: null },
    select: { id: true },
    take: 500,
  });
  for (const merchant of merchants) {
    await prisma.scheduledSyncState.upsert({
      where: { merchantId: merchant.id },
      create: { merchantId: merchant.id, nextRunAt: now },
      update: {},
    });
  }

  const due = await prisma.scheduledSyncState.findMany({
    where: { nextRunAt: { lte: now }, OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] },
    orderBy: [{ nextRunAt: "asc" }, { updatedAt: "asc" }],
    take: MAX_MERCHANTS_PER_RUN,
    include: { merchant: { select: { shop: true, uninstalledAt: true } } },
  });

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  for (const state of due) {
    if (state.merchant.uninstalledAt) { skipped += 1; continue; }
    const leaseUntil = new Date(Date.now() + LEASE_MS);
    const locked = await prisma.scheduledSyncState.updateMany({
      where: { id: state.id, OR: [{ lockedUntil: null }, { lockedUntil: { lte: new Date() } }] },
      data: { lockedUntil: leaseUntil, status: "running" },
    });
    if (locked.count !== 1) { skipped += 1; continue; }

    try {
      const { admin } = await unauthenticated.admin(state.merchant.shop);
      const result = await getShippingSnapshot(admin);
      const completed = result.paginationComplete;
      await prisma.scheduledSyncState.update({
        where: { id: state.id },
        data: {
          status: completed ? "healthy" : "syncing",
          nextRunAt: new Date(Date.now() + (completed ? 15 : 5) * 60 * 1000),
          lastRunAt: new Date(),
          lastSuccessAt: new Date(),
          failureCount: 0,
          lastError: null,
          lockedUntil: null,
        },
      });
      succeeded += 1;
    } catch {
      const failures = state.failureCount + 1;
      const backoffMinutes = Math.min(360, 5 * 2 ** Math.min(failures - 1, 6));
      await prisma.scheduledSyncState.update({
        where: { id: state.id },
        data: {
          status: "degraded",
          nextRunAt: new Date(Date.now() + backoffMinutes * 60 * 1000),
          lastRunAt: new Date(),
          failureCount: failures,
          lastError: "Scheduled Shopify sync failed. Reauthorize the app or inspect server logs.",
          lockedUntil: null,
        },
      });
      failed += 1;
    }
  }

  return Response.json({ ok: true, processed: due.length, succeeded, failed, skipped, timestamp: new Date().toISOString() }, {
    headers: { "Cache-Control": "no-store" },
  });
}
