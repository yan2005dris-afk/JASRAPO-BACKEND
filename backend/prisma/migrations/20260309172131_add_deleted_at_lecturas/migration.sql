/*
  Warnings:

  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clientes_medidores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comunidades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `convenios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detalle_factura` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `facturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lecturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medidores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menu_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pagos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rol_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles_heredados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitudes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
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
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_menus_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_factura_id_fkey";

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
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "clientes_medidores";

-- DropTable
DROP TABLE "comunidades";

-- DropTable
DROP TABLE "convenios";

-- DropTable
DROP TABLE "detalle_factura";

-- DropTable
DROP TABLE "facturas";

-- DropTable
DROP TABLE "lecturas";

-- DropTable
DROP TABLE "medidores";

-- DropTable
DROP TABLE "menu_permissions";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "pagos";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "rol_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "roles_heredados";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "solicitudes";

-- DropTable
DROP TABLE "user_permissions";

-- DropTable
DROP TABLE "users";
