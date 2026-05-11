
-- AlterTable (Safe migration for data conversion)
ALTER TABLE "convenios" ADD COLUMN "meses_mora_actual" INTEGER;

-- Backfill data from dias_mora_actual (assuming 30 days per month integer division)
UPDATE "convenios" SET "meses_mora_actual" = COALESCE("dias_mora_actual", 0) / 30;

-- Set NOT NULL constraint
ALTER TABLE "convenios" ALTER COLUMN "meses_mora_actual" SET NOT NULL;

-- Drop the old column
ALTER TABLE "convenios" DROP COLUMN "dias_mora_actual";
