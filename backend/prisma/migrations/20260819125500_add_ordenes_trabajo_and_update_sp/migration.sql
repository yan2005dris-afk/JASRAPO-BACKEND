-- CreateEnum
CREATE TYPE "TipoActividadOrden" AS ENUM ('INSTALACION', 'LECTURA', 'RECONEXION', 'INSPECCION');

-- CreateEnum
CREATE TYPE "EstadoOrdenTrabajo" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'FALLIDA');

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "orden_trabajo_id" BIGSERIAL NOT NULL,
    "ruta_id" BIGINT NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "medidor_id" BIGINT,
    "tipo_actividad" "TipoActividadOrden" NOT NULL DEFAULT 'LECTURA',
    "estado" "EstadoOrdenTrabajo" NOT NULL DEFAULT 'PENDIENTE',
    "orden_visita" INTEGER NOT NULL DEFAULT 0,
    "resultado_observacion" TEXT,
    "evidencia_foto_url" TEXT,
    "completado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("orden_trabajo_id")
);

-- CreateIndexes
CREATE INDEX "ordenes_trabajo_ruta_id_idx" ON "ordenes_trabajo"("ruta_id");
CREATE INDEX "ordenes_trabajo_contrato_id_idx" ON "ordenes_trabajo"("contrato_id");
CREATE INDEX "ordenes_trabajo_medidor_id_idx" ON "ordenes_trabajo"("medidor_id");
CREATE INDEX "ordenes_trabajo_estado_idx" ON "ordenes_trabajo"("estado");
CREATE INDEX "ordenes_trabajo_tipo_actividad_idx" ON "ordenes_trabajo"("tipo_actividad");

-- AddForeignKeys
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_ruta_id_fkey" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("ruta_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: poblar ordenes_trabajo existentes para las rutas actuales
INSERT INTO "ordenes_trabajo" ("ruta_id", "contrato_id", "medidor_id", "tipo_actividad", "estado", "creado_en", "actualizado_en")
SELECT DISTINCT 
    l.ruta_id, 
    c.contrato_id, 
    l.medidor_id, 
    'LECTURA'::"TipoActividadOrden", 
    CASE WHEN l.estado = 'APROBADA' THEN 'COMPLETADA'::"EstadoOrdenTrabajo" ELSE 'PENDIENTE'::"EstadoOrdenTrabajo" END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lecturas l
JOIN historial_medidores hm ON hm.medidor_id = l.medidor_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
JOIN contratos c ON c.contrato_id = hm.contrato_id AND c.borrado_en IS NULL
WHERE l.ruta_id IS NOT NULL AND l.borrado_en IS NULL;

-- Actualizar Stored Procedure inicializar_lecturas_ruta para sincronizar ordenes_trabajo
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
    v_orden_visita INTEGER := 0;
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
        ORDER BY c.contrato_id ASC
    LOOP
        v_orden_visita := v_orden_visita + 1;

        -- 3. Crear orden_trabajo si se proporcionó p_ruta_id y no existe para este contrato/ruta
        IF p_ruta_id IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM ordenes_trabajo ot
                WHERE ot.ruta_id = p_ruta_id
                  AND ot.contrato_id = r.contrato_id
                  AND ot.tipo_actividad = 'LECTURA'
                  AND ot.borrado_en IS NULL
            ) THEN
                INSERT INTO ordenes_trabajo (
                    ruta_id,
                    contrato_id,
                    medidor_id,
                    tipo_actividad,
                    estado,
                    orden_visita,
                    creado_en,
                    actualizado_en
                ) VALUES (
                    p_ruta_id,
                    r.contrato_id,
                    r.medidor_id,
                    'LECTURA',
                    'PENDIENTE',
                    v_orden_visita,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
            END IF;
        END IF;

        -- 4. Verificar si ya existe lectura en este período y mes
        IF NOT EXISTS (
            SELECT 1 FROM lecturas l
            WHERE l.medidor_id = r.medidor_id
              AND l.periodo_id = p_periodo_id
              AND l.fecha >= v_start_of_month
              AND l.fecha <= v_end_of_month
              AND l.borrado_en IS NULL
        ) THEN
            -- 5. Obtener la última lectura aprobada previa para arrastrar la lectura anterior
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

            -- 6. Insertar la lectura en PENDIENTE
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
