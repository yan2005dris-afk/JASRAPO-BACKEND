/*
  Warnings:

  - You are about to drop the `role_hierarchy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role_hierarchy" DROP CONSTRAINT "role_hierarchy_child_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_hierarchy" DROP CONSTRAINT "role_hierarchy_parent_role_id_fkey";

-- DropTable
DROP TABLE "role_hierarchy";

-- CreateTable
CREATE TABLE "roles_heredados" (
    "roles_heredados_id" SERIAL NOT NULL,
    "parent_role_id" INTEGER NOT NULL,
    "child_role_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("roles_heredados_id")
);

-- CreateIndex
CREATE INDEX "roles_heredados_parent_role_id_idx" ON "roles_heredados"("parent_role_id");

-- CreateIndex
CREATE INDEX "roles_heredados_child_role_id_idx" ON "roles_heredados"("child_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_heredados_parent_role_id_child_role_id_key" ON "roles_heredados"("parent_role_id", "child_role_id");

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_child_role_id_fkey" FOREIGN KEY ("child_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;
