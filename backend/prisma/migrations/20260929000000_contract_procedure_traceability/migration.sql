ALTER TABLE contratos
  ADD COLUMN tramitador_es_titular BOOLEAN,
  ADD COLUMN tramitador_nombre VARCHAR(200),
  ADD COLUMN tramitador_identificacion VARCHAR(30),
  ADD COLUMN relacion_tramitador VARCHAR(100),
  ADD COLUMN observaciones_tramite VARCHAR(2000),
  ADD COLUMN otras_novedades VARCHAR(2000),
  ADD COLUMN registrado_por_id INTEGER;
ALTER TABLE contratos ADD CONSTRAINT contratos_registrado_por_id_fkey FOREIGN KEY (registrado_por_id) REFERENCES usuarios(usuario_id) ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX contratos_registrado_por_id_idx ON contratos(registrado_por_id);
