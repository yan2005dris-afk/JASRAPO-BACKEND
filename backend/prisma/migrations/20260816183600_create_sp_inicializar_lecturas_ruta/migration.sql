-- Migration: Stored Procedure inicializar_lecturas_ruta
-- Created: 2026-08-16
-- Purpose: Inicializa masiva y atómicamente registros de lectura en estado PENDIENTE
--          para todos los contratos activos con medidores de una comunidad/sector,
--          arrastrando la última lectura aprobada (o lectura inicial).

CREATE OR REPLACE FUNCTION public.inicializar_lecturas_ruta(
    p_comunidad_id INTEGER,
    p_periodo_id INTEGER,
    p_fecha_planificada TIMESTAMP,
    p_sector_id INTEGER DEFAULT NULL
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
            hm.lectura_inicial_historial
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
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );

            v_inserted_count := v_inserted_count + 1;
        END IF;
    END LOOP;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;
