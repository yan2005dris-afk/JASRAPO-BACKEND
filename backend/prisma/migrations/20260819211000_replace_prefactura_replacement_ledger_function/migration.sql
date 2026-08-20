-- Final route-aware, retry-safe billing implementation for physical meter segments.
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
  v_mes INTEGER := COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);
  v_prefactura_id BIGINT;
  v_lectura_id BIGINT;
  v_lectura_anterior NUMERIC;
  v_lectura_actual NUMERIC;
  v_current_consumption NUMERIC;
  v_consumo_total NUMERIC;
  v_remaining_minimum NUMERIC;
  v_quantity NUMERIC;
  v_billable_quantity NUMERIC;
  v_unit_price NUMERIC;
  v_consumption_subtotal NUMERIC;
  v_fixed_subtotal NUMERIC;
  v_consumption_iva_rate NUMERIC := 0;
  v_fixed_iva_rate NUMERIC := 0;
  v_iva NUMERIC;
  v_total NUMERIC;
  v_security_rate NUMERIC := 0;
  v_security_subtotal NUMERIC := 0;
  v_security_iva_rate NUMERIC := 0;
  v_interest_rate NUMERIC := 0;
  v_interest_subtotal NUMERIC := 0;
  v_interest_iva_rate NUMERIC := 0;
  v_previous_debt NUMERIC := 0;
  v_overdue_balance NUMERIC := 0;
  v_months_overdue INTEGER := 0;
  v_discount NUMERIC := 0;
  v_senior_discount_value NUMERIC;
  v_senior_discount_percentage BOOLEAN;
  v_disability_discount_value NUMERIC;
  v_disability_discount_percentage BOOLEAN;
  v_prefactura_detalle_id BIGINT;
  v_rubro_consumo INTEGER;
  v_rubro_cargo_fijo INTEGER;
  v_rubro_interes INTEGER;
  v_rubro_seguridad INTEGER;
  v_count INTEGER := 0;
  v_total_lote NUMERIC := 0;
  v_allocations JSONB;
  v_active_replacement_id BIGINT;
  v_active_treatment TEXT;
  v_active_snapshot JSONB;
  v_active_period_origin INTEGER;
  v_active_month_origin INTEGER;
  v_active_period_destination INTEGER;
  v_active_month_destination INTEGER;
  v_active_origin_processed TIMESTAMP(3);
  v_active_destination_processed TIMESTAMP(3);
  v_active_deferred_consumption NUMERIC;
  contrato_row RECORD;
  segment_row RECORD;
  allocation_row RECORD;
BEGIN
  IF v_mes NOT BETWEEN 1 AND 12 THEN
    RAISE EXCEPTION 'Mes de facturación inválido: %', v_mes;
  END IF;

  -- Serialize the logical cycle, including the explicit NULL-route scope.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      p_periodo_id::TEXT || ':' || COALESCE(p_comunidad_id::TEXT, '*') || ':' ||
      v_mes::TEXT || ':' || COALESCE(p_ruta_id::TEXT, 'NULL'), 0
    )
  );

  SELECT lote_id INTO v_lote_id
  FROM lote
  WHERE periodo_id = p_periodo_id
    AND mes = v_mes
    AND comunidad_id = COALESCE(p_comunidad_id, comunidad_id)
    AND ruta_id IS NOT DISTINCT FROM p_ruta_id
    AND borrado_en IS NULL
  ORDER BY lote_id DESC
  LIMIT 1;

  -- A completed retry converges on the existing result instead of duplicating it.
  IF v_lote_id IS NOT NULL THEN
    RETURN v_lote_id;
  END IF;

  -- A destination cycle may not consume a deferred segment before its origin
  -- cycle has established readiness. Raising here avoids creating a partial lot.
  IF EXISTS (
    SELECT 1
    FROM reemplazos_medidor policy
    WHERE policy.periodo_destino_id = p_periodo_id
      AND policy.mes_destino = v_mes
      AND policy.tratamiento_entrante = 'DIFERIR_SIGUIENTE_PERIODO'::"TratamientoEntrante"
      AND policy.estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
      AND policy.origen_procesado_en IS NULL
      AND policy.borrado_en IS NULL
  ) THEN
    RAISE EXCEPTION 'El ciclo destino no puede procesarse antes de que el ciclo origen esté listo';
  END IF;

  SELECT rubro_id INTO v_rubro_consumo
  FROM rubros WHERE codigo_sri = '001' AND borrado_en IS NULL LIMIT 1;
  SELECT rubro_id INTO v_rubro_cargo_fijo
  FROM rubros WHERE codigo_sri = '002' AND borrado_en IS NULL LIMIT 1;
  SELECT rubro_id INTO v_rubro_interes
  FROM rubros WHERE codigo_sri = '003' AND borrado_en IS NULL LIMIT 1;
  SELECT rubro_id INTO v_rubro_seguridad
  FROM rubros WHERE codigo_sri = '004' AND borrado_en IS NULL LIMIT 1;
  IF v_rubro_consumo IS NULL OR v_rubro_cargo_fijo IS NULL
     OR v_rubro_interes IS NULL OR v_rubro_seguridad IS NULL THEN
    RAISE EXCEPTION 'Rubros requeridos 001/002/003/004 no encontrados';
  END IF;

  SELECT COALESCE(cti.porcentaje, 0) / 100 INTO v_consumption_iva_rate
  FROM rubros r
  JOIN catalogo_tarifas_impuesto cti ON cti.id = r.tarifa_impuesto_id
  WHERE r.rubro_id = v_rubro_consumo AND cti.activo
  ORDER BY cti.vigente_desde DESC NULLS LAST LIMIT 1;
  SELECT COALESCE(cti.porcentaje, 0) / 100 INTO v_fixed_iva_rate
  FROM rubros r
  JOIN catalogo_tarifas_impuesto cti ON cti.id = r.tarifa_impuesto_id
  WHERE r.rubro_id = v_rubro_cargo_fijo AND cti.activo
  ORDER BY cti.vigente_desde DESC NULLS LAST LIMIT 1;
  v_consumption_iva_rate := COALESCE(v_consumption_iva_rate, 0);
  v_fixed_iva_rate := COALESCE(v_fixed_iva_rate, 0);
  SELECT COALESCE(cti.porcentaje, 0) / 100 INTO v_interest_iva_rate
  FROM rubros r
  JOIN catalogo_tarifas_impuesto cti ON cti.id = r.tarifa_impuesto_id
  WHERE r.rubro_id = v_rubro_interes AND cti.activo
  ORDER BY cti.vigente_desde DESC NULLS LAST LIMIT 1;
  SELECT COALESCE(cti.porcentaje, 0) / 100 INTO v_security_iva_rate
  FROM rubros r
  JOIN catalogo_tarifas_impuesto cti ON cti.id = r.tarifa_impuesto_id
  WHERE r.rubro_id = v_rubro_seguridad AND cti.activo
  ORDER BY cti.vigente_desde DESC NULLS LAST LIMIT 1;
  v_interest_iva_rate := COALESCE(v_interest_iva_rate, 0);
  v_security_iva_rate := COALESCE(v_security_iva_rate, 0);

  SELECT COALESCE(tasa, 0) INTO v_interest_rate
  FROM parametro_tasa_interes
  WHERE activo
    AND (vigente_desde IS NULL OR vigente_desde <= CURRENT_TIMESTAMP)
    AND (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_TIMESTAMP)
  ORDER BY vigente_desde DESC NULLS LAST LIMIT 1;
  v_interest_rate := COALESCE(v_interest_rate, 0);

  SELECT valor, es_porcentaje
  INTO v_senior_discount_value, v_senior_discount_percentage
  FROM catalogo_descuento
  WHERE tipo_descuento = 'TERCERA_EDAD' AND activo AND aplica_automatico
  LIMIT 1;
  SELECT valor, es_porcentaje
  INTO v_disability_discount_value, v_disability_discount_percentage
  FROM catalogo_descuento
  WHERE tipo_descuento = 'DISCAPACIDAD' AND activo AND aplica_automatico
  LIMIT 1;

  INSERT INTO lote(
    comunidad_id, periodo_id, mes, ruta_id, estado, total_monto,
    total_emisiones, notas, creado_por, creado_en, actualizado_en
  ) VALUES (
    COALESCE(p_comunidad_id, 1), p_periodo_id, v_mes, p_ruta_id,
    'BORRADOR'::"EstadoLote", 0, 0, 'Generando...', p_creado_por,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ) RETURNING lote_id INTO v_lote_id;

  FOR contrato_row IN
    SELECT c.contrato_id, c.direccion_suministro, c.comunidad_id,
      cl.identificacion, cl.email,
      cl.aplica_tercera_edad, cl.aplica_discapacidad,
      CONCAT_WS(' ', cl.nombres, cl.apellidos) AS cliente_nombre,
      ct.nombre AS tarifa_nombre, ct.valor_base,
      COALESCE(ct.consumo_minimo_mensual, 0) AS consumo_minimo_mensual,
      COALESCE(ct.valor_excedente_m3, 0) AS valor_excedente_m3
    FROM contratos c
    JOIN clientes cl ON cl.cliente_id = c.cliente_id AND cl.borrado_en IS NULL
    JOIN categoria_tarifa ct ON ct.categoria_tarifa_id = c.categoria_tarifa_id
    WHERE c.estado = 'ACTIVO'::"EstadoContrato" AND c.borrado_en IS NULL
      AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
  LOOP
    v_lectura_id := NULL;
    IF p_ruta_id IS NULL THEN
      SELECT l.lectura_id, l.lectura_anterior, l.lectura_actual
      INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
      FROM historial_medidores hm
      JOIN lecturas l ON l.medidor_id = hm.medidor_id
      WHERE hm.contrato_id = contrato_row.contrato_id
        AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
        AND l.periodo_id = p_periodo_id
        AND EXTRACT(MONTH FROM l.fecha) = v_mes
        AND l.estado = 'APROBADA'::"EstadoLectura" AND l.borrado_en IS NULL
      ORDER BY l.fecha DESC, l.lectura_id DESC LIMIT 1;
    ELSE
      SELECT l.lectura_id, l.lectura_anterior, l.lectura_actual
      INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
      FROM ordenes_trabajo ot
      JOIN lecturas l ON l.lectura_id = ot.lectura_id
      WHERE ot.contrato_id = contrato_row.contrato_id
        AND ot.ruta_id = p_ruta_id AND ot.borrado_en IS NULL
        AND l.periodo_id = p_periodo_id
        AND EXTRACT(MONTH FROM l.fecha) = v_mes
        AND l.estado = 'APROBADA'::"EstadoLectura" AND l.borrado_en IS NULL
      ORDER BY l.fecha DESC, l.lectura_id DESC LIMIT 1;
    END IF;
    IF v_lectura_id IS NULL THEN CONTINUE; END IF;

    v_current_consumption := GREATEST(0, v_lectura_actual - v_lectura_anterior);
    v_allocations := '[]'::JSONB;

    -- Every closed physical segment belongs to the replacement that closed it.
    -- Its immediate/deferred timing policy belongs to the preceding replacement
    -- that opened that same meter history.
    FOR segment_row IN
      SELECT closing.reemplazo_id,
        opening.reemplazo_id AS policy_replacement_id,
        closing.consumo_facturable_saliente AS quantity,
        closing.tarifa_origen_snapshot AS snapshot,
        opening.tratamiento_entrante::TEXT AS timing,
        opening.periodo_destino_id, opening.mes_destino,
        opening.origen_procesado_en AS policy_origin_ready
      FROM reemplazos_medidor closing
      LEFT JOIN reemplazos_medidor opening
        ON opening.historial_entrante_id = closing.historial_saliente_id
       AND opening.borrado_en IS NULL
      WHERE closing.contrato_id = contrato_row.contrato_id
        AND closing.estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
        AND closing.borrado_en IS NULL
        AND (
          (opening.reemplazo_id IS NULL
            AND closing.origen_procesado_en IS NULL
            AND closing.periodo_origen_id = p_periodo_id AND closing.mes_origen = v_mes)
          OR (opening.tratamiento_entrante = 'FACTURAR_PERIODO_ACTUAL'::"TratamientoEntrante"
            AND closing.origen_procesado_en IS NULL
            AND closing.periodo_origen_id = p_periodo_id AND closing.mes_origen = v_mes)
          OR (opening.tratamiento_entrante = 'DIFERIR_SIGUIENTE_PERIODO'::"TratamientoEntrante"
            AND opening.periodo_destino_id = p_periodo_id AND opening.mes_destino = v_mes
            AND opening.origen_procesado_en IS NOT NULL
            AND opening.destino_procesado_en IS NULL)
        )
      ORDER BY closing.creado_en, closing.reemplazo_id
    LOOP
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'replacementId', segment_row.reemplazo_id,
        'policyReplacementId', segment_row.policy_replacement_id,
        'kind', 'SALIENTE',
        'quantity', segment_row.quantity,
        'unitPrice', COALESCE(
          (segment_row.snapshot->>'valorExcedenteM3')::NUMERIC,
          contrato_row.valor_excedente_m3
        )
      ));
    END LOOP;

    SELECT rm.reemplazo_id, rm.tratamiento_entrante::TEXT,
      rm.tarifa_origen_snapshot, rm.periodo_origen_id, rm.mes_origen,
      rm.periodo_destino_id, rm.mes_destino, rm.origen_procesado_en,
      rm.destino_procesado_en, rm.consumo_diferido_entrante
    INTO v_active_replacement_id, v_active_treatment, v_active_snapshot,
      v_active_period_origin, v_active_month_origin,
      v_active_period_destination, v_active_month_destination,
      v_active_origin_processed, v_active_destination_processed,
      v_active_deferred_consumption
    FROM reemplazos_medidor rm
    JOIN historial_medidores hm ON hm.historial_id = rm.historial_entrante_id
    WHERE rm.contrato_id = contrato_row.contrato_id
      AND hm.fecha_hasta IS NULL AND hm.borrado_en IS NULL
      AND rm.estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
      AND rm.borrado_en IS NULL
    ORDER BY rm.creado_en DESC, rm.reemplazo_id DESC LIMIT 1;

    IF v_active_replacement_id IS NULL THEN
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'kind', 'CURRENT', 'quantity', v_current_consumption,
        'unitPrice', contrato_row.valor_excedente_m3
      ));
    ELSIF v_active_period_origin = p_periodo_id
      AND v_active_month_origin = v_mes
      AND v_active_origin_processed IS NULL
      AND v_active_treatment = 'FACTURAR_PERIODO_ACTUAL' THEN
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'replacementId', v_active_replacement_id,
        'policyReplacementId', v_active_replacement_id,
        'kind', 'ENTRANTE', 'quantity', v_current_consumption,
        'unitPrice', contrato_row.valor_excedente_m3
      ));
    ELSIF v_active_period_origin = p_periodo_id
      AND v_active_month_origin = v_mes
      AND v_active_origin_processed IS NULL THEN
      UPDATE reemplazos_medidor SET
        consumo_medido_entrante = v_current_consumption,
        consumo_diferido_entrante = v_current_consumption,
        consumo_facturable_entrante = 0
      WHERE reemplazo_id = v_active_replacement_id;
    ELSIF v_active_treatment = 'DIFERIR_SIGUIENTE_PERIODO'
      AND v_active_period_destination = p_periodo_id
      AND v_active_month_destination = v_mes
      AND v_active_origin_processed IS NOT NULL
      AND v_active_destination_processed IS NULL THEN
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'replacementId', v_active_replacement_id,
        'policyReplacementId', v_active_replacement_id,
        'kind', 'ENTRANTE_DIFERIDO', 'quantity', v_active_deferred_consumption,
        'unitPrice', COALESCE(
          (v_active_snapshot->>'valorExcedenteM3')::NUMERIC,
          contrato_row.valor_excedente_m3
        )
      ));
      -- The destination month also has its own physical consumption. Keeping it
      -- separate prevents deferred origin volume from replacing current volume.
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'kind', 'CURRENT', 'quantity', v_current_consumption,
        'unitPrice', contrato_row.valor_excedente_m3
      ));
    ELSE
      v_allocations := v_allocations || jsonb_build_array(jsonb_build_object(
        'kind', 'CURRENT', 'quantity', v_current_consumption,
        'unitPrice', contrato_row.valor_excedente_m3
      ));
    END IF;

    v_remaining_minimum := contrato_row.consumo_minimo_mensual;
    v_consumo_total := 0;
    v_consumption_subtotal := 0;
    FOR allocation_row IN
      SELECT * FROM jsonb_to_recordset(v_allocations)
        AS x("replacementId" BIGINT, "policyReplacementId" BIGINT,
             kind TEXT, quantity NUMERIC, "unitPrice" NUMERIC)
    LOOP
      v_quantity := GREATEST(0, allocation_row.quantity);
      v_consumo_total := v_consumo_total + v_quantity;
      v_billable_quantity := GREATEST(0, v_quantity - v_remaining_minimum);
      v_remaining_minimum := GREATEST(0, v_remaining_minimum - v_quantity);
      v_consumption_subtotal := v_consumption_subtotal +
        (v_billable_quantity * allocation_row."unitPrice");
    END LOOP;

    v_fixed_subtotal := contrato_row.valor_base;
    SELECT COALESCE(porcentaje_tasa_seguridad, 0)
    INTO v_security_rate
    FROM comunidades WHERE comunidad_id = contrato_row.comunidad_id;
    v_security_subtotal :=
      (v_fixed_subtotal + v_consumption_subtotal) * (COALESCE(v_security_rate, 0) / 100);

    SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
    INTO v_overdue_balance, v_months_overdue
    FROM prefacturas
    WHERE contrato_id = contrato_row.contrato_id
      AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
      AND (periodo_id < p_periodo_id OR (periodo_id = p_periodo_id AND mes < v_mes))
      AND borrado_en IS NULL;
    SELECT COALESCE(total_pagar - abono, 0)
    INTO v_previous_debt
    FROM prefacturas
    WHERE contrato_id = contrato_row.contrato_id
      AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
      AND (periodo_id < p_periodo_id OR (periodo_id = p_periodo_id AND mes < v_mes))
      AND borrado_en IS NULL
    ORDER BY periodo_id DESC, mes DESC LIMIT 1;
    v_previous_debt := COALESCE(v_previous_debt, 0);
    v_overdue_balance := COALESCE(v_overdue_balance, 0);
    v_months_overdue := COALESCE(v_months_overdue, 0);
    v_interest_subtotal := CASE
      WHEN v_months_overdue > 0 AND v_overdue_balance > 0
      THEN v_overdue_balance * v_interest_rate * v_months_overdue
      ELSE 0 END;

    v_discount := 0;
    IF contrato_row.aplica_tercera_edad AND v_senior_discount_value IS NOT NULL THEN
      v_discount := v_discount + CASE WHEN v_senior_discount_percentage
        THEN v_fixed_subtotal * (v_senior_discount_value / 100)
        ELSE v_senior_discount_value END;
    END IF;
    IF contrato_row.aplica_discapacidad AND v_disability_discount_value IS NOT NULL THEN
      v_discount := v_discount + CASE WHEN v_disability_discount_percentage
        THEN v_fixed_subtotal * (v_disability_discount_value / 100)
        ELSE v_disability_discount_value END;
    END IF;
    v_iva := v_consumption_subtotal * v_consumption_iva_rate +
      v_fixed_subtotal * v_fixed_iva_rate +
      v_interest_subtotal * v_interest_iva_rate +
      v_security_subtotal * v_security_iva_rate;
    v_total := v_fixed_subtotal + v_consumption_subtotal + v_security_subtotal +
      v_interest_subtotal - v_discount + v_iva;

    INSERT INTO prefacturas(
      contrato_id, lote_id, periodo_id, punto_emision_id, lectura_anterior,
      lectura_actual, consumo_m3, subtotal, iva, descuento_total, total_pagar,
      deuda_anterior, saldo_vencido, abono, saldo_actual, meses_atrasado,
      estado, creado_por, interes_mora, cliente_direccion, cliente_email,
      cliente_identificacion, cliente_nombre, tarifa_nombre, tarifa_valor_base,
      tarifa_valor_excedente, lectura_id, mes, tasa_interes_usada,
      creado_en, actualizado_en
    ) VALUES (
      contrato_row.contrato_id, v_lote_id, p_periodo_id, 1,
      v_lectura_anterior, v_lectura_actual, v_consumo_total,
      v_fixed_subtotal + v_consumption_subtotal + v_security_subtotal +
        v_interest_subtotal - v_discount,
      v_iva, v_discount, v_total,
      v_previous_debt, v_overdue_balance, 0, v_total + v_overdue_balance,
      v_months_overdue, 'GENERADA'::"EstadoPrefactura", p_creado_por,
      v_interest_subtotal, contrato_row.direccion_suministro, contrato_row.email,
      contrato_row.identificacion, contrato_row.cliente_nombre,
      contrato_row.tarifa_nombre, contrato_row.valor_base,
      contrato_row.valor_excedente_m3, v_lectura_id, v_mes, v_interest_rate * 100,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ) RETURNING prefactura_id INTO v_prefactura_id;

    INSERT INTO prefactura_detalle(
      prefactura_id, rubro_id, descripcion, cantidad, precio_unitario,
      subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en
    ) VALUES (
      v_prefactura_id, v_rubro_cargo_fijo, 'Cargo Fijo Mensual', 1,
      v_fixed_subtotal, v_fixed_subtotal, v_fixed_subtotal * v_fixed_iva_rate,
      0, v_fixed_subtotal * (1 + v_fixed_iva_rate), v_fixed_iva_rate * 100,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    IF v_security_subtotal > 0 THEN
      INSERT INTO prefactura_detalle(
        prefactura_id, rubro_id, descripcion, cantidad, precio_unitario,
        subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en
      ) VALUES (
        v_prefactura_id, v_rubro_seguridad, 'Tasa de Seguridad Ciudadana', 1,
        v_security_subtotal, v_security_subtotal,
        v_security_subtotal * v_security_iva_rate, 0,
        v_security_subtotal * (1 + v_security_iva_rate), v_security_iva_rate * 100,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    END IF;
    IF v_interest_subtotal > 0 THEN
      INSERT INTO prefactura_detalle(
        prefactura_id, rubro_id, descripcion, cantidad, precio_unitario,
        subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en
      ) VALUES (
        v_prefactura_id, v_rubro_interes,
        'Interés por Mora (' || v_months_overdue || ' meses atrasados)', 1,
        v_interest_subtotal, v_interest_subtotal,
        v_interest_subtotal * v_interest_iva_rate, 0,
        v_interest_subtotal * (1 + v_interest_iva_rate), v_interest_iva_rate * 100,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      );
    END IF;

    v_remaining_minimum := contrato_row.consumo_minimo_mensual;
    FOR allocation_row IN
      SELECT * FROM jsonb_to_recordset(v_allocations)
        AS x("replacementId" BIGINT, "policyReplacementId" BIGINT,
             kind TEXT, quantity NUMERIC, "unitPrice" NUMERIC)
    LOOP
      v_quantity := GREATEST(0, allocation_row.quantity);
      v_billable_quantity := GREATEST(0, v_quantity - v_remaining_minimum);
      v_remaining_minimum := GREATEST(0, v_remaining_minimum - v_quantity);
      INSERT INTO prefactura_detalle(
        prefactura_id, rubro_id, descripcion, cantidad, precio_unitario,
        subtotal, iva, descuento, total, tarifa_impuesto, creado_en, actualizado_en
      ) VALUES (
        v_prefactura_id, v_rubro_consumo,
        'Segmento de consumo ' || allocation_row.kind,
        v_billable_quantity, allocation_row."unitPrice",
        v_billable_quantity * allocation_row."unitPrice",
        v_billable_quantity * allocation_row."unitPrice" * v_consumption_iva_rate,
        0, v_billable_quantity * allocation_row."unitPrice" * (1 + v_consumption_iva_rate),
        v_consumption_iva_rate * 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      ) RETURNING prefactura_detalle_id INTO v_prefactura_detalle_id;

      IF allocation_row."replacementId" IS NOT NULL THEN
        IF allocation_row.kind = 'SALIENTE' THEN
          UPDATE reemplazos_medidor SET
            prefactura_detalle_saliente_id = v_prefactura_detalle_id,
            origen_procesado_en = COALESCE(origen_procesado_en, CURRENT_TIMESTAMP)
          WHERE reemplazo_id = allocation_row."replacementId";
        ELSE
          UPDATE reemplazos_medidor SET
            prefactura_detalle_entrante_id = v_prefactura_detalle_id,
            consumo_facturable_entrante = v_quantity,
            destino_procesado_en = CASE WHEN allocation_row.kind = 'ENTRANTE_DIFERIDO'
              THEN CURRENT_TIMESTAMP ELSE destino_procesado_en END
          WHERE reemplazo_id = allocation_row."replacementId";
        END IF;
      END IF;
      IF allocation_row."policyReplacementId" IS NOT NULL
         AND allocation_row."policyReplacementId" IS DISTINCT FROM allocation_row."replacementId" THEN
        UPDATE reemplazos_medidor SET
          prefactura_detalle_entrante_id = v_prefactura_detalle_id,
          destino_procesado_en = CASE WHEN tratamiento_entrante = 'DIFERIR_SIGUIENTE_PERIODO'::"TratamientoEntrante"
            THEN CURRENT_TIMESTAMP ELSE destino_procesado_en END
        WHERE reemplazo_id = allocation_row."policyReplacementId";
      END IF;
    END LOOP;

    -- Origin readiness is explicit even for zero consumption and deferred rows.
    UPDATE reemplazos_medidor SET origen_procesado_en = CURRENT_TIMESTAMP
    WHERE contrato_id = contrato_row.contrato_id
      AND periodo_origen_id = p_periodo_id AND mes_origen = v_mes
      AND estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
      AND origen_procesado_en IS NULL AND borrado_en IS NULL;

    UPDATE reemplazos_medidor SET estado = 'APLICADA'::"EstadoResolucionConsumo"
    WHERE contrato_id = contrato_row.contrato_id
      AND estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
      AND origen_procesado_en IS NOT NULL
      AND (tratamiento_entrante = 'FACTURAR_PERIODO_ACTUAL'::"TratamientoEntrante"
        OR destino_procesado_en IS NOT NULL)
      AND borrado_en IS NULL;

    v_count := v_count + 1;
    v_total_lote := v_total_lote + v_total;
  END LOOP;

  UPDATE lote SET total_monto = v_total_lote, total_emisiones = v_count,
    notas = 'Completado: ' || CURRENT_TIMESTAMP || ' Total emisiones: ' || v_count,
    actualizado_en = CURRENT_TIMESTAMP
  WHERE lote_id = v_lote_id;
  RETURN v_lote_id;
END;
$$ LANGUAGE plpgsql;
