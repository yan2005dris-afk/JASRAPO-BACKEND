/*
  Warnings:

  - You are about to drop the column `perfil_actualizado_en` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `perfil_creado_en` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "perfil_actualizado_en",
DROP COLUMN "perfil_creado_en",
ADD COLUMN     "actualizado_en" TIMESTAMP(3),
ADD COLUMN     "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
