/*
  Warnings:

  - You are about to drop the column `factura_id` on the `detalle_pago` table. All the data in the column will be lost.
  - You are about to drop the column `nota_debito_id` on the `detalle_pago` table. All the data in the column will be lost.
  - The primary key for the `establecimientos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualizado_en` on the `establecimientos` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `establecimientos` table. All the data in the column will be lost.
  - You are about to drop the column `empresa_id` on the `establecimientos` table. All the data in the column will be lost.
  - You are about to drop the column `establecimiento_id` on the `establecimientos` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `establecimientos` table. All the data in the column will be lost.
  - The primary key for the `puntos_emision` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualizado_en` on the `puntos_emision` table. All the data in the column will be lost.
  - You are about to drop the column `creado_en` on the `puntos_emision` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `puntos_emision` table. All the data in the column will be lost.
  - You are about to drop the column `punto_emision_id` on the `puntos_emision` table. All the data in the column will be lost.
  - You are about to drop the column `secuencial_actual` on the `puntos_emision` table. All the data in the column will be lost.
  - You are about to drop the `empresa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_credito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_credito_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notas_debito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `retencion_detalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `retenciones` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[emisor_id,codigo]` on the table `establecimientos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[comprobante_id]` on the table `prefacturas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emisor_id` to the `establecimientos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "detalle_pago" DROP CONSTRAINT "detalle_pago_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "detalle_pago" DROP CONSTRAINT "detalle_pago_nota_debito_id_fkey";

-- DropForeignKey
ALTER TABLE "establecimientos" DROP CONSTRAINT "establecimientos_empresa_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_prefactura_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito_detalle" DROP CONSTRAINT "notas_credito_detalle_nota_credito_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_tipo_comprobante_id_fkey";

-- DropForeignKey
ALTER TABLE "prefacturas" DROP CONSTRAINT "prefacturas_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "puntos_emision" DROP CONSTRAINT "puntos_emision_establecimiento_id_fkey";

-- DropForeignKey
ALTER TABLE "retencion_detalle" DROP CONSTRAINT "retencion_detalle_retencion_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_punto_emision_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_tipo_comprobante_id_fkey";

-- DropIndex
DROP INDEX "detalle_pago_factura_id_idx";

-- DropIndex
DROP INDEX "detalle_pago_nota_debito_id_idx";

-- DropIndex
DROP INDEX "establecimientos_empresa_id_codigo_key";

-- AlterTable
ALTER TABLE "detalle_pago" DROP COLUMN "factura_id",
DROP COLUMN "nota_debito_id",
ADD COLUMN     "comprobante_id" BIGINT;

-- AlterTable
ALTER TABLE "establecimientos" DROP CONSTRAINT "establecimientos_pkey",
DROP COLUMN "actualizado_en",
DROP COLUMN "creado_en",
DROP COLUMN "empresa_id",
DROP COLUMN "establecimiento_id",
DROP COLUMN "nombre",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emisor_id" INTEGER NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "establecimientos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "prefacturas" ADD COLUMN     "comprobante_id" BIGINT;

-- AlterTable
ALTER TABLE "puntos_emision" DROP CONSTRAINT "puntos_emision_pkey",
DROP COLUMN "actualizado_en",
DROP COLUMN "creado_en",
DROP COLUMN "nombre",
DROP COLUMN "punto_emision_id",
DROP COLUMN "secuencial_actual",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "puntos_emision_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "empresa";

-- DropTable
DROP TABLE "facturas";

-- DropTable
DROP TABLE "notas_credito";

-- DropTable
DROP TABLE "notas_credito_detalle";

-- DropTable
DROP TABLE "notas_debito";

-- DropTable
DROP TABLE "retencion_detalle";

-- DropTable
DROP TABLE "retenciones";

-- DropEnum
DROP TYPE "AmbienteSri";

-- DropEnum
DROP TYPE "EstadoPago";

-- DropEnum
DROP TYPE "EstadoSri";

-- CreateTable
CREATE TABLE "comprobantes" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emisor_id" INTEGER NOT NULL,
    "punto_emision_id" INTEGER NOT NULL,
    "tipo_comprobante" VARCHAR(2) NOT NULL,
    "ambiente" VARCHAR(1) NOT NULL,
    "tipo_emision" VARCHAR(1) NOT NULL DEFAULT '1',
    "secuencial" VARCHAR(9) NOT NULL,
    "clave_acceso" VARCHAR(49),
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estado_sri" TEXT,
    "fecha_autorizacion" TIMESTAMP(3),
    "numero_autorizacion" VARCHAR(49),
    "total_sin_impuestos" DECIMAL(18,2) NOT NULL,
    "total_descuento" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "importe_total" DECIMAL(18,2) NOT NULL,
    "propina" DECIMAL(18,2),
    "moneda" VARCHAR(15) NOT NULL DEFAULT 'DOLAR',
    "receptor_tipo_identificacion" VARCHAR(2),
    "receptor_identificacion" VARCHAR(20),
    "receptor_razon_social" VARCHAR(300),
    "receptor_direccion" TEXT,
    "receptor_email" VARCHAR(255),
    "receptor_telefono" VARCHAR(20),
    "doc_modified_tipo" VARCHAR(2),
    "doc_modified_numero" VARCHAR(20),
    "doc_modified_fecha" TIMESTAMP(3),
    "motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comprobantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante_detalles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "codigo_principal" VARCHAR(25),
    "descripcion" VARCHAR(300) NOT NULL,
    "cantidad" DECIMAL(18,6) NOT NULL,
    "precio_unitario" DECIMAL(18,6) NOT NULL,
    "descuento" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "precio_total_sin_impuesto" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "comprobante_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante_pagos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "forma_pago" VARCHAR(2) NOT NULL,
    "total" DECIMAL(18,2) NOT NULL,
    "plazo" INTEGER,
    "unidad_tiempo" VARCHAR(20),

    CONSTRAINT "comprobante_pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emisores" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "ruc" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "nombre_comercial" TEXT,
    "direccion_matriz" TEXT NOT NULL,
    "obligado_contabilidad" BOOLEAN NOT NULL DEFAULT false,
    "contribuyente_especial" TEXT,
    "agente_retencion" TEXT,
    "contribuyente_rimpe" BOOLEAN NOT NULL DEFAULT false,
    "ambiente" TEXT NOT NULL DEFAULT '1',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "certificado_nombre" TEXT,
    "certificado_password_encrypted" TEXT,
    "certificado_valido_hasta" TIMESTAMP(3),
    "certificado_sujeto" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emisores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante_retenciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "codigo_retencion" VARCHAR(5) NOT NULL,
    "base_imponible" DECIMAL(18,2) NOT NULL,
    "porcentaje_retener" DECIMAL(8,2) NOT NULL,
    "valor_retenido" DECIMAL(18,2) NOT NULL,
    "cod_doc_sustento" VARCHAR(2),
    "num_doc_sustento" VARCHAR(20),
    "fecha_emision_doc_sustento" TIMESTAMP(3),

    CONSTRAINT "comprobante_retenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sri_catalogos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor" DECIMAL(18,4),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sri_catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante_xmls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "xml_firmado_path" VARCHAR(500),
    "xml_autorizado_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobante_xmls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emisor_id" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "eventos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "secreto" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "config_id" UUID NOT NULL,
    "evento" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "status_code" INTEGER,
    "respuesta" TEXT,
    "exitoso" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "tiempo_respuesta_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" INTEGER,
    "accion" VARCHAR(50) NOT NULL,
    "recurso" VARCHAR(100) NOT NULL,
    "recurso_id" VARCHAR(255),
    "descripcion" TEXT,
    "exitoso" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "duracion_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comprobantes_uuid_key" ON "comprobantes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "comprobantes_clave_acceso_key" ON "comprobantes"("clave_acceso");

-- CreateIndex
CREATE INDEX "comprobantes_emisor_id_idx" ON "comprobantes"("emisor_id");

-- CreateIndex
CREATE INDEX "comprobantes_punto_emision_id_idx" ON "comprobantes"("punto_emision_id");

-- CreateIndex
CREATE INDEX "comprobantes_fecha_emision_idx" ON "comprobantes"("fecha_emision");

-- CreateIndex
CREATE INDEX "comprobantes_estado_idx" ON "comprobantes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "emisores_uuid_key" ON "emisores"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "emisores_ruc_key" ON "emisores"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "sri_catalogos_tipo_codigo_key" ON "sri_catalogos"("tipo", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "comprobante_xmls_comprobante_id_key" ON "comprobante_xmls"("comprobante_id");

-- CreateIndex
CREATE INDEX "detalle_pago_comprobante_id_idx" ON "detalle_pago"("comprobante_id");

-- CreateIndex
CREATE UNIQUE INDEX "establecimientos_emisor_id_codigo_key" ON "establecimientos"("emisor_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "prefacturas_comprobante_id_key" ON "prefacturas"("comprobante_id");

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "emisores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante_detalles" ADD CONSTRAINT "comprobante_detalles_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante_pagos" ADD CONSTRAINT "comprobante_pagos_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establecimientos" ADD CONSTRAINT "establecimientos_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "emisores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_emision" ADD CONSTRAINT "puntos_emision_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante_retenciones" ADD CONSTRAINT "comprobante_retenciones_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante_xmls" ADD CONSTRAINT "comprobante_xmls_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_configs" ADD CONSTRAINT "webhook_configs_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "emisores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "webhook_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
