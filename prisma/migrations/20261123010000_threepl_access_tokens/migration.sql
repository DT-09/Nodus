CREATE TABLE "ThreePLAccessToken" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLAccessToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ThreePLAccessToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ThreePLWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ThreePLAccessToken_tokenHash_key" ON "ThreePLAccessToken"("tokenHash");
CREATE INDEX "ThreePLAccessToken_workspaceId_revokedAt_expiresAt_idx" ON "ThreePLAccessToken"("workspaceId","revokedAt","expiresAt");
