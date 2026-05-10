/*
  Warnings:

  - You are about to drop the column `estado_convenio` on the `convenios` table. All the data in the column will be lost.
  - You are about to alter the column `abono_inicial` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `deuda_total` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `monto_pagado_actual` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to drop the column `estado_convenio` on the `cuota_convenio` table. All the data in the column will be lost.
  - You are about to alter the column `valor_cuota` on the `cuota_convenio` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `monto_pagado` on the `cuota_convenio` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `interes_mora_aplicado` on the `cuota_convenio` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `saldo_pendiente` on the `cuota_convenio` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - Added the required column `estado_convenio_id` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado_cuota_convenio_id` to the `cuota_convenio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "estado_convenio",
ADD COLUMN     "estado_convenio_id" BIGINT NOT NULL,
ALTER COLUMN "abono_inicial" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "deuda_total" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "monto_pagado_actual" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "cuota_convenio" DROP COLUMN "estado_convenio",
ADD COLUMN     "estado_cuota_convenio_id" BIGINT NOT NULL,
ALTER COLUMN "valor_cuota" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "monto_pagado" SET DEFAULT 0,
ALTER COLUMN "monto_pagado" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "dias_retraso" SET DEFAULT 0,
ALTER COLUMN "interes_mora_aplicado" SET DEFAULT 0,
ALTER COLUMN "interes_mora_aplicado" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "saldo_pendiente" SET DATA TYPE DECIMAL(18,2);

-- DropEnum
DROP TYPE "EstadoConvenio";

-- CreateTable
CREATE TABLE "estado_convenio" (
    "estado_convenio_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_convenio_pkey" PRIMARY KEY ("estado_convenio_id")
);

-- CreateTable
CREATE TABLE "estado_cuota_convenio" (
    "estado_cuota_convenio_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_cuota_convenio_pkey" PRIMARY KEY ("estado_cuota_convenio_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_convenio_codigo_key" ON "estado_convenio"("codigo");

-- CreateIndex
CREATE INDEX "estado_convenio_codigo_idx" ON "estado_convenio"("codigo");

-- CreateIndex
CREATE INDEX "estado_convenio_activo_idx" ON "estado_convenio"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "estado_cuota_convenio_codigo_key" ON "estado_cuota_convenio"("codigo");

-- CreateIndex
CREATE INDEX "estado_cuota_convenio_codigo_idx" ON "estado_cuota_convenio"("codigo");

-- CreateIndex
CREATE INDEX "estado_cuota_convenio_activo_idx" ON "estado_cuota_convenio"("activo");

-- CreateIndex
CREATE INDEX "convenios_estado_convenio_id_idx" ON "convenios"("estado_convenio_id");

-- CreateIndex
CREATE INDEX "cuota_convenio_estado_cuota_convenio_id_idx" ON "cuota_convenio"("estado_cuota_convenio_id");

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_estado_convenio_id_fkey" FOREIGN KEY ("estado_convenio_id") REFERENCES "estado_convenio"("estado_convenio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuota_convenio" ADD CONSTRAINT "cuota_convenio_estado_cuota_convenio_id_fkey" FOREIGN KEY ("estado_cuota_convenio_id") REFERENCES "estado_cuota_convenio"("estado_cuota_convenio_id") ON DELETE RESTRICT ON UPDATE CASCADE;
