-- Additive bridge: retain contratos.estado until downstream flows migrate.
CREATE TYPE "EstadoServicioContrato" AS ENUM (
  'PENDIENTE_PAGO',
  'PENDIENTE_INSTALACION',
  'ACTIVO',
  'SUSPENDIDO',
  'RETIRADO'
);

CREATE TYPE "EstadoCobranzaContrato" AS ENUM (
  'AL_DIA',
  'EN_MORA',
  'EN_CONVENIO'
);

ALTER TABLE "contratos"
  ADD COLUMN "estado_servicio" "EstadoServicioContrato" NOT NULL DEFAULT 'PENDIENTE_PAGO',
  ADD COLUMN "estado_cobranza" "EstadoCobranzaContrato" NOT NULL DEFAULT 'AL_DIA';

-- Backfill the bridge columns from the legacy mixed state before new rows use the defaults.
UPDATE "contratos"
SET
  "estado_servicio" = CASE "estado"
    WHEN 'PENDIENTE_INSTALACION' THEN 'PENDIENTE_INSTALACION'
    WHEN 'ACTIVO' THEN 'ACTIVO'
    WHEN 'EN_MORA' THEN 'ACTIVO'
    WHEN 'ORDEN_CORTE' THEN 'SUSPENDIDO'
    WHEN 'SUSPENDIDO' THEN 'SUSPENDIDO'
    WHEN 'EN_CONVENIO' THEN 'ACTIVO'
    WHEN 'RETIRADO' THEN 'RETIRADO'
    WHEN 'RECONEXION' THEN 'SUSPENDIDO'
    ELSE 'PENDIENTE_PAGO'
  END::"EstadoServicioContrato",
  "estado_cobranza" = CASE "estado"
    WHEN 'EN_MORA' THEN 'EN_MORA'
    WHEN 'EN_CONVENIO' THEN 'EN_CONVENIO'
    ELSE 'AL_DIA'
  END::"EstadoCobranzaContrato";
