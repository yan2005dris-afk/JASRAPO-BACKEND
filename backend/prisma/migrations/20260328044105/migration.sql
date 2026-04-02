/*
  Warnings:

  - You are about to drop the column `costo_base_mensual` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `costo_excedente` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `limite_base` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `emision_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the `emision_mensual` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emision_mensual_detalle` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoRubro" ADD VALUE 'PRODUCTO';
ALTER TYPE "TipoRubro" ADD VALUE 'SERVICIO';
ALTER TYPE "TipoRubro" ADD VALUE 'IMPUESTO';

-- DropForeignKey
ALTER TABLE "emision_mensual" DROP CONSTRAINT "emision_mensual_contrato_id_fkey";

-- DropForeignKey
ALTER TABLE "emision_mensual" DROP CONSTRAINT "emision_mensual_lote_id_fkey";

-- DropForeignKey
ALTER TABLE "emision_mensual_detalle" DROP CONSTRAINT "emision_mensual_detalle_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "emision_mensual_detalle" DROP CONSTRAINT "emision_mensual_detalle_rubro_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_emision_id_fkey";

-- AlterTable
ALTER TABLE "categoria_tarifa" DROP COLUMN "costo_base_mensual",
DROP COLUMN "costo_excedente",
DROP COLUMN "limite_base",
ADD COLUMN     "fecha_vigencia_desde" DATE,
ADD COLUMN     "fecha_vigencia_hasta" DATE,
ADD COLUMN     "limite_base_m3" INTEGER DEFAULT 0,
ADD COLUMN     "valor_base" DECIMAL(18,6) DEFAULT 0,
ADD COLUMN     "valor_excedente_m3" DECIMAL(18,6) DEFAULT 0;

-- AlterTable
ALTER TABLE "detalle_factura" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "porcentaje_iva" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "producto_id" BIGINT,
ADD COLUMN     "servicio_id" BIGINT,
ALTER COLUMN "rubro_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "emision_id",
ADD COLUMN     "cliente_direccion" TEXT,
ADD COLUMN     "cliente_email" TEXT,
ADD COLUMN     "cliente_id" BIGINT,
ADD COLUMN     "cliente_identificacion" TEXT,
ADD COLUMN     "cliente_razon_social" TEXT,
ADD COLUMN     "forma_pago_sri" TEXT DEFAULT '01',
ADD COLUMN     "prefactura_id" BIGINT;

-- DropTable
DROP TABLE "emision_mensual";

-- DropTable
DROP TABLE "emision_mensual_detalle";

-- CreateTable
CREATE TABLE "prefactura" (
    "prefactura_id" BIGSERIAL NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "lote_id" BIGINT,
    "periodo" TEXT NOT NULL,
    "lectura_anterior" DECIMAL,
    "lectura_actual" DECIMAL,
    "consumo_m3" DECIMAL,
    "monto_consumo_agua" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_tasa_seguridad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_interes_mora" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_otros_cargos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meses_atrasado" INTEGER NOT NULL DEFAULT 0,
    "deuda_anterior" DECIMAL NOT NULL DEFAULT 0,
    "saldo_vencido" DECIMAL NOT NULL DEFAULT 0,
    "fecha_vencimiento" DATE,
    "abono" DECIMAL NOT NULL DEFAULT 0,
    "saldo_actual" DECIMAL NOT NULL DEFAULT 0,
    "estado_pago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estado_prefactura" TEXT NOT NULL DEFAULT 'BORRADOR',
    "fecha_primer_recordatorio" TIMESTAMP(6),
    "fecha_ultimo_recordatorio" TIMESTAMP(6),
    "cantidad_recordatorios_enviados" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "prefactura_pkey" PRIMARY KEY ("prefactura_id")
);

-- CreateTable
CREATE TABLE "prefactura_detalle" (
    "prefactura_detalle_id" BIGSERIAL NOT NULL,
    "prefactura_id" BIGINT NOT NULL,
    "rubro_id" INTEGER,
    "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "precio_unitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "descripcion" TEXT,
    "es_automatico" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "producto_id" BIGINT,
    "servicio_id" BIGINT,

    CONSTRAINT "prefactura_detalle_pkey" PRIMARY KEY ("prefactura_detalle_id")
);

-- CreateTable
CREATE TABLE "producto" (
    "producto_id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_unitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "servicio" (
    "servicio_id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio_unitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "iva" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("servicio_id")
);

-- AddForeignKey
ALTER TABLE "detalle_factura" ADD CONSTRAINT "detalle_factura_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_factura" ADD CONSTRAINT "detalle_factura_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("servicio_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefactura"("prefactura_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura" ADD CONSTRAINT "prefactura_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura" ADD CONSTRAINT "prefactura_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_facturacion"("lote_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefactura"("prefactura_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("servicio_id") ON DELETE SET NULL ON UPDATE NO ACTION;
