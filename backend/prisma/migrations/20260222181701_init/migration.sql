/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userPassword` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_userEmail_key";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "userEmail",
DROP COLUMN "userId",
DROP COLUMN "userName",
DROP COLUMN "userPassword",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "users_id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("users_id");

-- CreateTable
CREATE TABLE "menus" (
    "menus_id" SERIAL NOT NULL,
    "menus_parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("menus_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permissions_id" SERIAL NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permissions_id")
);

-- CreateTable
CREATE TABLE "rol_menus" (
    "rol_menus_id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rol_menus_pkey" PRIMARY KEY ("rol_menus_id")
);

-- CreateTable
CREATE TABLE "rol_permissions" (
    "rol_permissions_id" SERIAL NOT NULL,
    "roles_id" INTEGER NOT NULL,
    "permissions_id" INTEGER NOT NULL,

    CONSTRAINT "rol_permissions_pkey" PRIMARY KEY ("rol_permissions_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "roles_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roles_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessions_id" SERIAL NOT NULL,
    "users_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "is_revoked" BOOLEAN NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("sessions_id")
);

-- CreateTable
CREATE TABLE "users_roles" (
    "users_roles_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_roles_pkey" PRIMARY KEY ("users_roles_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menus_parent_id_fkey" FOREIGN KEY ("menus_parent_id") REFERENCES "menus"("menus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_menus" ADD CONSTRAINT "rol_menus_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_menus" ADD CONSTRAINT "rol_menus_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permissions" ADD CONSTRAINT "rol_permissions_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permissions" ADD CONSTRAINT "rol_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;
