/*
  Warnings:

  - You are about to drop the column `xml_autorizado` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `xml_firmado` on the `facturas` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "lecturas_contrato_id_idx";

-- DropIndex
DROP INDEX "lecturas_periodo_id_idx";

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "xml_autorizado",
DROP COLUMN "xml_firmado",
ADD COLUMN     "xml_autorizado_url" TEXT,
ADD COLUMN     "xml_firmado_url" TEXT;

-- CreateIndex
CREATE INDEX "facturas_fecha_emision_idx" ON "facturas"("fecha_emision");

-- CreateIndex
CREATE INDEX "facturas_estado_pago_idx" ON "facturas"("estado_pago");

-- CreateIndex
CREATE INDEX "facturas_estado_sri_idx" ON "facturas"("estado_sri");

-- CreateIndex
CREATE INDEX "lecturas_contrato_id_periodo_id_idx" ON "lecturas"("contrato_id", "periodo_id");

-- CreateIndex
CREATE INDEX "lecturas_fecha_idx" ON "lecturas"("fecha");

-- CreateIndex
CREATE INDEX "lecturas_es_validada_periodo_id_idx" ON "lecturas"("es_validada", "periodo_id");

-- CreateIndex
CREATE INDEX "lecturas_contrato_id_fecha_idx" ON "lecturas"("contrato_id", "fecha");
