/*
  Warnings:

  - You are about to drop the column `abono` on the `facturas` table. All the data in the column will be lost.
  - You are about to drop the `pago_metodo_detalle` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `forma_pago_id` to the `detalle_pago` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forma_pago_id` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `facturas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pago_metodo_detalle" DROP CONSTRAINT "pago_metodo_detalle_forma_pago_id_fkey";

-- DropForeignKey
ALTER TABLE "pago_metodo_detalle" DROP CONSTRAINT "pago_metodo_detalle_pago_id_fkey";

-- AlterTable
ALTER TABLE "detalle_pago" ADD COLUMN     "fecha_transaccion" TIMESTAMP(3),
ADD COLUMN     "forma_pago_id" INTEGER NOT NULL,
ADD COLUMN     "referencia" TEXT;

-- AlterTable
ALTER TABLE "facturas" DROP COLUMN "abono",
ADD COLUMN     "forma_pago_id" INTEGER NOT NULL,
ADD COLUMN     "total" DECIMAL NOT NULL;

-- DropTable
DROP TABLE "pago_metodo_detalle";

-- CreateIndex
CREATE INDEX "detalle_pago_forma_pago_id_idx" ON "detalle_pago"("forma_pago_id");

-- CreateIndex
CREATE INDEX "facturas_forma_pago_id_idx" ON "facturas"("forma_pago_id");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
