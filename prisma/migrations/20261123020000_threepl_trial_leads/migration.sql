CREATE TABLE "ThreePLLead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "shopDomain" TEXT NOT NULL,
  "monthlyOrders" TEXT NOT NULL,
  "fulfilmentSetup" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "requestedOffer" TEXT NOT NULL DEFAULT 'seven_day_trial',
  "consentAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLLead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ThreePLLead_status_createdAt_idx" ON "ThreePLLead"("status","createdAt");
CREATE INDEX "ThreePLLead_email_createdAt_idx" ON "ThreePLLead"("email","createdAt");
CREATE INDEX "ThreePLLead_shopDomain_createdAt_idx" ON "ThreePLLead"("shopDomain","createdAt");
