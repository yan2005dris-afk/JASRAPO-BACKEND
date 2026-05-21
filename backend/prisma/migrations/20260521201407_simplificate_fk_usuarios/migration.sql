/*
  Warnings:

  - You are about to drop the column `usuario_id` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `estado_id` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the `estado_medidor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creado_por` to the `caja_sesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creado_por` to the `pagos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoMedidor" AS ENUM ('BODEGA', 'INSTALADO', 'DANADO', 'PENDIENTE', 'BAJA');

-- DropForeignKey
ALTER TABLE "caja_sesion" DROP CONSTRAINT "caja_sesion_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "descuento_detalle" DROP CONSTRAINT "descuento_detalle_autorizado_por_fkey";

-- DropForeignKey
ALTER TABLE "lote" DROP CONSTRAINT "lote_creado_por_fkey";

-- DropForeignKey
ALTER TABLE "medidores" DROP CONSTRAINT "medidores_estado_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_usuario_id_fkey";

-- DropIndex
DROP INDEX "caja_sesion_usuario_id_idx";

-- DropIndex
DROP INDEX "pagos_usuario_id_idx";

-- AlterTable
ALTER TABLE "caja_sesion" DROP COLUMN "usuario_id",
ADD COLUMN     "creado_por" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "descuento_detalle" ALTER COLUMN "autorizado_por" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "lote" ALTER COLUMN "creado_por" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "estado_id",
ADD COLUMN     "estado" "EstadoMedidor" NOT NULL DEFAULT 'BODEGA';

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "usuario_id",
ADD COLUMN     "creado_por" TEXT NOT NULL;

-- DropTable
DROP TABLE "estado_medidor";

-- CreateIndex
CREATE INDEX "caja_sesion_creado_por_idx" ON "caja_sesion"("creado_por");

-- CreateIndex
CREATE INDEX "lote_creado_por_idx" ON "lote"("creado_por");

-- CreateIndex
CREATE INDEX "pagos_creado_por_idx" ON "pagos"("creado_por");
