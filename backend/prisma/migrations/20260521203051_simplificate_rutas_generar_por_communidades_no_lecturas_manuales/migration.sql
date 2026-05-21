/*
  Warnings:

  - You are about to drop the column `ruta_asignada_id` on the `lecturas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "lecturas" DROP CONSTRAINT "lecturas_ruta_asignada_id_fkey";

-- DropIndex
DROP INDEX "lecturas_ruta_asignada_id_idx";

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "ruta_asignada_id";
