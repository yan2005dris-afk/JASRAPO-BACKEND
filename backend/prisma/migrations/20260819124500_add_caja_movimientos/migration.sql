-- CreateEnum
CREATE TYPE "TipoMovCaja" AS ENUM ('EGRESO', 'INGRESO_EXTRA');

-- CreateTable
CREATE TABLE "caja_movimientos" (
    "id" BIGSERIAL NOT NULL,
    "caja_id" BIGINT NOT NULL,
    "tipo_movimiento" "TipoMovCaja" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT NOT NULL,
    "comprobante_ref" TEXT,
    "creado_por" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caja_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "caja_movimientos_caja_id_idx" ON "caja_movimientos"("caja_id");

-- AddForeignKey
ALTER TABLE "caja_movimientos" ADD CONSTRAINT "caja_movimientos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja_sesion"("caja_id") ON DELETE RESTRICT ON UPDATE CASCADE;
