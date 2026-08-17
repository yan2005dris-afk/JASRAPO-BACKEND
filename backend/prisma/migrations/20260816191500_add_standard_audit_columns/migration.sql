-- Migration: Standardize audit columns across key transactional tables
-- Created: 2026-08-16

-- 1. historial_medidores
ALTER TABLE "public"."historial_medidores"
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "creado_por" TEXT,
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 2. periodos
ALTER TABLE "public"."periodos"
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "creado_por" TEXT,
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 3. lote
ALTER TABLE "public"."lote"
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 4. prefactura_detalle
ALTER TABLE "public"."prefactura_detalle"
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "creado_por" TEXT,
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 5. caja_sesion
ALTER TABLE "public"."caja_sesion"
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 6. caja_arqueo_detalle
ALTER TABLE "public"."caja_arqueo_detalle"
  ADD COLUMN IF NOT EXISTS "actualizado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "creado_por" TEXT,
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;

-- 7. descuento_detalle
ALTER TABLE "public"."descuento_detalle"
  ADD COLUMN IF NOT EXISTS "actualizado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "borrado_en" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "creado_por" TEXT,
  ADD COLUMN IF NOT EXISTS "actualizado_por" TEXT;
