/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `prefacturas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "prefacturas" DROP CONSTRAINT "prefacturas_cliente_id_fkey";

-- DropIndex
DROP INDEX "prefacturas_cliente_id_idx";

-- AlterTable
ALTER TABLE "prefacturas" DROP COLUMN "cliente_id";
