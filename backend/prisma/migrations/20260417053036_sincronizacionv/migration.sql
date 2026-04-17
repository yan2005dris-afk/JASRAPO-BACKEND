/*
  Warnings:

  - Added the required column `cliente_id` to the `convenios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cliente_id` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cliente_id` to the `pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cliente_id` to the `prefacturas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_caja_id_fkey";

-- AlterTable
ALTER TABLE "convenios" ADD COLUMN     "cliente_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "cliente_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "cliente_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "prefacturas" ADD COLUMN     "cliente_id" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "convenios_cliente_id_idx" ON "convenios"("cliente_id");

-- CreateIndex
CREATE INDEX "facturas_cliente_id_idx" ON "facturas"("cliente_id");

-- CreateIndex
CREATE INDEX "pagos_cliente_id_idx" ON "pagos"("cliente_id");

-- CreateIndex
CREATE INDEX "prefacturas_cliente_id_idx" ON "prefacturas"("cliente_id");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja_sesion"("caja_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;
