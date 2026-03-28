-- ============================================================
-- SP: Generar Planillas Masivas - Motor de Reglas
-- Genera prefacturas y prefactura_detalle
-- Mantiene IDs estables al regenerar (UPDATE en vez de DELETE+INSERT)
-- ============================================================

CREATE OR REPLACE PROCEDURE public.sp_generar_planillas_masivas(
    p_comunidad_id integer, 
    p_anio integer, 
    p_mes integer, 
    p_usuario_id integer
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_lote_id bigint;
    v_lote_estado varchar(20);
    v_registro_contrato RECORD;
    v_periodo text := concat(p_anio, '-', lpad(p_mes::text, 2, '0'));
    v_consumo_m3 numeric;
    v_monto_base numeric := 0;
    v_monto_excedente numeric := 0;
    v_monto_agua numeric := 0;
    v_monto_tasa_seguridad numeric := 0;
    v_monto_interes_mora numeric := 0;
    v_monto_otros_cargos numeric := 0;
    v_monto_total numeric := 0;
    v_prefactura_id bigint;
    v_regla RECORD;
    v_porcentaje_tasa numeric;
    v_count integer;
    v_existe_prefactura boolean := false;
    v_fecha_vencimiento date;
    v_meses_atrasado integer := 0;
    v_deuda_anterior numeric := 0;
    v_saldo_vencido numeric := 0;
    v_consumo_base_m3 numeric := 0;
    v_consumo_excedente_m3 numeric := 0;
    v_limite_base_m3 numeric := 0;
BEGIN
    -- 1. Verificar si ya existe un lote para ese período
    SELECT lote_id, estado INTO v_lote_id, v_lote_estado
    FROM lote_facturacion 
    WHERE comunidad_id = p_comunidad_id AND anio = p_anio AND mes = p_mes;

    IF v_lote_id IS NOT NULL THEN
        IF v_lote_estado = 'DEFINITIVO' OR v_lote_estado = 'ENVIADO' THEN
            RAISE EXCEPTION 'El lote % esta en estado %. No se puede modificar.', v_lote_id, v_lote_estado;
        END IF;
        
        SELECT COUNT(*) INTO v_count FROM prefactura WHERE lote_id = v_lote_id;
        
        IF v_count > 0 THEN
            RAISE NOTICE 'El lote % regenerara % prefacturas.', v_lote_id, v_count;
        ELSE
            RAISE NOTICE 'El lote % creara nuevas prefacturas.', v_lote_id;
        END IF;
    ELSE
        INSERT INTO lote_facturacion (comunidad_id, anio, mes, periodo, estado, created_by, updated_at)
        VALUES (p_comunidad_id, p_anio, p_mes, v_periodo, 'BORRADOR', p_usuario_id, NOW())
        RETURNING lote_id INTO v_lote_id;
        RAISE NOTICE 'Nuevo lote % creado.', v_lote_id;
    END IF;

    SELECT COALESCE(porcentaje_tasa_seguridad, 0) INTO v_porcentaje_tasa
    FROM comunidades WHERE comunidad_id = p_comunidad_id;

    v_fecha_vencimiento := (p_anio::text || '-' || lpad((p_mes + 1)::text, 2, '0') || '-20')::date;
    IF p_mes = 12 THEN
        v_fecha_vencimiento := ((p_anio + 1)::text || '-01-20')::date;
    END IF;

    FOR v_registro_contrato IN 
        SELECT c.contrato_id, l.lectura_id, l.lectura_anterior, l.lectura_actual, l.consumo_calculado, c.categoria_tarifa_id
        FROM contratos c
        JOIN sectores s ON c.sector_id = s.sector_id
        JOIN comunidades com ON s.comunidad_id = com.comunidad_id
        JOIN lecturas l ON c.contrato_id = l.contrato_id
        WHERE com.comunidad_id = p_comunidad_id AND l.periodo = v_periodo AND c.estado = 'ACTIVO'
    LOOP
        v_consumo_m3 := COALESCE(v_registro_contrato.consumo_calculado, 0);
        v_monto_base := 0;
        v_monto_excedente := 0;
        v_monto_agua := 0;
        v_monto_interes_mora := 0;
        v_monto_otros_cargos := 0;

        -- MOTOR DE REGLAS: Calcular monto agua
        FOR v_regla IN
            SELECT ct.valor_base, ct.valor_excedente_m3, ct.limite_base_m3
            FROM categoria_tarifa ct
            WHERE ct.categoria_id = v_registro_contrato.categoria_tarifa_id
            AND ct.activo = true
            LIMIT 1
        LOOP
            v_limite_base_m3 := COALESCE(v_regla.limite_base_m3, 0);
            v_consumo_base_m3 := LEAST(v_consumo_m3, v_limite_base_m3);
            v_consumo_excedente_m3 := GREATEST(v_consumo_m3 - v_limite_base_m3, 0);
            
            v_monto_base := COALESCE(v_regla.valor_base, 0);
            v_monto_excedente := v_consumo_excedente_m3 * COALESCE(v_regla.valor_excedente_m3, 0);
        END LOOP;

        v_monto_agua := v_monto_base + v_monto_excedente;
        v_monto_tasa_seguridad := ROUND(v_monto_agua * (v_porcentaje_tasa / 100), 2);

        -- Calcular intereses mora
        SELECT COALESCE(COUNT(*), 0), COALESCE(SUM(saldo_vencido), 0)
        INTO v_meses_atrasado, v_saldo_vencido
        FROM prefactura 
        WHERE contrato_id = v_registro_contrato.contrato_id 
        AND estado_pago IN ('PENDIENTE', 'VENCIDO')
        AND periodo < v_periodo
        AND deleted_at IS NULL;

        IF v_saldo_vencido > 0 AND v_meses_atrasado > 0 THEN
            v_monto_interes_mora := ROUND(v_saldo_vencido * (v_consumo_base_m3 / 12) * v_meses_atrasado, 2);
        END IF;

        v_monto_total := v_monto_agua + v_monto_tasa_seguridad + v_monto_interes_mora + v_monto_otros_cargos;

        -- Verificar si ya existe prefactura
        SELECT COUNT(*), MAX(prefactura_id) INTO v_count, v_prefactura_id
        FROM prefactura 
        WHERE contrato_id = v_registro_contrato.contrato_id AND periodo = v_periodo AND lote_id = v_lote_id;

        v_existe_prefactura := (v_count > 0);

        IF v_existe_prefactura THEN
            UPDATE prefactura SET
                lectura_anterior = v_registro_contrato.lectura_anterior,
                lectura_actual = v_registro_contrato.lectura_actual,
                consumo_m3 = v_consumo_m3,
                monto_consumo_agua = v_monto_agua,
                monto_tasa_seguridad = v_monto_tasa_seguridad,
                monto_interes_mora = v_monto_interes_mora,
                monto_otros_cargos = v_monto_otros_cargos,
                monto_total = v_monto_total,
                meses_atrasado = v_meses_atrasado,
                deuda_anterior = v_deuda_anterior,
                saldo_vencido = v_saldo_vencido,
                fecha_vencimiento = v_fecha_vencimiento,
                saldo_actual = v_monto_total,
                updated_at = NOW()
            WHERE prefactura_id = v_prefactura_id;

            DELETE FROM prefactura_detalle WHERE prefactura_id = v_prefactura_id;
        ELSE
            INSERT INTO prefactura (
                contrato_id, periodo, lote_id,
                lectura_anterior, lectura_actual, consumo_m3,
                monto_consumo_agua, monto_tasa_seguridad, monto_interes_mora, monto_otros_cargos, monto_total, 
                meses_atrasado, deuda_anterior, saldo_vencido, fecha_vencimiento, abono, saldo_actual,
                estado_pago, estado_prefactura, created_at, updated_at
            )
            VALUES (
                v_registro_contrato.contrato_id, v_periodo, v_lote_id,
                v_registro_contrato.lectura_anterior, v_registro_contrato.lectura_actual, v_consumo_m3,
                v_monto_agua, v_monto_tasa_seguridad, v_monto_interes_mora, v_monto_otros_cargos, v_monto_total,
                v_meses_atrasado, v_deuda_anterior, v_saldo_vencido, v_fecha_vencimiento, 0, v_monto_total,
                'PENDIENTE', 'BORRADOR', NOW(), NOW()
            )
            RETURNING prefactura_id INTO v_prefactura_id;
        END IF;

        -- Insertar detalles automaticos
        -- Rubro 1 = Consumo Agua (excedente), Rubro 2 = Cargo Fijo
        IF v_monto_base > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, descripcion, es_automatico, created_at)
            VALUES (v_prefactura_id, 2, 1, v_monto_base, v_monto_base, 'Tarifa Base Agua', true, NOW());
        END IF;

        IF v_monto_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, descripcion, es_automatico, created_at)
            VALUES (v_prefactura_id, 1, v_consumo_excedente_m3, v_monto_excedente / NULLIF(v_consumo_excedente_m3, 0), v_monto_excedente, 'Consumo Excedente', true, NOW());
        END IF;

        IF v_monto_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, descripcion, es_automatico, created_at)
            VALUES (v_prefactura_id, 4, 1, v_monto_tasa_seguridad, v_monto_tasa_seguridad, 'Tasa Seguridad', true, NOW());
        END IF;

        IF v_monto_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, descripcion, es_automatico, created_at)
            VALUES (v_prefactura_id, 3, 1, v_monto_interes_mora, v_monto_interes_mora, 'Intereses Mora', true, NOW());
        END IF;

    END LOOP;

    UPDATE lote_facturacion SET total_emisiones = (SELECT COUNT(*) FROM prefactura WHERE lote_id = v_lote_id), updated_at = NOW() WHERE lote_id = v_lote_id;

    RAISE NOTICE 'Proceso completado lote %.', v_lote_id;
END;
$$;
