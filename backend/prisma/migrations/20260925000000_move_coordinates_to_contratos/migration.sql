-- AlterTable
ALTER TABLE "contratos" ADD COLUMN "latitud" DECIMAL(10,8),
ADD COLUMN "longitud" DECIMAL(11,8);

-- Backfill: copy the pair from the meter linked through the open historial row
UPDATE "contratos" c
SET "latitud" = m."latitud",
    "longitud" = m."longitud"
FROM "historial_medidores" h
JOIN "medidores" m ON m."medidor_id" = h."medidor_id"
WHERE h."contrato_id" = c."contrato_id"
  AND h."fecha_hasta" IS NULL
  AND h."borrado_en" IS NULL
  AND m."latitud" BETWEEN -90 AND 90
  AND m."longitud" BETWEEN -180 AND 180;

-- AddCheckConstraint
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_coordenadas_chk" CHECK (
  ("latitud" IS NULL AND "longitud" IS NULL)
  OR ("latitud" IS NOT NULL AND "longitud" IS NOT NULL
    AND "latitud" BETWEEN -90 AND 90 AND "longitud" BETWEEN -180 AND 180)
);

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "latitud",
DROP COLUMN "longitud";
