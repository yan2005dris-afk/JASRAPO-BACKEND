/*
  Warnings:

  - You are about to alter the column `porcentaje_tasa_seguridad` on the `comunidades` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `cantidad` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `precio_unitario` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `subtotal` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `iva` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `total` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `descuento` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `tarifa_impuesto` on the `prefactura_detalle` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `lectura_anterior` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `lectura_actual` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `consumo_m3` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `subtotal` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `iva` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `descuento_total` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `total_pagar` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `deuda_anterior` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `saldo_vencido` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `abono` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `saldo_actual` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `interes_mora` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `tarifa_valor_base` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `tarifa_valor_excedente` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to alter the column `tasa_interes_usada` on the `prefacturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,4)`.
  - You are about to alter the column `precio_unitario` on the `rubros` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(18,2)`.
  - You are about to drop the `lote_facturacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lote_facturacion" DROP CONSTRAINT "lote_facturacion_comunidad_id_fkey";

-- DropForeignKey
ALTER TABLE "lote_facturacion" DROP CONSTRAINT "lote_facturacion_creado_por_fkey";

-- DropForeignKey
ALTER TABLE "lote_facturacion" DROP CONSTRAINT "lote_facturacion_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "prefacturas" DROP CONSTRAINT "prefacturas_lote_id_fkey";

-- AlterTable
ALTER TABLE "comunidades" ALTER COLUMN "porcentaje_tasa_seguridad" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "prefactura_detalle" ALTER COLUMN "cantidad" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "precio_unitario" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "iva" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "descuento" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "tarifa_impuesto" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "prefacturas" ALTER COLUMN "lectura_anterior" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "lectura_actual" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "consumo_m3" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "iva" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "descuento_total" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "total_pagar" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "deuda_anterior" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "saldo_vencido" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "abono" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "saldo_actual" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "interes_mora" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "tarifa_valor_base" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "tarifa_valor_excedente" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "tasa_interes_usada" SET DATA TYPE DECIMAL(18,4);

-- AlterTable
ALTER TABLE "rubros" ALTER COLUMN "precio_unitario" SET DATA TYPE DECIMAL(18,2);

-- DropTable
DROP TABLE "lote_facturacion";

-- CreateTable
CREATE TABLE "lote" (
    "lote_id" BIGSERIAL NOT NULL,
    "comunidad_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'BORRADOR',
    "total_monto" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "total_emisiones" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lote_pkey" PRIMARY KEY ("lote_id")
);

-- CreateIndex
CREATE INDEX "lote_comunidad_id_idx" ON "lote"("comunidad_id");

-- CreateIndex
CREATE INDEX "lote_periodo_id_idx" ON "lote"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "lote_comunidad_id_periodo_id_key" ON "lote"("comunidad_id", "periodo_id");

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote"("lote_id") ON DELETE SET NULL ON UPDATE NO ACTION;
