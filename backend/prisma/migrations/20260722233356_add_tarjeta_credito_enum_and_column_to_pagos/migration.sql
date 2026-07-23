-- CreateEnum
CREATE TYPE "TarjetaCredito" AS ENUM ('DINERS', 'MASTERCARD', 'VISA', 'AMEX');

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN "tarjeta_credito" "TarjetaCredito";

-- CreateIndex
CREATE INDEX "pagos_tarjeta_credito_idx" ON "pagos"("tarjeta_credito");
