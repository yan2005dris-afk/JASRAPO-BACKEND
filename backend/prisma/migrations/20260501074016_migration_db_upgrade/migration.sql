/*
  Warnings:

  - The values [VIGENTE,PAGADO] on the enum `EstadoConvenio` will be removed. If these variants are still used in the database, this will fail.
  - The values [INACTIVO] on the enum `EstadoGenerico` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `origen_abono` on the `abono_cliente` table. All the data in the column will be lost.
  - You are about to drop the column `codigo_interno` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `es_validada` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `tiene_anomalia` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `lectura_inicial_medidor` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `estado_conciliacion` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the `periodos_facturacion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[prefactura_id]` on the table `facturas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tipo_origen_id` to the `abono_cliente` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoLectura" AS ENUM ('PENDIENTE', 'POR_REVISION', 'APROBADA', 'RECHAZADA_VERIFICACION', 'ESTIMADA', 'PLANILLADA');

-- CreateEnum
CREATE TYPE "EstadoValidacionPago" AS ENUM ('REPORTADO', 'VALIDANDO', 'APROBADO', 'RECHAZADO', 'CONCILIADO');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoConvenio_new" AS ENUM ('PREPARADO', 'PENDIENTE_ABONO', 'ACTIVO', 'INCUMPLIDO', 'FINALIZADO', 'ANULADO');
ALTER TABLE "convenios" ALTER COLUMN "estado_convenio" TYPE "EstadoConvenio_new" USING ("estado_convenio"::text::"EstadoConvenio_new");
ALTER TABLE "cuota_convenio" ALTER COLUMN "estado_convenio" TYPE "EstadoConvenio_new" USING ("estado_convenio"::text::"EstadoConvenio_new");
ALTER TYPE "EstadoConvenio" RENAME TO "EstadoConvenio_old";
ALTER TYPE "EstadoConvenio_new" RENAME TO "EstadoConvenio";
DROP TYPE "public"."EstadoConvenio_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoGenerico_new" AS ENUM ('SOLICITUD', 'PENDIENTE_PAGO', 'PENDIENTE_INSTALACION', 'ACTIVO', 'EN_MORA', 'ORDEN_CORTE', 'SUSPENDIDO', 'EN_CONVENIO', 'RETIRADO');
ALTER TABLE "contratos" ALTER COLUMN "estado" TYPE "EstadoGenerico_new" USING ("estado"::text::"EstadoGenerico_new");
ALTER TYPE "EstadoGenerico" RENAME TO "EstadoGenerico_old";
ALTER TYPE "EstadoGenerico_new" RENAME TO "EstadoGenerico";
DROP TYPE "public"."EstadoGenerico_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "lecturas" DROP CONSTRAINT "lecturas_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "lote_facturacion" DROP CONSTRAINT "lote_facturacion_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_credito" DROP CONSTRAINT "notas_credito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "notas_debito" DROP CONSTRAINT "notas_debito_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "prefacturas" DROP CONSTRAINT "prefacturas_periodo_id_fkey";

-- DropForeignKey
ALTER TABLE "retenciones" DROP CONSTRAINT "retenciones_periodo_id_fkey";

-- DropIndex
DROP INDEX "contratos_codigo_interno_key";

-- DropIndex
DROP INDEX "lecturas_es_validada_periodo_id_idx";

-- AlterTable
ALTER TABLE "abono_cliente" DROP COLUMN "origen_abono",
ADD COLUMN     "tipo_origen_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "caja_sesion" ADD COLUMN     "total_cheques_declarados" DECIMAL DEFAULT 0,
ADD COLUMN     "total_transferencias_declaradas" DECIMAL DEFAULT 0;

-- AlterTable
ALTER TABLE "contratos" DROP COLUMN "codigo_interno",
ADD COLUMN     "creado_por" TEXT;

-- AlterTable
ALTER TABLE "descuento_detalle" ADD COLUMN     "es_porcentaje" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "valor_aplicado" DECIMAL(12,4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "anulado_por" TEXT,
ADD COLUMN     "fecha_anulacion" TIMESTAMP(3),
ADD COLUMN     "motivo_anulacion" TEXT;

-- AlterTable
ALTER TABLE "historial_medidores" ADD COLUMN     "saldo_pendiente_cambio" DECIMAL DEFAULT 0;

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "es_validada",
DROP COLUMN "tiene_anomalia",
ADD COLUMN     "estado" "EstadoLectura" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "lote_facturacion" ALTER COLUMN "total_monto" SET DATA TYPE DECIMAL;

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "lectura_inicial_medidor",
ADD COLUMN     "latitud" DECIMAL(10,8),
ADD COLUMN     "longitud" DECIMAL(11,8);

-- AlterTable
ALTER TABLE "novedad_operativa" ADD COLUMN     "foto_url_minio" TEXT;

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "estado_conciliacion",
ADD COLUMN     "anulado_por" TEXT,
ADD COLUMN     "estado_validacion" "EstadoValidacionPago" NOT NULL DEFAULT 'APROBADO',
ADD COLUMN     "fecha_anulacion" TIMESTAMP(3),
ADD COLUMN     "motivo_anulacion" TEXT;

-- AlterTable
ALTER TABLE "prefactura_detalle" ADD COLUMN     "cuota_convenio_id" BIGINT;

-- AlterTable
ALTER TABLE "prefacturas" ADD COLUMN     "lectura_id" BIGINT,
ADD COLUMN     "tasa_interes_usada" DECIMAL NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "periodos_facturacion";

-- DropEnum
DROP TYPE "EstadoConciliacion";

-- CreateTable
CREATE TABLE "periodos" (
    "periodo_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPeriodo" NOT NULL DEFAULT 'ABIERTO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("periodo_id")
);

-- CreateTable
CREATE TABLE "preferencias_sistema" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "actualizado_por" TEXT,

    CONSTRAINT "preferencias_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caja_arqueo_detalle" (
    "id" SERIAL NOT NULL,
    "caja_id" BIGINT NOT NULL,
    "denominacion" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "es_moneda" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caja_arqueo_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_origen_abono" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_origen_abono_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periodos_nombre_key" ON "periodos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_sistema_clave_key" ON "preferencias_sistema"("clave");

-- CreateIndex
CREATE INDEX "caja_arqueo_detalle_caja_id_idx" ON "caja_arqueo_detalle"("caja_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_origen_abono_nombre_key" ON "tipo_origen_abono"("nombre");

-- CreateIndex
CREATE INDEX "abono_cliente_tipo_origen_id_idx" ON "abono_cliente"("tipo_origen_id");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_prefactura_id_key" ON "facturas"("prefactura_id");

-- CreateIndex
CREATE INDEX "lecturas_estado_periodo_id_idx" ON "lecturas"("estado", "periodo_id");

-- CreateIndex
CREATE INDEX "prefactura_detalle_cuota_convenio_id_idx" ON "prefactura_detalle"("cuota_convenio_id");

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_credito" ADD CONSTRAINT "notas_credito_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_cuota_convenio_id_fkey" FOREIGN KEY ("cuota_convenio_id") REFERENCES "cuota_convenio"("cuota_convenio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abono_cliente" ADD CONSTRAINT "abono_cliente_tipo_origen_id_fkey" FOREIGN KEY ("tipo_origen_id") REFERENCES "tipo_origen_abono"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_arqueo_detalle" ADD CONSTRAINT "caja_arqueo_detalle_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja_sesion"("caja_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
