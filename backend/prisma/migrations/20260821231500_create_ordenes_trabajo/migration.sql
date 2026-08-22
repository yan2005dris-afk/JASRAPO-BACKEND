-- Work orders are the source of truth for the field stops assigned to a route.
CREATE TYPE "TipoActividadOrdenTrabajo" AS ENUM (
  'LECTURA',
  'INSTALACION',
  'RECONEXION',
  'INSPECCION'
);

CREATE TYPE "EstadoOrdenTrabajo" AS ENUM (
  'PENDIENTE',
  'EN_PROGRESO',
  'COMPLETADA',
  'CANCELADA',
  'FALLIDA'
);

CREATE TABLE "ordenes_trabajo" (
  "orden_trabajo_id" BIGSERIAL NOT NULL,
  "ruta_id" BIGINT NOT NULL,
  "contrato_id" BIGINT NOT NULL,
  "medidor_id" BIGINT,
  "lectura_id" BIGINT,
  "tipo_actividad" "TipoActividadOrdenTrabajo" NOT NULL,
  "estado" "EstadoOrdenTrabajo" NOT NULL DEFAULT 'PENDIENTE',
  "orden_visita" INTEGER NOT NULL DEFAULT 0,
  "resultado_observacion" TEXT,
  "evidencia_foto_url" TEXT,
  "completado_en" TIMESTAMP(3),
  "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizado_en" TIMESTAMP(3) NOT NULL,
  "borrado_en" TIMESTAMP(3),
  CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("orden_trabajo_id")
);

CREATE UNIQUE INDEX "ordenes_trabajo_ruta_id_lectura_id_key"
  ON "ordenes_trabajo"("ruta_id", "lectura_id");
CREATE UNIQUE INDEX "ordenes_trabajo_ruta_id_medidor_id_tipo_actividad_key"
  ON "ordenes_trabajo"("ruta_id", "medidor_id", "tipo_actividad");
CREATE INDEX "ordenes_trabajo_ruta_id_estado_idx"
  ON "ordenes_trabajo"("ruta_id", "estado");
CREATE INDEX "ordenes_trabajo_contrato_id_idx"
  ON "ordenes_trabajo"("contrato_id");
CREATE INDEX "ordenes_trabajo_medidor_id_idx"
  ON "ordenes_trabajo"("medidor_id");
CREATE INDEX "ordenes_trabajo_lectura_id_idx"
  ON "ordenes_trabajo"("lectura_id");
CREATE INDEX "ordenes_trabajo_orden_visita_idx"
  ON "ordenes_trabajo"("orden_visita");

ALTER TABLE "ordenes_trabajo"
  ADD CONSTRAINT "ordenes_trabajo_ruta_id_fkey"
  FOREIGN KEY ("ruta_id") REFERENCES "rutas"("ruta_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ordenes_trabajo"
  ADD CONSTRAINT "ordenes_trabajo_contrato_id_fkey"
  FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ordenes_trabajo"
  ADD CONSTRAINT "ordenes_trabajo_medidor_id_fkey"
  FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ordenes_trabajo"
  ADD CONSTRAINT "ordenes_trabajo_lectura_id_fkey"
  FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill reading routes from their explicit lectura.ruta_id assignment.
INSERT INTO "ordenes_trabajo" (
  "ruta_id",
  "contrato_id",
  "medidor_id",
  "lectura_id",
  "tipo_actividad",
  "estado",
  "orden_visita",
  "completado_en",
  "creado_en",
  "actualizado_en"
)
SELECT
  l."ruta_id",
  hm."contrato_id",
  l."medidor_id",
  l."lectura_id",
  'LECTURA'::"TipoActividadOrdenTrabajo",
  CASE
    WHEN l."estado" IN ('APROBADA', 'PLANILLADA') THEN 'COMPLETADA'::"EstadoOrdenTrabajo"
    WHEN l."estado" IN ('RECHAZADA_VERIFICACION', 'CON_NOVEDAD') THEN 'FALLIDA'::"EstadoOrdenTrabajo"
    WHEN l."estado" = 'POR_REVISION' THEN 'EN_PROGRESO'::"EstadoOrdenTrabajo"
    ELSE 'PENDIENTE'::"EstadoOrdenTrabajo"
  END,
  ROW_NUMBER() OVER (PARTITION BY l."ruta_id" ORDER BY l."lectura_id")::INTEGER,
  CASE WHEN l."estado" IN ('APROBADA', 'PLANILLADA') THEN l."actualizado_en" END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "lecturas" l
JOIN "rutas" r ON r."ruta_id" = l."ruta_id" AND r."borrado_en" IS NULL
JOIN LATERAL (
  SELECT h."contrato_id"
  FROM "historial_medidores" h
  WHERE h."medidor_id" = l."medidor_id"
    AND h."borrado_en" IS NULL
    AND h."fecha_hasta" IS NULL
  ORDER BY h."fecha_desde" DESC
  LIMIT 1
) hm ON TRUE
WHERE l."ruta_id" IS NOT NULL
  AND l."borrado_en" IS NULL
  AND r."tipo_ruta" = 'TOMA_LECTURA'
ON CONFLICT DO NOTHING;

-- Backfill meter-specific installation, reconnection and inspection routes.
INSERT INTO "ordenes_trabajo" (
  "ruta_id",
  "contrato_id",
  "medidor_id",
  "tipo_actividad",
  "estado",
  "orden_visita",
  "completado_en",
  "creado_en",
  "actualizado_en"
)
SELECT
  r."ruta_id",
  hm."contrato_id",
  r."medidor_id",
  r."tipo_ruta"::text::"TipoActividadOrdenTrabajo",
  CASE
    WHEN r."estado" = 'COMPLETADA' THEN 'COMPLETADA'::"EstadoOrdenTrabajo"
    WHEN r."estado" = 'CANCELADA' THEN 'CANCELADA'::"EstadoOrdenTrabajo"
    WHEN r."estado" IN ('EN_PROGRESO', 'PARCIAL') THEN 'EN_PROGRESO'::"EstadoOrdenTrabajo"
    ELSE 'PENDIENTE'::"EstadoOrdenTrabajo"
  END,
  1,
  CASE WHEN r."estado" = 'COMPLETADA' THEN r."fecha_fin" END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "rutas" r
JOIN LATERAL (
  SELECT h."contrato_id"
  FROM "historial_medidores" h
  WHERE h."medidor_id" = r."medidor_id"
    AND h."borrado_en" IS NULL
    AND h."fecha_hasta" IS NULL
  ORDER BY h."fecha_desde" DESC
  LIMIT 1
) hm ON TRUE
WHERE r."borrado_en" IS NULL
  AND r."medidor_id" IS NOT NULL
  AND r."tipo_ruta" IN ('INSTALACION', 'RECONEXION', 'INSPECCION')
ON CONFLICT DO NOTHING;
