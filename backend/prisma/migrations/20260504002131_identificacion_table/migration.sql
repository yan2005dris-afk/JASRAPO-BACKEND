/*
  Warnings:

  - You are about to drop the column `tipo_identificacion` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the `novedad_operativa` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoAnomalia" AS ENUM ('FUGA', 'MEDIDOR_DAÑADO', 'LECTURA_ERRONEA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoAnomalia" AS ENUM ('PENDIENTE', 'EN_REVISION', 'RESUELTA', 'DESCARTADA');

-- DropForeignKey
ALTER TABLE "novedad_operativa" DROP CONSTRAINT "novedad_operativa_lectura_id_fkey";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "tipo_identificacion",
ADD COLUMN     "tipo_identificacion_id" BIGINT;

-- DropTable
DROP TABLE "novedad_operativa";

-- DropEnum
DROP TYPE "EstadoNovedad";

-- DropEnum
DROP TYPE "TipoIdentificacion";

-- DropEnum
DROP TYPE "TipoNovedad";

-- CreateTable
CREATE TABLE "catalogo_identificacion" (
    "identificacion_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_identificacion_pkey" PRIMARY KEY ("identificacion_id")
);

-- CreateTable
CREATE TABLE "lectura_anomalia" (
    "anomalia_id" BIGSERIAL NOT NULL,
    "lectura_id" BIGINT NOT NULL,
    "observacion" TEXT,
    "tipo" "TipoAnomalia" NOT NULL,
    "estado" "EstadoAnomalia" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),
    "foto_url_minio" TEXT,

    CONSTRAINT "lectura_anomalia_pkey" PRIMARY KEY ("anomalia_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_identificacion_codigo_key" ON "catalogo_identificacion"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_identificacion_codigo_idx" ON "catalogo_identificacion"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_identificacion_activo_idx" ON "catalogo_identificacion"("activo");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipo_identificacion_id_fkey" FOREIGN KEY ("tipo_identificacion_id") REFERENCES "catalogo_identificacion"("identificacion_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectura_anomalia" ADD CONSTRAINT "lectura_anomalia_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE RESTRICT ON UPDATE CASCADE;
