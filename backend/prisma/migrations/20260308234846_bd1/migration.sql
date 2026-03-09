/*
  Warnings:

  - You are about to drop the column `detelted_at` on the `user_permissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_permissions" DROP COLUMN "detelted_at",
ADD COLUMN     "deleted_at" TIMESTAMP(3);
