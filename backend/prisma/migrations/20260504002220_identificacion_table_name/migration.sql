/*
  Warnings:

  - You are about to drop the `catalogo_identificacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_tipo_identificacion_id_fkey";

-- DropTable
DROP TABLE "catalogo_identificacion";

-- CreateTable
CREATE TABLE "identificacion" (
    "identificacion_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identificacion_pkey" PRIMARY KEY ("identificacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identificacion_codigo_key" ON "identificacion"("codigo");

-- CreateIndex
CREATE INDEX "identificacion_codigo_idx" ON "identificacion"("codigo");

-- CreateIndex
CREATE INDEX "identificacion_activo_idx" ON "identificacion"("activo");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipo_identificacion_id_fkey" FOREIGN KEY ("tipo_identificacion_id") REFERENCES "identificacion"("identificacion_id") ON DELETE SET NULL ON UPDATE CASCADE;
