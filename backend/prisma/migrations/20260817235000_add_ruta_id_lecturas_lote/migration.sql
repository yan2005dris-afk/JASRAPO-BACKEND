-- Migration: Add ruta_id to lecturas and lote
-- Created: 2026-08-17
--
-- Changes:
--   1. Reintroduce el vínculo lectura <-> ruta (se eliminó en 20260521203051)
--   2. Agrega ruta_id a lote para trazabilidad de la planilla
--   3. Backfill de lecturas existentes hacia la ruta de TOMA_LECTURA COMPLETADA
--      que coincida por comunidad + periodo + mes de la fecha planificada
--   4. inicializar_lecturas_ruta ahora acepta p_ruta_id y lo asigna a las
--      lecturas creadas
--   5. generar_prefacturas_lote ahora acepta p_ruta_id: valida el lote por ruta,
--      persiste ruta_id en lote y filtra las lecturas APROBADA por ruta
--      (ver 20260817230000_fix_sp_mes_y_descripcion_detalle para el body completo
--      de generar_prefacturas_lote)

-- 1. lecturas.ruta_id
ALTER TABLE "lecturas" ADD COLUMN "ruta_id" BIGINT;
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("ruta_id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "lecturas_ruta_id_idx" ON "lecturas"("ruta_id");

-- 2. lote.ruta_id
ALTER TABLE "lote" ADD COLUMN "ruta_id" BIGINT;
ALTER TABLE "lote" ADD CONSTRAINT "lote_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("ruta_id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "lote_ruta_id_idx" ON "lote"("ruta_id");

-- 3. Backfill: asignar la ruta de TOMA_LECTURA COMPLETADA a lecturas existentes
--    que coincidan por periodo + mes de la fecha planificada + comunidad del contrato
UPDATE lecturas l
SET ruta_id = sub.ruta_id
FROM (
    SELECT r.ruta_id, r.comunidad_id, r.periodo_id, EXTRACT(MONTH FROM r.fecha_planificada)::int AS mes
    FROM rutas r
    WHERE r.tipo_ruta = 'TOMA_LECTURA'
      AND r.estado = 'COMPLETADA'
      AND r.periodo_id IS NOT NULL
      AND r.fecha_planificada IS NOT NULL
      AND r.borrado_en IS NULL
) sub
WHERE l.ruta_id IS NULL
  AND l.periodo_id = sub.periodo_id
  AND EXTRACT(MONTH FROM l.fecha) = sub.mes
  AND EXISTS (
    SELECT 1
    FROM medidores m
    JOIN historial_medidores hm ON hm.medidor_id = m.medidor_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
    JOIN contratos c ON c.contrato_id = hm.contrato_id
    WHERE m.medidor_id = l.medidor_id
      AND c.comunidad_id = sub.comunidad_id
      AND c.borrado_en IS NULL
  );

-- 4. inicializar_lecturas_ruta: acepta p_ruta_id y lo persiste en las lecturas
CREATE OR REPLACE FUNCTION public.inicializar_lecturas_ruta(
    p_comunidad_id INTEGER,
    p_periodo_id INTEGER,
    p_fecha_planificada TIMESTAMP,
    p_sector_id INTEGER DEFAULT NULL,
    p_ruta_id BIGINT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_start_of_month TIMESTAMP;
    v_end_of_month TIMESTAMP;
    v_target_fecha TIMESTAMP;
    v_inserted_count INTEGER := 0;
    r RECORD;
    v_lectura_anterior NUMERIC(10, 2);
    v_last_approved_actual NUMERIC(10, 2);
    v_es_inicial BOOLEAN;
BEGIN
    -- 1. Calcular rango de fechas para el mes planificado
    v_start_of_month := DATE_TRUNC('month', p_fecha_planificada);
    v_end_of_month := v_start_of_month + INTERVAL '1 month' - INTERVAL '1 millisecond';
    v_target_fecha := v_start_of_month + INTERVAL '14 days 12 hours'; -- Día 15 a las 12:00

    -- 2. Iterar contratos activos con medidores asignados en la comunidad/sector
    FOR r IN
        SELECT
            c.contrato_id,
            hm.medidor_id,
            hm.lectura_inicial_historial AS lectura_inicial
        FROM contratos c
        JOIN historial_medidores hm ON hm.contrato_id = c.contrato_id AND hm.fecha_hasta IS NULL
        JOIN medidores m ON m.medidor_id = hm.medidor_id
        WHERE c.comunidad_id = p_comunidad_id
          AND (p_sector_id IS NULL OR c.sector_id = p_sector_id)
          AND c.estado = 'ACTIVO'
          AND c.borrado_en IS NULL
          AND m.borrado_en IS NULL
    LOOP
        -- 3. Verificar si ya existe lectura en este período y mes
        IF NOT EXISTS (
            SELECT 1 FROM lecturas l
            WHERE l.medidor_id = r.medidor_id
              AND l.periodo_id = p_periodo_id
              AND l.fecha >= v_start_of_month
              AND l.fecha <= v_end_of_month
              AND l.borrado_en IS NULL
        ) THEN
            -- 4. Obtener la última lectura aprobada previa para arrastrar la lectura anterior
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

            -- 5. Insertar la lectura en PENDIENTE
            INSERT INTO lecturas (
                medidor_id,
                periodo_id,
                fecha,
                lectura_anterior,
                lectura_actual,
                consumo_calculado,
                estado,
                estado_asignacion,
                lectura_inicial,
                ruta_id,
                creado_en,
                actualizado_en
            ) VALUES (
                r.medidor_id,
                p_periodo_id,
                v_target_fecha,
                v_lectura_anterior,
                0,
                0,
                'PENDIENTE',
                'ASIGNADA',
                v_es_inicial,
                p_ruta_id,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );

            v_inserted_count := v_inserted_count + 1;
        END IF;
    END LOOP;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;