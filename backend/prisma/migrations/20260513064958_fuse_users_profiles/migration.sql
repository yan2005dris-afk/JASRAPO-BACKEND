/*
  Warnings:

  - You are about to drop the `perfiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "perfiles" DROP CONSTRAINT "perfiles_usuario_id_fkey";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "apellido" TEXT,
ADD COLUMN     "avatar" JSONB,
ADD COLUMN     "perfil_actualizado_en" TIMESTAMP(3),
ADD COLUMN     "perfil_creado_en" TIMESTAMP(3),
ADD COLUMN     "primer_nombre" TEXT,
ADD COLUMN     "telefono" TEXT;

-- DropTable
DROP TABLE "perfiles";
