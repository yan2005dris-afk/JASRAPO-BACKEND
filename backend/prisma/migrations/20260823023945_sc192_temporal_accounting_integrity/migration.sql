-- ============================================================================
-- Migración SC-192: Integridad Temporal, Contable y Resolución de Anomalías
-- ============================================================================

-- 1. Crear Enum de Resolución Económica de Anomalías
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ResolucionEconomicaAnomalia') THEN
    CREATE TYPE "ResolucionEconomicaAnomalia" AS ENUM (
      'COBRO_REAL',
      'PROMEDIO_HISTORICO',
      'EXONERACION_PARCIAL',
      'EXONERACION_TOTAL',
      'AJUSTE_LECTURA'
    );
  END IF;
END $$;

-- 2. Extender tabla lectura_anomalia con campos de resolución económica
ALTER TABLE "lectura_anomalia"
  ADD COLUMN IF NOT EXISTS "resolucion_tipo" "ResolucionEconomicaAnomalia",
  ADD COLUMN IF NOT EXISTS "consumo_ajustado" DECIMAL(18, 2),
  ADD COLUMN IF NOT EXISTS "observacion_resolucion" TEXT,
  ADD COLUMN IF NOT EXISTS "resuelto_por_usuario_id" INTEGER,
  ADD COLUMN IF NOT EXISTS "resuelto_en" TIMESTAMP(3);

-- Clave foránea hacia usuarios (quién resolvió la anomalía)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lectura_anomalia_resuelto_por_usuario_id_fkey'
  ) THEN
    ALTER TABLE "lectura_anomalia"
      ADD CONSTRAINT "lectura_anomalia_resuelto_por_usuario_id_fkey"
      FOREIGN KEY ("resuelto_por_usuario_id")
      REFERENCES "usuarios"("usuario_id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3. Trigger de Inmutabilidad de Lecturas Físicas Aprobadas o Planilladas
CREATE OR REPLACE FUNCTION trg_prevent_immutable_reading_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la lectura ya está APROBADA o PLANILLADA, no permitir cambiar lectura_actual ni consumo_calculado
  IF (OLD.estado IN ('APROBADA', 'PLANILLADA')) THEN
    IF (OLD.lectura_actual IS DISTINCT FROM NEW.lectura_actual OR OLD.consumo_calculado IS DISTINCT FROM NEW.consumo_calculado) THEN
      RAISE EXCEPTION 'INVARIANTE VIOLADA: No se permite modificar lecturas físicas aprobadas o facturadas (Lectura ID: %). Requiere compensación contable o nota de crédito.', OLD.lectura_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_lectura_inmutabilidad ON "lecturas";
CREATE TRIGGER check_lectura_inmutabilidad
  BEFORE UPDATE ON "lecturas"
  FOR EACH ROW
  EXECUTE FUNCTION trg_prevent_immutable_reading_update();
