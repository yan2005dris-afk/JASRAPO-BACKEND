/*
  Warnings:

  - You are about to drop the column `modifica_lectura_inicial` on the `lecturas` table. All the data in the column will be lost.
  - Changed the type of `lectura_inicial` on the `lecturas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "modifica_lectura_inicial",
DROP COLUMN "lectura_inicial",
ADD COLUMN     "lectura_inicial" BOOLEAN NOT NULL;
