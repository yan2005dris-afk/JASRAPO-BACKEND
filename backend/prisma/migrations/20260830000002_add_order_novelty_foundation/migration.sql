-- CreateEnum
CREATE TYPE "TipoNovedadOrden" AS ENUM ('FUGA', 'MEDIDOR_DAÑADO', 'LECTURA_ERRONEA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoNovedadOrden" AS ENUM ('PENDIENTE', 'EN_SEGUIMIENTO', 'RESUELTA');

-- CreateTable
CREATE TABLE "novedades_ordenes_trabajo" (
    "novedad_id" BIGSERIAL NOT NULL,
    "orden_trabajo_id" BIGINT NOT NULL,
    "ejecucion_id" BIGINT,
    "lectura_id" BIGINT,
    "reportado_por_usuario_id" INTEGER NOT NULL,
    "responsable_usuario_id" INTEGER NOT NULL,
    "tipo" "TipoNovedadOrden" NOT NULL,
    "estado" "EstadoNovedadOrden" NOT NULL DEFAULT 'PENDIENTE',
    "observacion" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novedades_ordenes_trabajo_pkey" PRIMARY KEY ("novedad_id")
);

-- CreateIndex
CREATE INDEX "novedades_ordenes_trabajo_orden_trabajo_id_creado_en_idx" ON "novedades_ordenes_trabajo"("orden_trabajo_id", "creado_en");

-- CreateIndex
CREATE INDEX "novedades_ordenes_trabajo_responsable_usuario_id_estado_act_idx" ON "novedades_ordenes_trabajo"("responsable_usuario_id", "estado", "actualizado_en");

-- CreateIndex
CREATE INDEX "novedades_ordenes_trabajo_lectura_id_estado_tipo_idx" ON "novedades_ordenes_trabajo"("lectura_id", "estado", "tipo");

-- CreateIndex
CREATE INDEX "novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_idx" ON "novedades_ordenes_trabajo"("ejecucion_id", "orden_trabajo_id");

-- CreateIndex
CREATE INDEX "novedades_ordenes_trabajo_reportado_por_usuario_id_idx" ON "novedades_ordenes_trabajo"("reportado_por_usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_ordenes_trabajo_ejecucion_id_orden_trabajo_id_key" ON "ejecuciones_ordenes_trabajo"("ejecucion_id", "orden_trabajo_id");

-- AddForeignKey
ALTER TABLE "novedades_ordenes_trabajo" ADD CONSTRAINT "novedades_ordenes_trabajo_orden_trabajo_id_fkey" FOREIGN KEY ("orden_trabajo_id") REFERENCES "ordenes_trabajo"("orden_trabajo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_ordenes_trabajo" ADD CONSTRAINT "novedades_ordenes_trabajo_ejecucion_id_orden_trabajo_id_fkey" FOREIGN KEY ("ejecucion_id", "orden_trabajo_id") REFERENCES "ejecuciones_ordenes_trabajo"("ejecucion_id", "orden_trabajo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_ordenes_trabajo" ADD CONSTRAINT "novedades_ordenes_trabajo_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_ordenes_trabajo" ADD CONSTRAINT "novedades_ordenes_trabajo_reportado_por_usuario_id_fkey" FOREIGN KEY ("reportado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_ordenes_trabajo" ADD CONSTRAINT "novedades_ordenes_trabajo_responsable_usuario_id_fkey" FOREIGN KEY ("responsable_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;
