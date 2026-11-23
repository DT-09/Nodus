CREATE TABLE "ThreePLWorkspace" (
  "id" TEXT NOT NULL,
  "businessName" TEXT NOT NULL,
  "ownerName" TEXT NOT NULL,
  "ownerEmail" TEXT NOT NULL,
  "shopDomain" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "planCode" TEXT,
  "trialActivatedAt" TIMESTAMP(3),
  "trialEndsAt" TIMESTAMP(3),
  "subscriptionStatus" TEXT NOT NULL DEFAULT 'none',
  "subscriptionStartedAt" TIMESTAMP(3),
  "subscriptionEndsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ThreePLWorkspace_ownerEmail_idx" ON "ThreePLWorkspace"("ownerEmail");
CREATE INDEX "ThreePLWorkspace_status_trialEndsAt_idx" ON "ThreePLWorkspace"("status","trialEndsAt");

CREATE TABLE "ThreePLProvider" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "externalRef" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLProvider_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLProvider_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLProvider_workspaceId_name_key" ON "ThreePLProvider"("workspaceId","name");
CREATE INDEX "ThreePLProvider_workspaceId_status_idx" ON "ThreePLProvider"("workspaceId","status");

CREATE TABLE "ThreePLContract" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "sourceFileName" TEXT,
  "sourceHash" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLContract_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLContract_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLContract_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ThreePLProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLContract_workspaceId_providerId_effectiveFrom_idx" ON "ThreePLContract"("workspaceId","providerId","effectiveFrom");

CREATE TABLE "ThreePLRateRule" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "chargeCode" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "pricing" TEXT NOT NULL,
  "rateMinor" BIGINT NOT NULL,
  "currency" TEXT NOT NULL,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLRateRule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLRateRule_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ThreePLContract"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLRateRule_contractId_chargeCode_effectiveFrom_idx" ON "ThreePLRateRule"("contractId","chargeCode","effectiveFrom");

CREATE TABLE "ThreePLInvoice" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "invoiceDate" TIMESTAMP(3) NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL,
  "totalMinor" BIGINT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'imported',
  "sourceFileName" TEXT,
  "sourceHash" TEXT,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLInvoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLInvoice_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLInvoice_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ThreePLProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLInvoice_workspaceId_providerId_invoiceNumber_key" ON "ThreePLInvoice"("workspaceId","providerId","invoiceNumber");
CREATE INDEX "ThreePLInvoice_workspaceId_invoiceDate_idx" ON "ThreePLInvoice"("workspaceId","invoiceDate");
CREATE INDEX "ThreePLInvoice_workspaceId_status_periodStart_idx" ON "ThreePLInvoice"("workspaceId","status","periodStart");

CREATE TABLE "ThreePLInvoiceLine" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "externalLineId" TEXT,
  "chargeCode" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(18,3) NOT NULL,
  "unit" TEXT NOT NULL,
  "amountMinor" BIGINT NOT NULL,
  "currency" TEXT NOT NULL,
  "activityReference" TEXT,
  "sourceRow" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLInvoiceLine_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ThreePLInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLInvoiceLine_invoiceId_chargeCode_idx" ON "ThreePLInvoiceLine"("invoiceId","chargeCode");
CREATE INDEX "ThreePLInvoiceLine_invoiceId_activityReference_idx" ON "ThreePLInvoiceLine"("invoiceId","activityReference");

CREATE TABLE "ThreePLActivityRecord" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "sourceSystem" TEXT NOT NULL,
  "sourceRecordId" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "chargeCode" TEXT NOT NULL,
  "quantity" DECIMAL(18,3) NOT NULL,
  "unit" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3),
  "sourceRow" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLActivityRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLActivityRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLActivityRecord_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ThreePLProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLActivityRecord_workspaceId_sourceSystem_sourceRecordId_key" ON "ThreePLActivityRecord"("workspaceId","sourceSystem","sourceRecordId");
CREATE INDEX "ThreePLActivityRecord_workspaceId_reference_chargeCode_idx" ON "ThreePLActivityRecord"("workspaceId","reference","chargeCode");
CREATE INDEX "ThreePLActivityRecord_workspaceId_occurredAt_idx" ON "ThreePLActivityRecord"("workspaceId","occurredAt");

CREATE TABLE "ThreePLReconciliationRun" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "engineVersion" TEXT NOT NULL,
  "inputHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'completed',
  "summary" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLReconciliationRun_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLReconciliationRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLReconciliationRun_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ThreePLInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLReconciliationRun_workspaceId_invoiceId_inputHash_key" ON "ThreePLReconciliationRun"("workspaceId","invoiceId","inputHash");
CREATE INDEX "ThreePLReconciliationRun_workspaceId_createdAt_idx" ON "ThreePLReconciliationRun"("workspaceId","createdAt");

CREATE TABLE "ThreePLException" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "invoiceLineId" TEXT,
  "fingerprint" TEXT NOT NULL,
  "findingCode" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "exposureMinor" BIGINT,
  "currency" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "evidenceReferences" JSONB NOT NULL,
  "assignedTo" TEXT,
  "dueAt" TIMESTAMP(3),
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLException_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLException_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLException_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "ThreePLInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLException_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ThreePLReconciliationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLException_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "ThreePLInvoiceLine"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLException_workspaceId_fingerprint_key" ON "ThreePLException"("workspaceId","fingerprint");
CREATE INDEX "ThreePLException_workspaceId_status_severity_lastSeenAt_idx" ON "ThreePLException"("workspaceId","status","severity","lastSeenAt");
CREATE INDEX "ThreePLException_workspaceId_invoiceId_idx" ON "ThreePLException"("workspaceId","invoiceId");

CREATE TABLE "ThreePLCaseEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "exceptionId" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorRef" TEXT,
  "action" TEXT NOT NULL,
  "detail" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLCaseEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLCaseEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLCaseEvent_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "ThreePLException"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLCaseEvent_workspaceId_exceptionId_createdAt_idx" ON "ThreePLCaseEvent"("workspaceId","exceptionId","createdAt");

CREATE TABLE "ThreePLPeriodReport" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "payload" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLPeriodReport_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLPeriodReport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLPeriodReport_workspaceId_periodStart_periodEnd_revision_key" ON "ThreePLPeriodReport"("workspaceId","periodStart","periodEnd","revision");
CREATE INDEX "ThreePLPeriodReport_workspaceId_periodEnd_idx" ON "ThreePLPeriodReport"("workspaceId","periodEnd");

CREATE TABLE "ThreePLOutcome" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "exceptionId" TEXT NOT NULL,
  "outcomeType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'identified',
  "amountMinor" BIGINT NOT NULL,
  "currency" TEXT NOT NULL,
  "externalReference" TEXT,
  "evidenceNote" TEXT NOT NULL,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLOutcome_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLOutcome_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ThreePLOutcome_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "ThreePLException"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLOutcome_workspaceId_status_currency_idx" ON "ThreePLOutcome"("workspaceId","status","currency");
CREATE INDEX "ThreePLOutcome_workspaceId_exceptionId_idx" ON "ThreePLOutcome"("workspaceId","exceptionId");
