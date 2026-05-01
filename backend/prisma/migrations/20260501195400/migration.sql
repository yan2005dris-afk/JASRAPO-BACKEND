/*
  Warnings:

  - You are about to drop the column `prefactura_detalle_id` on the `descuento_detalle` table. All the data in the column will be lost.
  - Made the column `prefactura_id` on table `descuento_detalle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "descuento_detalle" DROP CONSTRAINT "descuento_detalle_prefactura_detalle_id_fkey";

-- DropIndex
DROP INDEX "descuento_detalle_prefactura_detalle_id_idx";

-- AlterTable
ALTER TABLE "descuento_detalle" DROP COLUMN "prefactura_detalle_id",
ALTER COLUMN "prefactura_id" SET NOT NULL;
