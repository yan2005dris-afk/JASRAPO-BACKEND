-- Eliminar foreign key, index y columna medidor_id de rutas
ALTER TABLE "rutas" DROP CONSTRAINT IF EXISTS "rutas_medidor_id_fkey";
DROP INDEX IF EXISTS "rutas_medidor_id_idx";
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "medidor_id";
