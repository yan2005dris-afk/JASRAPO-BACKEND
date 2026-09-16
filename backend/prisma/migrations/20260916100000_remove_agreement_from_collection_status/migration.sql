-- Transitional decoupling: an agreement is metadata, not current-service debt.
-- Normalize the old marker before replacing the PostgreSQL enum. This does not
-- allocate historical agreement debt into service invoices; the collection
-- evaluator recalculates current-service debt from eligible Prefacturas.
BEGIN;

UPDATE "contratos"
SET "estado_cobranza" = 'AL_DIA'
WHERE "estado_cobranza" = 'EN_CONVENIO';

ALTER TABLE "contratos"
  ALTER COLUMN "estado_cobranza" DROP DEFAULT;

CREATE TYPE "EstadoCobranzaContrato_new" AS ENUM ('AL_DIA', 'EN_MORA');

ALTER TABLE "contratos"
  ALTER COLUMN "estado_cobranza" TYPE "EstadoCobranzaContrato_new"
  USING "estado_cobranza"::text::"EstadoCobranzaContrato_new";

DROP TYPE "EstadoCobranzaContrato";
ALTER TYPE "EstadoCobranzaContrato_new" RENAME TO "EstadoCobranzaContrato";

ALTER TABLE "contratos"
  ALTER COLUMN "estado_cobranza" SET DEFAULT 'AL_DIA';

COMMIT;
