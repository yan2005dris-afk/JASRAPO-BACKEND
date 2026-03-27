/*
  Warnings:

  - You are about to drop the column `cedula` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `comunidad_id` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_fin` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_inicio` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `monto_cuota` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `detalle_factura` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `detalle_factura` table. All the data in the column will be lost.
  - You are about to drop the column `abono` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `consumo` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `interes_mora` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `lectura_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `mes` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `saldo` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `tarifa` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `abono` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_medidor_id` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `saldo_pendiente` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `valor_monetario` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `cliente_id` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `factura_id` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `monto` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the `clientes_medidores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitudes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[identificacion]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `comunidades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serie]` on the table `medidores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidos` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identificacion` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_identificacion` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `comunidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `porcentaje_tasa_seguridad` to the `comunidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `comunidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abono_inicial` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrato_id` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deuda_total` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dias_mora_actual` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado_convenio` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_primer_pago` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto_pagado_actual` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Made the column `numero_cuotas` on table `convenios` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rubro_id` to the `detalle_factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `detalle_factura` table without a default value. This is not possible if the table is not empty.
  - Made the column `factura_id` on table `detalle_factura` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clave_acceso_sri` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descuento_total` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emision_id` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_vencimiento` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iva` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_sri` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_pagar` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrato_id` to the `lecturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lectura_inicial` to the `lecturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodo` to the `lecturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lecturas` table without a default value. This is not possible if the table is not empty.
  - Made the column `consumo_calculado` on table `lecturas` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lectura_inicial_medidor` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marca` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serie` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estado` on the `medidores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `cambio` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado_conciliacion` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_pago` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto_total_recibido` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `users_id` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodo_pago` to the `pagos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTA', 'CERRADA', 'DESCUADRADA');

-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CEDULA', 'RUC', 'PASAPORTE', 'CONSUMIDOR_FINAL', 'IDENTIFICACION_EXTRANJERA');

-- CreateEnum
CREATE TYPE "EstadoGenerico" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoConvenio" AS ENUM ('VIGENTE', 'PAGADO', 'INCUMPLIDO');

-- CreateEnum
CREATE TYPE "TipoDetallePago" AS ENUM ('FACTURA', 'CUOTA_CONVENIO', 'PAGO_LIBRE');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'PARCIAL', 'VENCIDO', 'EN_CONVENIO', 'CONVENIO_PAGADO');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('BORRADOR', 'EMITIDA', 'AUTORIZADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoMedidor" AS ENUM ('ACTIVO', 'DADO_DE_BAJA', 'DANADO');

-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('FUGA', 'MEDIDOR_DANADO', 'LECTURA_ERRONEA', 'OTRO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoConciliacion" AS ENUM ('PENDIENTE', 'CONCILIADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoRubro" AS ENUM ('FIJO', 'VARIABLE', 'MULTA', 'OTRO');

-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_comunidad_id_fkey";

-- DropForeignKey
ALTER TABLE "clientes_medidores" DROP CONSTRAINT "clientes_medidores_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "clientes_medidores" DROP CONSTRAINT "clientes_medidores_medidor_id_fkey";

-- DropForeignKey
ALTER TABLE "convenios" DROP CONSTRAINT "convenios_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "detalle_factura" DROP CONSTRAINT "detalle_factura_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_lectura_id_fkey";

-- DropForeignKey
ALTER TABLE "lecturas" DROP CONSTRAINT "lecturas_cliente_medidor_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_factura_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_cliente_id_fkey";

-- DropIndex
DROP INDEX "clientes_cedula_key";

-- DropIndex
DROP INDEX "clientes_nombre_idx";

-- DropIndex
DROP INDEX "medidores_codigo_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "cedula",
DROP COLUMN "comunidad_id",
DROP COLUMN "nombre",
ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "aplica_terceraedad_discapacidad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "direccion_domicilio" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "identificacion" TEXT NOT NULL,
ADD COLUMN     "is_perfil_validado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nombres" TEXT NOT NULL,
ADD COLUMN     "razon_social" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "telefono_secundario" TEXT,
ADD COLUMN     "tipo_identificacion" "TipoIdentificacion" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "comunidades" ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "porcentaje_tasa_seguridad" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "cliente_id",
DROP COLUMN "estado",
DROP COLUMN "fecha_fin",
DROP COLUMN "fecha_inicio",
DROP COLUMN "monto_cuota",
ADD COLUMN     "abono_inicial" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "contrato_id" BIGINT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deuda_total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dias_mora_actual" INTEGER NOT NULL,
ADD COLUMN     "estado_convenio" "EstadoConvenio" NOT NULL,
ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3),
ADD COLUMN     "fecha_primer_pago" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fecha_proximo_pago" TIMESTAMP(3),
ADD COLUMN     "monto_pagado_actual" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "numero_cuotas" SET NOT NULL;

-- AlterTable
ALTER TABLE "detalle_factura" DROP COLUMN "descripcion",
DROP COLUMN "total",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rubro_id" INTEGER NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "factura_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "abono",
DROP COLUMN "cliente_id",
DROP COLUMN "consumo",
DROP COLUMN "fecha",
DROP COLUMN "interes_mora",
DROP COLUMN "lectura_id",
DROP COLUMN "mes",
DROP COLUMN "saldo",
DROP COLUMN "tarifa",
ADD COLUMN     "clave_acceso_sri" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "descuento_total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "emision_id" BIGINT NOT NULL,
ADD COLUMN     "enviado_sri" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" "EstadoFactura" NOT NULL,
ADD COLUMN     "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_enviado_sri" TIMESTAMP(3),
ADD COLUMN     "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "iva" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "numero_sri" TEXT NOT NULL,
ADD COLUMN     "pdf_url" TEXT,
ADD COLUMN     "respuesta_sri" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_pagar" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "xml_sri" TEXT;

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "abono",
DROP COLUMN "cliente_medidor_id",
DROP COLUMN "saldo_pendiente",
DROP COLUMN "valor_monetario",
ADD COLUMN     "contrato_id" BIGINT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descripcion_anomalia" TEXT,
ADD COLUMN     "fecha_validacion" TIMESTAMP(3),
ADD COLUMN     "foto_url_minio" TEXT,
ADD COLUMN     "is_validada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lectura_inicial" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "periodo" TEXT NOT NULL,
ADD COLUMN     "tiene_anomalia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "consumo_calculado" SET NOT NULL;

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "codigo",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "fecha_baja" TIMESTAMP(3),
ADD COLUMN     "lectura_inicial_medidor" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "marca" TEXT NOT NULL,
ADD COLUMN     "modelo" TEXT NOT NULL,
ADD COLUMN     "motivo_baja" TEXT,
ADD COLUMN     "serie" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoMedidor" NOT NULL;

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "cliente_id",
DROP COLUMN "factura_id",
DROP COLUMN "fecha",
DROP COLUMN "monto",
ADD COLUMN     "caja_id" BIGINT,
ADD COLUMN     "cambio" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "comprobante_url_minio" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "estado_conciliacion" "EstadoConciliacion" NOT NULL,
ADD COLUMN     "fecha_pago" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "monto_total_recibido" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "numero_operacion" TEXT,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "referencia_banco" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "users_id" INTEGER NOT NULL,
DROP COLUMN "metodo_pago",
ADD COLUMN     "metodo_pago" "MetodoPago" NOT NULL;

-- DropTable
DROP TABLE "clientes_medidores";

-- DropTable
DROP TABLE "solicitudes";

-- CreateTable
CREATE TABLE "abono_cliente" (
    "abono_cliente_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "pago_id" BIGINT,
    "monto_abono" DOUBLE PRECISION NOT NULL,
    "origen_abono" TEXT NOT NULL,
    "disponible_para_aplicar" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "abono_cliente_pkey" PRIMARY KEY ("abono_cliente_id")
);

-- CreateTable
CREATE TABLE "caja_sesion" (
    "caja_id" BIGSERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_apertura" DOUBLE PRECISION NOT NULL,
    "monto_cierre_sistema" DOUBLE PRECISION,
    "monto_cierre_real" DOUBLE PRECISION,
    "novedad_cierre" TEXT,
    "estado" "EstadoCaja" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caja_sesion_pkey" PRIMARY KEY ("caja_id")
);

-- CreateTable
CREATE TABLE "categoria_tarifa" (
    "categoria_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "costo_base_mensual" DOUBLE PRECISION NOT NULL,
    "limite_base" DOUBLE PRECISION NOT NULL,
    "costo_excedente" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categoria_tarifa_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "cobrador_sector" (
    "cobrador_id" BIGSERIAL NOT NULL,
    "sector_id" INTEGER,
    "users_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cobrador_sector_pkey" PRIMARY KEY ("cobrador_id")
);

-- CreateTable
CREATE TABLE "contrato_medidor" (
    "contrato_medidor_id" BIGSERIAL NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "medidor_id" BIGINT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "motivo_cambio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contrato_medidor_pkey" PRIMARY KEY ("contrato_medidor_id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "contrato_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "sector_id" INTEGER NOT NULL,
    "categoria_tarifa_id" INTEGER NOT NULL,
    "numero_guia" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direccion_suministro" TEXT NOT NULL,
    "estado" "EstadoGenerico" NOT NULL,
    "codigo_interno" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("contrato_id")
);

-- CreateTable
CREATE TABLE "cuota_convenio" (
    "cuota_convenio_id" BIGSERIAL NOT NULL,
    "convenio_id" BIGINT NOT NULL,
    "numero_cuota" INTEGER NOT NULL,
    "valor_cuota" DOUBLE PRECISION NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado_convenio" "EstadoConvenio" NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "monto_pagado" DOUBLE PRECISION NOT NULL,
    "dias_retraso" INTEGER NOT NULL,
    "interes_mora_aplicado" DOUBLE PRECISION NOT NULL,
    "pago_completo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_pago_anticipado" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cuota_convenio_pkey" PRIMARY KEY ("cuota_convenio_id")
);

-- CreateTable
CREATE TABLE "detalle_pago" (
    "detalle_pago_id" BIGSERIAL NOT NULL,
    "pago_id" BIGINT NOT NULL,
    "factura_id" BIGINT,
    "cuota_convenio_id" BIGINT,
    "tipo_pago" "TipoDetallePago" NOT NULL,
    "monto_abonado" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "detalle_pago_pkey" PRIMARY KEY ("detalle_pago_id")
);

-- CreateTable
CREATE TABLE "emision_mensual" (
    "emision_id" BIGSERIAL NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "periodo" TEXT NOT NULL,
    "monto_consumo_agua" DOUBLE PRECISION NOT NULL,
    "monto_interes_mora" DOUBLE PRECISION NOT NULL,
    "monto_total" DOUBLE PRECISION NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL,
    "fecha_primer_recordatorio" TIMESTAMP(3),
    "fecha_ultimo_recordatorio" TIMESTAMP(3),
    "cantidad_recordatorios_enviados" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "emision_mensual_pkey" PRIMARY KEY ("emision_id")
);

-- CreateTable
CREATE TABLE "novedad_operativa" (
    "novedad_id" BIGSERIAL NOT NULL,
    "lectura_id" BIGINT NOT NULL,
    "observacion" TEXT,
    "tipo" "TipoNovedad" NOT NULL,
    "estado" "EstadoGenerico" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "novedad_operativa_pkey" PRIMARY KEY ("novedad_id")
);

-- CreateTable
CREATE TABLE "parametro_tasa_interes" (
    "parametro_id" SERIAL NOT NULL,
    "tasa" DOUBLE PRECISION NOT NULL,
    "vigente_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigente_hasta" TIMESTAMP(3),
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parametro_tasa_interes_pkey" PRIMARY KEY ("parametro_id")
);

-- CreateTable
CREATE TABLE "rubros" (
    "rubro_id" SERIAL NOT NULL,
    "codigo_sri" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor_unitario" DOUBLE PRECISION NOT NULL,
    "tipo_rubro" "TipoRubro" NOT NULL,
    "grava_iva" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rubros_pkey" PRIMARY KEY ("rubro_id")
);

-- CreateTable
CREATE TABLE "sectores" (
    "sector_id" SERIAL NOT NULL,
    "comunidad_id" INTEGER,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("sector_id")
);

-- CreateIndex
CREATE INDEX "abono_cliente_cliente_id_idx" ON "abono_cliente"("cliente_id");

-- CreateIndex
CREATE INDEX "abono_cliente_deleted_at_idx" ON "abono_cliente"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numero_guia_key" ON "contratos"("numero_guia");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_codigo_interno_key" ON "contratos"("codigo_interno");

-- CreateIndex
CREATE UNIQUE INDEX "rubros_codigo_sri_key" ON "rubros"("codigo_sri");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_identificacion_key" ON "clientes"("identificacion");

-- CreateIndex
CREATE INDEX "clientes_nombres_idx" ON "clientes"("nombres");

-- CreateIndex
CREATE UNIQUE INDEX "comunidades_codigo_key" ON "comunidades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "medidores_serie_key" ON "medidores"("serie");

-- AddForeignKey
ALTER TABLE "abono_cliente" ADD CONSTRAINT "abono_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abono_cliente" ADD CONSTRAINT "abono_cliente_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_sesion" ADD CONSTRAINT "caja_sesion_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrador_sector" ADD CONSTRAINT "cobrador_sector_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("sector_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrador_sector" ADD CONSTRAINT "cobrador_sector_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_medidor" ADD CONSTRAINT "contrato_medidor_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrato_medidor" ADD CONSTRAINT "contrato_medidor_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_categoria_tarifa_id_fkey" FOREIGN KEY ("categoria_tarifa_id") REFERENCES "categoria_tarifa"("categoria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("sector_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuota_convenio" ADD CONSTRAINT "cuota_convenio_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "convenios"("convenio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_factura" ADD CONSTRAINT "detalle_factura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_factura" ADD CONSTRAINT "detalle_factura_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_cuota_convenio_id_fkey" FOREIGN KEY ("cuota_convenio_id") REFERENCES "cuota_convenio"("cuota_convenio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emision_mensual" ADD CONSTRAINT "emision_mensual_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_emision_id_fkey" FOREIGN KEY ("emision_id") REFERENCES "emision_mensual"("emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedad_operativa" ADD CONSTRAINT "novedad_operativa_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja_sesion"("caja_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectores" ADD CONSTRAINT "sectores_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE SET NULL ON UPDATE CASCADE;
