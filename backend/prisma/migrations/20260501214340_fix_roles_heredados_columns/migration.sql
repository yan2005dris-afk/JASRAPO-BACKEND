/*
  Warnings:

  - The primary key for the `roles_heredados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `child_role_id` on the `roles_heredados` table. All the data in the column will be lost.
  - You are about to drop the column `parent_role_id` on the `roles_heredados` table. All the data in the column will be lost.
  - Added the required column `rol_hijo_id` to the `roles_heredados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol_padre_id` to the `roles_heredados` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_child_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_parent_role_id_fkey";

-- AlterTable
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_pkey",
DROP COLUMN "child_role_id",
DROP COLUMN "parent_role_id",
ADD COLUMN     "rol_hijo_id" INTEGER NOT NULL,
ADD COLUMN     "rol_padre_id" INTEGER NOT NULL,
ADD CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("rol_padre_id", "rol_hijo_id");

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_padre_id_fkey" FOREIGN KEY ("rol_padre_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_hijo_id_fkey" FOREIGN KEY ("rol_hijo_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;
