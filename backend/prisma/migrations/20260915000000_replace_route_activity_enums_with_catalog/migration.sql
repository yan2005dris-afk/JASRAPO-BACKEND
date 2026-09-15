-- Atomic migration: route-owned activity catalog replaces persisted route/order enums.
CREATE TABLE "activity_types" (
  "activity_type_id" BIGSERIAL NOT NULL,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "activity_types_pkey" PRIMARY KEY ("activity_type_id")
);
CREATE UNIQUE INDEX "activity_types_codigo_key" ON "activity_types"("codigo");
CREATE INDEX "activity_types_activo_idx" ON "activity_types"("activo");

INSERT INTO "activity_types" ("codigo", "nombre") VALUES
  ('LECTURA', 'Lectura'),
  ('INSPECCION', 'Inspección'),
  ('INSTALACION', 'Instalación'),
  ('CORTE', 'Corte'),
  ('RECONEXION', 'Reconexión');

ALTER TABLE "rutas" ADD COLUMN "activity_type_id" BIGINT;
UPDATE "rutas" SET "activity_type_id" = at."activity_type_id"
FROM "activity_types" at
WHERE at."codigo" = CASE "tipo_ruta"::text WHEN 'TOMA_LECTURA' THEN 'LECTURA' ELSE "tipo_ruta"::text END;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "rutas" WHERE "activity_type_id" IS NULL) THEN
    RAISE EXCEPTION 'Every route must resolve to an activity type';
  END IF;
END $$;
ALTER TABLE "rutas" ALTER COLUMN "activity_type_id" SET NOT NULL;
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_activity_type_id_fkey" FOREIGN KEY ("activity_type_id") REFERENCES "activity_types"("activity_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "rutas_activity_type_id_idx" ON "rutas"("activity_type_id");

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "ordenes_trabajo" ot LEFT JOIN "rutas" r ON r."ruta_id" = ot."ruta_id" WHERE r."activity_type_id" IS NULL) THEN
    RAISE EXCEPTION 'Every work order must resolve through its route activity type';
  END IF;
END $$;
DROP INDEX IF EXISTS "ordenes_trabajo_tipo_actividad_idx";
ALTER TABLE "ordenes_trabajo" DROP COLUMN "tipo_actividad";
DROP INDEX IF EXISTS "rutas_tipo_ruta_idx";
ALTER TABLE "rutas" DROP COLUMN "tipo_ruta";
DROP TYPE IF EXISTS "TipoActividadOrden";
DROP TYPE IF EXISTS "TipoRuta";

CREATE OR REPLACE FUNCTION public.inicializar_lecturas_ruta(
  p_comunidad_id INTEGER, p_periodo_id INTEGER, p_fecha_planificada TIMESTAMP,
  p_sector_id INTEGER DEFAULT NULL, p_ruta_id BIGINT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_start_of_month TIMESTAMP; v_end_of_month TIMESTAMP; v_target_fecha TIMESTAMP;
  v_inserted_count INTEGER := 0; v_orden_visita INTEGER := 0; r RECORD;
  v_lectura_anterior NUMERIC(10, 2); v_last_approved_actual NUMERIC(10, 2); v_es_inicial BOOLEAN;
BEGIN
  v_start_of_month := DATE_TRUNC('month', p_fecha_planificada);
  v_end_of_month := v_start_of_month + INTERVAL '1 month' - INTERVAL '1 millisecond';
  v_target_fecha := v_start_of_month + INTERVAL '14 days 12 hours';
  FOR r IN SELECT c.contrato_id, hm.medidor_id, hm.lectura_inicial_historial AS lectura_inicial
    FROM contratos c JOIN historial_medidores hm ON hm.contrato_id = c.contrato_id AND hm.fecha_hasta IS NULL
    JOIN medidores m ON m.medidor_id = hm.medidor_id
    WHERE c.comunidad_id = p_comunidad_id AND (p_sector_id IS NULL OR c.sector_id = p_sector_id)
      AND c.estado = 'ACTIVO' AND c.borrado_en IS NULL AND m.borrado_en IS NULL
    ORDER BY c.contrato_id ASC LOOP
    v_orden_visita := v_orden_visita + 1;
    IF p_ruta_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM ordenes_trabajo ot JOIN rutas rt ON rt.ruta_id = ot.ruta_id
      JOIN activity_types at ON at.activity_type_id = rt.activity_type_id
      WHERE ot.ruta_id = p_ruta_id AND ot.contrato_id = r.contrato_id AND at.codigo = 'LECTURA' AND ot.borrado_en IS NULL
    ) THEN
      INSERT INTO ordenes_trabajo (ruta_id, contrato_id, medidor_id, estado, orden_visita, creado_en, actualizado_en)
      VALUES (p_ruta_id, r.contrato_id, r.medidor_id, 'PENDIENTE', v_orden_visita, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM lecturas l WHERE l.medidor_id = r.medidor_id AND l.periodo_id = p_periodo_id
      AND l.fecha >= v_start_of_month AND l.fecha <= v_end_of_month AND l.borrado_en IS NULL) THEN
      SELECT l.lectura_actual INTO v_last_approved_actual FROM lecturas l WHERE l.medidor_id = r.medidor_id AND l.estado = 'APROBADA' AND l.borrado_en IS NULL ORDER BY l.fecha DESC LIMIT 1;
      IF v_last_approved_actual IS NOT NULL THEN v_lectura_anterior := v_last_approved_actual; v_es_inicial := FALSE;
      ELSE v_lectura_anterior := COALESCE(r.lectura_inicial, 0); v_es_inicial := TRUE; END IF;
      INSERT INTO lecturas (medidor_id, periodo_id, fecha, lectura_anterior, lectura_actual, consumo_calculado, estado, estado_asignacion, lectura_inicial, ruta_id, creado_en, actualizado_en)
      VALUES (r.medidor_id, p_periodo_id, v_target_fecha, v_lectura_anterior, 0, 0, 'PENDIENTE', 'ASIGNADA', v_es_inicial, p_ruta_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      v_inserted_count := v_inserted_count + 1;
    END IF;
  END LOOP;
  RETURN v_inserted_count;
END; $$ LANGUAGE plpgsql;
