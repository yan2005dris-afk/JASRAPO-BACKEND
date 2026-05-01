/*
  Warnings:

  - You are about to drop the column `aplica_terceraedad_discapacidad` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `es_perfil_validado` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion_anomalia` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `cambio` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `impuesto_id` on the `prefactura_detalle` table. All the data in the column will be lost.
  - You are about to drop the `abono_cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_origen_abono` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `comunidad_id` to the `contratos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoOrigenAbono" AS ENUM ('PAGO_EXCESO', 'AJUSTE_RECLAMO', 'NOTA_CREDITO', 'OTROS');

-- DropForeignKey
ALTER TABLE "abono_cliente" DROP CONSTRAINT "abono_cliente_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "abono_cliente" DROP CONSTRAINT "abono_cliente_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "abono_cliente" DROP CONSTRAINT "abono_cliente_tipo_origen_id_fkey";

-- DropForeignKey
ALTER TABLE "prefactura_detalle" DROP CONSTRAINT "prefactura_detalle_impuesto_id_fkey";

-- DropIndex
DROP INDEX "prefactura_detalle_impuesto_id_idx";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "aplica_terceraedad_discapacidad",
DROP COLUMN "es_perfil_validado",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "aplica_discapacidad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aplica_tercera_edad" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "contratos" ADD COLUMN     "comunidad_id" INTEGER NOT NULL,
ALTER COLUMN "sector_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "descripcion_anomalia";

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "cambio";

-- AlterTable
ALTER TABLE "prefactura_detalle" DROP COLUMN "impuesto_id";

-- DropTable
DROP TABLE "abono_cliente";

-- DropTable
DROP TABLE "tipo_origen_abono";

-- CreateTable
CREATE TABLE "saldo_favor_cliente" (
    "saldo_favor_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "pago_id" BIGINT,
    "monto_saldo" DECIMAL NOT NULL,
    "tipo_origen" "TipoOrigenAbono" NOT NULL,
    "disponible_para_aplicar" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "saldo_favor_cliente_pkey" PRIMARY KEY ("saldo_favor_id")
);

-- CreateIndex
CREATE INDEX "saldo_favor_cliente_cliente_id_idx" ON "saldo_favor_cliente"("cliente_id");

-- CreateIndex
CREATE INDEX "saldo_favor_cliente_pago_id_idx" ON "saldo_favor_cliente"("pago_id");

-- CreateIndex
CREATE INDEX "saldo_favor_cliente_borrado_en_idx" ON "saldo_favor_cliente"("borrado_en");

-- CreateIndex
CREATE INDEX "contratos_comunidad_id_idx" ON "contratos"("comunidad_id");

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_favor_cliente" ADD CONSTRAINT "saldo_favor_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo_favor_cliente" ADD CONSTRAINT "saldo_favor_cliente_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE SET NULL ON UPDATE CASCADE;
