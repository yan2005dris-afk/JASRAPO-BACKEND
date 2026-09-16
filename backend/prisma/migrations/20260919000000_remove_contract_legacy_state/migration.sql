-- Final contract-state cutover.
-- Replace the latest installed routines before removing the column they read.
DO $$
DECLARE
  routine_definition TEXT;
  routine_signature REGPROCEDURE;
  routine_name TEXT;
BEGIN
  FOREACH routine_name IN ARRAY ARRAY[
    'public.inicializar_lecturas_ruta(integer,integer,timestamp without time zone,integer,bigint)',
    'public.generar_prefacturas_lote(integer,integer,text,integer,bigint)',
    'public.generar_prefactura_instalacion(bigint,text)'
  ] LOOP
    BEGIN
      routine_signature := to_regprocedure(routine_name);
      IF routine_signature IS NULL THEN
        CONTINUE;
      END IF;
      SELECT pg_get_functiondef(routine_signature) INTO routine_definition;

      routine_definition := replace(
        routine_definition,
        'c.estado = ''ACTIVO''::"EstadoContrato"',
        'c.estado_servicio = ''ACTIVO''::"EstadoServicioContrato"'
      );
      routine_definition := replace(
        routine_definition,
        'c.estado = ''ACTIVO''',
        'c.estado_servicio = ''ACTIVO'''
      );
      routine_definition := replace(routine_definition, 'c.estado,', 'c.estado_servicio,');
      routine_definition := replace(
        routine_definition,
        'v_contrato.estado <> ''PENDIENTE_PAGO''::"EstadoContrato"',
        'v_contrato.estado <> ''PENDIENTE_PAGO''::"EstadoServicioContrato"'
      );

      -- Do not search for the bare prefix: `c.estado_servicio` contains it.
      IF routine_definition ~
        $regex$c\.estado[[:space:]]*(=|,|\)|::)$regex$
        OR routine_definition ~ $regex$v_contrato\.estado[[:space:]]*(=|,|\)|::)$regex$
      THEN
        RAISE EXCEPTION 'Routine % still references contratos.estado', routine_name;
      END IF;

      EXECUTE routine_definition;
    END;
  END LOOP;
END $$;

ALTER TABLE "contratos" DROP COLUMN IF EXISTS "estado";
DROP TYPE IF EXISTS "EstadoContrato";
