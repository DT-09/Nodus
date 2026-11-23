ALTER TABLE "ThreePLActivityRecord"
  ADD COLUMN "sourceFileName" TEXT NOT NULL DEFAULT 'activity.csv',
  ADD COLUMN "sourceHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ThreePLException" ADD COLUMN "note" TEXT;
