-- CreateEnum
CREATE TYPE "TipoRuta" AS ENUM ('TOMA_LECTURA', 'RECONEXION');

-- CreateEnum
CREATE TYPE "EstadoRuta" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'PARCIAL', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('NO_ASIGNADA', 'ASIGNADA', 'TOMADA', 'COMPLETADA');

-- AlterTable
ALTER TABLE "lecturas" ADD COLUMN     "estado_asignacion" "EstadoAsignacion" NOT NULL DEFAULT 'NO_ASIGNADA',
ADD COLUMN     "ruta_asignada_id" BIGINT;

-- CreateTable
CREATE TABLE "rutas" (
    "ruta_id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "operario_id" INTEGER NOT NULL,
    "tipo_ruta" "TipoRuta" NOT NULL,
    "comunidad_id" INTEGER NOT NULL,
    "sector_id" INTEGER,
    "estado" "EstadoRuta" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_planificada" TIMESTAMP(3),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("ruta_id")
);

-- CreateIndex
CREATE INDEX "rutas_operario_id_idx" ON "rutas"("operario_id");

-- CreateIndex
CREATE INDEX "rutas_comunidad_id_idx" ON "rutas"("comunidad_id");

-- CreateIndex
CREATE INDEX "rutas_sector_id_idx" ON "rutas"("sector_id");

-- CreateIndex
CREATE INDEX "rutas_estado_idx" ON "rutas"("estado");

-- CreateIndex
CREATE INDEX "rutas_tipo_ruta_idx" ON "rutas"("tipo_ruta");

-- CreateIndex
CREATE INDEX "rutas_fecha_planificada_idx" ON "rutas"("fecha_planificada");

-- CreateIndex
CREATE INDEX "lecturas_ruta_asignada_id_idx" ON "lecturas"("ruta_asignada_id");

-- CreateIndex
CREATE INDEX "lecturas_estado_asignacion_idx" ON "lecturas"("estado_asignacion");

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_ruta_asignada_id_fkey" FOREIGN KEY ("ruta_asignada_id") REFERENCES "rutas"("ruta_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_operario_id_fkey" FOREIGN KEY ("operario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("sector_id") ON DELETE SET NULL ON UPDATE CASCADE;
