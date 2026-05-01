/*
  Warnings:

  - The values [IMPUESTO] on the enum `TipoRubro` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tipo_descuento` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `valor_aplicado` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `grava_iva` on the `prefactura_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje_iva` on the `prefactura_detalle` table. All the data in the column will be lost.
  - Made the column `catalogo_descuento_id` on table `descuento_detalle` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `impuesto_id` to the `prefactura_detalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EstadoPago" ADD VALUE 'ANULADO';

-- AlterEnum
ALTER TYPE "EstadoSri" ADD VALUE 'ANULADA';

-- AlterEnum
BEGIN;
CREATE TYPE "TipoRubro_new" AS ENUM ('FIJO', 'VARIABLE', 'MULTA', 'OTRO', 'BIEN', 'SERVICIO');
ALTER TABLE "rubros" ALTER COLUMN "tipo_rubro" TYPE "TipoRubro_new" USING ("tipo_rubro"::text::"TipoRubro_new");
ALTER TYPE "TipoRubro" RENAME TO "TipoRubro_old";
ALTER TYPE "TipoRubro_new" RENAME TO "TipoRubro";
DROP TYPE "public"."TipoRubro_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "descuento_detalle" DROP CONSTRAINT "descuento_detalle_catalogo_descuento_id_fkey";

-- AlterTable
ALTER TABLE "descuento_detalle" DROP COLUMN "tipo_descuento",
DROP COLUMN "valor_aplicado",
ADD COLUMN     "prefactura_id" BIGINT,
ADD COLUMN     "valor_applied" DECIMAL(12,4) NOT NULL DEFAULT 0,
ALTER COLUMN "catalogo_descuento_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "estado";

-- AlterTable
ALTER TABLE "prefactura_detalle" DROP COLUMN "grava_iva",
DROP COLUMN "porcentaje_iva",
ADD COLUMN     "codigo_porcentaje_sri" TEXT,
ADD COLUMN     "impuesto_id" INTEGER NOT NULL,
ADD COLUMN     "tarifa_impuesto" DECIMAL NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "EstadoFactura";

-- CreateIndex
CREATE INDEX "descuento_detalle_prefactura_id_idx" ON "descuento_detalle"("prefactura_id");

-- CreateIndex
CREATE INDEX "prefactura_detalle_impuesto_id_idx" ON "prefactura_detalle"("impuesto_id");

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefacturas"("prefactura_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_catalogo_descuento_id_fkey" FOREIGN KEY ("catalogo_descuento_id") REFERENCES "catalogo_descuento"("catalogo_descuento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_impuesto_id_fkey" FOREIGN KEY ("impuesto_id") REFERENCES "sri_impuesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
