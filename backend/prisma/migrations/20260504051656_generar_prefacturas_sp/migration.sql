-- Migración: Procedimientos Almacenados para generación de prefacturas (Optimizado y Corregido)
-- Creado: 2026-05-04
-- Revisado: 2026-05-05

-- SP 1: Actualizar consumo en la tabla de lecturas
CREATE OR REPLACE FUNCTION actualizar_consumo_lectura()
RETURNS TRIGGER AS $$
BEGIN
    NEW.consumo_calculado := NEW.lectura_actual - NEW.lectura_anterior;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el consumo al insertar o actualizar
DROP TRIGGER IF EXISTS trg_actualizar_consumo_lectura ON lecturas;
CREATE TRIGGER trg_actualizar_consumo_lectura
    BEFORE INSERT OR UPDATE ON lecturas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_consumo_lectura();

-- SP 2: Generar lote de prefacturas (SP Principal)
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
    
    -- IDs de Rubros (Constantes)
    RUBRO_CONSUMO CONSTANT INTEGER := 1;
    RUBRO_CARGO_FIJO CONSTANT INTEGER := 2;
    RUBRO_INTERES CONSTANT INTEGER := 3;
    RUBRO_TASA_SEGURIDAD CONSTANT INTEGER := 4;
    
BEGIN
    -- 1. Cachear tasas de impuestos y códigos de sri_impuesto para rubros comunes
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_consumo, v_cod_imp_consumo, v_por_imp_consumo 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CONSUMO;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_cargo_fijo, v_cod_imp_fijo, v_por_imp_fijo 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CARGO_FIJO;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_interes, v_cod_imp_interes, v_por_imp_interes 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_INTERES;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_tasa_seguridad, v_cod_imp_seg, v_por_imp_seg 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_TASA_SEGURIDAD;

    -- 2. Crear el lote (Nombre de tabla corregido a 'lote', conversión segura de p_creado_por)
    -- Los enums creados por Prisma requieren comillas dobles para respetar mayúsculas en Postgres
    INSERT INTO lote (comunidad_id, periodo_id, estado, total_monto, notas, creado_por)
    VALUES (
        COALESCE(p_comunidad_id, 1),
        p_periodo_id,
        'BORRADOR'::"EstadoLote",
        0,
        'Generando...',
        (CASE WHEN p_creado_por ~ '^[0-9]+$' THEN p_creado_por::INTEGER ELSE NULL END)
    )
    RETURNING lote_id INTO v_lote_id;
    
    -- 3. Obtener porcentaje de tasa de seguridad de la comunidad
    SELECT COALESCE(c.porcentaje_tasa_seguridad, 0)
    INTO v_porcentaje_tasa
    FROM comunidades c
    WHERE c.comunidad_id = COALESCE(p_comunidad_id, c.comunidad_id)
    LIMIT 1;
    
    -- 4. Procesar contratos activos
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
          AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
    LOOP
        -- Buscar lectura (Debe estar APROBADA)
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
        
        -- Tasa de Seguridad de la Comunidad (Calculada a partir del parámetro)
        IF v_porcentaje_tasa > 0 THEN
            v_tasa_seguridad := (v_cargo_fijo + v_excedente) * (v_porcentaje_tasa / 100);
        ELSE
            v_tasa_seguridad := 0;
        END IF;
        
        -- Seguimiento de Deuda
        -- v_saldo_vencido: total de prefacturas impagas anteriores
        SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
        INTO v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND periodo_id < p_periodo_id
          AND borrado_en IS NULL;
          
        -- v_deuda_anterior: buscar la ÚLTIMA prefactura impaga antes de la actual
        SELECT COALESCE(total_pagar - abono, 0)
        INTO v_deuda_anterior
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id < p_periodo_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND borrado_en IS NULL
        ORDER BY periodo_id DESC
        LIMIT 1;

        -- Fórmula de Interés de Mora: (saldo vencido) * (cargo fijo / 12) * (meses atrasados)
        IF v_meses_atrasado >= 3 THEN
            v_interes_mora := v_saldo_vencido * (v_cargo_fijo / 12) * v_meses_atrasado;
        ELSE
            v_interes_mora := 0;
        END IF;
        
        -- Descuentos (Adulto Mayor / Discapacidad) aplicados solo al Cargo Fijo
        IF contrato_row.aplica_tercera_edad OR contrato_row.aplica_discapacidad THEN
            v_descuento := v_cargo_fijo * 0.50;
        ELSE
            v_descuento := 0;
        END IF;
        
        -- Subtotal e IVA por Rubro
        -- 1. Cargo Fijo
        v_iva_total := (v_cargo_fijo - v_descuento) * v_iva_cargo_fijo;
        -- 2. Excedente
        v_iva_total := v_iva_total + (v_excedente * v_iva_consumo);
        -- 3. Interés
        v_iva_total := v_iva_total + (v_interes_mora * v_iva_interes);
        -- 4. Tasa Seguridad
        v_iva_total := v_iva_total + (v_tasa_seguridad * v_iva_tasa_seguridad);
        
        v_subtotal := v_cargo_fijo + v_excedente + v_tasa_seguridad + v_interes_mora;
        v_total_pagar_periodo := v_subtotal + v_iva_total - v_descuento;
        
        -- Insertar prefactura
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
            v_interes_mora, (v_cargo_fijo / 12), 'GENERADA'::"EstadoPrefactura",
            contrato_row.direccion_suministro, contrato_row.email, contrato_row.cliente_identificacion, contrato_row.cliente_nombre,
            v_cargo_fijo, contrato_row.valor_excedente_m3, v_lectura_id, p_creado_por
        )
        RETURNING prefactura_id INTO v_prefactura_id;
        
        -- Insertar Detalles (Con códigos SRI e impuestos correctos)
        -- Detalle: Cargo Fijo
        INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri)
        VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Cargo Fijo', 1, v_cargo_fijo, v_cargo_fijo, v_cargo_fijo * v_iva_cargo_fijo, v_cargo_fijo * (1 + v_iva_cargo_fijo), v_iva_cargo_fijo * 100, v_cod_imp_fijo, v_por_imp_fijo);
        
        -- Detalle: Excedente
        IF v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri)
            VALUES (v_prefactura_id, RUBRO_CONSUMO, 'Excedente Consumo', GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual), contrato_row.valor_excedente_m3, v_excedente, v_excedente * v_iva_consumo, v_excedente * (1 + v_iva_consumo), v_iva_consumo * 100, v_cod_imp_consumo, v_por_imp_consumo);
        END IF;
        
        -- Detalle: Tasa Seguridad
        IF v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri)
            VALUES (v_prefactura_id, RUBRO_TASA_SEGURIDAD, 'Tasa Seguridad', 1, v_tasa_seguridad, v_tasa_seguridad, v_tasa_seguridad * v_iva_tasa_seguridad, v_tasa_seguridad * (1 + v_iva_tasa_seguridad), v_iva_tasa_seguridad * 100, v_cod_imp_seg, v_por_imp_seg);
        END IF;
        
        -- Detalle: Interés Mora
        IF v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri)
            VALUES (v_prefactura_id, RUBRO_INTERES, 'Interés Mora', v_meses_atrasado, v_interes_mora / NULLIF(v_meses_atrasado, 0), v_interes_mora, v_interes_mora * v_iva_interes, v_interes_mora * (1 + v_iva_interes), v_iva_interes * 100, v_cod_imp_interes, v_por_imp_interes);
        END IF;
        
        -- Detalle: Descuento
        IF v_descuento > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, descuento, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri)
            VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Descuento Ley (Tercera Edad/Disc.)', 1, -v_descuento, -v_descuento, 0, -v_descuento, v_descuento, 0, '2', '0');
        END IF;
        
        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;
    
    -- 5. Finalizar Lote (Nombre de tabla corregido)
    UPDATE lote 
    SET total_monto = v_total_lote_monto, 
        total_emisiones = v_count,
        notas = v_observaciones_lote || 'Completado: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;
    
    RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;

-- SP 3: Aprobar lote (Nombre de tabla corregido)
CREATE OR REPLACE FUNCTION aprobar_lote_facturacion(
    p_lote_id BIGINT,
    p_aprobado_por TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE lote 
    SET estado = 'DEFINITIVO'::"EstadoLote",
        notas = COALESCE(notas, '') || E'\n' || 'Aprobado por: ' || p_aprobado_por || ' Fecha: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = p_lote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lote no encontrado: %', p_lote_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- SP 4: Obtener resumen de deuda por contrato
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
      AND p.estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
      AND p.borrado_en IS NULL;
END;
$$ LANGUAGE plpgsql;