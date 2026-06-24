-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoRuta" ADD VALUE 'INSTALACION';
ALTER TYPE "TipoRuta" ADD VALUE 'INSPECCION';

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "fecha_limite" TIMESTAMP(3),
ADD COLUMN     "medidor_id" BIGINT,
ADD COLUMN     "observacion" TEXT,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "rutas_medidor_id_idx" ON "rutas"("medidor_id");

-- CreateIndex
CREATE INDEX "rutas_orden_idx" ON "rutas"("orden");

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE SET NULL ON UPDATE CASCADE;
