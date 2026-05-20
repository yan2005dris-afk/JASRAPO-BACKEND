/*
  Warnings:

  - The `usuario_id` column on the `auditoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `doc_modified_fecha` on the `comprobantes` table. All the data in the column will be lost.
  - You are about to drop the column `doc_modified_numero` on the `comprobantes` table. All the data in the column will be lost.
  - You are about to drop the column `doc_modified_tipo` on the `comprobantes` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `webhook_configs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "webhook_logs" DROP CONSTRAINT "webhook_logs_config_id_fkey";

-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "datos_anteriores" JSONB,
ADD COLUMN     "datos_nuevos" JSONB,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "tenant_id" UUID,
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "usuario_email" VARCHAR(255),
DROP COLUMN "usuario_id",
ADD COLUMN     "usuario_id" UUID;

-- AlterTable
ALTER TABLE "comprobante_detalles" ADD COLUMN     "codigo_auxiliar" VARCHAR(25),
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unidad_medida" VARCHAR(50),
ALTER COLUMN "precio_total_sin_impuesto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "comprobante_retenciones" ADD COLUMN     "cod_sustento" VARCHAR(2),
ADD COLUMN     "forma_pago" VARCHAR(2),
ADD COLUMN     "importe_total" DECIMAL(18,2),
ADD COLUMN     "pago_loc_ext" VARCHAR(2) NOT NULL DEFAULT '01',
ADD COLUMN     "total_sin_impuestos" DECIMAL(18,2),
ALTER COLUMN "base_imponible" DROP NOT NULL,
ALTER COLUMN "porcentaje_retener" DROP NOT NULL,
ALTER COLUMN "valor_retenido" DROP NOT NULL,
ALTER COLUMN "fecha_emision_doc_sustento" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "comprobantes" DROP COLUMN "doc_modified_fecha",
DROP COLUMN "doc_modified_numero",
DROP COLUMN "doc_modified_tipo",
ADD COLUMN     "dir_partida" TEXT,
ADD COLUMN     "doc_modificado_fecha" TIMESTAMP(3),
ADD COLUMN     "doc_modificado_numero" VARCHAR(20),
ADD COLUMN     "doc_modificado_tipo" VARCHAR(2),
ADD COLUMN     "fecha_fin_transporte" DATE,
ADD COLUMN     "fecha_ini_transporte" DATE,
ADD COLUMN     "guia_remision" VARCHAR(20),
ADD COLUMN     "id_referencia_externa" VARCHAR(100),
ADD COLUMN     "periodo_fiscal" VARCHAR(7),
ADD COLUMN     "placa" VARCHAR(20),
ADD COLUMN     "razon_social_transportista" VARCHAR(300),
ADD COLUMN     "rise" VARCHAR(40),
ADD COLUMN     "ruc_transportista" VARCHAR(13),
ADD COLUMN     "tipo_identificacion_transportista" VARCHAR(2),
ADD COLUMN     "tipo_sistema_externo" VARCHAR(50),
ADD COLUMN     "valor_modificacion" DECIMAL(18,2),
ALTER COLUMN "total_sin_impuestos" DROP NOT NULL,
ALTER COLUMN "importe_total" DROP NOT NULL;

-- AlterTable
ALTER TABLE "webhook_configs" ADD COLUMN     "reintentos_max" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "tenant_id" UUID,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "webhook_logs" ADD COLUMN     "intento" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "config_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "comprobante_impuestos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_detalle_id" UUID NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "codigo_porcentaje" VARCHAR(4) NOT NULL,
    "tarifa" DECIMAL(8,2),
    "base_imponible" DECIMAL(18,2),
    "valor" DECIMAL(18,2),

    CONSTRAINT "comprobante_impuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobante_totales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "codigo_porcentaje" VARCHAR(4) NOT NULL,
    "descuento_adicional" DECIMAL(18,2),
    "base_imponible" DECIMAL(18,2),
    "tarifa" DECIMAL(8,2),
    "valor" DECIMAL(18,2),
    "valor_devolucion_iva" DECIMAL(18,2),

    CONSTRAINT "comprobante_totales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guia_destinatarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "tipo_identificacion_destinatario" VARCHAR(2),
    "identificacion_destinatario" VARCHAR(20) NOT NULL,
    "razon_social_destinatario" VARCHAR(300) NOT NULL,
    "dir_destinatario" VARCHAR(300),
    "motivo_traslado" VARCHAR(300),
    "doc_aduanero_unico" VARCHAR(20),
    "cod_estab_destino" VARCHAR(3),
    "ruta" VARCHAR(300),
    "cod_doc_sustento" VARCHAR(2),
    "num_doc_sustento" VARCHAR(17),
    "fecha_emision_doc_sustento" DATE,
    "num_aut_doc_sustento" VARCHAR(49),
    "email_destinatario" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guia_destinatarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guia_detalles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "destinatario_id" UUID NOT NULL,
    "codigo_interno" VARCHAR(25) NOT NULL,
    "codigo_adicional" VARCHAR(25),
    "descripcion" VARCHAR(300) NOT NULL,
    "cantidad" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guia_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "info_adicional" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "valor" VARCHAR(300) NOT NULL,

    CONSTRAINT "info_adicional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalles_adicionales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_detalle_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "valor" VARCHAR(300) NOT NULL,

    CONSTRAINT "detalles_adicionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivos_nota_debito" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "comprobante_id" BIGINT NOT NULL,
    "razon" TEXT NOT NULL,
    "valor" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "motivos_nota_debito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secuenciales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "punto_emision_id" INTEGER NOT NULL,
    "tipo_comprobante" VARCHAR(2) NOT NULL,
    "ultimo_secuencial" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secuenciales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comprobante_impuestos_comprobante_detalle_id_idx" ON "comprobante_impuestos"("comprobante_detalle_id");

-- CreateIndex
CREATE INDEX "comprobante_totales_comprobante_id_idx" ON "comprobante_totales"("comprobante_id");

-- CreateIndex
CREATE INDEX "guia_destinatarios_comprobante_id_idx" ON "guia_destinatarios"("comprobante_id");

-- CreateIndex
CREATE INDEX "guia_detalles_destinatario_id_idx" ON "guia_detalles"("destinatario_id");

-- CreateIndex
CREATE INDEX "info_adicional_comprobante_id_idx" ON "info_adicional"("comprobante_id");

-- CreateIndex
CREATE INDEX "detalles_adicionales_comprobante_detalle_id_idx" ON "detalles_adicionales"("comprobante_detalle_id");

-- CreateIndex
CREATE INDEX "motivos_nota_debito_comprobante_id_idx" ON "motivos_nota_debito"("comprobante_id");

-- CreateIndex
CREATE INDEX "secuenciales_punto_emision_id_idx" ON "secuenciales"("punto_emision_id");

-- CreateIndex
CREATE UNIQUE INDEX "secuenciales_punto_emision_id_tipo_comprobante_key" ON "secuenciales"("punto_emision_id", "tipo_comprobante");

-- CreateIndex
CREATE INDEX "auditoria_accion_idx" ON "auditoria"("accion");

-- CreateIndex
CREATE INDEX "auditoria_recurso_recurso_id_idx" ON "auditoria"("recurso", "recurso_id");

-- CreateIndex
CREATE INDEX "auditoria_tenant_id_idx" ON "auditoria"("tenant_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- AddForeignKey
ALTER TABLE "comprobante_impuestos" ADD CONSTRAINT "comprobante_impuestos_comprobante_detalle_id_fkey" FOREIGN KEY ("comprobante_detalle_id") REFERENCES "comprobante_detalles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobante_totales" ADD CONSTRAINT "comprobante_totales_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guia_destinatarios" ADD CONSTRAINT "guia_destinatarios_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guia_detalles" ADD CONSTRAINT "guia_detalles_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "guia_destinatarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "info_adicional" ADD CONSTRAINT "info_adicional_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalles_adicionales" ADD CONSTRAINT "detalles_adicionales_comprobante_detalle_id_fkey" FOREIGN KEY ("comprobante_detalle_id") REFERENCES "comprobante_detalles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motivos_nota_debito" ADD CONSTRAINT "motivos_nota_debito_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secuenciales" ADD CONSTRAINT "secuenciales_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "webhook_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
