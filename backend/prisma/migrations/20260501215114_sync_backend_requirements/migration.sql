/*
  Warnings:

  - The primary key for the `roles_heredados` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[rol_padre_id,rol_hijo_id]` on the table `roles_heredados` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "lecturas" ADD COLUMN     "descripcion_anomalia" TEXT,
ALTER COLUMN "lectura_inicial" SET DEFAULT false;

-- AlterTable
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_pkey",
ADD COLUMN     "borrado_en" TIMESTAMP(3),
ADD COLUMN     "role_hierarchy_id" SERIAL NOT NULL,
ADD CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("role_hierarchy_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_heredados_rol_padre_id_rol_hijo_id_key" ON "roles_heredados"("rol_padre_id", "rol_hijo_id");
