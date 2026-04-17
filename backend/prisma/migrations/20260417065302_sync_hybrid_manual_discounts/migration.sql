-- AlterTable
ALTER TABLE "descuento_detalle" ADD COLUMN     "factura_detalle_id" BIGINT,
ADD COLUMN     "prefactura_detalle_id" BIGINT;

-- AlterTable
ALTER TABLE "prefactura_detalle" ADD COLUMN     "descuento" DECIMAL NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "descuento_detalle_factura_detalle_id_idx" ON "descuento_detalle"("factura_detalle_id");

-- CreateIndex
CREATE INDEX "descuento_detalle_prefactura_detalle_id_idx" ON "descuento_detalle"("prefactura_detalle_id");

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_factura_detalle_id_fkey" FOREIGN KEY ("factura_detalle_id") REFERENCES "factura_detalle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_prefactura_detalle_id_fkey" FOREIGN KEY ("prefactura_detalle_id") REFERENCES "prefactura_detalle"("prefactura_detalle_id") ON DELETE SET NULL ON UPDATE CASCADE;
