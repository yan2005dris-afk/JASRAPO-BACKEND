-- SC-328: the automatic senior/disability discount only applies when consumption
-- does not exceed the category base consumption (v_excedente = 0), and it is
-- recorded in descuento_detalle so the pre-invoice can itemize the legal subsidy.
DO $$
DECLARE
  routine_signature REGPROCEDURE;
  routine_definition TEXT;
  anchors TEXT[];
  replacements TEXT[];
  occurrences INTEGER;
  i INTEGER;
BEGIN
  routine_signature := to_regprocedure(
    'public.generar_prefacturas_lote(integer,integer,text,integer,bigint)'
  );
  IF routine_signature IS NULL THEN
    RAISE EXCEPTION 'generar_prefacturas_lote does not exist';
  END IF;

  SELECT pg_get_functiondef(routine_signature) INTO routine_definition;

  anchors := ARRAY[
    'v_prefactura_detalle_consumo_id BIGINT;',
    'IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_valor IS NOT NULL THEN',
    'IF contrato_row.aplica_discapacidad AND v_descuento_disc_valor IS NOT NULL THEN',
    '-- Insertar PrefacturaDetalle: Cargo Fijo',
    '(v_iva_cargo_fijo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
    '-- Insertar PrefacturaDetalle: Consumo Excedente de Agua'
  ];

  replacements := ARRAY[
    E'v_prefactura_detalle_consumo_id BIGINT;\n    v_cargo_fijo_detalle_id BIGINT;',
    'IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_valor IS NOT NULL AND v_excedente <= 0 THEN',
    'IF contrato_row.aplica_discapacidad AND v_descuento_disc_valor IS NOT NULL AND v_excedente <= 0 THEN',
    E'v_cargo_fijo_detalle_id := NULL;\n\n        -- Insertar PrefacturaDetalle: Cargo Fijo',
    E'(v_iva_cargo_fijo * 100), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)\n            RETURNING prefactura_detalle_id INTO v_cargo_fijo_detalle_id;',
    E'-- Record the legal discount on the fixed charge\n'
    || E'        IF v_cargo_fijo_detalle_id IS NOT NULL THEN\n'
    || E'            IF contrato_row.aplica_tercera_edad AND v_descuento_tercera_valor IS NOT NULL AND v_excedente <= 0 THEN\n'
    || E'                INSERT INTO descuento_detalle (prefactura_detalle_id, catalogo_descuento_id, monto_descontado, es_porcentaje, valor_applied, motivo, creado_en)\n'
    || E'                VALUES (\n'
    || E'                    v_cargo_fijo_detalle_id,\n'
    || E'                    v_descuento_tercera_id,\n'
    || E'                    CASE WHEN v_descuento_tercera_pct THEN ROUND((v_cargo_fijo * (v_descuento_tercera_valor / 100)), 2) ELSE v_descuento_tercera_valor END,\n'
    || E'                    v_descuento_tercera_pct,\n'
    || E'                    v_descuento_tercera_valor,\n'
    || E'                    ''Descuento automático por beneficio de tercera edad'',\n'
    || E'                    CURRENT_TIMESTAMP\n'
    || E'                );\n'
    || E'            END IF;\n'
    || E'            IF contrato_row.aplica_discapacidad AND v_descuento_disc_valor IS NOT NULL AND v_excedente <= 0 THEN\n'
    || E'                INSERT INTO descuento_detalle (prefactura_detalle_id, catalogo_descuento_id, monto_descontado, es_porcentaje, valor_applied, motivo, creado_en)\n'
    || E'                VALUES (\n'
    || E'                    v_cargo_fijo_detalle_id,\n'
    || E'                    v_descuento_disc_id,\n'
    || E'                    CASE WHEN v_descuento_disc_pct THEN ROUND((v_cargo_fijo * (v_descuento_disc_valor / 100)), 2) ELSE v_descuento_disc_valor END,\n'
    || E'                    v_descuento_disc_pct,\n'
    || E'                    v_descuento_disc_valor,\n'
    || E'                    ''Descuento automático por beneficio de discapacidad'',\n'
    || E'                    CURRENT_TIMESTAMP\n'
    || E'                );\n'
    || E'            END IF;\n'
    || E'        END IF;\n\n'
    || E'        -- Insertar PrefacturaDetalle: Consumo Excedente de Agua'
  ];

  FOR i IN 1 .. array_length(anchors, 1) LOOP
    occurrences := (length(routine_definition) - length(replace(routine_definition, anchors[i], '')))
      / length(anchors[i]);
    IF occurrences <> 1 THEN
      RAISE EXCEPTION 'generar_prefacturas_lote: anchor "%" found % times (expected 1)',
        anchors[i], occurrences;
    END IF;
    routine_definition := replace(routine_definition, anchors[i], replacements[i]);
  END LOOP;

  EXECUTE routine_definition;
END $$;
