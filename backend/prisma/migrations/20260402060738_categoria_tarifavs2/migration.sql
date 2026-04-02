/*
  Warnings:

  - You are about to drop the column `limite_base_m3` on the `categoria_tarifa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categoria_tarifa" DROP COLUMN "limite_base_m3",
ADD COLUMN     "consumo_minimo_mensual" INTEGER DEFAULT 0;
