CREATE TYPE "OperatorSyncChangeOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

CREATE TABLE "operator_sync_changes" (
  "sequence_id" BIGSERIAL NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" BIGINT NOT NULL,
  "operation" "OperatorSyncChangeOperation" NOT NULL,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "periodo_id" INTEGER,
  "ruta_id" BIGINT,
  "comunidad_id" INTEGER,
  "sector_id" INTEGER,
  "medidor_id" BIGINT,
  "payload" JSONB NOT NULL,
  CONSTRAINT "operator_sync_changes_pkey" PRIMARY KEY ("sequence_id")
);
CREATE INDEX "operator_sync_changes_sequence_id_idx" ON "operator_sync_changes"("sequence_id");
CREATE INDEX "operator_sync_changes_changed_at_sequence_id_idx" ON "operator_sync_changes"("changed_at", "sequence_id");
CREATE INDEX "operator_sync_changes_periodo_id_comunidad_id_sector_id_sequence_id_idx" ON "operator_sync_changes"("periodo_id", "comunidad_id", "sector_id", "sequence_id");
CREATE INDEX "operator_sync_changes_ruta_id_sequence_id_idx" ON "operator_sync_changes"("ruta_id", "sequence_id");
CREATE INDEX "operator_sync_changes_medidor_id_sequence_id_idx" ON "operator_sync_changes"("medidor_id", "sequence_id");

CREATE OR REPLACE FUNCTION operator_sync_capture_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r jsonb; eid bigint; periodo integer; ruta bigint; comunidad integer; sector integer; medidor bigint; op "OperatorSyncChangeOperation";
BEGIN
  IF TG_OP = 'DELETE' THEN
    r := to_jsonb(OLD);
  ELSE
    r := to_jsonb(NEW);
  END IF;
  eid := (r ->> CASE TG_TABLE_NAME WHEN 'rutas' THEN 'ruta_id' WHEN 'ordenes_trabajo' THEN 'orden_trabajo_id' WHEN 'lecturas' THEN 'lectura_id' WHEN 'medidores' THEN 'medidor_id' ELSE 'anomalia_id' END)::bigint;
  op := CASE WHEN TG_OP = 'DELETE' THEN 'DELETE'::"OperatorSyncChangeOperation" WHEN TG_OP = 'UPDATE' AND (OLD.borrado_en IS NULL AND NEW.borrado_en IS NOT NULL) THEN 'DELETE'::"OperatorSyncChangeOperation" WHEN TG_OP = 'INSERT' THEN 'CREATE'::"OperatorSyncChangeOperation" ELSE 'UPDATE'::"OperatorSyncChangeOperation" END;
  periodo := NULL; ruta := NULL; comunidad := NULL; sector := NULL; medidor := NULL;
  IF TG_TABLE_NAME = 'rutas' THEN periodo := (r->>'periodo_id')::integer; ruta := eid; comunidad := (r->>'comunidad_id')::integer; sector := (r->>'sector_id')::integer;
  ELSIF TG_TABLE_NAME = 'ordenes_trabajo' THEN ruta := (r->>'ruta_id')::bigint; medidor := (r->>'medidor_id')::bigint;
    SELECT rt.periodo_id, rt.comunidad_id, rt.sector_id INTO periodo, comunidad, sector FROM rutas rt WHERE rt.ruta_id = ruta;
  ELSIF TG_TABLE_NAME = 'lecturas' THEN periodo := (r->>'periodo_id')::integer; medidor := (r->>'medidor_id')::bigint;
    SELECT c.comunidad_id, c.sector_id INTO comunidad, sector FROM historial_medidores hm JOIN contratos c ON c.contrato_id = hm.contrato_id WHERE hm.medidor_id = medidor AND hm.fecha_hasta IS NULL LIMIT 1;
  ELSIF TG_TABLE_NAME = 'medidores' THEN medidor := eid;
    SELECT c.comunidad_id, c.sector_id INTO comunidad, sector FROM historial_medidores hm JOIN contratos c ON c.contrato_id = hm.contrato_id WHERE hm.medidor_id = medidor AND hm.fecha_hasta IS NULL LIMIT 1;
  ELSE
    SELECT l.periodo_id, l.medidor_id INTO periodo, medidor FROM lecturas l WHERE l.lectura_id = (r->>'lectura_id')::bigint;
  END IF;
  INSERT INTO operator_sync_changes(entity_type, entity_id, operation, periodo_id, ruta_id, comunidad_id, sector_id, medidor_id, payload)
  VALUES (TG_TABLE_NAME, eid, op, periodo, ruta, comunidad, sector, medidor,
    jsonb_build_object('entityType', TG_TABLE_NAME, 'entityId', eid, 'operation', op, 'changedAt', clock_timestamp(), 'data', r));
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

CREATE TRIGGER operator_sync_rutas AFTER INSERT OR UPDATE OR DELETE ON rutas FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_ordenes_trabajo AFTER INSERT OR UPDATE OR DELETE ON ordenes_trabajo FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_lecturas AFTER INSERT OR UPDATE OR DELETE ON lecturas FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_medidores AFTER INSERT OR UPDATE OR DELETE ON medidores FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_lectura_anomalia AFTER INSERT OR UPDATE OR DELETE ON lectura_anomalia FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
