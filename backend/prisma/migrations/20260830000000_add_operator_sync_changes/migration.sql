-- This migration must run after the five source tables exist; the trigger body
-- intentionally uses their mapped PostgreSQL names and columns.
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
CREATE INDEX "operator_sync_changes_changed_at_sequence_id_idx" ON "operator_sync_changes"("changed_at", "sequence_id");
CREATE INDEX "operator_sync_changes_periodo_id_comunidad_id_sector_id_sequence_id_idx" ON "operator_sync_changes"("periodo_id", "comunidad_id", "sector_id", "sequence_id");
CREATE INDEX "operator_sync_changes_ruta_id_sequence_id_idx" ON "operator_sync_changes"("ruta_id", "sequence_id");
CREATE INDEX "operator_sync_changes_medidor_id_sequence_id_idx" ON "operator_sync_changes"("medidor_id", "sequence_id");

CREATE OR REPLACE FUNCTION operator_sync_capture_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  row_data jsonb; entity_key bigint; period_key integer; route_key bigint;
  community_key integer; sector_key integer; meter_key bigint;
  change_operation "OperatorSyncChangeOperation";
BEGIN
  row_data := to_jsonb(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END);
  entity_key := (row_data ->> CASE TG_TABLE_NAME
    WHEN 'rutas' THEN 'ruta_id' WHEN 'ordenes_trabajo' THEN 'orden_trabajo_id'
    WHEN 'lecturas' THEN 'lectura_id' WHEN 'medidores' THEN 'medidor_id'
    ELSE 'anomalia_id' END)::bigint;
  change_operation := CASE
    WHEN TG_OP = 'DELETE' THEN 'DELETE'::"OperatorSyncChangeOperation"
    WHEN TG_OP = 'UPDATE' AND OLD.borrado_en IS NULL AND NEW.borrado_en IS NOT NULL THEN 'DELETE'::"OperatorSyncChangeOperation"
    WHEN TG_OP = 'INSERT' THEN 'CREATE'::"OperatorSyncChangeOperation"
    ELSE 'UPDATE'::"OperatorSyncChangeOperation" END;
  period_key := NULL; route_key := NULL; community_key := NULL; sector_key := NULL; meter_key := NULL;
  IF TG_TABLE_NAME = 'rutas' THEN
    period_key := (row_data->>'periodo_id')::integer; route_key := entity_key;
    community_key := (row_data->>'comunidad_id')::integer; sector_key := (row_data->>'sector_id')::integer;
  ELSIF TG_TABLE_NAME = 'ordenes_trabajo' THEN
    route_key := (row_data->>'ruta_id')::bigint; meter_key := (row_data->>'medidor_id')::bigint;
    SELECT r.periodo_id, r.comunidad_id, r.sector_id INTO period_key, community_key, sector_key FROM rutas r WHERE r.ruta_id = route_key;
  ELSIF TG_TABLE_NAME = 'lecturas' THEN
    period_key := (row_data->>'periodo_id')::integer; meter_key := (row_data->>'medidor_id')::bigint;
    SELECT c.comunidad_id, c.sector_id INTO community_key, sector_key FROM historial_medidores h JOIN contratos c ON c.contrato_id = h.contrato_id WHERE h.medidor_id = meter_key AND h.fecha_hasta IS NULL LIMIT 1;
  ELSIF TG_TABLE_NAME = 'medidores' THEN
    meter_key := entity_key;
    SELECT c.comunidad_id, c.sector_id INTO community_key, sector_key FROM historial_medidores h JOIN contratos c ON c.contrato_id = h.contrato_id WHERE h.medidor_id = meter_key AND h.fecha_hasta IS NULL LIMIT 1;
  ELSE
    SELECT l.periodo_id, l.medidor_id INTO period_key, meter_key FROM lecturas l WHERE l.lectura_id = (row_data->>'lectura_id')::bigint;
    SELECT c.comunidad_id, c.sector_id INTO community_key, sector_key FROM historial_medidores h JOIN contratos c ON c.contrato_id = h.contrato_id WHERE h.medidor_id = meter_key AND h.fecha_hasta IS NULL LIMIT 1;
  END IF;

  -- Si un UPDATE cambia el scope geográfico o de ruta, emitir un tombstone DELETE en el scope previo
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      old_period_key integer := NULL; old_route_key bigint := NULL;
      old_community_key integer := NULL; old_sector_key integer := NULL;
      old_meter_key bigint := NULL;
    BEGIN
      IF TG_TABLE_NAME = 'rutas' THEN
        old_period_key := OLD.periodo_id; old_route_key := OLD.ruta_id;
        old_community_key := OLD.comunidad_id; old_sector_key := OLD.sector_id;
      ELSIF TG_TABLE_NAME = 'ordenes_trabajo' THEN
        old_route_key := OLD.ruta_id; old_meter_key := OLD.medidor_id;
        SELECT r.periodo_id, r.comunidad_id, r.sector_id INTO old_period_key, old_community_key, old_sector_key FROM rutas r WHERE r.ruta_id = old_route_key;
      END IF;

      IF (old_route_key IS DISTINCT FROM route_key) OR (old_community_key IS DISTINCT FROM community_key) OR (old_sector_key IS DISTINCT FROM sector_key) THEN
        INSERT INTO operator_sync_changes(entity_type, entity_id, operation, periodo_id, ruta_id, comunidad_id, sector_id, medidor_id, payload)
        VALUES (TG_TABLE_NAME, entity_key, 'DELETE'::"OperatorSyncChangeOperation", old_period_key, old_route_key, old_community_key, old_sector_key, old_meter_key,
          jsonb_build_object('entityType', TG_TABLE_NAME, 'entityId', entity_key, 'operation', 'DELETE', 'data', to_jsonb(OLD)));
      END IF;
    END;
  END IF;

  INSERT INTO operator_sync_changes(entity_type, entity_id, operation, periodo_id, ruta_id, comunidad_id, sector_id, medidor_id, payload)
  VALUES (TG_TABLE_NAME, entity_key, change_operation, period_key, route_key, community_key, sector_key, meter_key,
    jsonb_build_object('entityType', TG_TABLE_NAME, 'entityId', entity_key, 'operation', change_operation, 'data', row_data));
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

CREATE TRIGGER operator_sync_rutas AFTER INSERT OR UPDATE OR DELETE ON rutas FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_ordenes_trabajo AFTER INSERT OR UPDATE OR DELETE ON ordenes_trabajo FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_lecturas AFTER INSERT OR UPDATE OR DELETE ON lecturas FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_medidores AFTER INSERT OR UPDATE OR DELETE ON medidores FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
CREATE TRIGGER operator_sync_lectura_anomalia AFTER INSERT OR UPDATE OR DELETE ON lectura_anomalia FOR EACH ROW EXECUTE FUNCTION operator_sync_capture_change();
