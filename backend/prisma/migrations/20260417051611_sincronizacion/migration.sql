/*
  Warnings:

  - You are about to alter the column `lectura_inicial_medidor` on the `medidores` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal`.
  - You are about to drop the column `cliente_id` on the `prefacturas` table. All the data in the column will be lost.
  - You are about to drop the `cobrador_sector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cobrador_sector" DROP CONSTRAINT "cobrador_sector_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "cobrador_sector" DROP CONSTRAINT "cobrador_sector_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_forma_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_prefactura_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "medidores" DROP CONSTRAINT "medidores_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "prefacturas" DROP CONSTRAINT "prefacturas_cliente_id_fkey";

-- DropIndex
DROP INDEX "prefacturas_cliente_id_idx";

-- AlterTable
ALTER TABLE "medidores" ALTER COLUMN "lectura_inicial_medidor" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "prefacturas" DROP COLUMN "cliente_id";

-- DropTable
DROP TABLE "cobrador_sector";

-- CreateTable
CREATE TABLE "historial_medidores" (
    "historial_id" BIGSERIAL NOT NULL,
    "medidor_id" BIGINT NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "fecha_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_hasta" TIMESTAMP(3),
    "lectura_inicial_historial" DECIMAL NOT NULL,
    "lectura_final_historial" DECIMAL,
    "motivo" TEXT,
    "observacion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_medidores_pkey" PRIMARY KEY ("historial_id")
);

-- CreateIndex
CREATE INDEX "historial_medidores_medidor_id_idx" ON "historial_medidores"("medidor_id");

-- CreateIndex
CREATE INDEX "historial_medidores_contrato_id_idx" ON "historial_medidores"("contrato_id");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefacturas"("prefactura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_medidores" ADD CONSTRAINT "historial_medidores_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_medidores" ADD CONSTRAINT "historial_medidores_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE NO ACTION;
