/*
  Warnings:

  - You are about to drop the column `forma_pago_id` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the column `metodo_pago` on the `pagos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_forma_pago_id_fkey";

-- DropIndex
DROP INDEX "facturas_forma_pago_id_idx";

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "forma_pago_id";

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "metodo_pago";

-- DropEnum
DROP TYPE "MetodoPago";

-- CreateTable
CREATE TABLE "pago_metodo_detalle" (
    "id" SERIAL NOT NULL,
    "pago_id" BIGINT NOT NULL,
    "forma_pago_id" INTEGER NOT NULL,
    "monto" DECIMAL(12,4) NOT NULL,
    "referencia" TEXT,
    "fecha_transaccion" TIMESTAMP(3),

    CONSTRAINT "pago_metodo_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pago_metodo_detalle_pago_id_idx" ON "pago_metodo_detalle"("pago_id");

-- CreateIndex
CREATE INDEX "pago_metodo_detalle_forma_pago_id_idx" ON "pago_metodo_detalle"("forma_pago_id");

-- AddForeignKey
ALTER TABLE "pago_metodo_detalle" ADD CONSTRAINT "pago_metodo_detalle_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago_metodo_detalle" ADD CONSTRAINT "pago_metodo_detalle_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
