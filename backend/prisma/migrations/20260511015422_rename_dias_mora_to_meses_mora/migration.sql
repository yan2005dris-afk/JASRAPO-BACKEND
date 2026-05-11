/*
  Warnings:

  - You are about to drop the column `dias_mora_actual` on the `convenios` table. All the data in the column will be lost.
  - Added the required column `meses_mora_actual` to the `convenios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "dias_mora_actual",
ADD COLUMN     "meses_mora_actual" INTEGER NOT NULL;
