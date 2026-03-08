/*
  Warnings:

  - The `avatar` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "avatar",
ADD COLUMN     "avatar" JSONB;
