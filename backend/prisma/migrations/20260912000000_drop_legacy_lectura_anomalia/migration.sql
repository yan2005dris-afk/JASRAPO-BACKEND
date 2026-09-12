-- Drop legacy trigger for operator sync on lectura_anomalia
DROP TRIGGER IF EXISTS operator_sync_lectura_anomalia ON "lectura_anomalia";

-- Drop legacy table lectura_anomalia with CASCADE to drop associated foreign keys/indexes safely
DROP TABLE IF EXISTS "lectura_anomalia" CASCADE;

-- Drop legacy enum EstadoAnomalia if no longer referenced
DROP TYPE IF EXISTS "EstadoAnomalia";
