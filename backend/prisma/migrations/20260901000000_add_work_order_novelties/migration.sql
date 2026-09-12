-- CreateEnum
CREATE TYPE "EstadoNovedad" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateTable
CREATE TABLE "novedades_ordenes_trabajo" (
    "novedad_id" BIGSERIAL PRIMARY KEY,
    "orden_trabajo_id" BIGINT NOT NULL REFERENCES "ordenes_trabajo"("orden_trabajo_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "lectura_id" BIGINT REFERENCES "lecturas"("lectura_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "observacion" TEXT,
    "tipo" "TipoAnomalia" NOT NULL,
    "estado" "EstadoNovedad" NOT NULL DEFAULT 'OPEN',
    "resolucion_tipo" "ResolucionEconomicaAnomalia",
    "consumo_ajustado" DECIMAL(18,2),
    "observacion_resolucion" TEXT,
    "resuelto_por_usuario_id" INTEGER REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "resuelto_en" TIMESTAMP(3) WITH TIME ZONE,
    "creado_en" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3) WITH TIME ZONE,
    "foto_url" TEXT,
    "legacy_anomalia_id" BIGINT UNIQUE
);

CREATE INDEX "novedades_ordenes_trabajo_orden_trabajo_id_estado_idx" ON "novedades_ordenes_trabajo"("orden_trabajo_id", "estado");
CREATE INDEX "novedades_ordenes_trabajo_orden_trabajo_id_idx" ON "novedades_ordenes_trabajo"("orden_trabajo_id");
CREATE INDEX "novedades_ordenes_trabajo_lectura_id_idx" ON "novedades_ordenes_trabajo"("lectura_id");

-- Preflight verification, deterministic backfill, sequence advancement, and reconciliation
DO $$
DECLARE
    v_unmatched INTEGER; v_ambiguous INTEGER; v_drift INTEGER; v_legacy INTEGER; v_target INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_unmatched FROM "lectura_anomalia" la
    WHERE NOT EXISTS (SELECT 1 FROM "ordenes_trabajo" ot WHERE ot."lectura_id" = la."lectura_id");
    IF v_unmatched > 0 THEN
        RAISE EXCEPTION 'Backfill blocked: % legacy anomalies have no matching work order', v_unmatched;
    END IF;

    SELECT COUNT(*) INTO v_ambiguous FROM (
        SELECT la."anomalia_id" FROM "lectura_anomalia" la
        JOIN "ordenes_trabajo" ot ON ot."lectura_id" = la."lectura_id"
        GROUP BY la."anomalia_id" HAVING COUNT(DISTINCT ot."orden_trabajo_id") > 1
    ) sub;
    IF v_ambiguous > 0 THEN
        RAISE EXCEPTION 'Backfill blocked: % legacy anomalies have multiple candidate work orders', v_ambiguous;
    END IF;

    SELECT COUNT(*) INTO v_drift FROM "novedades_ordenes_trabajo" n
    JOIN "lectura_anomalia" la ON n."legacy_anomalia_id" = la."anomalia_id"
    JOIN "ordenes_trabajo" ot ON ot."lectura_id" = la."lectura_id"
    WHERE n."orden_trabajo_id" IS DISTINCT FROM ot."orden_trabajo_id"
       OR n."lectura_id" IS DISTINCT FROM la."lectura_id"
       OR n."observacion" IS DISTINCT FROM la."observacion"
       OR n."tipo"::text IS DISTINCT FROM la."tipo"::text
       OR n."estado"::text IS DISTINCT FROM (
           CASE la."estado" WHEN 'PENDIENTE' THEN 'OPEN' WHEN 'EN_REVISION' THEN 'IN_PROGRESS'
                            WHEN 'RESUELTA' THEN 'RESOLVED' WHEN 'DESCARTADA' THEN 'CANCELLED' END
       )
       OR n."resolucion_tipo"::text IS DISTINCT FROM la."resolucion_tipo"::text
       OR n."consumo_ajustado" IS DISTINCT FROM la."consumo_ajustado"
       OR n."observacion_resolucion" IS DISTINCT FROM la."observacion_resolucion"
       OR n."resuelto_por_usuario_id" IS DISTINCT FROM la."resuelto_por_usuario_id"
       OR n."resuelto_en" IS DISTINCT FROM la."resuelto_en"
       OR n."creado_en" IS DISTINCT FROM la."creado_en"
       OR n."actualizado_en" IS DISTINCT FROM la."actualizado_en"
       OR n."borrado_en" IS DISTINCT FROM la."borrado_en"
       OR n."foto_url" IS DISTINCT FROM la."foto_url";
    IF v_drift > 0 THEN
        RAISE EXCEPTION 'Backfill blocked: % existing target rows do not match legacy anomaly source values', v_drift;
    END IF;

    INSERT INTO "novedades_ordenes_trabajo" (
        "novedad_id", "orden_trabajo_id", "lectura_id", "observacion", "tipo", "estado",
        "resolucion_tipo", "consumo_ajustado", "observacion_resolucion", "resuelto_por_usuario_id",
        "resuelto_en", "creado_en", "actualizado_en", "borrado_en", "foto_url", "legacy_anomalia_id"
    )
    SELECT
        la."anomalia_id", ot."orden_trabajo_id", la."lectura_id", la."observacion", la."tipo",
        CASE la."estado" WHEN 'PENDIENTE' THEN 'OPEN'::"EstadoNovedad"
                         WHEN 'EN_REVISION' THEN 'IN_PROGRESS'::"EstadoNovedad"
                         WHEN 'RESUELTA' THEN 'RESOLVED'::"EstadoNovedad"
                         WHEN 'DESCARTADA' THEN 'CANCELLED'::"EstadoNovedad" END,
        la."resolucion_tipo", la."consumo_ajustado", la."observacion_resolucion",
        la."resuelto_por_usuario_id", la."resuelto_en", la."creado_en", la."actualizado_en",
        la."borrado_en", la."foto_url", la."anomalia_id"
    FROM "lectura_anomalia" la
    JOIN "ordenes_trabajo" ot ON ot."lectura_id" = la."lectura_id"
    WHERE NOT EXISTS (SELECT 1 FROM "novedades_ordenes_trabajo" n WHERE n."legacy_anomalia_id" = la."anomalia_id")
    ON CONFLICT ("legacy_anomalia_id") DO NOTHING;

    PERFORM setval(
        'novedades_ordenes_trabajo_novedad_id_seq',
        GREATEST(COALESCE((SELECT MAX("novedad_id") FROM "novedades_ordenes_trabajo"), 1), 1),
        (SELECT COUNT(*) > 0 FROM "novedades_ordenes_trabajo")
    );

    SELECT COUNT(*) INTO v_legacy FROM "lectura_anomalia";
    SELECT COUNT(*) INTO v_target FROM "novedades_ordenes_trabajo" WHERE "legacy_anomalia_id" IS NOT NULL;
    IF v_legacy != v_target THEN
        RAISE EXCEPTION 'Reconciliation failed: legacy count (%) != target count (%)', v_legacy, v_target;
    END IF;
END $$;
