/*
  Warnings:

  - You are about to drop the column `prefactura_id` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the `notas_debito_motivo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `prefactura_detalle_id` to the `descuento_detalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivo` to the `notas_debito` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "descuento_detalle" DROP CONSTRAINT "descuento_detalle_prefactura_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_forma_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito_motivo" DROP CONSTRAINT "notas_debito_motivo_nota_debito_id_fkey";

-- DropIndex
DROP INDEX "descuento_detalle_prefactura_id_idx";

-- AlterTable
ALTER TABLE "catalogo_descuento" ADD COLUMN     "aplica_automatico" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "descuento_detalle" DROP COLUMN "prefactura_id",
ADD COLUMN     "prefactura_detalle_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "notas_debito" ADD COLUMN     "codigo_impuesto_sri" TEXT,
ADD COLUMN     "codigo_porcentaje_sri" TEXT,
ADD COLUMN     "motivo" TEXT NOT NULL,
ADD COLUMN     "tarifa_impuesto" DECIMAL NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "notas_debito_motivo";

-- CreateIndex
CREATE INDEX "descuento_detalle_prefactura_detalle_id_idx" ON "descuento_detalle"("prefactura_detalle_id");

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_prefactura_detalle_id_fkey" FOREIGN KEY ("prefactura_detalle_id") REFERENCES "prefactura_detalle"("prefactura_detalle_id") ON DELETE CASCADE ON UPDATE CASCADE;
