-- Expand only. The following forward migration performs evidence-based backfill,
-- validation, and constraint/index creation for both fresh and upgraded databases.
ALTER TABLE "lote" ADD COLUMN IF NOT EXISTS "mes" INTEGER;

-- Crear índice para mes en lote
CREATE INDEX IF NOT EXISTS "lote_mes_idx" ON "lote"("mes");
