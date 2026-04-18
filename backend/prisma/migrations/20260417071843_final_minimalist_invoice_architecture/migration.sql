/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `descuento_total` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `interes_mora` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `iva` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `periodo_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `punto_emision_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `total_pagar` on the `facturas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tipo_comprobante_id,secuencial]` on the table `facturas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_punto_emision_id_fkey";

-- DropIndex
DROP INDEX "facturas_cliente_id_idx";

-- DropIndex
DROP INDEX "facturas_periodo_id_idx";

-- DropIndex
DROP INDEX "facturas_punto_emision_id_idx";

-- DropIndex
DROP INDEX "facturas_punto_emision_id_tipo_comprobante_id_secuencial_key";

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "cliente_id",
DROP COLUMN "descuento_total",
DROP COLUMN "interes_mora",
DROP COLUMN "iva",
DROP COLUMN "periodo_id",
DROP COLUMN "punto_emision_id",
DROP COLUMN "subtotal",
DROP COLUMN "total_pagar";

-- CreateIndex
CREATE UNIQUE INDEX "facturas_tipo_comprobante_id_secuencial_key" ON "facturas"("tipo_comprobante_id", "secuencial");
