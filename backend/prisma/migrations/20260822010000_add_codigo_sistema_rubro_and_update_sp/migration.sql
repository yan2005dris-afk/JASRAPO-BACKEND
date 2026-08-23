-- Migration: add_codigo_sistema_rubro_and_update_sp
-- Description: Add CodigoSistemaRubro enum to rubros, populate existing installation rubros, create unique partial index per category, and update generar_prefactura_instalacion SP.

-- 1. Create Enum CodigoSistemaRubro if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CodigoSistemaRubro') THEN
        CREATE TYPE "CodigoSistemaRubro" AS ENUM ('INSTALACION', 'RECONEXION', 'INSPECCION');
    END IF;
END $$;

-- 2. Add column to rubros
ALTER TABLE rubros
  ADD COLUMN IF NOT EXISTS codigo_sistema_rubro "CodigoSistemaRubro";

-- 3. Populate historical installation rubros
UPDATE rubros
SET codigo_sistema_rubro = 'INSTALACION'
WHERE codigo_sri LIKE 'SERV-GUIA-%'
  AND borrado_en IS NULL;

-- 4. Create Partial Unique Index (one active INSTALACION per category)
DROP INDEX IF EXISTS uk_rubros_sistema_categoria;
CREATE UNIQUE INDEX uk_rubros_sistema_categoria
  ON rubros (codigo_sistema_rubro, categoria_tarifa_id)
  WHERE activo AND borrado_en IS NULL AND codigo_sistema_rubro IS NOT NULL;

-- 5. Create index for fast lookups
CREATE INDEX IF NOT EXISTS rubros_codigo_sistema_rubro_idx
  ON rubros (codigo_sistema_rubro);

-- 6. Update SP generar_prefactura_instalacion
CREATE OR REPLACE FUNCTION generar_prefactura_instalacion(
    p_contrato_id BIGINT,
    p_creado_por TEXT DEFAULT 'SYSTEM'
)
RETURNS BIGINT AS $$
DECLARE
    v_contrato RECORD;
    v_existing_prefactura_id BIGINT;
    v_rubro_id INT;
    v_rubro_nombre TEXT;
    v_precio_unitario NUMERIC(18,2);
    v_tasa NUMERIC(18,4);
    v_cod_impuesto TEXT;
    v_porcentaje_impuesto TEXT;
    v_periodo_id INT;
    v_mes_actual INT;
    v_subtotal NUMERIC(18,2);
    v_iva NUMERIC(18,2);
    v_total NUMERIC(18,2);
    v_prefactura_id BIGINT;
    v_emisor_id INT;
    v_punto_emision_id INT;
    v_ambiente TEXT;
    v_comprobante_id BIGINT;
BEGIN
    -- 1. Lock + snapshot: validar contrato y estado PENDIENTE_PAGO
    SELECT 
        c.contrato_id,
        c.categoria_tarifa_id,
        c.direccion_suministro,
        cat.nombre AS categoria_nombre,
        cl.identificacion AS cliente_identificacion,
        cl.email AS cliente_email,
        cl.direccion_domicilio AS cliente_direccion,
        COALESCE(NULLIF(cl.razon_social, ''), cl.nombres || ' ' || cl.apellidos) AS cliente_nombre,
        c.estado,
        c.borrado_en
    INTO v_contrato
    FROM contratos c
    JOIN clientes cl ON c.cliente_id = cl.cliente_id
    JOIN categoria_tarifa cat ON c.categoria_tarifa_id = cat.categoria_tarifa_id
    WHERE c.contrato_id = p_contrato_id
    FOR UPDATE OF c;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contrato con ID % no encontrado', p_contrato_id;
    END IF;

    IF v_contrato.borrado_en IS NOT NULL THEN
        RAISE EXCEPTION 'El contrato con ID % se encuentra eliminado', p_contrato_id;
    END IF;

    IF v_contrato.estado <> 'PENDIENTE_PAGO'::"EstadoContrato" THEN
        RAISE EXCEPTION 'El contrato con ID % no está en estado PENDIENTE_PAGO (estado actual: %)', p_contrato_id, v_contrato.estado;
    END IF;

    -- 2. Idempotencia robusta basada en detalle del rubro de instalación (codigo_sistema_rubro = INSTALACION)
    SELECT pf.prefactura_id INTO v_existing_prefactura_id
    FROM prefacturas pf
    WHERE pf.contrato_id = p_contrato_id
      AND pf.estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
      AND pf.borrado_en IS NULL
      AND EXISTS (
          SELECT 1 FROM prefactura_detalle d
          JOIN rubros r ON d.rubro_id = r.rubro_id
          WHERE d.prefactura_id = pf.prefactura_id
            AND r.codigo_sistema_rubro = 'INSTALACION'::"CodigoSistemaRubro"
            AND r.borrado_en IS NULL
      )
    ORDER BY pf.creado_en DESC
    LIMIT 1;

    IF v_existing_prefactura_id IS NOT NULL THEN
        RETURN v_existing_prefactura_id;
    END IF;

    -- 3. Rubro por categoría con codigo_sistema_rubro = INSTALACION
    SELECT 
        r.rubro_id, 
        r.nombre, 
        r.precio_unitario,
        COALESCE(cti.porcentaje, 0) / 100.0 AS tasa, 
        ci.codigo AS cod_impuesto,
        cti.codigo_porcentaje AS porcentaje_impuesto
    INTO 
        v_rubro_id, 
        v_rubro_nombre, 
        v_precio_unitario, 
        v_tasa, 
        v_cod_impuesto, 
        v_porcentaje_impuesto
    FROM rubros r
    JOIN catalogo_tarifas_impuesto cti ON r.tarifa_impuesto_id = cti.id
    JOIN catalogo_impuestos ci ON cti.impuesto_id = ci.id
    WHERE r.categoria_tarifa_id = v_contrato.categoria_tarifa_id 
      AND r.codigo_sistema_rubro = 'INSTALACION'::"CodigoSistemaRubro"
      AND r.activo 
      AND r.borrado_en IS NULL 
      AND cti.activo
      AND (cti.vigente_desde IS NULL OR cti.vigente_desde <= CURRENT_TIMESTAMP)
      AND (cti.vigente_hasta IS NULL OR cti.vigente_hasta >= CURRENT_TIMESTAMP)
    ORDER BY r.rubro_id ASC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe un rubro configurado como INSTALACION para la categoría tarifaria ID %', v_contrato.categoria_tarifa_id;
    END IF;

    -- 4. Período abierto
    SELECT periodo_id INTO v_periodo_id
    FROM periodos
    WHERE estado = 'ABIERTO'::"EstadoPeriodo"
      AND borrado_en IS NULL
    ORDER BY fecha_inicio DESC
    LIMIT 1;

    IF v_periodo_id IS NULL THEN
        RAISE EXCEPTION 'No existe un período de facturación ABIERTO para generar la prefactura de instalación';
    END IF;

    -- 5. Mes real actual
    v_mes_actual := EXTRACT(MONTH FROM CURRENT_DATE)::INT;

    -- 6. Emisor y punto de emisión para comprobante borrador
    SELECT e.id, pe.id, e.ambiente
    INTO v_emisor_id, v_punto_emision_id, v_ambiente
    FROM puntos_emision pe
    JOIN establecimientos est ON pe.establecimiento_id = est.id
    JOIN emisores e ON est.emisor_id = e.id
    WHERE pe.id = 1
    LIMIT 1;

    -- 7. Cálculo
    v_subtotal := v_precio_unitario;
    v_iva := ROUND(v_subtotal * v_tasa, 2);
    v_total := v_subtotal + v_iva;

    -- 8. Crear Comprobante BORRADOR
    INSERT INTO comprobantes (
        emisor_id,
        punto_emision_id,
        tipo_comprobante,
        ambiente,
        tipo_emision,
        secuencial,
        fecha_emision,
        estado,
        total_sin_impuestos,
        total_descuento,
        importe_total,
        moneda,
        receptor_identificacion,
        receptor_razon_social,
        receptor_direccion,
        receptor_email,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(v_emisor_id, 1),
        COALESCE(v_punto_emision_id, 1),
        '01', -- FACTURA
        COALESCE(v_ambiente, '1'),
        '1',
        '',
        CURRENT_DATE,
        'BORRADOR',
        v_subtotal,
        0,
        v_total,
        'DOLAR',
        v_contrato.cliente_identificacion,
        v_contrato.cliente_nombre,
        v_contrato.cliente_direccion,
        v_contrato.cliente_email,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_comprobante_id;

    -- 9. Detalle del Comprobante
    INSERT INTO comprobante_detalles (
        comprobante_id,
        codigo_principal,
        descripcion,
        cantidad,
        precio_unitario,
        descuento,
        precio_total_sin_impuesto,
        orden
    ) VALUES (
        v_comprobante_id,
        v_rubro_id::TEXT,
        v_rubro_nombre,
        1,
        v_precio_unitario,
        0,
        v_subtotal,
        1
    );

    -- 10. Insertar Prefactura de instalación en estado APROBADA con comprobante_id enlazado
    INSERT INTO prefacturas (
        contrato_id,
        lote_id,
        periodo_id,
        punto_emision_id,
        lectura_anterior,
        lectura_actual,
        consumo_m3,
        subtotal,
        iva,
        descuento_total,
        total_pagar,
        deuda_anterior,
        saldo_vencido,
        abono,
        saldo_actual,
        meses_atrasado,
        estado,
        creado_por,
        aprobada_por,
        fecha_aprobacion,
        interes_mora,
        cliente_direccion,
        cliente_email,
        cliente_identificacion,
        cliente_nombre,
        tarifa_nombre,
        tarifa_valor_base,
        tarifa_valor_excedente,
        lectura_id,
        comprobante_id,
        mes,
        tasa_interes_usada,
        creado_en,
        actualizado_en
    ) VALUES (
        p_contrato_id,
        NULL,
        v_periodo_id,
        COALESCE(v_punto_emision_id, 1),
        0,
        0,
        0,
        v_subtotal,
        v_iva,
        0,
        v_total,
        0,
        0,
        0,
        v_total,
        0,
        'APROBADA'::"EstadoPrefactura",
        p_creado_por,
        p_creado_por,
        CURRENT_TIMESTAMP,
        0,
        v_contrato.cliente_direccion,
        v_contrato.cliente_email,
        v_contrato.cliente_identificacion,
        v_contrato.cliente_nombre,
        v_contrato.categoria_nombre,
        0,
        0,
        NULL,
        v_comprobante_id,
        v_mes_actual,
        0,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING prefactura_id INTO v_prefactura_id;

    -- 11. Insertar detalle de prefactura
    INSERT INTO prefactura_detalle (
        prefactura_id,
        rubro_id,
        descripcion,
        cantidad,
        precio_unitario,
        subtotal,
        iva,
        descuento,
        total,
        tarifa_impuesto,
        codigo_impuesto_sri,
        codigo_porcentaje_sri,
        creado_en,
        actualizado_en,
        creado_por
    ) VALUES (
        v_prefactura_id,
        v_rubro_id,
        v_rubro_nombre,
        1,
        v_precio_unitario,
        v_subtotal,
        v_iva,
        0,
        v_total,
        (v_tasa * 100.0),
        v_cod_impuesto,
        v_porcentaje_impuesto,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        p_creado_por
    );

    RETURN v_prefactura_id;
END;
$$ LANGUAGE plpgsql;
