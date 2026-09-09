-- CreateEnum
CREATE TYPE "EstadoEjecucionOrden" AS ENUM ('LEGACY_UNKNOWN', 'DRAFT', 'SUBMITTED', 'CANCELED');

-- AlterTable
ALTER TABLE "ejecuciones_ordenes_trabajo" ADD COLUMN     "cancelado_en" TIMESTAMP(3),
ADD COLUMN     "creado_por_usuario_id" INTEGER,
ADD COLUMN     "enviado_en" TIMESTAMP(3),
ADD COLUMN     "enviado_por_usuario_id" INTEGER,
ADD COLUMN     "estado" "EstadoEjecucionOrden" NOT NULL DEFAULT 'LEGACY_UNKNOWN',
ADD COLUMN     "propietario_usuario_id" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "ejecuciones_ordenes_trabajo" ADD CONSTRAINT "ejecuciones_ordenes_trabajo_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones_ordenes_trabajo" ADD CONSTRAINT "ejecuciones_ordenes_trabajo_propietario_usuario_id_fkey" FOREIGN KEY ("propietario_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejecuciones_ordenes_trabajo" ADD CONSTRAINT "ejecuciones_ordenes_trabajo_enviado_por_usuario_id_fkey" FOREIGN KEY ("enviado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma cannot express these lifecycle invariants; ownership is retained here.
ALTER TABLE "ejecuciones_ordenes_trabajo"
  ADD CONSTRAINT "ejecuciones_ordenes_trabajo_version_check" CHECK (version >= 1),
  ADD CONSTRAINT "ejecuciones_ordenes_trabajo_actor_positive_check" CHECK (
    (creado_por_usuario_id IS NULL OR creado_por_usuario_id > 0) AND
    (propietario_usuario_id IS NULL OR propietario_usuario_id > 0) AND
    (enviado_por_usuario_id IS NULL OR enviado_por_usuario_id > 0)
  ),
  ADD CONSTRAINT "ejecuciones_ordenes_trabajo_lifecycle_check" CHECK (
    (estado = 'LEGACY_UNKNOWN' AND creado_por_usuario_id IS NULL AND propietario_usuario_id IS NULL AND enviado_por_usuario_id IS NULL AND enviado_en IS NULL AND cancelado_en IS NULL) OR
    (estado = 'DRAFT' AND creado_por_usuario_id IS NOT NULL AND propietario_usuario_id IS NOT NULL AND enviado_por_usuario_id IS NULL AND enviado_en IS NULL AND cancelado_en IS NULL) OR
    (estado = 'SUBMITTED' AND creado_por_usuario_id IS NOT NULL AND propietario_usuario_id IS NOT NULL AND enviado_por_usuario_id IS NOT NULL AND enviado_en IS NOT NULL AND cancelado_en IS NULL) OR
    (estado = 'CANCELED' AND creado_por_usuario_id IS NOT NULL AND propietario_usuario_id IS NOT NULL AND enviado_por_usuario_id IS NULL AND enviado_en IS NULL AND cancelado_en IS NOT NULL)
  );
