/*
  Warnings:

  - You are about to drop the column `factura_detalle_id` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the `factura_detalle` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "EstadoPrefactura" ADD VALUE 'PAGADA';

-- DropForeignKey
ALTER TABLE "descuento_detalle" DROP CONSTRAINT "descuento_detalle_factura_detalle_id_fkey";

-- DropForeignKey
ALTER TABLE "factura_detalle" DROP CONSTRAINT "factura_detalle_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "factura_detalle" DROP CONSTRAINT "factura_detalle_rubro_id_fkey";

-- DropIndex
DROP INDEX "descuento_detalle_factura_detalle_id_idx";

-- AlterTable
ALTER TABLE "descuento_detalle" DROP COLUMN "factura_detalle_id";

-- DropTable
DROP TABLE "factura_detalle";
