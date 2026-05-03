/*
  Warnings:

  - You are about to drop the column `motivo_baja` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `motivo_cambio` on the `medidores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "motivo_baja",
DROP COLUMN "motivo_cambio",
ADD COLUMN     "motivo" TEXT;
