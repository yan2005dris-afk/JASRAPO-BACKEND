-- Migration: Add mes column to prefacturas and update unique constraint
-- Created: 2026-08-18

ALTER TABLE "public"."prefacturas"
  ADD COLUMN IF NOT EXISTS "mes" INTEGER NOT NULL DEFAULT 1;

-- Backfill mes from fecha_aprobacion or creado_en if present
UPDATE "public"."prefacturas"
SET "mes" = EXTRACT(MONTH FROM COALESCE("fecha_aprobacion", "creado_en"))::INTEGER
WHERE "mes" = 1 AND ("fecha_aprobacion" IS NOT NULL OR "creado_en" IS NOT NULL);

CREATE INDEX IF NOT EXISTS "prefacturas_mes_idx" ON "public"."prefacturas"("mes");

-- Ensure unique constraint includes mes
ALTER TABLE "public"."prefacturas" DROP CONSTRAINT IF EXISTS "prefacturas_contrato_id_periodo_id_key";
ALTER TABLE "public"."prefacturas" DROP CONSTRAINT IF EXISTS "uk_prefacturas_contrato_periodo_mes";
ALTER TABLE "public"."prefacturas" ADD CONSTRAINT "uk_prefacturas_contrato_periodo_mes" UNIQUE ("contrato_id", "periodo_id", "mes");
