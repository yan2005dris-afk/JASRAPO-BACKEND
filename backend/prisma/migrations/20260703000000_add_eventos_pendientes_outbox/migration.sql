-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('PENDIENTE', 'PROCESADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "eventos_pendientes" (
    "id" BIGSERIAL NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "aggregateType" VARCHAR(50),
    "aggregateId" VARCHAR(50),
    "payload" JSONB NOT NULL,
    "estado" "EstadoEvento" NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesado_en" TIMESTAMP(3),

    CONSTRAINT "eventos_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eventos_pendientes_estado_tipo_creado_en_idx" ON "eventos_pendientes"("estado", "tipo", "creado_en");

-- CreateIndex
CREATE INDEX "eventos_pendientes_aggregateType_aggregateId_idx" ON "eventos_pendientes"("aggregateType", "aggregateId");
