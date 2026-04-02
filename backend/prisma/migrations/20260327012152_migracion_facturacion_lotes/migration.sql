/*
  Warnings:

  - You are about to drop the column `prefactura_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `total_prefacturas` on the `lote_facturacion` table. All the data in the column will be lost.
  - You are about to drop the `prefactura` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_prefactura_id_fkey";

-- DropForeignKey
ALTER TABLE "prefactura" DROP CONSTRAINT "prefactura_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "prefactura" DROP CONSTRAINT "prefactura_lote_id_fkey";

-- DropIndex
DROP INDEX "facturas_prefactura_id_key";

-- AlterTable
ALTER TABLE "emision_mensual" ADD COLUMN     "lote_id" BIGINT;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "prefactura_id";

-- AlterTable
ALTER TABLE "lote_facturacion" DROP COLUMN "total_prefacturas",
ADD COLUMN     "total_emisiones" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "prefactura";

-- DropEnum
DROP TYPE "EstadoPrefactura";

-- AddForeignKey
ALTER TABLE "emision_mensual" ADD CONSTRAINT "emision_mensual_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_facturacion"("lote_id") ON DELETE SET NULL ON UPDATE CASCADE;
