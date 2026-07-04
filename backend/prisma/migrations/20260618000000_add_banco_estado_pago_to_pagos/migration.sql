-- CreateEnum
CREATE TYPE "Banco" AS ENUM ('PICHINCHA', 'GUAYAQUIL', 'PRODUBANC', 'PACIFICIO', 'BOLIVARIANO', 'LOJA', 'AUSTRO', 'RUMIÑAHUI', 'CNT', 'Diners', 'Mastercard', 'Visa', 'AMEX', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'REGISTRADO', 'ANULADO');

-- AlterTable
ALTER TABLE "pagos"
  ADD COLUMN "banco" "Banco",
  ADD COLUMN "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE INDEX "pagos_banco_idx" ON "pagos"("banco");

-- CreateIndex
CREATE INDEX "pagos_estado_pago_idx" ON "pagos"("estado_pago");
