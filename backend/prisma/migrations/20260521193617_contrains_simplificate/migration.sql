/*
  Warnings:

  - You are about to drop the column `contrato_id` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `contrato_id` on the `medidores` table. All the data in the column will be lost.
  - Made the column `medidor_id` on table `lecturas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "lecturas" DROP CONSTRAINT "lecturas_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "medidores" DROP CONSTRAINT "medidores_contrato_id_fkey";

-- DropIndex
DROP INDEX "lecturas_contrato_id_fecha_idx";

-- DropIndex
DROP INDEX "lecturas_contrato_id_periodo_id_idx";

-- DropIndex
DROP INDEX "medidores_contrato_id_key";

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "contrato_id",
ALTER COLUMN "medidor_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "contrato_id";

-- CreateIndex
CREATE INDEX "lecturas_periodo_id_idx" ON "lecturas"("periodo_id");
