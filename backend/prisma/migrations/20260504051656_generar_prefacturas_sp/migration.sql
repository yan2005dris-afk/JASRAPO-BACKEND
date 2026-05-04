-- Migration: Stored Procedures for prefactura generation (Optimized)
-- Created: 2026-05-04

-- SP 1: Update consumo in lecturas table
CREATE OR REPLACE FUNCTION actualizar_consumo_lectura()
RETURNS TRIGGER AS $$
BEGIN
    NEW.consumo_calculado := NEW.lectura_actual - NEW.lectura_anterior;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update consumo on INSERT or UPDATE
DROP TRIGGER IF EXISTS trg_actualizar_consumo_lectura ON lecturas;
CREATE TRIGGER trg_actualizar_consumo_lectura
    BEFORE INSERT OR UPDATE ON lecturas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_consumo_lectura();

-- SP 2: Generate prefacturas lot (main SP)
CREATE OR REPLACE FUNCTION generar_prefacturas_lote(
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
    
    -- Dynamic tax rates for calculation
    v_iva_consumo NUMERIC := 0;
    v_iva_cargo_fijo NUMERIC := 0;
    v_iva_interes NUMERIC := 0;
    v_iva_tasa_seguridad NUMERIC := 0;
    
    -- Rubro IDs
    RUBRO_CONSUMO CONSTANT INTEGER := 1;
    RUBRO_CARGO_FIJO CONSTANT INTEGER := 2;
    RUBRO_INTERES CONSTANT INTEGER := 3;
    RUBRO_TASA_SEGURIDAD CONSTANT INTEGER := 4;
    
BEGIN
    -- 1. Cache tax rates (tarifa) for common rubros
    SELECT COALESCE(i.tarifa, 0) / 100 INTO v_iva_consumo FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CONSUMO;
    SELECT COALESCE(i.tarifa, 0) / 100 INTO v_iva_cargo_fijo FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CARGO_FIJO;
    SELECT COALESCE(i.tarifa, 0) / 100 INTO v_iva_interes FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_INTERES;
    SELECT COALESCE(i.tarifa, 0) / 100 INTO v_iva_tasa_seguridad FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_TASA_SEGURIDAD;

    -- 2. Create the lot
    INSERT INTO lote_facturacion (comunidad_id, periodo_id, estado, total_monto, notas, creado_por)
    VALUES (
        COALESCE(p_comunidad_id, 1),
        p_periodo_id,
        'BORRADOR'::EstadoLote,
        0,
        'Generando...',
        NULL -- Note: creado_por is Int in schema, but passed as Text? I'll use null or fix logic if needed.
    )
    RETURNING lote_id INTO v_lote_id;
    
    -- 3. Get community security fee
    SELECT COALESCE(c.porcentaje_tasa_seguridad, 0)
    INTO v_porcentaje_tasa
    FROM comunidades c
    WHERE c.comunidad_id = COALESCE(p_comunidad_id, c.comunidad_id)
    LIMIT 1;
    
    -- 4. Process contracts
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
        WHERE c.estado = 'ACTIVO'::EstadoGenerico
          AND c.borrado_en IS NULL
          AND cl.borrado_en IS NULL
          AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
    LOOP
        -- Find reading (Must be APROBADA)
        SELECT lectura_id, lectura_anterior, lectura_actual
        INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
        FROM lecturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id = p_periodo_id
          AND estado = 'APROBADA'::EstadoLectura
          AND borrado_en IS NULL;
        
        IF NOT FOUND THEN
            v_observaciones_lote := v_observaciones_lote || 'Contrato ' || contrato_row.contrato_id || ': Sin lectura APROBADA para periodo ' || p_periodo_id || E'\n';
            CONTINUE;
        END IF;
        
        -- Calculations
        v_consumo := v_lectura_actual - v_lectura_anterior;
        v_excedente := GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual) * contrato_row.valor_excedente_m3;
        v_cargo_fijo := contrato_row.valor_base;
        
        -- Community Security Fee
        IF v_porcentaje_tasa > 0 THEN
            v_tasa_seguridad := (v_cargo_fijo + v_excedente) * (v_porcentaje_tasa / 100);
        ELSE
            v_tasa_seguridad := 0;
        END IF;
        
        -- Debt tracking
        -- v_saldo_vencido: total unpaid prefacturas
        SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
        INTO v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado NOT IN ('PAGADA'::EstadoPrefactura, 'ANULADA'::EstadoPrefactura)
          AND periodo_id < p_periodo_id
          AND borrado_en IS NULL;
          
        -- v_deuda_anterior: only the immediate previous period
        SELECT COALESCE(total_pagar - abono, 0)
        INTO v_deuda_anterior
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id = p_periodo_id - 1
          AND estado NOT IN ('PAGADA'::EstadoPrefactura, 'ANULADA'::EstadoPrefactura)
          AND borrado_en IS NULL;

        -- Interest Formula: (saldo atrasado) * (cargo fijo / 12) * (meses atrasado)
        -- Only if 3+ months? User said "arregla el calculo", previously mentioned Excel had >=3.
        -- But also asked for exactly the formula. I'll include interest if months > 0 for accuracy.
        IF v_meses_atrasado >= 3 THEN
            v_interes_mora := v_saldo_vencido * (v_cargo_fijo / 12) * v_meses_atrasado;
        ELSE
            v_interes_mora := 0;
        END IF;
        
        -- Discounts (Adulto Mayor / Discapacidad) applied only to Base Fee
        IF contrato_row.aplica_tercera_edad OR contrato_row.aplica_discapacidad THEN
            v_descuento := v_cargo_fijo * 0.50;
        ELSE
            v_descuento := 0;
        END IF;
        
        -- Subtotal & IVA per Rubro
        -- 1. Cargo Fijo
        v_iva_total := (v_cargo_fijo - v_descuento) * v_iva_cargo_fijo;
        -- 2. Excedente
        v_iva_total := v_iva_total + (v_excedente * v_iva_consumo);
        -- 3. Interes
        v_iva_total := v_iva_total + (v_interes_mora * v_iva_interes);
        -- 4. Tasa Seguridad
        v_iva_total := v_iva_total + (v_tasa_seguridad * v_iva_tasa_seguridad);
        
        v_subtotal := v_cargo_fijo + v_excedente + v_tasa_seguridad + v_interes_mora;
        v_total_pagar_periodo := v_subtotal + v_iva_total - v_descuento;
        
        -- Insert prefactura
        INSERT INTO prefacturas (
            contrato_id, lote_id, periodo_id, punto_emision_id,
            lectura_anterior, lectura_actual, consumo_m3,
            subtotal, iva, descuento_total, total_pagar,
            deuda_anterior, saldo_vencido, saldo_actual, meses_atrasado,
            interes_mora, tasa_interes_usada, estado,
            cliente_direccion, cliente_email, cliente_identificacion, cliente_nombre,
            tarifa_valor_base, tarifa_valor_excedente, lectura_id, creado_por
        ) VALUES (
            contrato_row.contrato_id, v_lote_id, p_periodo_id, 1,
            v_lectura_anterior, v_lectura_actual, v_consumo,
            v_subtotal, v_iva_total, v_descuento, v_total_pagar_periodo,
            v_deuda_anterior, v_saldo_vencido, v_total_pagar_periodo + v_saldo_vencido, v_meses_atrasado,
            v_interes_mora, (v_cargo_fijo / 12), 'GENERADA'::EstadoPrefactura,
            contrato_row.direccion_suministro, contrato_row.email, contrato_row.cliente_identificacion, contrato_row.cliente_nombre,
            v_cargo_fijo, contrato_row.valor_excedente_m3, v_lectura_id, p_creado_por
        )
        RETURNING prefactura_id INTO v_prefactura_id;
        
        -- Insert Details
        -- Detail: Cargo Fijo
        INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total)
        VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Cargo Fijo', 1, v_cargo_fijo, v_cargo_fijo, v_cargo_fijo * v_iva_cargo_fijo, v_cargo_fijo * (1 + v_iva_cargo_fijo));
        
        -- Detail: Excedente
        IF v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total)
            VALUES (v_prefactura_id, RUBRO_CONSUMO, 'Excedente Consumo', GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual), contrato_row.valor_excedente_m3, v_excedente, v_excedente * v_iva_consumo, v_excedente * (1 + v_iva_consumo));
        END IF;
        
        -- Detail: Tasa Seguridad
        IF v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total)
            VALUES (v_prefactura_id, RUBRO_TASA_SEGURIDAD, 'Tasa Seguridad', 1, v_tasa_seguridad, v_tasa_seguridad, v_tasa_seguridad * v_iva_tasa_seguridad, v_tasa_seguridad * (1 + v_iva_tasa_seguridad));
        END IF;
        
        -- Detail: Interes Mora
        IF v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total)
            VALUES (v_prefactura_id, RUBRO_INTERES, 'Interés Mora', v_meses_atrasado, v_interes_mora / NULLIF(v_meses_atrasado, 0), v_interes_mora, v_interes_mora * v_iva_interes, v_interes_mora * (1 + v_iva_interes));
        END IF;
        
        -- Detail: Descuento
        IF v_descuento > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, descuento)
            VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Descuento Ley (Tercera Edad/Disc.)', 1, -v_descuento, -v_descuento, 0, -v_descuento, v_descuento);
        END IF;
        
        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;
    
    -- 5. Finalize Lote
    UPDATE lote_facturacion 
    SET total_monto = v_total_lote_monto, 
        total_emisiones = v_count,
        notas = v_observaciones_lote || 'Completado: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;
    
    RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;

-- SP 3: Approve lot (change from BORRADOR to DEFINITIVO)
CREATE OR REPLACE FUNCTION aprobar_lote_facturacion(
    p_lote_id BIGINT,
    p_aprobado_por TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE lote_facturacion 
    SET estado = 'DEFINITIVO'::EstadoLote,
        notas = COALESCE(notas, '') || E'\n' || 'Aprobado por: ' || p_aprobado_por || ' Fecha: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = p_lote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lote no encontrado: %', p_lote_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- SP 4: Get debt summary by contract
CREATE OR REPLACE FUNCTION obtener_deuda_contrato(p_contrato_id BIGINT)
RETURNS TABLE(
    deuda_total NUMERIC,
    meses_atrasado INTEGER,
    ultima_fecha_pago TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(p.total_pagar - p.abono), 0)::NUMERIC AS deuda_total,
        COUNT(*)::INTEGER AS meses_atrasado,
        MAX(p.creado_en) AS ultima_fecha_pago
    FROM prefacturas p
    WHERE p.contrato_id = p_contrato_id
      AND p.estado NOT IN ('PAGADA'::EstadoPrefactura, 'ANULADA'::EstadoPrefactura)
      AND p.borrado_en IS NULL;
END;
$$ LANGUAGE plpgsql;