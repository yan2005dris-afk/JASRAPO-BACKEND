-- Compatibility bridge: contract lifecycle decisions now use estado_servicio.
-- Previous migration files remain immutable; this migration replaces only the
-- currently installed function definitions in-place and keeps contratos.estado.

DO $$
DECLARE
  function_definition TEXT;
BEGIN
  SELECT pg_get_functiondef(
    'public.inicializar_lecturas_ruta(integer,integer,timestamp without time zone,integer)'::regprocedure
  ) INTO function_definition;
  function_definition := replace(
    function_definition,
    'c.estado = ''ACTIVO''',
    'c.estado_servicio = ''ACTIVO'''
  );
  EXECUTE function_definition;

  SELECT pg_get_functiondef(
    'public.generar_prefacturas_lote(integer,integer,text,integer,bigint)'::regprocedure
  ) INTO function_definition;
  function_definition := replace(
    function_definition,
    'c.estado = ''ACTIVO''::"EstadoContrato"',
    'c.estado_servicio = ''ACTIVO''::"EstadoServicioContrato"'
  );
  EXECUTE function_definition;

  SELECT pg_get_functiondef(
    'public.generar_prefactura_instalacion(bigint,text)'::regprocedure
  ) INTO function_definition;
  function_definition := replace(
    function_definition,
    'c.estado,',
    'c.estado_servicio AS estado,'
  );
  function_definition := replace(
    function_definition,
    'v_contrato.estado <> ''PENDIENTE_PAGO''::"EstadoContrato"',
    'v_contrato.estado <> ''PENDIENTE_PAGO''::"EstadoServicioContrato"'
  );
  EXECUTE function_definition;
END $$;
