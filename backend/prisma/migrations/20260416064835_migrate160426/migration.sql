/*
  Warnings:

  - You are about to drop the column `created_at` on the `abono_cliente` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `abono_cliente` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaApertura` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `caja_sesion` table. All the data in the column will be lost.
  - The primary key for the `categoria_tarifa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoria_id` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `categoria_tarifa` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `is_perfil_validado` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `cobrador_sector` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `cobrador_sector` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `cobrador_sector` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `comunidades` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `comunidades` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `comunidades` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `contrato_medidor` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `contrato_medidor` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `contratos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `convenios` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `cuota_convenio` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `cuota_convenio` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `cuota_convenio` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `detalle_factura` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `detalle_factura` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `detalle_pago` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `detalle_pago` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `is_validada` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `lecturas` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `lote_facturacion` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `lote_facturacion` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `lote_facturacion` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `medidores` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `medidores` table. All the data in the column will be lost.
  - The primary key for the `menus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `menus_id` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `menus_parent_id` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `route` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `novedad_operativa` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `novedad_operativa` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `novedad_operativa` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `parametro_tasa_interes` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `parametro_tasa_interes` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `parametro_tasa_interes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `prefactura` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `prefactura` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `prefactura` table. All the data in the column will be lost.
  - The `estado_pago` column on the `prefactura` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `estado_prefactura` column on the `prefactura` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `created_at` on the `prefactura_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `prefactura_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `producto` table. All the data in the column will be lost.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleted_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `roles_id` on the `roles` table. All the data in the column will be lost.
  - The primary key for the `roles_heredados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `child_role_id` on the `roles_heredados` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `roles_heredados` table. All the data in the column will be lost.
  - You are about to drop the column `parent_role_id` on the `roles_heredados` table. All the data in the column will be lost.
  - You are about to drop the column `roles_heredados_id` on the `roles_heredados` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `rubros` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `rubros` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `rubros` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `sectores` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `sectores` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `sectores` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `servicio` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `servicio` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `servicio` table. All the data in the column will be lost.
  - You are about to drop the `menu_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rol_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rol_padre_id,rol_hijo_id]` on the table `roles_heredados` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actualizado_en` to the `caja_sesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `caja_sesion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `categoria_tarifa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `cobrador_sector` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `comunidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `contratos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `cuota_convenio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `lecturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `lote_facturacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `medidores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ruta` to the `menus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `novedad_operativa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `parametro_tasa_interes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol_hijo_id` to the `roles_heredados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol_padre_id` to the `roles_heredados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `rubros` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `sectores` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPrefactura" AS ENUM ('BORRADOR', 'EMITIDA', 'ACEPTADA', 'RECHAZADA', 'ANULADA');

-- DropForeignKey
ALTER TABLE "caja_sesion" DROP CONSTRAINT "caja_sesion_users_id_fkey";

-- DropForeignKey
ALTER TABLE "cobrador_sector" DROP CONSTRAINT "cobrador_sector_users_id_fkey";

-- DropForeignKey
ALTER TABLE "contratos" DROP CONSTRAINT "contratos_categoria_tarifa_id_fkey";

-- DropForeignKey
ALTER TABLE "lote_facturacion" DROP CONSTRAINT "lote_facturacion_created_by_fkey";

-- DropForeignKey
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_menus_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_users_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_users_id_fkey";

-- DropForeignKey
ALTER TABLE "rol_permissions" DROP CONSTRAINT "rol_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "rol_permissions" DROP CONSTRAINT "rol_permissions_roles_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_child_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_parent_role_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_users_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "abono_cliente_deleted_at_idx";

-- DropIndex
DROP INDEX "clientes_deleted_at_idx";

-- DropIndex
DROP INDEX "roles_name_key";

-- DropIndex
DROP INDEX "roles_heredados_child_role_id_idx";

-- DropIndex
DROP INDEX "roles_heredados_parent_role_id_child_role_id_key";

-- DropIndex
DROP INDEX "roles_heredados_parent_role_id_idx";

-- AlterTable
ALTER TABLE "abono_cliente" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "caja_sesion" DROP COLUMN "created_at",
DROP COLUMN "fechaApertura",
DROP COLUMN "updated_at",
DROP COLUMN "users_id",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "categoria_tarifa" DROP CONSTRAINT "categoria_tarifa_pkey",
DROP COLUMN "categoria_id",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "categoria_tarifa_id" SERIAL NOT NULL,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "categoria_tarifa_pkey" PRIMARY KEY ("categoria_tarifa_id");

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "is_perfil_validado",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "es_perfil_validado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cobrador_sector" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "users_id",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "comunidades" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "contrato_medidor" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "contratos" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "cuota_convenio" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "detalle_factura" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "detalle_pago" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "is_validada",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "es_validada" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "lote_facturacion" DROP COLUMN "created_at",
DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creado_por" INTEGER;

-- AlterTable
ALTER TABLE "medidores" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "menus" DROP CONSTRAINT "menus_pkey",
DROP COLUMN "active",
DROP COLUMN "deleted_at",
DROP COLUMN "icon",
DROP COLUMN "menus_id",
DROP COLUMN "menus_parent_id",
DROP COLUMN "name",
DROP COLUMN "route",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "icono" TEXT,
ADD COLUMN     "menu_id" SERIAL NOT NULL,
ADD COLUMN     "menu_padre_id" INTEGER,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "ruta" TEXT NOT NULL,
ADD CONSTRAINT "menus_pkey" PRIMARY KEY ("menu_id");

-- AlterTable
ALTER TABLE "novedad_operativa" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
DROP COLUMN "users_id",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "parametro_tasa_interes" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "prefactura" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "borrado_en" TIMESTAMP(6),
ADD COLUMN     "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "estado_pago",
ADD COLUMN     "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
DROP COLUMN "estado_prefactura",
ADD COLUMN     "estado_prefactura" "EstadoPrefactura" NOT NULL DEFAULT 'BORRADOR';

-- AlterTable
ALTER TABLE "prefactura_detalle" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
ADD COLUMN     "borrado_en" TIMESTAMP(6),
ADD COLUMN     "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "producto" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "borrado_en" TIMESTAMP(6),
ADD COLUMN     "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
DROP COLUMN "deleted_at",
DROP COLUMN "name",
DROP COLUMN "roles_id",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "rol_id" SERIAL NOT NULL,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("rol_id");

-- AlterTable
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_pkey",
DROP COLUMN "child_role_id",
DROP COLUMN "deleted_at",
DROP COLUMN "parent_role_id",
DROP COLUMN "roles_heredados_id",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "rol_heredado_id" SERIAL NOT NULL,
ADD COLUMN     "rol_hijo_id" INTEGER NOT NULL,
ADD COLUMN     "rol_padre_id" INTEGER NOT NULL,
ADD CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("rol_heredado_id");

-- AlterTable
ALTER TABLE "rubros" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "sectores" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "servicio" DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "borrado_en" TIMESTAMP(6),
ADD COLUMN     "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "menu_permissions";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "rol_permissions";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "user_permissions";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "menu_permisos" (
    "menu_permiso_id" SERIAL NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "menu_permisos_pkey" PRIMARY KEY ("menu_permiso_id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "permiso_id" SERIAL NOT NULL,
    "recurso" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("permiso_id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "perfil_id" SERIAL NOT NULL,
    "primer_nombre" TEXT,
    "apellido" TEXT,
    "telefono" TEXT,
    "avatar" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("perfil_id")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "rol_permiso_id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("rol_permiso_id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "sesion_id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "hash_token_actualizado" TEXT NOT NULL,
    "direccion_ip" TEXT,
    "usuario_agente" TEXT,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("sesion_id")
);

-- CreateTable
CREATE TABLE "usuario_permisos" (
    "id_usuario_permiso" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "permitir" BOOLEAN NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "usuario_permisos_pkey" PRIMARY KEY ("id_usuario_permiso")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contrasenia" TEXT NOT NULL,
    "rol_id" INTEGER,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_usuario_id_key" ON "perfiles"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_expira_en_idx" ON "sesiones"("expira_en");

-- CreateIndex
CREATE INDEX "sesiones_revocado_expira_en_idx" ON "sesiones"("revocado", "expira_en");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "abono_cliente_borrado_en_idx" ON "abono_cliente"("borrado_en");

-- CreateIndex
CREATE INDEX "clientes_borrado_en_idx" ON "clientes"("borrado_en");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE INDEX "roles_heredados_rol_padre_id_idx" ON "roles_heredados"("rol_padre_id");

-- CreateIndex
CREATE INDEX "roles_heredados_rol_hijo_id_idx" ON "roles_heredados"("rol_hijo_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_heredados_rol_padre_id_rol_hijo_id_key" ON "roles_heredados"("rol_padre_id", "rol_hijo_id");

-- AddForeignKey
ALTER TABLE "menu_permisos" ADD CONSTRAINT "menu_permisos_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permisos" ADD CONSTRAINT "menu_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menu_padre_id_fkey" FOREIGN KEY ("menu_padre_id") REFERENCES "menus"("menu_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_hijo_id_fkey" FOREIGN KEY ("rol_hijo_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_padre_id_fkey" FOREIGN KEY ("rol_padre_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permisos" ADD CONSTRAINT "usuario_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permisos" ADD CONSTRAINT "usuario_permisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_sesion" ADD CONSTRAINT "caja_sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrador_sector" ADD CONSTRAINT "cobrador_sector_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_categoria_tarifa_id_fkey" FOREIGN KEY ("categoria_tarifa_id") REFERENCES "categoria_tarifa"("categoria_tarifa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
