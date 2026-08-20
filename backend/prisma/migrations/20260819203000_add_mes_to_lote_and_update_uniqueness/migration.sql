-- Agregar columna mes a tabla lote
ALTER TABLE "lote" ADD COLUMN IF NOT EXISTS "mes" INTEGER NOT NULL DEFAULT 1;

-- Crear índice para mes en lote
CREATE INDEX IF NOT EXISTS "lote_mes_idx" ON "lote"("mes");

-- Crear constraint única para (comunidad_id, periodo_id, mes) si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lote_comunidad_periodo_mes_unique'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'lote_comunidad_periodo_mes_key'
    ) THEN
        CREATE UNIQUE INDEX "lote_comunidad_periodo_mes_key" ON "lote"("comunidad_id", "periodo_id", "mes");
    END IF;
END $$;
