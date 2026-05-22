/*
  Warnings:

  - You are about to drop the column `estado_id` on the `lote` table. All the data in the column will be lost.
  - You are about to drop the `estado_lote` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('BORRADOR', 'DEFINITIVO', 'ENVIADO');

-- DropForeignKey
ALTER TABLE "lote" DROP CONSTRAINT "lote_estado_id_fkey";

-- AlterTable
ALTER TABLE "lote" DROP COLUMN "estado_id",
ADD COLUMN     "estado" "EstadoLote" NOT NULL DEFAULT 'BORRADOR';

-- DropTable
DROP TABLE "estado_lote";
