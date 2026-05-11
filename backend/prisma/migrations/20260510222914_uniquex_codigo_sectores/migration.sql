/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `sectores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "sectores_codigo_key" ON "sectores"("codigo");
