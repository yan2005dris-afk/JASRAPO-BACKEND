/*
  Warnings:

  - You are about to drop the `roles_heredados` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_rol_hijo_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_rol_padre_id_fkey";

-- DropTable
DROP TABLE "roles_heredados";
