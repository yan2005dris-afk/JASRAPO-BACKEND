-- Forward-only repair for lote month rollout and meter replacement authorization.

BEGIN;

-- 1. Expand lote.mes for databases that already applied the earlier migration.
ALTER TABLE "lote" ADD COLUMN IF NOT EXISTS "mes" INTEGER;
ALTER TABLE "lote" ALTER COLUMN "mes" DROP DEFAULT;
DROP INDEX IF EXISTS "lote_comunidad_periodo_mes_key";
DROP INDEX IF EXISTS "uk_lote_comunidad_periodo_mes";

-- Backfill only from the authoritative invoices belonging to each lot.
WITH resolved AS (
  SELECT l.lote_id, MIN(p.mes)::INTEGER AS mes
  FROM lote l
  JOIN prefacturas p ON p.lote_id = l.lote_id AND p.borrado_en IS NULL
  GROUP BY l.lote_id
  HAVING COUNT(DISTINCT p.mes) = 1
)
UPDATE lote l
SET mes = resolved.mes
FROM resolved
WHERE l.lote_id = resolved.lote_id;

DO $$
DECLARE
  unresolved_ids TEXT;
BEGIN
  SELECT string_agg(lote_id::TEXT, ', ' ORDER BY lote_id)
  INTO unresolved_ids
  FROM lote
  WHERE mes IS NULL
     OR mes NOT BETWEEN 1 AND 12
     OR NOT EXISTS (
       SELECT 1 FROM prefacturas p
       WHERE p.lote_id = lote.lote_id AND p.borrado_en IS NULL
     )
     OR EXISTS (
       SELECT 1 FROM prefacturas p
       WHERE p.lote_id = lote.lote_id AND p.borrado_en IS NULL
       GROUP BY p.lote_id HAVING COUNT(DISTINCT p.mes) > 1
     );

  IF unresolved_ids IS NOT NULL THEN
    RAISE EXCEPTION USING
      MESSAGE = 'No se puede derivar lote.mes sin ambigüedad para lotes: ' || unresolved_ids,
      HINT = 'Corrija cada lote usando el mes de sus prefacturas antes de reintentar la migración.';
  END IF;
END $$;

ALTER TABLE "lote" ADD CONSTRAINT "lote_mes_check"
  CHECK ("mes" BETWEEN 1 AND 12) NOT VALID;
ALTER TABLE "lote" VALIDATE CONSTRAINT "lote_mes_check";
ALTER TABLE "lote" ALTER COLUMN "mes" SET NOT NULL;

-- NULL routes form one explicit scope; deleted lots do not block regeneration.
DO $$
DECLARE duplicate_scopes TEXT;
BEGIN
  SELECT string_agg(
    comunidad_id::TEXT || '/' || periodo_id::TEXT || '/' || mes::TEXT || '/' ||
      COALESCE(ruta_id::TEXT, 'NULL'), ', ' ORDER BY comunidad_id, periodo_id, mes, ruta_id
  ) INTO duplicate_scopes
  FROM (
    SELECT comunidad_id, periodo_id, mes, ruta_id
    FROM lote
    WHERE borrado_en IS NULL
    GROUP BY comunidad_id, periodo_id, mes, ruta_id
    HAVING COUNT(*) > 1
  ) duplicates;
  IF duplicate_scopes IS NOT NULL THEN
    RAISE EXCEPTION USING
      MESSAGE = 'Existen lotes activos duplicados para los ciclos/rutas: ' || duplicate_scopes,
      HINT = 'Conserve un lote activo por alcance y marque los duplicados con borrado_en antes de reintentar.';
  END IF;
END $$;

CREATE UNIQUE INDEX "lote_activo_ciclo_ruta_key"
  ON "lote" ("comunidad_id", "periodo_id", "mes", COALESCE("ruta_id", -1::BIGINT))
  WHERE "borrado_en" IS NULL;

-- 2. Canonical user principals and explicit approval/processing state.
CREATE TYPE "EstadoAprobacionReemplazo" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');
ALTER TABLE "reemplazos_medidor"
  ADD COLUMN "estado_aprobacion" "EstadoAprobacionReemplazo" NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN "clave_idempotencia" TEXT,
  ADD COLUMN "huella_solicitud" TEXT,
  ADD COLUMN "origen_procesado_en" TIMESTAMP(3),
  ADD COLUMN "destino_procesado_en" TIMESTAMP(3);

DO $$
DECLARE invalid_ids TEXT;
BEGIN
  SELECT string_agg(reemplazo_id::TEXT, ', ' ORDER BY reemplazo_id)
  INTO invalid_ids
  FROM reemplazos_medidor
  WHERE solicitado_por_usuario_id IS NULL
     OR solicitado_por_usuario_id !~ '^[0-9]+$'
     OR NOT EXISTS (
       SELECT 1 FROM usuarios u
       WHERE u.usuario_id = solicitado_por_usuario_id::INTEGER
     )
     OR (autorizado_por_usuario_id IS NOT NULL AND (
       autorizado_por_usuario_id !~ '^[0-9]+$'
       OR NOT EXISTS (
         SELECT 1 FROM usuarios u
         WHERE u.usuario_id = autorizado_por_usuario_id::INTEGER
       )
     ));
  IF invalid_ids IS NOT NULL THEN
    RAISE EXCEPTION USING
      MESSAGE = 'Principales de reemplazo inválidos: ' || invalid_ids,
      HINT = 'Asigne solicitado_por_usuario_id/autorizado_por_usuario_id a usuarios canónicos antes de reintentar.';
  END IF;
END $$;

UPDATE reemplazos_medidor
SET clave_idempotencia = 'legacy-' || reemplazo_id,
    huella_solicitud = md5(reemplazo_id::TEXT || ':' || contrato_id::TEXT),
    estado_aprobacion = CASE
      WHEN tratamiento_saliente = 'COBRO_REAL'::"TratamientoSaliente"
       AND tratamiento_entrante = 'FACTURAR_PERIODO_ACTUAL'::"TratamientoEntrante"
      THEN 'APROBADA'::"EstadoAprobacionReemplazo"
      ELSE 'PENDIENTE'::"EstadoAprobacionReemplazo"
    END;

UPDATE reemplazos_medidor
SET autorizado_por_usuario_id = solicitado_por_usuario_id,
    autorizado_en = COALESCE(autorizado_en, creado_en)
WHERE estado_aprobacion = 'APROBADA'::"EstadoAprobacionReemplazo"
  AND autorizado_por_usuario_id IS NULL;

ALTER TABLE reemplazos_medidor
  ALTER COLUMN solicitado_por_usuario_id TYPE INTEGER USING solicitado_por_usuario_id::INTEGER,
  ALTER COLUMN autorizado_por_usuario_id TYPE INTEGER USING autorizado_por_usuario_id::INTEGER,
  ALTER COLUMN solicitado_por_usuario_id SET NOT NULL,
  ALTER COLUMN clave_idempotencia SET NOT NULL,
  ALTER COLUMN huella_solicitud SET NOT NULL;

ALTER TABLE reemplazos_medidor
  ADD CONSTRAINT reemplazos_medidor_solicitante_fkey
    FOREIGN KEY (solicitado_por_usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT reemplazos_medidor_autorizador_fkey
    FOREIGN KEY (autorizado_por_usuario_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT reemplazo_autorizador_distinto_check
    CHECK (
      (tratamiento_saliente = 'COBRO_REAL'::"TratamientoSaliente"
        AND tratamiento_entrante = 'FACTURAR_PERIODO_ACTUAL'::"TratamientoEntrante")
      OR autorizado_por_usuario_id IS NULL
      OR autorizado_por_usuario_id <> solicitado_por_usuario_id
    ),
  ADD CONSTRAINT reemplazo_aprobacion_coherente_check
    CHECK (
      (estado_aprobacion = 'PENDIENTE' AND autorizado_por_usuario_id IS NULL AND autorizado_en IS NULL)
      OR (estado_aprobacion = 'APROBADA' AND autorizado_por_usuario_id IS NOT NULL AND autorizado_en IS NOT NULL)
      OR estado_aprobacion = 'RECHAZADA'
    );

CREATE UNIQUE INDEX reemplazos_medidor_solicitante_idempotencia_key
  ON reemplazos_medidor(solicitado_por_usuario_id, clave_idempotencia);
CREATE INDEX reemplazos_medidor_autorizador_idx ON reemplazos_medidor(autorizado_por_usuario_id);
CREATE INDEX reemplazos_medidor_aprobacion_ciclo_idx
  ON reemplazos_medidor(estado_aprobacion, periodo_origen_id, mes_origen);

INSERT INTO permisos(nombre, descripcion, recurso, accion)
SELECT 'Aprobar Reemplazos De Medidor',
       'Permite aprobar tratamientos económicos excepcionales de reemplazos de medidor',
       'meter-replacements', 'approve'
WHERE NOT EXISTS (
  SELECT 1 FROM permisos
  WHERE recurso = 'meter-replacements' AND accion = 'approve' AND borrado_en IS NULL
);

-- The function is replaced in the following migration so already-applied
-- environments receive the corrected billing ledger implementation.

COMMIT;
