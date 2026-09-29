-- AlterTable: Add historial_medidor_id to lecturas
ALTER TABLE "lecturas" ADD COLUMN "historial_medidor_id" BIGINT;

-- Backfill: Vincular lecturas existentes con el historial_medidores correspondiente por medidor_id y fecha
UPDATE "lecturas" l
SET "historial_medidor_id" = hm."historial_id"
FROM "historial_medidores" hm
WHERE l."medidor_id" = hm."medidor_id"
  AND l."fecha" >= hm."fecha_desde"
  AND (hm."fecha_hasta" IS NULL OR l."fecha" <= hm."fecha_hasta")
  AND hm."borrado_en" IS NULL
  AND l."historial_medidor_id" IS NULL;

-- Fallback backfill: Para cualquier lectura previa que coincida con el historial activo del medidor
UPDATE "lecturas" l
SET "historial_medidor_id" = hm."historial_id"
FROM "historial_medidores" hm
WHERE l."medidor_id" = hm."medidor_id"
  AND hm."fecha_hasta" IS NULL
  AND hm."borrado_en" IS NULL
  AND l."historial_medidor_id" IS NULL;

-- CreateIndex
CREATE INDEX "lecturas_historial_medidor_id_idx" ON "lecturas"("historial_medidor_id");

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_historial_medidor_id_fkey" FOREIGN KEY ("historial_medidor_id") REFERENCES "historial_medidores"("historial_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update Stored Procedure inicializar_lecturas_ruta to populate historial_medidor_id
CREATE OR REPLACE FUNCTION public.inicializar_lecturas_ruta(
  p_comunidad_id INTEGER,
  p_periodo_id INTEGER,
  p_fecha_planificada TIMESTAMP,
  p_sector_id INTEGER DEFAULT NULL,
  p_ruta_id BIGINT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_start_of_month TIMESTAMP;
  v_end_of_month TIMESTAMP;
  v_target_fecha TIMESTAMP;
  v_inserted_count INTEGER := 0;
  v_orden_visita INTEGER := 0;
  r RECORD;
  v_lectura_anterior NUMERIC(10, 2);
  v_last_approved_actual NUMERIC(10, 2);
  v_es_inicial BOOLEAN;
  v_new_lectura_id BIGINT;
BEGIN
  -- 1. Calcular rango de fechas para el mes planificado
  v_start_of_month := DATE_TRUNC('month', p_fecha_planificada);
  v_end_of_month := v_start_of_month + INTERVAL '1 month' - INTERVAL '1 millisecond';
  v_target_fecha := v_start_of_month + INTERVAL '14 days 12 hours'; -- Día 15 a las 12:00

  -- 2. Iterar contratos activos con medidores asignados en la comunidad/sector
  FOR r IN
    SELECT
      c.contrato_id,
      hm.historial_id,
      hm.medidor_id,
      hm.lectura_inicial_historial AS lectura_inicial
    FROM contratos c
    JOIN historial_medidores hm ON hm.contrato_id = c.contrato_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
    JOIN medidores m ON m.medidor_id = hm.medidor_id AND m.borrado_en IS NULL
    WHERE c.comunidad_id = p_comunidad_id
      AND (p_sector_id IS NULL OR c.sector_id = p_sector_id)
      AND c.estado_servicio = 'ACTIVO'
      AND c.borrado_en IS NULL
    ORDER BY c.contrato_id ASC
  LOOP
    v_orden_visita := v_orden_visita + 1;
    v_new_lectura_id := NULL;

    -- 3. Verificar si ya existe lectura en este período y mes
    SELECT l.lectura_id INTO v_new_lectura_id
    FROM lecturas l
    WHERE l.medidor_id = r.medidor_id
      AND l.periodo_id = p_periodo_id
      AND l.fecha >= v_start_of_month
      AND l.fecha <= v_end_of_month
      AND l.borrado_en IS NULL
    LIMIT 1;

    IF v_new_lectura_id IS NULL THEN
      -- Obtener la última lectura aprobada previa para arrastrar la lectura anterior
      SELECT l.lectura_actual
      INTO v_last_approved_actual
      FROM lecturas l
      WHERE l.medidor_id = r.medidor_id
        AND l.estado = 'APROBADA'
        AND l.borrado_en IS NULL
      ORDER BY l.fecha DESC
      LIMIT 1;

      IF v_last_approved_actual IS NOT NULL THEN
        v_lectura_anterior := v_last_approved_actual;
        v_es_inicial := FALSE;
      ELSE
        v_lectura_anterior := COALESCE(r.lectura_inicial, 0);
        v_es_inicial := TRUE;
      END IF;

      -- Insertar la lectura en PENDIENTE vinculada con historial_medidor_id
      INSERT INTO lecturas (
        medidor_id,
        historial_medidor_id,
        periodo_id,
        fecha,
        lectura_anterior,
        lectura_actual,
        consumo_calculado,
        estado,
        lectura_inicial,
        creado_en,
        actualizado_en
      ) VALUES (
        r.medidor_id,
        r.historial_id,
        p_periodo_id,
        v_target_fecha,
        v_lectura_anterior,
        0,
        0,
        'PENDIENTE',
        v_es_inicial,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING lectura_id INTO v_new_lectura_id;

      v_inserted_count := v_inserted_count + 1;
    END IF;

    -- 4. Crear orden_trabajo si se proporcionó p_ruta_id
    IF p_ruta_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM ordenes_trabajo ot
        JOIN rutas rt ON rt.ruta_id = ot.ruta_id
        JOIN tipos_actividad ta ON ta.tipo_actividad_id = rt.tipo_actividad_id
        WHERE ot.ruta_id = p_ruta_id
          AND ot.contrato_id = r.contrato_id
          AND ta.codigo = 'LECTURA'
          AND ot.borrado_en IS NULL
      ) THEN
        INSERT INTO ordenes_trabajo (
          ruta_id,
          contrato_id,
          medidor_id,
          lectura_id,
          estado,
          orden_visita,
          creado_en,
          actualizado_en
        ) VALUES (
          p_ruta_id,
          r.contrato_id,
          r.medidor_id,
          v_new_lectura_id,
          'PENDIENTE',
          v_orden_visita,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        );
      END IF;
    END IF;
  END LOOP;

  RETURN v_inserted_count;
END; $$ LANGUAGE plpgsql;
