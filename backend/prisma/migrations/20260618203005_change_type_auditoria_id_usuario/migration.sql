/*
  Warnings:

  - The `usuario_id` column on the `auditoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "auditoria" DROP COLUMN "usuario_id",
ADD COLUMN     "usuario_id" INTEGER;

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");
