/*
  Warnings:

  - The primary key for the `comunidades` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `comunidad_id` on the `comunidades` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `comunidad_id` on the `sectores` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "sectores" DROP CONSTRAINT "sectores_comunidad_id_fkey";

-- AlterTable
ALTER TABLE "comunidades" DROP CONSTRAINT "comunidades_pkey",
ALTER COLUMN "comunidad_id" TYPE INTEGER,
ALTER COLUMN "comunidad_id" SET DEFAULT nextval('comunidades_comunidad_id_seq'::regclass),
ADD CONSTRAINT "comunidades_pkey" PRIMARY KEY ("comunidad_id");

-- AlterTable
ALTER TABLE "sectores" ALTER COLUMN "comunidad_id" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "sectores" ADD CONSTRAINT "sectores_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE SET NULL ON UPDATE CASCADE;
