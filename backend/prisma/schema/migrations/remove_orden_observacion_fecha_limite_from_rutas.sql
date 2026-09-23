-- DropIndex
DROP INDEX IF EXISTS "rutas_orden_idx";

-- AlterTable
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "orden";
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "observacion";
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "fecha_limite";
