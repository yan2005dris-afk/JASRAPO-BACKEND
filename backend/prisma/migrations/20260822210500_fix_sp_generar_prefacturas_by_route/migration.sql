-- Actualizar Stored Procedure generar_prefacturas_lote para tomar lecturas vinculadas a la ruta de forma determinista
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
    v_excedente NUMERIC := 0;
    contrato_row RECORD;
    v_cargo_fijo NUMERIC := 0;
    v_precio_variable NUMERIC := 0;
    v_rubro_cargo_fijo_id INTEGER;
    v_rubro_consumo_id INTEGER;
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

    -- Variables de Reemplazo de Medidor
    v_reemplazos_count INTEGER := 0;
    v_ultimo_reemplazo_id BIGINT := NULL;
    v_consumo_facturable_saliente NUMERIC := 0;
    v_consumo_facturable_entrante NUMERIC := 0;
    v_consumo_fisico_entrante NUMERIC := 0;
    v_consumo_diferido_a_guardar NUMERIC := 0;
    v_consumo_diferido_a_cobrar NUMERIC := 0;
    v_tratamiento_entrante TEXT;
    v_prefactura_detalle_consumo_id BIGINT;

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

    -- IDs de Rubros Globales (Interés, Tasa Seguridad)
    v_rubro_interes INTEGER;
    v_rubro_tasa_seguridad INTEGER;

    -- Descuentos dinámicos desde catalogo_descuento
    v_descuento_tercera_valor NUMERIC;
    v_descuento_tercera_pct BOOLEAN;
    v_descuento_tercera_id INTEGER;
    v_descuento_disc_valor NUMERIC;
    v_descuento_disc_pct BOOLEAN;
    v_descuento_disc_id INTEGER;

    -- Tasa de interés mora desde parámetros
    v_tasa_interes NUMERIC := 0;

BEGIN
    -- 1. Resolver IDs de rubros de sistema (Interés, Tasa Seguridad)
    SELECT rubro_id INTO v_rubro_interes FROM rubros WHERE (codigo_sri = '003' OR codigo_sri = '007' OR nombre ILIKE '%Interés%') AND borrado_en IS NULL LIMIT 1;
    SELECT rubro_id INTO v_rubro_tasa_seguridad FROM rubros WHERE (codigo_sri = '004' OR codigo_sri = '008' OR nombre ILIKE '%Seguridad%') AND borrado_en IS NULL LIMIT 1;

    -- 2. Cachear tasas de impuestos y códigos SRI para rubros globales
    IF v_rubro_interes IS NOT NULL THEN
        SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
        INTO v_iva_interes, v_cod_imp_interes, v_por_imp_interes
        FROM rubros r
        JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
        JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
        WHERE r.rubro_id = v_rubro_interes;
    END IF;

    IF v_rubro_tasa_seguridad IS NOT NULL THEN
        SELECT COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
        INTO v_iva_tasa_seguridad, v_cod_imp_seg, v_por_imp_seg
        FROM rubros r
        JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
        JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
        WHERE r.rubro_id = v_rubro_tasa_seguridad;
    END IF;

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
            c.categoria_tarifa_id, ct.nombre AS categoria_nombre, ct.consumo_minimo_mensual,
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
        -- Buscar lectura APROBADA determinista
        IF p_ruta_id IS NOT NULL THEN
            SELECT l.lectura_id, l.lectura_anterior, l.lectura_actual
            INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
            FROM ordenes_trabajo ot
            JOIN lecturas l ON l.lectura_id = ot.lectura_id
            WHERE ot.ruta_id = p_ruta_id
              AND ot.contrato_id = contrato_row.contrato_id
              AND l.periodo_id = p_periodo_id
              AND l.estado = 'APROBADA'::"EstadoLectura"
              AND ot.borrado_en IS NULL
              AND l.borrado_en IS NULL
            ORDER BY l.fecha DESC, l.lectura_id DESC
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
            ORDER BY l.fecha DESC, l.lectura_id DESC
            LIMIT 1;
        END IF;

        IF NOT FOUND OR v_lectura_id IS NULL THEN
            v_observaciones_lote := v_observaciones_lote || 'Contrato ' || contrato_row.contrato_id || ': Sin lectura APROBADA para periodo ' || p_periodo_id || ' mes ' || v_mes || E'\n';
            CONTINUE;
        END IF;

        -- 8.1 Obtener rubros de Cargo Fijo y Consumo Variable de la categoría del contrato
        v_cargo_fijo := 0;
        v_precio_variable := 0;
        v_rubro_cargo_fijo_id := NULL;
        v_rubro_consumo_id := NULL;

        SELECT r.rubro_id, r.precio_unitario, COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
        INTO v_rubro_cargo_fijo_id, v_cargo_fijo, v_iva_cargo_fijo, v_cod_imp_fijo, v_por_imp_fijo
        FROM rubros r
        JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
        JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
        WHERE r.categoria_tarifa_id = contrato_row.categoria_tarifa_id
          AND r.tipo_rubro = 'FIJO'::"TipoRubro"
          AND r.activo
          AND r.borrado_en IS NULL
        LIMIT 1;

        SELECT r.rubro_id, r.precio_unitario, COALESCE(cti.porcentaje, 0) / 100, ci.codigo, cti.codigo_porcentaje
        INTO v_rubro_consumo_id, v_precio_variable, v_iva_consumo, v_cod_imp_consumo, v_por_imp_consumo
        FROM rubros r
        JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
        JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
        WHERE r.categoria_tarifa_id = contrato_row.categoria_tarifa_id
          AND r.tipo_rubro = 'VARIABLE'::"TipoRubro"
          AND r.activo
          AND r.borrado_en IS NULL
        LIMIT 1;

        -- Validación estricta: La categoría debe tener configurados sus rubros obligatorios activos
        IF v_rubro_cargo_fijo_id IS NULL THEN
            RAISE EXCEPTION 'La categoría de tarifa "%" (ID %) asociada al contrato % no tiene configurado un rubro activo de Cargo Fijo (tipo FIJO). Configure los rubros de la categoría antes de facturar.',
                contrato_row.categoria_nombre, contrato_row.categoria_tarifa_id, contrato_row.contrato_id;
        END IF;

        IF v_rubro_consumo_id IS NULL THEN
            RAISE EXCEPTION 'La categoría de tarifa "%" (ID %) asociada al contrato % no tiene configurado un rubro activo de Consumo de Agua (tipo VARIABLE). Configure los rubros de la categoría antes de facturar.',
                contrato_row.categoria_nombre, contrato_row.categoria_tarifa_id, contrato_row.contrato_id;
        END IF;

        v_cargo_fijo := COALESCE(v_cargo_fijo, 0);
        v_precio_variable := COALESCE(v_precio_variable, 0);

        -- 8.2 Cálculo de Consumo y Excedente
        v_consumo := GREATEST(0, v_lectura_actual - v_lectura_anterior);
        v_excedente := GREATEST(0, v_consumo - COALESCE(contrato_row.consumo_minimo_mensual, 10));

        -- 8.3 Ajuste por Reemplazo de Medidor
        v_consumo_facturable_saliente := 0;
        v_consumo_facturable_entrante := 0;
        v_consumo_fisico_entrante := 0;
        v_consumo_diferido_a_guardar := 0;
        v_consumo_diferido_a_cobrar := 0;
        v_tratamiento_entrante := NULL;
        v_ultimo_reemplazo_id := NULL;

        SELECT
            COUNT(*),
            MAX(reemplazo_id),
            COALESCE(SUM(consumo_facturable_saliente), 0),
            COALESCE(SUM(consumo_facturable_entrante), 0),
            COALESCE(SUM(consumo_medido_entrante), 0),
            COALESCE(SUM(consumo_diferido_entrante), 0)
        INTO
            v_reemplazos_count,
            v_ultimo_reemplazo_id,
            v_consumo_facturable_saliente,
            v_consumo_facturable_entrante,
            v_consumo_fisico_entrante,
            v_consumo_diferido_a_guardar
        FROM reemplazos_medidor
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_origen_id = p_periodo_id
          AND mes_origen = v_mes
          AND estado = 'PENDIENTE'::"EstadoResolucionConsumo"
          AND borrado_en IS NULL;

        IF v_ultimo_reemplazo_id IS NOT NULL THEN
            SELECT tratamiento_entrante::TEXT
            INTO v_tratamiento_entrante
            FROM reemplazos_medidor
            WHERE reemplazo_id = v_ultimo_reemplazo_id;
        END IF;

        SELECT COALESCE(SUM(consumo_diferido_entrante), 0)
        INTO v_consumo_diferido_a_cobrar
        FROM reemplazos_medidor
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_destino_id = p_periodo_id
          AND mes_destino = v_mes
          AND estado = 'PENDIENTE'::"EstadoResolucionConsumo"
          AND borrado_en IS NULL;

        IF v_reemplazos_count > 0 THEN
            IF v_tratamiento_entrante = 'DIFERIR_SIGUIENTE_PERIODO' THEN
                v_consumo := GREATEST(0, v_consumo_facturable_saliente + (v_consumo - v_consumo_fisico_entrante) + v_consumo_diferido_a_cobrar);
            ELSE
                v_consumo := GREATEST(0, v_consumo_facturable_saliente + v_consumo_facturable_entrante + (v_consumo - v_consumo_fisico_entrante) + v_consumo_diferido_a_cobrar);
            END IF;
            v_excedente := GREATEST(0, v_consumo - COALESCE(contrato_row.consumo_minimo_mensual, 10));
        ELSIF v_consumo_diferido_a_cobrar > 0 THEN
            v_consumo := v_consumo + v_consumo_diferido_a_cobrar;
            v_excedente := GREATEST(0, v_consumo - COALESCE(contrato_row.consumo_minimo_mensual, 10));
        END IF;

        -- 8.4 Cálculo Financiero del Período
        v_tasa_seguridad := ROUND((v_cargo_fijo + (v_excedente * v_precio_variable)) * (v_porcentaje_tasa / 100), 2);

        -- Cálculo de Deuda Anterior e Intereses
        SELECT
            COALESCE(SUM(saldo_actual), 0),
            COALESCE(SUM(CASE WHEN fecha_aprobacion IS NOT NULL AND saldo_actual > 0 THEN saldo_actual ELSE 0 END), 0),
            COUNT(CASE WHEN fecha_aprobacion IS NOT NULL AND saldo_actual > 0 THEN 1 END)
        INTO v_deuda_anterior, v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado IN ('GENERADA'::"EstadoPrefactura", 'EN_REVISION'::"EstadoPrefactura", 'APROBADA'::"EstadoPrefactura")
          AND borrado_en IS NULL;

        IF v_saldo_vencido > 0 AND v_tasa_interes > 0 THEN
            v_interes_mora := ROUND((v_saldo_vencido * (v_tasa_interes / 100)), 2);
        ELSE
            v_interes_mora := 0;
        END IF;

        -- Descuentos dinámicos
        v_descuento := 0;
        IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_valor IS NOT NULL THEN
            IF v_descuento_tercera_pct THEN
                v_descuento := v_descuento + ROUND((v_cargo_fijo * (v_descuento_tercera_valor / 100)), 2);
            ELSE
                v_descuento := v_descuento + v_descuento_tercera_valor;
            END IF;
        END IF;

        IF contrato_row.aplica_discapacidad AND v_descuento_disc_valor IS NOT NULL THEN
            IF v_descuento_disc_pct THEN
                v_descuento := v_descuento + ROUND((v_cargo_fijo * (v_descuento_disc_valor / 100)), 2);
            ELSE
                v_descuento := v_descuento + v_descuento_disc_valor;
            END IF;
        END IF;

        -- Subtotal
        v_subtotal := v_cargo_fijo + (v_excedente * v_precio_variable) + v_tasa_seguridad + v_interes_mora - v_descuento;

        -- Cálculo dinámico de IVA
        v_iva_total := ((v_excedente * v_precio_variable) * v_iva_consumo) +
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
            contrato_row.categoria_nombre, v_cargo_fijo, v_precio_variable,
            v_lectura_id, v_mes, (v_tasa_interes * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING prefactura_id INTO v_prefactura_id;

        -- Insertar PrefacturaDetalle: Cargo Fijo
        IF v_rubro_cargo_fijo_id IS NOT NULL AND v_cargo_fijo > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_cargo_fijo_id, 'Cargo Fijo Mensual', 1, v_cargo_fijo, v_cargo_fijo, (v_cargo_fijo * v_iva_cargo_fijo), 0, (v_cargo_fijo * (1 + v_iva_cargo_fijo)), (v_iva_cargo_fijo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        -- Insertar PrefacturaDetalle: Consumo Excedente de Agua
        v_prefactura_detalle_consumo_id := NULL;
        IF v_rubro_consumo_id IS NOT NULL AND v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_consumo_id, 'Consumo Excedente Agua Potable', v_excedente, v_precio_variable, (v_excedente * v_precio_variable), ((v_excedente * v_precio_variable) * v_iva_consumo), 0, ((v_excedente * v_precio_variable) * (1 + v_iva_consumo)), (v_iva_consumo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING prefactura_detalle_id INTO v_prefactura_detalle_consumo_id;
        END IF;

        -- Insertar PrefacturaDetalle: Tasa Seguridad
        IF v_rubro_tasa_seguridad IS NOT NULL AND v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_tasa_seguridad, 'Tasa de Seguridad Ciudadana', 1, v_tasa_seguridad, v_tasa_seguridad, (v_tasa_seguridad * v_iva_tasa_seguridad), 0, (v_tasa_seguridad * (1 + v_iva_tasa_seguridad)), (v_iva_tasa_seguridad * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        -- Insertar PrefacturaDetalle: Interés por Mora
        IF v_rubro_interes IS NOT NULL AND v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_interes, 'Interés por Mora (' || v_meses_atrasado || ' meses atrasados)', 1, v_interes_mora, v_interes_mora, (v_interes_mora * v_iva_interes), 0, (v_interes_mora * (1 + v_iva_interes)), (v_iva_interes * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;

        -- 8.4 Actualizar reemplazos de medidor de origen
        IF v_reemplazos_count > 0 THEN
            UPDATE reemplazos_medidor
            SET prefactura_detalle_saliente_id = v_prefactura_detalle_consumo_id,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE contrato_id = contrato_row.contrato_id
              AND periodo_origen_id = p_periodo_id
              AND mes_origen = v_mes
              AND estado = 'PENDIENTE'::"EstadoResolucionConsumo"
              AND borrado_en IS NULL;
        END IF;

        -- 8.5 Actualizar resoluciones diferidas
        UPDATE reemplazos_medidor
        SET prefactura_detalle_entrante_id = v_prefactura_detalle_consumo_id,
            estado = 'APLICADA'::"EstadoResolucionConsumo",
            actualizado_en = CURRENT_TIMESTAMP
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_destino_id = p_periodo_id
          AND mes_destino = v_mes
          AND estado = 'PENDIENTE'::"EstadoResolucionConsumo"
          AND borrado_en IS NULL;

        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;

    -- 9. Finalizar Lote
    v_observaciones_lote := v_observaciones_lote || 'Finalizado: ' || CURRENT_TIMESTAMP || '. Prefacturas: ' || v_count || E'\n';
    UPDATE lote
    SET total_monto = v_total_lote_monto,
        total_emisiones = v_count,
        notas = v_observaciones_lote,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;

    RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;
