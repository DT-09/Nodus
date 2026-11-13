CREATE TABLE "ShopifySyncState" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "afterCursor" TEXT,
    "hasMore" BOOLEAN NOT NULL DEFAULT false,
    "pagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "ordersProcessed" INTEGER NOT NULL DEFAULT 0,
    "lastPageAt" TIMESTAMP(3),
    "lastCompletedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ShopifySyncState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShopifySyncState_merchantId_key" ON "ShopifySyncState"("merchantId");
ALTER TABLE "ShopifySyncState" ADD CONSTRAINT "ShopifySyncState_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
