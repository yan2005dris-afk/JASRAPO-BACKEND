-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('TERCERA_EDAD', 'DISCAPACIDAD', 'INTERES_MORA', 'EXENCION_TASA', 'CONVENIO', 'OTROS');

-- AlterTable
ALTER TABLE "categoria_tarifa" ADD COLUMN     "aplica_subsidio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limite_subsidio_m3" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "porcentaje_subsidio" DECIMAL(5,2) DEFAULT 0;

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "interes_mora" DECIMAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "prefacturas" ADD COLUMN     "interes_mora" DECIMAL NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "descuento_detalle" (
    "descuento_detalle_id" SERIAL NOT NULL,
    "factura_id" BIGINT,
    "prefactura_id" BIGINT,
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "monto_descontado" DECIMAL(12,4) NOT NULL,
    "motivo" TEXT,
    "autorizado_por" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "descuento_detalle_pkey" PRIMARY KEY ("descuento_detalle_id")
);

-- CreateIndex
CREATE INDEX "descuento_detalle_factura_id_idx" ON "descuento_detalle"("factura_id");

-- CreateIndex
CREATE INDEX "descuento_detalle_prefactura_id_idx" ON "descuento_detalle"("prefactura_id");

-- CreateIndex
CREATE INDEX "descuento_detalle_autorizado_por_idx" ON "descuento_detalle"("autorizado_por");

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefacturas"("prefactura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descuento_detalle" ADD CONSTRAINT "descuento_detalle_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
