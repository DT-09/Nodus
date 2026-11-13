CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Session_shop_idx" ON "Session"("shop");

CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "shopName" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Merchant_shop_key" ON "Merchant"("shop");

CREATE TABLE "ShippingOrder" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "sourceOrderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "shippingRevenueMinor" BIGINT NOT NULL,
    "subtotalMinor" BIGINT,
    "trackingNumbers" JSONB,
    "sourcePayload" JSONB,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShippingOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShippingOrder_merchantId_sourceOrderId_key" ON "ShippingOrder"("merchantId", "sourceOrderId");
CREATE INDEX "ShippingOrder_merchantId_orderedAt_idx" ON "ShippingOrder"("merchantId", "orderedAt");
ALTER TABLE "ShippingOrder" ADD CONSTRAINT "ShippingOrder_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ShippingCost" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "orderReference" TEXT,
    "trackingNumber" TEXT,
    "currency" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "costType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "sourceReference" TEXT,
    CONSTRAINT "ShippingCost_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ShippingCost_merchantId_sourceSystem_sourceRecordId_key" ON "ShippingCost"("merchantId", "sourceSystem", "sourceRecordId");
CREATE INDEX "ShippingCost_merchantId_orderReference_idx" ON "ShippingCost"("merchantId", "orderReference");
CREATE INDEX "ShippingCost_merchantId_trackingNumber_idx" ON "ShippingCost"("merchantId", "trackingNumber");
ALTER TABLE "ShippingCost" ADD CONSTRAINT "ShippingCost_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditEvent_merchantId_createdAt_idx" ON "AuditEvent"("merchantId", "createdAt");
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WebhookReceipt" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'received',
    CONSTRAINT "WebhookReceipt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebhookReceipt_webhookId_key" ON "WebhookReceipt"("webhookId");
CREATE INDEX "WebhookReceipt_shop_topic_receivedAt_idx" ON "WebhookReceipt"("shop", "topic", "receivedAt");
