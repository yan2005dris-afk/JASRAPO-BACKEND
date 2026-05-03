/*
  Warnings:

  - The values [ESTIMADO] on the enum `EstadoMedidor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoMedidor_new" AS ENUM ('BODEGA', 'INSTALADO', 'DANADO', 'PENDIENTE', 'BAJA');
ALTER TABLE "medidores" ALTER COLUMN "estado" TYPE "EstadoMedidor_new" USING ("estado"::text::"EstadoMedidor_new");
ALTER TYPE "EstadoMedidor" RENAME TO "EstadoMedidor_old";
ALTER TYPE "EstadoMedidor_new" RENAME TO "EstadoMedidor";
DROP TYPE "public"."EstadoMedidor_old";
COMMIT;
