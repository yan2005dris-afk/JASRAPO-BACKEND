/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `convenios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "convenios" DROP CONSTRAINT "convenios_cliente_id_fkey";

-- DropIndex
DROP INDEX "convenios_cliente_id_idx";

-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "cliente_id";
