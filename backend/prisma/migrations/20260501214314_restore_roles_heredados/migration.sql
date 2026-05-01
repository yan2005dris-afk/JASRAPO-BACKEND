-- CreateTable
CREATE TABLE "roles_heredados" (
    "parent_role_id" INTEGER NOT NULL,
    "child_role_id" INTEGER NOT NULL,

    CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("parent_role_id","child_role_id")
);

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_child_role_id_fkey" FOREIGN KEY ("child_role_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;
