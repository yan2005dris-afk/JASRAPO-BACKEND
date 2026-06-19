/*
  Warnings:

  - Changed the type of `estado` on the `contratos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('SOLICITUD', 'PENDIENTE_PAGO', 'PENDIENTE_INSTALACION', 'ACTIVO', 'EN_MORA', 'ORDEN_CORTE', 'SUSPENDIDO', 'EN_CONVENIO', 'RETIRADO', 'RECONEXION');

-- AlterTable
ALTER TABLE "contratos" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoContrato" NOT NULL;

-- DropEnum
DROP TYPE "EstadoGenerico";

-- CreateTable
CREATE TABLE "impuestos_doc_sustento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_retencion_id" UUID NOT NULL,
    "cod_impuesto_doc_sustento" VARCHAR(2) NOT NULL,
    "codigo_porcentaje" VARCHAR(4) NOT NULL,
    "base_imponible" DECIMAL(18,2),
    "tarifa" DECIMAL(8,2),
    "valor_impuesto" DECIMAL(18,2),

    CONSTRAINT "impuestos_doc_sustento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "impuestos_doc_sustento_comprobante_retencion_id_idx" ON "impuestos_doc_sustento"("comprobante_retencion_id");

-- AddForeignKey
ALTER TABLE "impuestos_doc_sustento" ADD CONSTRAINT "impuestos_doc_sustento_comprobante_retencion_id_fkey" FOREIGN KEY ("comprobante_retencion_id") REFERENCES "comprobante_retenciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
