-- B03d owns the all-or-none invariant; Prisma cannot express CHECK constraints.
ALTER TABLE "ejecuciones_ordenes_trabajo"
  ADD COLUMN "lectura_snapshot_id" BIGINT,
  ADD COLUMN "lectura_snapshot_anterior" DECIMAL,
  ADD COLUMN "lectura_snapshot_actual" DECIMAL,
  ADD COLUMN "lectura_snapshot_consumo" DECIMAL,
  ADD COLUMN "lectura_snapshot_fecha" TIMESTAMP(3),
  ADD COLUMN "lectura_snapshot_inicial" BOOLEAN,
  ADD COLUMN "lectura_snapshot_medidor_id" BIGINT,
  ADD COLUMN "lectura_snapshot_periodo_id" INTEGER;

ALTER TABLE "ejecuciones_ordenes_trabajo"
  ADD CONSTRAINT "ejecucion_lectura_snapshot_all_or_none_chk"
  CHECK (num_nonnulls(
    "lectura_snapshot_id", "lectura_snapshot_anterior", "lectura_snapshot_actual",
    "lectura_snapshot_consumo", "lectura_snapshot_fecha", "lectura_snapshot_inicial",
    "lectura_snapshot_medidor_id", "lectura_snapshot_periodo_id") IN (0, 8));
