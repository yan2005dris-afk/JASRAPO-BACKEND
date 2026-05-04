/*
  Warnings:

  - You are about to drop the column `estado` on the `medidores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "estado",
ADD COLUMN     "estado_id" BIGINT;

-- DropEnum
DROP TYPE "EstadoMedidor";

-- CreateTable
CREATE TABLE "catalogo_estado_medidor" (
    "estado_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_estado_medidor_pkey" PRIMARY KEY ("estado_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_estado_medidor_codigo_key" ON "catalogo_estado_medidor"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_estado_medidor_codigo_idx" ON "catalogo_estado_medidor"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_estado_medidor_activo_idx" ON "catalogo_estado_medidor"("activo");

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "catalogo_estado_medidor"("estado_id") ON DELETE SET NULL ON UPDATE CASCADE;
