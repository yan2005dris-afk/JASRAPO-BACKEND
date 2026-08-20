-- CreateEnum
CREATE TYPE "MotivoReemplazoMedidor" AS ENUM ('DANO', 'MANTENIMIENTO_PREVENTIVO', 'CALIBRACION', 'REUBICACION', 'FIN_VIDA_UTIL', 'OTRO');

-- CreateEnum
CREATE TYPE "ResponsabilidadDano" AS ENUM ('USUARIO', 'JUNTA', 'TERCERO', 'NO_DETERMINADA', 'NO_APLICA');

-- CreateEnum
CREATE TYPE "TratamientoSaliente" AS ENUM ('COBRO_REAL', 'PROMEDIO_HISTORICO', 'EXONERADO', 'COBRO_PARCIAL');

-- CreateEnum
CREATE TYPE "TratamientoEntrante" AS ENUM ('FACTURAR_PERIODO_ACTUAL', 'DIFERIR_SIGUIENTE_PERIODO');

-- CreateEnum
CREATE TYPE "EstadoResolucionConsumo" AS ENUM ('PENDIENTE', 'APLICADA', 'ANULADA');

-- CreateTable
CREATE TABLE "reemplazos_medidor" (
    "reemplazo_id" BIGSERIAL NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "historial_saliente_id" BIGINT NOT NULL,
    "historial_entrante_id" BIGINT NOT NULL,
    "lectura_final_saliente_id" BIGINT,
    "lectura_inicial_entrante_id" BIGINT,
    "orden_trabajo_id" BIGINT,
    "periodo_origen_id" INTEGER NOT NULL,
    "periodo_destino_id" INTEGER,
    "motivo" "MotivoReemplazoMedidor" NOT NULL,
    "responsabilidad_dano" "ResponsabilidadDano" NOT NULL DEFAULT 'NO_APLICA',
    "detalle_motivo" TEXT,
    "tratamiento_saliente" "TratamientoSaliente" NOT NULL,
    "tratamiento_entrante" "TratamientoEntrante" NOT NULL,
    "consumo_medido_saliente" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "consumo_facturable_saliente" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "consumo_medido_entrante" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "consumo_facturable_entrante" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "consumo_diferido_entrante" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "ventana_promedio" INTEGER,
    "promedio_calculado" DECIMAL(18,2),
    "porcentaje_cobro" DECIMAL(5,2),
    "tarifa_origen_snapshot" JSONB,
    "prefactura_detalle_saliente_id" BIGINT,
    "prefactura_detalle_entrante_id" BIGINT,
    "estado" "EstadoResolucionConsumo" NOT NULL DEFAULT 'PENDIENTE',
    "solicitado_por_usuario_id" TEXT,
    "autorizado_por_usuario_id" TEXT,
    "autorizado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),
    "creado_por" TEXT,
    "actualizado_por" TEXT,

    CONSTRAINT "reemplazos_medidor_pkey" PRIMARY KEY ("reemplazo_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reemplazos_medidor_historial_saliente_id_key" ON "reemplazos_medidor"("historial_saliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "reemplazos_medidor_historial_entrante_id_key" ON "reemplazos_medidor"("historial_entrante_id");

-- CreateIndex
CREATE UNIQUE INDEX "reemplazos_medidor_prefactura_detalle_entrante_id_key" ON "reemplazos_medidor"("prefactura_detalle_entrante_id");

-- CreateIndex
CREATE INDEX "reemplazos_medidor_contrato_id_idx" ON "reemplazos_medidor"("contrato_id");

-- CreateIndex
CREATE INDEX "reemplazos_medidor_periodo_origen_id_idx" ON "reemplazos_medidor"("periodo_origen_id");

-- CreateIndex
CREATE INDEX "reemplazos_medidor_periodo_destino_id_idx" ON "reemplazos_medidor"("periodo_destino_id");

-- CreateIndex
CREATE INDEX "reemplazos_medidor_prefactura_detalle_saliente_id_idx" ON "reemplazos_medidor"("prefactura_detalle_saliente_id");

-- Partial unique indexes for active assignments in historial_medidores
CREATE UNIQUE INDEX IF NOT EXISTS "idx_historial_contrato_abierto" ON "historial_medidores"("contrato_id") WHERE "fecha_hasta" IS NULL AND "borrado_en" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_historial_medidor_abierto" ON "historial_medidores"("medidor_id") WHERE "fecha_hasta" IS NULL AND "borrado_en" IS NULL;

-- AddForeignKeys
ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_historial_saliente_id_fkey" FOREIGN KEY ("historial_saliente_id") REFERENCES "historial_medidores"("historial_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_historial_entrante_id_fkey" FOREIGN KEY ("historial_entrante_id") REFERENCES "historial_medidores"("historial_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_lectura_final_saliente_id_fkey" FOREIGN KEY ("lectura_final_saliente_id") REFERENCES "lecturas"("lectura_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_lectura_inicial_entrante_id_fkey" FOREIGN KEY ("lectura_inicial_entrante_id") REFERENCES "lecturas"("lectura_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_orden_trabajo_id_fkey" FOREIGN KEY ("orden_trabajo_id") REFERENCES "ordenes_trabajo"("orden_trabajo_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_periodo_origen_id_fkey" FOREIGN KEY ("periodo_origen_id") REFERENCES "periodos"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_periodo_destino_id_fkey" FOREIGN KEY ("periodo_destino_id") REFERENCES "periodos"("periodo_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_prefactura_detalle_saliente_id_fkey" FOREIGN KEY ("prefactura_detalle_saliente_id") REFERENCES "prefactura_detalle"("prefactura_detalle_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_prefactura_detalle_entrante_id_fkey" FOREIGN KEY ("prefactura_detalle_entrante_id") REFERENCES "prefactura_detalle"("prefactura_detalle_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Constraints
ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "chk_reemplazo_consumos_no_negativos" CHECK (
    "consumo_medido_saliente" >= 0 AND
    "consumo_facturable_saliente" >= 0 AND
    "consumo_medido_entrante" >= 0 AND
    "consumo_facturable_entrante" >= 0 AND
    "consumo_diferido_entrante" >= 0
);
