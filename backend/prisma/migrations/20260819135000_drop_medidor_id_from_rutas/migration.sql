-- 1. Lossless backfill: Asegurar que toda ruta técnica (INSTALACION, RECONEXION, INSPECCION)
-- que tenga medidor_id o esté asociada a un contrato tenga su orden_trabajo creada.
INSERT INTO "ordenes_trabajo" ("ruta_id", "contrato_id", "medidor_id", "tipo_actividad", "estado", "orden_visita", "creado_en", "actualizado_en")
SELECT DISTINCT
    r.ruta_id,
    c.contrato_id,
    r.medidor_id,
    r.tipo_ruta::text::"TipoActividadOrden",
    CASE WHEN r.estado = 'COMPLETADA' THEN 'COMPLETADA'::"EstadoOrdenTrabajo"
         WHEN r.estado = 'EN_PROGRESO' THEN 'EN_PROGRESO'::"EstadoOrdenTrabajo"
         ELSE 'PENDIENTE'::"EstadoOrdenTrabajo" END,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM rutas r
JOIN contratos c ON c.comunidad_id = r.comunidad_id AND (r.sector_id IS NULL OR c.sector_id = r.sector_id) AND c.borrado_en IS NULL
WHERE r.medidor_id IS NOT NULL
  AND r.borrado_en IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM ordenes_trabajo ot
      WHERE ot.ruta_id = r.ruta_id
  );

-- 2. Eliminar foreign key, index y columna medidor_id de rutas
ALTER TABLE "rutas" DROP CONSTRAINT IF EXISTS "rutas_medidor_id_fkey";
DROP INDEX IF EXISTS "rutas_medidor_id_idx";
ALTER TABLE "rutas" DROP COLUMN IF EXISTS "medidor_id";

