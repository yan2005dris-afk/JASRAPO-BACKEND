/*
  Warnings:

  - You are about to drop the column `aplica_subsidio` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `limite_subsidio_m3` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje_subsidio` on the `categoria_tarifa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categoria_tarifa" DROP COLUMN "aplica_subsidio",
DROP COLUMN "limite_subsidio_m3",
DROP COLUMN "porcentaje_subsidio";

-- AlterTable
ALTER TABLE "descuento_detalle" ADD COLUMN     "catalogo_descuento_id" INTEGER;

-- CreateTable
CREATE TABLE "catalogo_descuento" (
    "catalogo_descuento_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "valor" DECIMAL(12,4) NOT NULL,
    "es_porcentaje" BOOLEAN NOT NULL DEFAULT true,
    "rubro_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "catalogo_descuento_pkey" PRIMARY KEY ("catalogo_descuento_id")
);

-- CreateIndex
CREATE INDEX "descuento_detalle_catalogo_descuento_id_idx" ON "descuento_detalle"("catalogo_descuento_id");

-- AddForeignKey
ALTER TABLE "catalogo_descuento" ADD CONSTRAINT "catalogo_descuento_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_catalogo_descuento_id_fkey" FOREIGN KEY ("catalogo_descuento_id") REFERENCES "catalogo_descuento"("catalogo_descuento_id") ON DELETE SET NULL ON UPDATE CASCADE;
