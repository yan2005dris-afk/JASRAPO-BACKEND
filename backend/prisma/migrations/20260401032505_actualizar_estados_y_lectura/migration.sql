/*
  Warnings:

  - Changed the type of `estado` on the `novedad_operativa` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoNovedad" AS ENUM ('PENDIENTE', 'EN_REVISION', 'RESUELTA', 'DESCARTADA');

-- AlterTable
ALTER TABLE "lecturas" ADD COLUMN     "modifica_lectura_inicial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "novedad_operativa" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoNovedad" NOT NULL;
