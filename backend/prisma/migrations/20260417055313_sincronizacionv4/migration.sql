/*
  Warnings:

  - A unique constraint covering the columns `[contrato_id]` on the table `medidores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "medidores_contrato_id_key" ON "medidores"("contrato_id");
