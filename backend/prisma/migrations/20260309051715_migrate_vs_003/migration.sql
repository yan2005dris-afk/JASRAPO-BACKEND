/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contrato]` on the table `clientes_medidores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cedula` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrato` to the `clientes_medidores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "cedula" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "clientes_medidores" ADD COLUMN     "contrato" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cedula_key" ON "clientes"("cedula");

-- CreateIndex
CREATE INDEX "clientes_nombre_idx" ON "clientes"("nombre");

-- CreateIndex
CREATE INDEX "clientes_deleted_at_idx" ON "clientes"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_medidores_contrato_key" ON "clientes_medidores"("contrato");

-- CreateIndex
CREATE INDEX "clientes_medidores_cliente_id_idx" ON "clientes_medidores"("cliente_id");

-- CreateIndex
CREATE INDEX "clientes_medidores_fecha_retiro_idx" ON "clientes_medidores"("fecha_retiro");
