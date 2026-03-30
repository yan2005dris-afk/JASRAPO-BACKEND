/*
  Warnings:

  - A unique constraint covering the columns `[prefactura_id]` on the table `facturas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('BORRADOR', 'DEFINITIVO', 'ENVIADO');

-- CreateEnum
CREATE TYPE "EstadoPrefactura" AS ENUM ('PENDIENTE', 'PAGADA', 'ANULADA');

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "prefactura_id" BIGINT;

-- CreateTable
CREATE TABLE "emision_mensual_detalle" (
    "emision_detalle_id" BIGSERIAL NOT NULL,
    "emision_id" BIGINT NOT NULL,
    "rubro_id" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "emision_mensual_detalle_pkey" PRIMARY KEY ("emision_detalle_id")
);

-- CreateTable
CREATE TABLE "lote_facturacion" (
    "lote_id" BIGSERIAL NOT NULL,
    "comunidad_id" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'BORRADOR',
    "total_prefacturas" INTEGER NOT NULL DEFAULT 0,
    "total_monto" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "lote_facturacion_pkey" PRIMARY KEY ("lote_id")
);

-- CreateTable
CREATE TABLE "prefactura" (
    "prefactura_id" BIGSERIAL NOT NULL,
    "lote_id" BIGINT NOT NULL,
    "emision_id" BIGINT NOT NULL,
    "periodo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoPrefactura" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" TIMESTAMP(3),
    "metodo_pago" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prefactura_pkey" PRIMARY KEY ("prefactura_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lote_facturacion_comunidad_id_anio_mes_key" ON "lote_facturacion"("comunidad_id", "anio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_prefactura_id_key" ON "facturas"("prefactura_id");

-- AddForeignKey
ALTER TABLE "emision_mensual_detalle" ADD CONSTRAINT "emision_mensual_detalle_emision_id_fkey" FOREIGN KEY ("emision_id") REFERENCES "emision_mensual"("emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_mensual_detalle" ADD CONSTRAINT "emision_mensual_detalle_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefactura"("prefactura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefactura" ADD CONSTRAINT "prefactura_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_facturacion"("lote_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefactura" ADD CONSTRAINT "prefactura_emision_id_fkey" FOREIGN KEY ("emision_id") REFERENCES "emision_mensual"("emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;
