-- CreateTable
-- Contador y configuración del código correlativo de medidores.
-- Tabla de una sola fila: mantiene la secuencia vigente de forma auditable.
CREATE TABLE "secuencia_medidor" (
    "secuencia_medidor_id" SERIAL NOT NULL,
    "prefijo" TEXT NOT NULL DEFAULT 'MED',
    "longitud" INTEGER NOT NULL DEFAULT 6,
    "ultimo_valor" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secuencia_medidor_pkey" PRIMARY KEY ("secuencia_medidor_id")
);

-- AlterTable
ALTER TABLE "medidores" ADD COLUMN "codigo" TEXT;

-- Semilla del contador (fila única).
INSERT INTO "secuencia_medidor" ("prefijo", "longitud", "ultimo_valor", "actualizado_en")
VALUES ('MED', 6, 0, CURRENT_TIMESTAMP);

-- Backfill: asigna código a los medidores ya existentes respetando el orden de
-- alta, para que la numeración histórica sea estable y reproducible.
WITH numerados AS (
    SELECT
        "medidor_id",
        ROW_NUMBER() OVER (ORDER BY "medidor_id") AS correlativo
    FROM "medidores"
)
UPDATE "medidores" m
SET "codigo" = 'MED-' || LPAD(n.correlativo::TEXT, 6, '0')
FROM numerados n
WHERE m."medidor_id" = n."medidor_id";

-- Deja el contador en el último valor entregado por el backfill.
UPDATE "secuencia_medidor"
SET "ultimo_valor" = (SELECT COUNT(*) FROM "medidores")::INTEGER,
    "actualizado_en" = CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "medidores_codigo_key" ON "medidores"("codigo");
