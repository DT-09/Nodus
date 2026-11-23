CREATE TABLE "ThreePLWorkspaceEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "actorRef" TEXT,
  "action" TEXT NOT NULL,
  "detail" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLWorkspaceEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLWorkspaceEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ThreePLWorkspaceEvent_workspaceId_createdAt_idx" ON "ThreePLWorkspaceEvent"("workspaceId","createdAt");
