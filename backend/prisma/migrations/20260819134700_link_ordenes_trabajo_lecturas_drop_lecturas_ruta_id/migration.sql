-- 1. Agregar lectura_id a ordenes_trabajo (idempotent)
ALTER TABLE "ordenes_trabajo" ADD COLUMN IF NOT EXISTS "lectura_id" BIGINT;
CREATE INDEX IF NOT EXISTS "ordenes_trabajo_lectura_id_idx" ON "ordenes_trabajo"("lectura_id");
ALTER TABLE "ordenes_trabajo" DROP CONSTRAINT IF EXISTS "ordenes_trabajo_lectura_id_fkey";
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 1.1 Lossless backfill: Asegurar que toda lectura con ruta_id tenga su orden_trabajo creada y enlazada
INSERT INTO "ordenes_trabajo" ("ruta_id", "contrato_id", "medidor_id", "lectura_id", "tipo_actividad", "estado", "orden_visita", "creado_en", "actualizado_en")
SELECT DISTINCT
    l.ruta_id,
    c.contrato_id,
    l.medidor_id,
    l.lectura_id,
    'LECTURA'::"TipoActividadOrden",
    CASE WHEN l.estado = 'APROBADA' THEN 'COMPLETADA'::"EstadoOrdenTrabajo" ELSE 'PENDIENTE'::"EstadoOrdenTrabajo" END,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM lecturas l
JOIN historial_medidores hm ON hm.medidor_id = l.medidor_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
JOIN contratos c ON c.contrato_id = hm.contrato_id AND c.borrado_en IS NULL
WHERE l.ruta_id IS NOT NULL
  AND l.borrado_en IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM ordenes_trabajo ot
      WHERE ot.ruta_id = l.ruta_id
        AND ot.lectura_id = l.lectura_id
  );

-- Actualizar lectura_id en ordenes_trabajo existentes que coincidían por ruta_id y contrato_id pero tenían lectura_id null
UPDATE ordenes_trabajo ot
SET lectura_id = l.lectura_id
FROM lecturas l
JOIN historial_medidores hm ON hm.medidor_id = l.medidor_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
WHERE ot.ruta_id = l.ruta_id
  AND ot.contrato_id = hm.contrato_id
  AND ot.lectura_id IS NULL
  AND ot.tipo_actividad = 'LECTURA'
  AND l.borrado_en IS NULL;

-- 2. Eliminar foreign key, index y columna ruta_id de lecturas (idempotent)
ALTER TABLE "lecturas" DROP CONSTRAINT IF EXISTS "lecturas_ruta_id_fkey";
DROP INDEX IF EXISTS "lecturas_ruta_id_idx";
ALTER TABLE "lecturas" DROP COLUMN IF EXISTS "ruta_id";

-- 3. Actualizar Stored Procedure inicializar_lecturas_ruta
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

            -- Insertar la lectura en PENDIENTE
            INSERT INTO lecturas (
                medidor_id,
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
                WHERE ot.ruta_id = p_ruta_id
                  AND ot.contrato_id = r.contrato_id
                  AND ot.tipo_actividad = 'LECTURA'
                  AND ot.borrado_en IS NULL
            ) THEN
                INSERT INTO ordenes_trabajo (
                    ruta_id,
                    contrato_id,
                    medidor_id,
                    lectura_id,
                    tipo_actividad,
                    estado,
                    orden_visita,
                    creado_en,
                    actualizado_en
                ) VALUES (
                    p_ruta_id,
                    r.contrato_id,
                    r.medidor_id,
                    v_new_lectura_id,
                    'LECTURA',
                    'PENDIENTE',
                    v_orden_visita,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
            ELSE
                -- Si la orden de trabajo ya existía pero no tenía lectura_id, enlazarla
                UPDATE ordenes_trabajo
                SET lectura_id = v_new_lectura_id,
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE ruta_id = p_ruta_id
                  AND contrato_id = r.contrato_id
                  AND tipo_actividad = 'LECTURA'
                  AND lectura_id IS NULL;
            END IF;
        END IF;
    END LOOP;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar Stored Procedure generar_prefacturas_lote para buscar lecturas a través de ordenes_trabajo
CREATE OR REPLACE FUNCTION public.generar_prefacturas_lote(
    p_periodo_id INTEGER,
    p_comunidad_id INTEGER DEFAULT NULL,
    p_creado_por TEXT DEFAULT 'SYSTEM',
    p_mes INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    p_ruta_id BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    v_lote_id BIGINT;
    v_lectura_id BIGINT;
    v_lectura_anterior NUMERIC;
    v_lectura_actual NUMERIC;
    v_consumo NUMERIC;
    contrato_row RECORD;
    v_consumo_minimo INTEGER;
    v_excedente NUMERIC;
    v_cargo_fijo NUMERIC;
    v_excedente_valor NUMERIC;
    v_subtotal NUMERIC;
    v_tasa_seguridad NUMERIC := 0;
    v_porcentaje_tasa NUMERIC := 0;
    v_deuda_anterior NUMERIC := 0;
    v_saldo_vencido NUMERIC := 0;
    v_meses_atrasado INTEGER := 0;
    v_interes_mora NUMERIC := 0;
    v_descuento NUMERIC := 0;
    v_iva_total NUMERIC := 0;
    v_total_pagar_periodo NUMERIC := 0;
    v_prefactura_id BIGINT;
    v_count INTEGER := 0;
    v_total_lote_monto NUMERIC := 0;
    v_observaciones_lote TEXT := 'Iniciado: ' || CURRENT_TIMESTAMP || E'\n';
    v_mes INTEGER := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);

    -- Tasas de impuestos dinámicas para el cálculo
    v_iva_consumo NUMERIC := 0;
    v_iva_cargo_fijo NUMERIC := 0;
    v_iva_interes NUMERIC := 0;
    v_iva_tasa_seguridad NUMERIC := 0;

    -- Códigos SRI para los detalles
    v_cod_imp_consumo TEXT; v_por_imp_consumo TEXT;
    v_cod_imp_fijo TEXT; v_por_imp_fijo TEXT;
    v_cod_imp_interes TEXT; v_por_imp_interes TEXT;
    v_cod_imp_seg TEXT; v_por_imp_seg TEXT;

    -- IDs de Rubros (resueltos dinámicamente por codigo_sri)
    v_rubro_consumo INTEGER;
    v_rubro_cargo_fijo INTEGER;
    v_rubro_interes INTEGER;
    v_rubro_tasa_seguridad INTEGER;

    -- Descuentos dinámicos desde catalogo_descuento
    v_descuento_tercera_valor NUMERIC;
    v_descuento_tercera_pct BOOLEAN;
    v_descuento_tercera_id INTEGER;
    v_descuento_disc_valor NUMERIC;
    v_descuento_disc_pct BOOLEAN;
    v_descuento_disc_id INTEGER;
    v_prefactura_detalle_id BIGINT;

    -- Tasa de interés mora desde parámetros
    v_tasa_interes NUMERIC := 0;

BEGIN
    -- 1. Resolver IDs de rubros dinámicamente por codigo_sri
    SELECT rubro_id INTO v_rubro_consumo FROM rubros WHERE codigo_sri = '001' AND borrado_en IS NULL;
    SELECT rubro_id INTO v_rubro_cargo_fijo FROM rubros WHERE codigo_sri = '002' AND borrado_en IS NULL;
    SELECT rubro_id INTO v_rubro_interes FROM rubros WHERE codigo_sri = '003' AND borrado_en IS NULL;
    SELECT rubro_id INTO v_rubro_tasa_seguridad FROM rubros WHERE codigo_sri = '004' AND borrado_en IS NULL;

    IF v_rubro_consumo IS NULL OR v_rubro_cargo_fijo IS NULL OR v_rubro_interes IS NULL OR v_rubro_tasa_seguridad IS NULL THEN
        RAISE EXCEPTION 'Rubros requeridos no encontrados. Verifique que existan rubros con codigo_sri 001, 002, 003, 004';
    END IF;

    -- 2. Cachear tasas de impuestos y códigos SRI
    SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
    INTO v_iva_consumo, v_cod_imp_consumo, v_por_imp_consumo
    FROM rubros r
    JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
    JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
    WHERE r.codigo_sri = '001'
      AND cti.activo
      AND (cti.vigente_desde IS NULL OR cti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (cti.vigente_hasta IS NULL OR cti.vigente_hasta >= CURRENT_TIMESTAMP);

    SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
    INTO v_iva_cargo_fijo, v_cod_imp_fijo, v_por_imp_fijo
    FROM rubros r
    JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
    JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
    WHERE r.codigo_sri = '002'
      AND cti.activo
      AND (cti.vigente_desde IS NULL OR cti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (cti.vigente_hasta IS NULL OR cti.vigente_hasta >= CURRENT_TIMESTAMP);

    SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
    INTO v_iva_interes, v_cod_imp_interes, v_por_imp_interes
    FROM rubros r
    JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
    JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
    WHERE r.codigo_sri = '003'
      AND cti.activo
      AND (cti.vigente_desde IS NULL OR cti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (cti.vigente_hasta IS NULL OR cti.vigente_hasta >= CURRENT_TIMESTAMP);

    SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
    INTO v_iva_tasa_seguridad, v_cod_imp_seg, v_por_imp_seg
    FROM rubros r
    JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
    JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
    WHERE r.codigo_sri = '004'
      AND cti.activo
      AND (cti.vigente_desde IS NULL OR cti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (cti.vigente_hasta IS NULL OR cti.vigente_hasta >= CURRENT_TIMESTAMP);

    -- 3. Cachear descuentos automáticos desde catalogo_descuento
    SELECT cd.valor, cd.es_porcentaje, cd.catalogo_descuento_id
    INTO v_descuento_tercera_valor, v_descuento_tercera_pct, v_descuento_tercera_id
    FROM catalogo_descuento cd
    WHERE cd.tipo_descuento = 'TERCERA_EDAD' AND cd.activo AND cd.aplica_automatico
    LIMIT 1;

    SELECT cd.valor, cd.es_porcentaje, cd.catalogo_descuento_id
    INTO v_descuento_disc_valor, v_descuento_disc_pct, v_descuento_disc_id
    FROM catalogo_descuento cd
    WHERE cd.tipo_descuento = 'DISCAPACIDAD' AND cd.activo AND cd.aplica_automatico
    LIMIT 1;

    -- 4. Cachear tasa de interés mora desde parametro_tasa_interes
    SELECT COALESCE(pti.tasa, 0)
    INTO v_tasa_interes
    FROM parametro_tasa_interes pti
    WHERE pti.activo
      AND (pti.vigente_desde IS NULL OR pti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (pti.vigente_hasta IS NULL OR pti.vigente_hasta >= CURRENT_TIMESTAMP)
    ORDER BY pti.vigente_desde DESC NULLS LAST
    LIMIT 1;

    -- 5. Validar que no exista lote previo
    IF EXISTS (
        SELECT 1 FROM lote
        WHERE periodo_id = p_periodo_id
          AND mes = v_mes
          AND (p_ruta_id IS NULL OR ruta_id = p_ruta_id)
          AND (p_comunidad_id IS NULL OR comunidad_id = p_comunidad_id)
          AND borrado_en IS NULL
    ) THEN
        RAISE EXCEPTION 'Ya existe un lote para este período, mes, ruta y comunidad';
    END IF;

    -- 6. Crear el lote
    INSERT INTO lote (comunidad_id, periodo_id, mes, ruta_id, estado, total_monto, total_emisiones, notas, creado_por, actualizado_en, creado_en)
    VALUES (
        COALESCE(p_comunidad_id, 1),
        p_periodo_id,
        v_mes,
        p_ruta_id,
        'BORRADOR'::"EstadoLote",
        0,
        0,
        'Generando...',
        p_creado_por,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING lote_id INTO v_lote_id;

    -- 7. Obtener porcentaje de tasa de seguridad de la comunidad
    SELECT COALESCE(c.porcentaje_tasa_seguridad, 0)
    INTO v_porcentaje_tasa
    FROM comunidades c
    WHERE c.comunidad_id = COALESCE(p_comunidad_id, c.comunidad_id)
    LIMIT 1;

    -- 8. Procesar contratos activos
    FOR contrato_row IN
        SELECT
            c.contrato_id, c.cliente_id, c.numero_guia, c.direccion_suministro,
            ct.valor_base, ct.consumo_minimo_mensual, ct.valor_excedente_m3,
            cl.aplica_tercera_edad, cl.aplica_discapacidad,
            (cl.nombres || ' ' || cl.apellidos) AS cliente_nombre,
            cl.identificacion AS cliente_identificacion, cl.email
        FROM contratos c
        JOIN categoria_tarifa ct ON c.categoria_tarifa_id = ct.categoria_tarifa_id
        JOIN clientes cl ON c.cliente_id = cl.cliente_id
        WHERE c.estado = 'ACTIVO'::"EstadoContrato"
          AND c.borrado_en IS NULL
          AND cl.borrado_en IS NULL
          AND ct.activo
          AND (ct.fecha_vigencia_desde IS NULL OR ct.fecha_vigencia_desde <= CURRENT_DATE)
          AND (ct.fecha_vigencia_hasta IS NULL OR ct.fecha_vigencia_hasta >= CURRENT_DATE)
          AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
    LOOP
        -- Buscar lectura APROBADA (directa o a través de ordenes_trabajo de la ruta si se especificó p_ruta_id)
        IF p_ruta_id IS NOT NULL THEN
            SELECT l.lectura_id, l.lectura_anterior, l.lectura_actual
            INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
            FROM ordenes_trabajo ot
            JOIN lecturas l ON l.lectura_id = ot.lectura_id
            WHERE ot.ruta_id = p_ruta_id
              AND ot.contrato_id = contrato_row.contrato_id
              AND l.periodo_id = p_periodo_id
              AND EXTRACT(MONTH FROM l.fecha) = v_mes
              AND l.estado = 'APROBADA'::"EstadoLectura"
              AND ot.borrado_en IS NULL
              AND l.borrado_en IS NULL
            LIMIT 1;
        ELSE
            SELECT l.lectura_id, l.lectura_anterior, l.lectura_actual
            INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
            FROM lecturas l
            JOIN historial_medidores hm ON l.medidor_id = hm.medidor_id AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
            WHERE hm.contrato_id = contrato_row.contrato_id
              AND l.periodo_id = p_periodo_id
              AND EXTRACT(MONTH FROM l.fecha) = v_mes
              AND l.estado = 'APROBADA'::"EstadoLectura"
              AND l.borrado_en IS NULL
            LIMIT 1;
        END IF;

        IF NOT FOUND OR v_lectura_id IS NULL THEN
            v_observaciones_lote := v_observaciones_lote || 'Contrato ' || contrato_row.contrato_id || ': Sin lectura APROBADA para periodo ' || p_periodo_id || ' mes ' || v_mes || E'\n';
            CONTINUE;
        END IF;

        -- Cálculos de consumo y excedente
        v_consumo := v_lectura_actual - v_lectura_anterior;
        v_excedente := GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual) * contrato_row.valor_excedente_m3;
        v_cargo_fijo := contrato_row.valor_base;

        -- Tasa de Seguridad
        IF v_porcentaje_tasa > 0 THEN
            v_tasa_seguridad := (v_cargo_fijo + v_excedente) * (v_porcentaje_tasa / 100);
        ELSE
            v_tasa_seguridad := 0;
        END IF;

        -- Seguimiento de Deuda (períodos/meses anteriores)
        SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
        INTO v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND (periodo_id < p_periodo_id OR (periodo_id = p_periodo_id AND mes < v_mes))
          AND borrado_en IS NULL;

        SELECT COALESCE(total_pagar - abono, 0)
        INTO v_deuda_anterior
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND (periodo_id < p_periodo_id OR (periodo_id = p_periodo_id AND mes < v_mes))
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND borrado_en IS NULL
        ORDER BY periodo_id DESC, mes DESC
        LIMIT 1;

        IF v_deuda_anterior IS NULL THEN
            v_deuda_anterior := 0;
        END IF;

        -- Interés por Mora
        IF v_meses_atrasado > 0 AND v_saldo_vencido > 0 AND v_tasa_interes > 0 THEN
            v_interes_mora := v_saldo_vencido * v_tasa_interes * v_meses_atrasado;
        ELSE
            v_interes_mora := 0;
        END IF;

        -- Descuento Tercera Edad / Discapacidad
        v_descuento := 0;
        IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_valor IS NOT NULL THEN
            IF v_descuento_tercera_pct THEN
                v_descuento := v_descuento + (v_cargo_fijo * (v_descuento_tercera_valor / 100));
            ELSE
                v_descuento := v_descuento + v_descuento_tercera_valor;
            END IF;
        END IF;

        IF contrato_row.aplica_discapacidad AND v_descuento_disc_valor IS NOT NULL THEN
            IF v_descuento_disc_pct THEN
                v_descuento := v_descuento + (v_cargo_fijo * (v_descuento_disc_valor / 100));
            ELSE
                v_descuento := v_descuento + v_descuento_disc_valor;
            END IF;
        END IF;

        -- Subtotal
        v_subtotal := v_cargo_fijo + v_excedente + v_tasa_seguridad + v_interes_mora - v_descuento;

        -- Cálculo dinámico de IVA
        v_iva_total := (v_excedente * v_iva_consumo) +
                       (v_cargo_fijo * v_iva_cargo_fijo) +
                       (v_interes_mora * v_iva_interes) +
                       (v_tasa_seguridad * v_iva_tasa_seguridad);

        -- Total Período
        v_total_pagar_periodo := v_subtotal + v_iva_total;

        -- Insertar prefactura
        INSERT INTO prefacturas (
            contrato_id, lote_id, periodo_id, punto_emision_id,
            lectura_anterior, lectura_actual, consumo_m3,
            subtotal, iva, descuento_total, total_pagar,
            deuda_anterior, saldo_vencido, abono, saldo_actual,
            meses_atrasado, estado, creado_por, interes_mora,
            cliente_direccion, cliente_email, cliente_identificacion, cliente_nombre,
            tarifa_nombre, tarifa_valor_base, tarifa_valor_excedente,
            lectura_id, mes, tasa_interes_usada, creado_en, actualizado_en
        ) VALUES (
            contrato_row.contrato_id, v_lote_id, p_periodo_id, 1,
            v_lectura_anterior, v_lectura_actual, v_consumo,
            v_subtotal, v_iva_total, v_descuento, v_total_pagar_periodo,
            v_deuda_anterior, v_saldo_vencido, 0, (v_total_pagar_periodo + v_saldo_vencido),
            v_meses_atrasado, 'GENERADA'::"EstadoPrefactura", p_creado_por, v_interes_mora,
            contrato_row.direccion_suministro, contrato_row.email, contrato_row.cliente_identificacion, contrato_row.cliente_nombre,
            'Tarifa Agua', contrato_row.valor_base, contrato_row.valor_excedente_m3,
            v_lectura_id, v_mes, (v_tasa_interes * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING prefactura_id INTO v_prefactura_id;

        -- Insertar PrefacturaDetalle: Cargo Fijo
        INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
        VALUES (v_prefactura_id, v_rubro_cargo_fijo, 'Cargo Fijo Mensual', 1, v_cargo_fijo, v_cargo_fijo, (v_cargo_fijo * v_iva_cargo_fijo), 0, (v_cargo_fijo * (1 + v_iva_cargo_fijo)), (v_iva_cargo_fijo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

        -- Insertar PrefacturaDetalle: Consumo Excedente (si existe)
        IF v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_consumo, 'Consumo Excedente Agua Potable', (v_consumo - contrato_row.consumo_minimo_mensual), contrato_row.valor_excedente_m3, v_excedente, (v_excedente * v_iva_consumo), 0, (v_excedente * (1 + v_iva_consumo)), (v_iva_consumo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        -- Insertar PrefacturaDetalle: Tasa Seguridad (si existe)
        IF v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_tasa_seguridad, 'Tasa de Seguridad Ciudadana', 1, v_tasa_seguridad, v_tasa_seguridad, (v_tasa_seguridad * v_iva_tasa_seguridad), 0, (v_tasa_seguridad * (1 + v_iva_tasa_seguridad)), (v_iva_tasa_seguridad * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        -- Insertar PrefacturaDetalle: Interés por Mora (si existe)
        IF v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_interes, 'Interés por Mora (' || v_meses_atrasado || ' meses atrasados)', 1, v_interes_mora, v_interes_mora, (v_interes_mora * v_iva_interes), 0, (v_interes_mora * (1 + v_iva_interes)), (v_iva_interes * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;

    -- 9. Actualizar Lote
    UPDATE lote
    SET total_monto = v_total_lote_monto,
        total_emisiones = v_count,
        notas = v_observaciones_lote || 'Completado: ' || CURRENT_TIMESTAMP || ' Total emisiones: ' || v_count || ' Total monto: $' || v_total_lote_monto,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;

    RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;
