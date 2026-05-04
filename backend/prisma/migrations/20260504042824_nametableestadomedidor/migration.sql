/*
  Warnings:

  - You are about to drop the `catalogo_estado_medidor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "medidores" DROP CONSTRAINT "medidores_estado_id_fkey";

-- DropTable
DROP TABLE "catalogo_estado_medidor";

-- CreateTable
CREATE TABLE "estado_medidor" (
    "estado_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "estado_medidor_pkey" PRIMARY KEY ("estado_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_medidor_codigo_key" ON "estado_medidor"("codigo");

-- CreateIndex
CREATE INDEX "estado_medidor_codigo_idx" ON "estado_medidor"("codigo");

-- CreateIndex
CREATE INDEX "estado_medidor_activo_idx" ON "estado_medidor"("activo");

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estado_medidor"("estado_id") ON DELETE SET NULL ON UPDATE CASCADE;
