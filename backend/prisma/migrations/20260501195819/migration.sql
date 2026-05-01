/*
  Warnings:

  - You are about to drop the column `forma_pago_id` on the `facturas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_forma_pago_id_fkey";

-- DropIndex
DROP INDEX "facturas_forma_pago_id_idx";

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "forma_pago_id";
