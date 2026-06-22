-- Migration: Interés mora desde parametro_tasa_interes
-- Created: 2026-06-21
--
-- Changes:
--   1. Agrega v_tasa_interes cacheada desde parametro_tasa_interes
--   2. Reemplaza fórmula provisoria v_saldo_vencido * (cargo_fijo/12) * meses
--      por v_saldo_vencido * (tasa/100) * meses
--   3. Actualiza tasa_interes_usada en prefactura con la tasa vigente
--   4. Si no hay tasa configurada, interes_mora = 0

CREATE OR REPLACE FUNCTION public.generar_prefacturas_lote(
    p_periodo_id INTEGER,
    p_comunidad_id INTEGER DEFAULT NULL,
    p_creado_por TEXT DEFAULT 'SYSTEM'
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

    -- 5. Crear el lote
    INSERT INTO lote (comunidad_id, periodo_id, estado_id, total_monto, notas, creado_por, actualizado_en, creado_en)
    VALUES (
        COALESCE(p_comunidad_id, 1),
        p_periodo_id,
        1,
        0,
        'Generando...',
        (CASE WHEN p_creado_por ~ '^[0-9]+$' THEN p_creado_por::INTEGER ELSE NULL END),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING lote_id INTO v_lote_id;
    
    -- 6. Obtener porcentaje de tasa de seguridad de la comunidad
    SELECT COALESCE(c.porcentaje_tasa_seguridad, 0)
    INTO v_porcentaje_tasa
    FROM comunidades c
    WHERE c.comunidad_id = COALESCE(p_comunidad_id, c.comunidad_id)
    LIMIT 1;
    
    -- 7. Procesar contratos activos
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
        WHERE c.estado = 'ACTIVO'::"EstadoGenerico"
          AND c.borrado_en IS NULL
          AND cl.borrado_en IS NULL
          AND ct.activo
          AND (ct.fecha_vigencia_desde IS NULL OR ct.fecha_vigencia_desde <= CURRENT_DATE)
          AND (ct.fecha_vigencia_hasta IS NULL OR ct.fecha_vigencia_hasta >= CURRENT_DATE)
          AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
    LOOP
        SELECT lectura_id, lectura_anterior, lectura_actual
        INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
        FROM lecturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id = p_periodo_id
          AND estado = 'APROBADA'::"EstadoLectura"
          AND borrado_en IS NULL;
        
        IF NOT FOUND THEN
            v_observaciones_lote := v_observaciones_lote || 'Contrato ' || contrato_row.contrato_id || ': Sin lectura APROBADA para periodo ' || p_periodo_id || E'\n';
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
        
        -- Seguimiento de Deuda
        SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
        INTO v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND periodo_id < p_periodo_id
          AND borrado_en IS NULL;
          
        SELECT COALESCE(total_pagar - abono, 0)
        INTO v_deuda_anterior
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id < p_periodo_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND borrado_en IS NULL
        ORDER BY periodo_id DESC
        LIMIT 1;
        
        IF v_deuda_anterior IS NULL THEN
            v_deuda_anterior := 0;
        END IF;

        -- Interés de Mora (desde parametro_tasa_interes)
        -- Fórmula: saldo_vencido * (tasa / 100) * meses_atrasado
        -- Ej: $100 deuda * (1.5% / 100) * 3 meses = $4.50
        IF v_meses_atrasado >= 3 AND v_tasa_interes > 0 THEN
            v_interes_mora := v_saldo_vencido * (v_tasa_interes / 100) * v_meses_atrasado;
        ELSE
            v_interes_mora := 0;
        END IF;
        
        -- Descuentos DINÁMICOS desde catalogo_descuento
        -- TERCERA_EDAD tiene prioridad sobre DISCAPACIDAD si ambos aplican
        v_descuento := 0;
        IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_id IS NOT NULL THEN
            IF v_descuento_tercera_pct THEN
                v_descuento := v_cargo_fijo * (v_descuento_tercera_valor / 100);
            ELSE
                v_descuento := LEAST(v_descuento_tercera_valor, v_cargo_fijo);
            END IF;
        ELSIF contrato_row.aplica_discapacidad AND v_descuento_disc_id IS NOT NULL THEN
            IF v_descuento_disc_pct THEN
                v_descuento := v_cargo_fijo * (v_descuento_disc_valor / 100);
            ELSE
                v_descuento := LEAST(v_descuento_disc_valor, v_cargo_fijo);
            END IF;
        END IF;
        
        -- Subtotal e IVA
        v_iva_total := (v_cargo_fijo - v_descuento) * v_iva_cargo_fijo;
        v_iva_total := v_iva_total + (v_excedente * v_iva_consumo);
        v_iva_total := v_iva_total + (v_interes_mora * v_iva_interes);
        v_iva_total := v_iva_total + (v_tasa_seguridad * v_iva_tasa_seguridad);
        
        v_subtotal := v_cargo_fijo + v_excedente + v_tasa_seguridad + v_interes_mora;
        v_total_pagar_periodo := v_subtotal + v_iva_total - v_descuento;
        
        -- Insertar prefactura (con tasa_interes_usada real)
        INSERT INTO prefacturas (
            contrato_id, lote_id, periodo_id, punto_emision_id,
            lectura_anterior, lectura_actual, consumo_m3,
            subtotal, iva, descuento_total, total_pagar,
            deuda_anterior, saldo_vencido, saldo_actual, meses_atrasado,
            interes_mora, tasa_interes_usada, estado,
            cliente_direccion, cliente_email, cliente_identificacion, cliente_nombre,
            tarifa_valor_base, tarifa_valor_excedente, lectura_id, creado_por,
            abono, creado_en, actualizado_en
        ) VALUES (
            contrato_row.contrato_id, v_lote_id, p_periodo_id, 1,
            v_lectura_anterior, v_lectura_actual, v_consumo,
            v_subtotal, v_iva_total, v_descuento, v_total_pagar_periodo,
            v_deuda_anterior, v_saldo_vencido, v_total_pagar_periodo + v_saldo_vencido, v_meses_atrasado,
            v_interes_mora, v_tasa_interes, 'GENERADA'::"EstadoPrefactura",
            contrato_row.direccion_suministro, contrato_row.email, contrato_row.cliente_identificacion, contrato_row.cliente_nombre,
            v_cargo_fijo, contrato_row.valor_excedente_m3, v_lectura_id, p_creado_por,
            0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING prefactura_id INTO v_prefactura_id;
        
        -- Detalle: Cargo Fijo (con RETURNING para descuento_detalle)
        INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
        VALUES (v_prefactura_id, v_rubro_cargo_fijo, 'Cargo Fijo', 1, v_cargo_fijo, v_cargo_fijo, v_cargo_fijo * v_iva_cargo_fijo, v_cargo_fijo * (1 + v_iva_cargo_fijo), v_iva_cargo_fijo * 100, v_cod_imp_fijo, v_por_imp_fijo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING prefactura_detalle_id INTO v_prefactura_detalle_id;
        
        -- Detalle: Excedente
        IF v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_consumo, 'Excedente Consumo', GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual), contrato_row.valor_excedente_m3, v_excedente, v_excedente * v_iva_consumo, v_excedente * (1 + v_iva_consumo), v_iva_consumo * 100, v_cod_imp_consumo, v_por_imp_consumo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Tasa Seguridad
        IF v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_tasa_seguridad, 'Tasa Seguridad', 1, v_tasa_seguridad, v_tasa_seguridad, v_tasa_seguridad * v_iva_tasa_seguridad, v_tasa_seguridad * (1 + v_iva_tasa_seguridad), v_iva_tasa_seguridad * 100, v_cod_imp_seg, v_por_imp_seg, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Interés Mora
        IF v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, iva, total, descuento, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, v_rubro_interes, v_meses_atrasado, v_interes_mora / NULLIF(v_meses_atrasado, 0), v_interes_mora, v_interes_mora * v_iva_interes, v_interes_mora * (1 + v_iva_interes), 0, v_iva_interes * 100, v_cod_imp_interes, v_por_imp_interes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Descuento + registro en descuento_detalle
        IF v_descuento > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, descuento, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (
                v_prefactura_id, v_rubro_cargo_fijo,
                CASE WHEN contrato_row.aplica_tercera_edad THEN 'Descuento Tercera Edad' ELSE 'Descuento Discapacidad' END,
                1, -v_descuento, -v_descuento, 0, -v_descuento, v_descuento, 0, '2', '0',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            );
            
            -- Registrar en descuento_detalle para auditoría
            INSERT INTO descuento_detalle (
                prefactura_detalle_id, catalogo_descuento_id, monto_descontado,
                es_porcentaje, valor_applied, creado_en
            ) VALUES (
                v_prefactura_detalle_id,
                CASE WHEN contrato_row.aplica_tercera_edad THEN v_descuento_tercera_id ELSE v_descuento_disc_id END,
                v_descuento,
                CASE WHEN contrato_row.aplica_tercera_edad THEN v_descuento_tercera_pct ELSE v_descuento_disc_pct END,
                CASE WHEN contrato_row.aplica_tercera_edad THEN v_descuento_tercera_valor ELSE v_descuento_disc_valor END,
                CURRENT_TIMESTAMP
            );
        END IF;
        
        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;
    
    -- Actualizar lote con totales
    UPDATE lote 
    SET total_monto = v_total_lote_monto, 
        total_emisiones = v_count,
        notas = v_observaciones_lote || 'Completado: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;
    
    RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;
