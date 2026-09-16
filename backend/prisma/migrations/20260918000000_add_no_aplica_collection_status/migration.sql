-- Collection status is not applicable until the service is active.
CREATE TYPE "EstadoCobranzaContrato_new" AS ENUM ('NO_APLICA', 'AL_DIA', 'EN_MORA');

ALTER TABLE "contratos"
ALTER COLUMN "estado_cobranza" DROP DEFAULT;

ALTER TABLE "contratos"
ALTER COLUMN "estado_cobranza" TYPE "EstadoCobranzaContrato_new"
USING "estado_cobranza"::text::"EstadoCobranzaContrato_new";

DROP TYPE "EstadoCobranzaContrato";
ALTER TYPE "EstadoCobranzaContrato_new" RENAME TO "EstadoCobranzaContrato";

UPDATE "contratos"
SET "estado_cobranza" = 'NO_APLICA'
WHERE "estado_servicio" IN ('PENDIENTE_PAGO', 'PENDIENTE_INSTALACION');

ALTER TABLE "contratos"
ALTER COLUMN "estado_cobranza" SET DEFAULT 'NO_APLICA';
