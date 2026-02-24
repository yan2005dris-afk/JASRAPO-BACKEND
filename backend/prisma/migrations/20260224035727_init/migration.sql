/*
  Warnings:

  - You are about to drop the `rol_menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "rol_menus" DROP CONSTRAINT "rol_menus_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "rol_menus" DROP CONSTRAINT "rol_menus_rol_id_fkey";

-- DropTable
DROP TABLE "rol_menus";

-- CreateTable
CREATE TABLE "menu_permissions" (
    "rol_menus_id" SERIAL NOT NULL,
    "permissions_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("rol_menus_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id_user_permissions" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permissions_id" INTEGER NOT NULL,
    "allow" BOOLEAN NOT NULL,
    "detelted_at" TIMESTAMP(3),

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id_user_permissions")
);

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;
