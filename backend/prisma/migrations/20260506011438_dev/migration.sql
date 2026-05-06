/*
  Warnings:

  - You are about to drop the column `estado` on the `lote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `estado_lote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "lote" DROP CONSTRAINT "lote_estado_id_fkey";

-- AlterTable
ALTER TABLE "estado_lote" ALTER COLUMN "codigo" SET DATA TYPE TEXT,
ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "actualizado_en" DROP DEFAULT;

-- AlterTable
ALTER TABLE "lote" DROP COLUMN "estado",
ALTER COLUMN "estado_id" SET DEFAULT 1;

-- DropEnum
DROP TYPE "EstadoLote";

-- CreateIndex
CREATE UNIQUE INDEX "estado_lote_codigo_key" ON "estado_lote"("codigo");

-- CreateIndex
CREATE INDEX "estado_lote_codigo_idx" ON "estado_lote"("codigo");

-- CreateIndex
CREATE INDEX "estado_lote_activo_idx" ON "estado_lote"("activo");

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estado_lote"("estado_id") ON DELETE RESTRICT ON UPDATE CASCADE;
