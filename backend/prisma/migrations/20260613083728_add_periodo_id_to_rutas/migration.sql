-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "periodo_id" INTEGER;

-- CreateIndex
CREATE INDEX "rutas_periodo_id_idx" ON "rutas"("periodo_id");

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos"("periodo_id") ON DELETE SET NULL ON UPDATE CASCADE;
