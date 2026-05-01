/*
  Warnings:

  - The values [NOTA_CREDITO] on the enum `TipoOrigenAbono` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `roles_heredados` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoDetallePago" ADD VALUE 'NOTA_DEBITO';
ALTER TYPE "TipoDetallePago" ADD VALUE 'SALDO_FAVOR';

-- AlterEnum
BEGIN;
CREATE TYPE "TipoOrigenAbono_new" AS ENUM ('PAGO_EXCESO', 'AJUSTE_RECLAMO', 'OTROS');
ALTER TABLE "saldo_favor_cliente" ALTER COLUMN "tipo_origen" TYPE "TipoOrigenAbono_new" USING ("tipo_origen"::text::"TipoOrigenAbono_new");
ALTER TYPE "TipoOrigenAbono" RENAME TO "TipoOrigenAbono_old";
ALTER TYPE "TipoOrigenAbono_new" RENAME TO "TipoOrigenAbono";
DROP TYPE "public"."TipoOrigenAbono_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_rol_hijo_id_fkey";

-- DropForeignKey
ALTER TABLE "roles_heredados" DROP CONSTRAINT "roles_heredados_rol_padre_id_fkey";

-- AlterTable
ALTER TABLE "detalle_pago" ADD COLUMN     "nota_debito_id" BIGINT;

-- DropTable
DROP TABLE "roles_heredados";

-- CreateIndex
CREATE INDEX "detalle_pago_nota_debito_id_idx" ON "detalle_pago"("nota_debito_id");

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_nota_debito_id_fkey" FOREIGN KEY ("nota_debito_id") REFERENCES "notas_debito"("id") ON DELETE SET NULL ON UPDATE CASCADE;
