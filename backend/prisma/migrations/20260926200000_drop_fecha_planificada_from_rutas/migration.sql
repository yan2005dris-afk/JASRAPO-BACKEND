-- DropIndex
DROP INDEX IF EXISTS "rutas_fecha_planificada_idx";

-- AlterTable
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "fecha_planificada";
