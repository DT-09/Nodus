ALTER TABLE "ThreePLActivityRecord"
  ADD COLUMN "sourceFileName" TEXT NOT NULL DEFAULT 'activity.csv',
  ADD COLUMN "sourceHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ThreePLActivityRecord"
  ALTER COLUMN "sourceFileName" DROP DEFAULT,
  ALTER COLUMN "sourceHash" DROP DEFAULT;
ALTER TABLE "ThreePLException" ADD COLUMN "note" TEXT;
