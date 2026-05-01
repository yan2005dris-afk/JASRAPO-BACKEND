/*
  Warnings:

  - You are about to drop the `notas_credito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_credito_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_debito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_debito_motivo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `retencion_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `retenciones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito_detalle" DROP CONSTRAINT "notas_credito_detalle_nota_credito_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_forma_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito_motivo" DROP CONSTRAINT "notas_debito_motivo_nota_debito_id_fkey";

-- DropForeignKey
ALTER TABLE "retencion_detalle" DROP CONSTRAINT "retencion_detalle_retencion_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_tipo_comprobante_id_fkey";

-- AlterTable
ALTER TABLE "cuota_convenio" ADD COLUMN     "saldo_pendiente" DECIMAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "lecturas" ADD COLUMN     "medidor_id" BIGINT;

-- AlterTable
ALTER TABLE "prefacturas" ADD COLUMN     "tarifa_nombre" TEXT,
ADD COLUMN     "tarifa_valor_base" DECIMAL,
ADD COLUMN     "tarifa_valor_excedente" DECIMAL;

-- DropTable
DROP TABLE "notas_credito";

-- DropTable
DROP TABLE "notas_credito_detalle";

-- DropTable
DROP TABLE "notas_debito";

-- DropTable
DROP TABLE "notas_debito_motivo";

-- DropTable
DROP TABLE "retencion_detalle";

-- DropTable
DROP TABLE "retenciones";

-- CreateIndex
CREATE INDEX "lecturas_medidor_id_idx" ON "lecturas"("medidor_id");

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE RESTRICT ON UPDATE CASCADE;
