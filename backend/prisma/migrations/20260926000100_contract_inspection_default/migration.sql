-- No modifica los estados de los contratos históricos.
ALTER TABLE "contratos" ALTER COLUMN "estado_servicio" SET DEFAULT 'PENDIENTE_INSPECCION'::"EstadoServicioContrato";
