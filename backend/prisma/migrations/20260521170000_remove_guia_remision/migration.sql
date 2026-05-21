-- Drop GuiaDestinatarios and GuiaDetalles tables
DROP TABLE IF EXISTS guia_detalles;
DROP TABLE IF EXISTS guia_destinatarios;

-- Drop transport-related columns from comprobantes
ALTER TABLE comprobantes DROP COLUMN IF EXISTS guia_remision;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS dir_partida;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS placa;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS ruc_transportista;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS razon_social_transportista;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS tipo_identificacion_transportista;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS fecha_ini_transporte;
ALTER TABLE comprobantes DROP COLUMN IF EXISTS fecha_fin_transporte;
