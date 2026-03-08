-- CreateTable
CREATE TABLE "role_hierarchy" (
    "role_hierarchy_id" SERIAL NOT NULL,
    "parent_role_id" INTEGER NOT NULL,
    "child_role_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "role_hierarchy_pkey" PRIMARY KEY ("role_hierarchy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_hierarchy_parent_role_id_child_role_id_key" ON "role_hierarchy"("parent_role_id", "child_role_id");

-- CreateIndex
CREATE INDEX "role_hierarchy_parent_role_id_idx" ON "role_hierarchy"("parent_role_id");

-- CreateIndex
CREATE INDEX "role_hierarchy_child_role_id_idx" ON "role_hierarchy"("child_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "role_hierarchy" ADD CONSTRAINT "role_hierarchy_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_hierarchy" ADD CONSTRAINT "role_hierarchy_child_role_id_fkey" FOREIGN KEY ("child_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;
